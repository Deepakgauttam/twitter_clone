// Import necessary modules and functions
const mongoose = require('mongoose');
const home_timeline = require('../models/home_timeline.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const { serializePosts } = require('../serializers/post.serializer');
const { serializeUser } = require('../serializers/user.serializer');
const { filterInput } = require('../utils/helpers');
const assert = require('assert');

// Define a function to retrieve the user's home timeline
exports.homeTimeline = async (req, res, next) => {
    try {
        // Check if the Mongoose connection is ready (state 1)
        assert(mongoose.connection.readyState, 1);
        
        // Get the user from the request object
        let user = req.user;
        assert.ok(user);

        // Get the page number from the request query
        let page = req.query['p'];

        // Get posts from the home timeline for the user
        let posts = /*list*/await home_timeline.getTimeline({ user_id: user._id }, page);

        // Serialize the posts and respond with them
        posts = await serializePosts(posts, req.user);
        res.json({
            posts //posts: null or empty when exhausts
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function to retrieve a user's timeline
exports.userTimeline = async (req, res, next) => {
    try {
        // Get the username from the request parameters and page number from the request query
        let username = req.params.username;
        let page = req.query['p'];
        page = parseInt(page);

        // Filter and sanitize the username input
        username = filterInput(username, 'username');

        // Find the user with the specified username
        let user = await User.findOne({ screen_name: username });

        if (!user) {
            // If the user is not found, respond with a bad request message
            res.status(400).json({ message: "Bad request" });
            return;
        }

        // Get posts from the user's timeline
        let posts = await Post.getUserTimeline({ user_id: user._id }, page);

        // Serialize the posts and user, and respond with them
        posts = await serializePosts(posts, req.user);
        user = await serializeUser(user, req.user);
        res.json({
            posts,
            user
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}




// const mongoose = require('mongoose')
// const home_timeline = require('../models/home_timeline.model')
// const Post = require('../models/post.model')
// const User = require('../models/user.model')
// const { serializePosts } = require('../serializers/post.serializer')
// const { serializeUser } = require('../serializers/user.serializer')
// const { filterInput } = require('../utils/helpers')
// const assert = require('assert')

// exports.homeTimeline = async (req, res, next) => {
//     try {
//         assert(mongoose.connection.readyState, 1);
//         let user = req.user;
//         assert.ok(user);
//         let page = req.query['p'];
//         let posts = /*list*/await home_timeline.getTimeline({ user_id: user._id }, page);
//         posts = await serializePosts(posts, req.user)
//         res.json({
//             posts //posts: null or empty when exhausts
//         })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.userTimeline = async (req, res, next) => {
//     try {
//         let username = req.params.username;
//         let page = req.query['p'];
//         page = parseInt(page);
//         username = filterInput(username, 'username');
//         let user = await User.findOne({ screen_name: username })
//         if (!user) {
//             res.status(400).json({ message: "Bad request" })
//             return
//         }
//         let posts = await Post.getUserTimeline({ user_id: user._id }, page)
//         posts = await serializePosts(posts, req.user)
//         user = await serializeUser(user, req.user)
//         res.json({
//             posts,
//             user
//         })
//     } catch (err) {
//         next(err)
//     }
// }