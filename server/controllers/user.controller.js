// Import necessary modules and functions
const User = require('../models/user.model');
const Friendship = require('../models/friendship.model');
const { serializeUser, serializeUsers } = require('../serializers/user.serializer');
const { filterInput, ensureCorrectImage } = require('../utils/helpers');
const assert = require('assert');

// Define a function to get user information by their username
exports.getUser = async (req, res, next) => {
    try {
        // Get the username from the request parameters and sanitize it
        let username = req.params.username;
        username = filterInput(username, 'username');

        // Find the user with the specified username
        let user = await User.findOne({ screen_name: username });

        // Serialize the user and respond with their information
        user = await serializeUser(user, req.user);
        res.status(200).json({
            user,
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function to update user information
exports.updateUser = async (req, res, next) => {
    try {
        // Get the authenticated user
        let user = req.user;
        assert.ok(user);

        // Extract user information from the request body
        let {
            name,
            description,
            profile_banner_color,
            location,
            website,
            profile_image_url_https,
        } = req.body;

        // Sanitize and validate the input data
        name = filterInput(name, 'name', { identifier: 'Name' });
        description = filterInput(description, 'html', { max_length: 200, identifier: 'Bio' });
        profile_banner_color = filterInput(profile_banner_color, null, {
            regex: /^#[0-9A-Fa-f]{3,6}$/,
            identifier: 'Banner color',
        });
        location = filterInput(location, 'name', { min_length: 0, identifier: 'Location' });
        website = filterInput(website, 'html', { min_length: 0, identifier: 'Website URL' });
        profile_image_url_https = ensureCorrectImage(profile_image_url_https);

        // Create a URL object for the website
        let url = {
            url: website,
            expanded_url: website,
        };

        // Update the user's information in the database
        user = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    name,
                    description,
                    profile_image_url_https,
                    profile_banner_color,
                    location,
                    default_profile_image: false,
                    default_profile: false,
                    'entities.url.urls': [url],
                },
            },
            { new: true }
        );

        if (user) {
            // Serialize the updated user and respond with the new information
            user = await serializeUser(user, user);
            res.json({ user });
        } else {
            // If an error occurs during the update, throw an error
            throw Error('error in updateUser');
        }
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function to follow a user
exports.followUser = async (req, res, next) => {
    try {
        // Get the username from the request parameters and sanitize it
        let username = req.params.username;
        username = filterInput(username, 'username');

        // Find the user to follow by their username
        let user = await User.findOne({ screen_name: username }, '_id');

        if (!user) {
            // If the user does not exist, throw an error
            throw Error('username does not exist');
        }

        // Get the authenticated user
        let req_user = await User.findById(req.user._id);

        // Attempt to follow the user and check the response
        let response = await Friendship.gotFollowed(user._id, req_user._id);

        if (response.ok && response.nModified !== 0) {
            // If the follow operation was successful, also follow the user locally
            await req_user.follow(user._id);
        } else {
            // If the response is not successful, throw an error
            throw Error('user.follow response not ok');
        }

        // Respond with a success message
        res.json({
            message: 'success',
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function to unfollow a user
exports.unFollowUser = async (req, res, next) => {
    try {
        // Get the username from the request parameters and sanitize it
        let username = req.params.username;
        username = filterInput(username, 'username');

        // Find the user to unfollow by their username
        let user = await User.findOne({ screen_name: username }, '_id');

        if (!user) {
            // If the user does not exist, throw an error
            throw Error('username does not exist');
        }

        // Get the authenticated user
        let req_user = await User.findById(req.user._id);

        // Attempt to unfollow the user and check the response
        let response = await Friendship.gotUnfollowed(user._id, req_user._id);

        // Unfollow the user locally
        await req_user.unfollow(user._id);

        // Respond with a success message
        res.json({
            message: 'success',
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function to get the followers of a user
exports.getFollowers = async (req, res, next) => {
    try {
        // Get the username from the request parameters and sanitize it
        let username = req.params.username;
        username = filterInput(username, 'username');

        // Get the page number from the query parameters
        const p = parseInt(req.query['p']); // page/batch number

        // Define the size of a page/batch
        const s = 20; // size of page/batch

        // Find the user by their username
        const user = await User.findOne({ screen_name: username }, '_id');

        if (!user) {
            // If the user does not exist, return a bad request response
            return res.status(400).json({ msg: 'Bad request' });
        }

        // Find the follower IDs with pagination
        const doc = await Friendship.findOne(
            { user_id: user._id },
            {
                follower_ids: {
                    $slice: [s * (p - 1), s],
                },
            }
        ).populate('follower_ids');

        if (!doc) {
            // If there are no followers, return a response with no users
            return res.json({ users: null });
        }

        // Serialize the follower users and respond with the list
        const users = await serializeUsers(doc.follower_ids, user);
        res.json({ users: users });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function to get the friends of a user
exports.getFriends = async (req, res, next) => {
    try {
        // Get the username from the request parameters and sanitize it
        let username = req.params.username;
        username = filterInput(username, 'username');

        // Get the page number from the query parameters
        let p = req.query['p'];
        p = parseInt(p); // page/batch number

        // Define the size of a page/batch
        const s = 15; // size of page/batch

        // Find the user by their username
        const user = await User.findOne({ screen_name: username }, '_id');

        if (!user) {
            // If the user does not exist, return a bad request response
            return res.status(400).json({ msg: 'Bad request' });
        }

        // Find the friend IDs with pagination
        const doc = await Friendship.findOne(
            { user_id: user._id },
            {
                friend_ids: {
                    $slice: [s * (p - 1), s],
                },
            }
        ).populate('friend_ids');

        if (!doc) {
            // If there are no friends, return a response with no users
            return res.json({ users: null });
        }

        // Serialize the friend users and respond with the list
        const users = await serializeUsers(doc.friend_ids, user);
        res.json({ users: users });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}



// const User = require('../models/user.model')
// const Friendship = require('../models/friendship.model')
// const { serializeUser, serializeUsers } = require('../serializers/user.serializer')
// const { filterInput, ensureCorrectImage } = require('../utils/helpers')
// const assert = require('assert')

// exports.getUser = async (req, res, next) => {
//     try {
//         let username = req.params.username
//         username = filterInput(username, 'username')
//         let user = await User.findOne({ screen_name: username })
//         user = await serializeUser(user, req.user)
//         res.status(200).json({
//             user,
//         })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.updateUser = async (req, res, next) => {
//     try {
//         let user = req.user
//         assert.ok(user)
//         let {
//             name,
//             description,
//             profile_banner_color,
//             location,
//             website,
//             profile_image_url_https,
//         } = req.body

//         name = filterInput(name, 'name', { identifier: 'Name' })
//         description = filterInput(description, 'html', { max_length: 200, identifier: 'Bio' })
//         profile_banner_color = filterInput(profile_banner_color, null, {
//             regex: /^#[0-9A-Fa-f]{3,6}$/,
//             identifier: 'Banner color',
//         })
//         location = filterInput(location, 'name', { min_length: 0, identifier: 'Location' })
//         website = filterInput(website, 'html', { min_length: 0, identifier: 'Website URL' })
//         profile_image_url_https = ensureCorrectImage(profile_image_url_https)

//         let url = {
//             url: website,
//             expanded_url: website,
//         }
//         user = await User.findByIdAndUpdate(
//             user._id,
//             {
//                 $set: {
//                     name,
//                     description,
//                     profile_image_url_https,
//                     profile_banner_color,
//                     location,
//                     default_profile_image: false,
//                     default_profile: false,
//                     'entities.url.urls': [url],
//                 },
//             },
//             { new: true }
//         )
//         if (user) {
//             user = await serializeUser(user, user)
//             res.json({ user })
//         } else throw Error('error in updateUser')
//     } catch (err) {
//         next(err)
//     }
// }

// exports.followUser = async (req, res, next) => {
//     try {
//         let username = req.params.username
//         username = filterInput(username, 'username')
//         let user = await User.findOne({ screen_name: username }, '_id')
//         if (!user) throw Error('username does not exist')
//         let req_user = await User.findById(req.user._id)
//         let responce = await Friendship.gotFollowed(user._id, req_user._id)
//         if (responce.ok && responce.nModified !== 0) await req_user.follow(user._id)
//         else throw Error('user.follow responce not ok')

//         res.json({
//             message: 'success',
//         })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.unFollowUser = async (req, res, next) => {
//     try {
//         let username = req.params.username
//         username = filterInput(username, 'username')
//         let user = await User.findOne({ screen_name: username }, '_id')
//         if (!user) throw Error('username does not exist')
//         let req_user = await User.findById(req.user._id)
//         let responce = await Friendship.gotUnfollowed(user._id, req_user._id)
//         // if (responce.ok && responce.nModified !== 0)
//         await req_user.unfollow(user._id)
//         // else
//         // throw Error('user.unfollow responce not ok');
//         res.json({
//             message: 'success',
//         })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.getFollowers = async (req, res, next) => {
//     try {
//         let username = req.params.username
//         username = filterInput(username, 'username')
//         const p = parseInt(req.query['p']) //page/batch number
//         const s = 20 //size of page/batch

//         const user = await User.findOne({ screen_name: username }, '_id')
//         if (!user) return res.status(400).json({ msg: 'Bad request' })

//         const doc = await Friendship.findOne(
//             { user_id: user._id },
//             {
//                 follower_ids: {
//                     $slice: [s * (p - 1), s],
//                 },
//             }
//         ).populate('follower_ids')
//         if (!doc) return res.json({ users: null })
//         const users = await serializeUsers(doc.follower_ids, user)
//         res.json({ users: users })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.getFriends = async (req, res, next) => {
//     try {
//         let username = req.params.username
//         username = filterInput(username, 'username')
//         let p = req.query['p']
//         p = parseInt(p) //page/batch number
//         const s = 15 //size of page/batch

//         const user = await User.findOne({ screen_name: username }, '_id')
//         if (!user) return res.status(400).json({ msg: 'Bad request' })

//         const doc = await Friendship.findOne(
//             { user_id: user._id },
//             {
//                 friend_ids: {
//                     $slice: [s * (p - 1), s],
//                 },
//             }
//         ).populate('friend_ids')
//         if (!doc) return res.json({ users: null })
//         const users = await serializeUsers(doc.friend_ids, user)
//         res.json({ users: users })
//     } catch (err) {
//         next(err)
//     }
// }
