// Import necessary modules and functions
const User = require('../models/user.model')
const Post = require('../models/post.model')
const Trend = require('../models/trend.model')
// Imports the 'serializePosts' function from the 'post.serializer' module.
const { serializePosts } = require('../serializers/post.serializer')
// Imports the 'serializeUsers' function from the 'user.serializer' module.
const { serializeUsers } = require('../serializers/user.serializer')
const assert = require('assert')

// Define a function for searching based on user input
exports.search = async (req, res, next) => {
    try {
        // Get the search query and page number from the request query parameters
        let query = req.query['q'];
        let page = req.query['p'];

        if (!query) {
            // If no query is provided, respond with no results
            res.json({
                posts: null
            });
            return;
        }

        page = parseInt(page);

        if (query.startsWith('#')) {
            // If the query starts with '#', search for posts containing the hashtag
            let result = await Post.searchHashtag(query, page);
            posts = await serializePosts(result, req.user);
            res.json({ posts });
            return;
        }
        else if (query.startsWith('@')) {
            // If the query starts with '@', search for posts containing the user mention or accounts matching the query
            let posts = await Post.searchUserMention(query, page);
            let users = await User.searchUser(query);
            posts = await serializePosts(posts, req.user);
            users = await serializeUsers(users, req.user);
            res.json({
                posts,
                users
            });
            return;
        }
        else {
            // For other queries, perform a text search
            let result = await Post.searchText(query, page);
            posts = await serializePosts(result, req.user);
            res.json({ posts });
        }
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for retrieving trends based on location (woeid)
exports.trends = async (req, res, next) => {
    try {
        // Get the woeid (location identifier) from the request query parameters
        let woeid = req.query['woeid'];

        // Find and retrieve the trends for the specified woeid
        let trend = await Trend.findOne({ 'locations.woeid': woeid });

        // Respond with the retrieved trend data
        res.json(trend);
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for suggesting users to follow
exports.userSuggests = async (req, res, next) => {
    try {
        // Get the user from the request object
        let user = req.user;

        // Ensure that the user object exists
        assert.ok(user);

        // Retrieve a list of suggested users to follow for the current user
        let users = await User.getSuggestions({ user_id: user._id });

        // Serialize the suggested users and respond with them
        users = await serializeUsers(users, req.user);
        res.json({
            users,
            more: false
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}





// const User = require('../models/user.model')
// const Post = require('../models/post.model')
// const Trend = require('../models/trend.model')
// const { serializePosts } = require('../serializers/post.serializer')
// const { serializeUsers } = require('../serializers/user.serializer')
// const assert = require('assert')


// exports.search = async (req, res, next) => {
//     try {
//         let query = req.query['q'];
//         let page = req.query['p'];
//         if (!query) {
//             res.json({
//                 posts: null
//             })
//             return
//         }
//         page = parseInt(page);
//         if (query.startsWith('#')) {
//             // posts containing hashtag
//             let result = await Post.searchHashtag(query, page);
//             //result direct return of find (empty array when no match)
//             posts = await serializePosts(result, req.user)
//             res.json({ posts });
//             return;
//         }
//         else if (query.startsWith('@')) {
//             // posts containing @query or accounts matching query
//             let posts = await Post.searchUserMention(query, page);
//             let users = await User.searchUser(query);
//             posts = await serializePosts(posts, req.user)
//             users = await serializeUsers(users, req.user)
//             res.json({
//                 posts,
//                 users
//             })
//             return;
//         }
//         else {
//             //do a text search
//             let result = await Post.searchText(query, page);
//             //result is direct return of find()
//             posts = await serializePosts(result, req.user)
//             res.json({ posts });
//         }
//     } catch (err) {
//         next(err)
//     }
// }
// exports.trends = async (req, res, next) => {
//     try {
//         let woeid = req.query['woeid'];
//         let trend = await Trend.findOne({ 'locations.woeid': woeid });
//         res.json(trend);

//     } catch (err) {
//         next(err)
//     }
// }
// exports.userSuggests = async (req, res, next) => {
//     try {
//         let user = req.user;
//         assert.ok(user)
//         let users = await User.getSuggestions({ user_id: user._id });
//         users = await serializeUsers(users, req.user)
//         res.json({
//             users,
//             more: false
//         })
//     } catch (err) {
//         next(err)
//     }
// }