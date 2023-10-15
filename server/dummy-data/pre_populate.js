// Import the Mongoose library for database interaction
const mongoose = require('mongoose');

// Import the assert library for performing assertions
const assert = require('assert');

// Import the User model for user-related data
const User = require('../models/user.model');

// Import the Post model for handling post-related data
const Post = require('../models/post.model');

// Import the PostEngagement model for managing post engagements
const PostEngagement = require('../models/post_engagement.model');

// Import the Notification model for handling notifications
const Notification = require('../models/notification.model');

// Import the internal_setting model for internal settings
const internal_setting = require('../models/internal_setting.model');

// Import the home_timeline model for managing the user's home timeline
const home_timeline = require('../models/home_timeline.model');

// Import the Hashtag model for handling hashtags
const Hashtag = require('../models/hashtag.model');

// Import the Trend model for managing trends
const Trend = require('../models/trend.model');

// Import the Auth model for authentication-related data
const Auth = require('../models/auth.model');

// Import the Friendship model for managing user friendships
const Friendship = require('../models/friendship.model');

// Define an async function for pre-populating data
async function pre_populate() {
    // Check if the database connection is established (readyState 1)
    assert(mongoose.connection.readyState, 1, 'Database not connected');

    try {
        // Refresh trends (assumption: this is a function that populates trends)
        await Trend.refreshTrends();
    } catch (error) {
        // Log an error message if an exception occurs
        console.error('error populating:', error);
    } finally {
        // After pre-population (whether successful or not), log the number of posts and users in the database
        let posts = await Post.countDocuments({});
        console.log("posts in db:", posts);
        let users = await User.countDocuments({});
        console.log("users in db:", users);
    }
}

// Export the pre_populate function
module.exports = pre_populate;

