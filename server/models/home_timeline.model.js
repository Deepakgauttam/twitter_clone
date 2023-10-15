const mongoose = require('mongoose');

const timelineSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    posts: [{
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        created_at: {
            type: Date,
        }
    }]
})

// Define a static method to get a user's timeline
timelineSchema.statics.getTimeline = async function ({
    username: screen_name = null,
    user_id = null
}, page = 1) {
    // ... (Code to get a user's timeline)
}

// Define a static method for bulk adding posts to multiple timelines
timelineSchema.statics.bulkAddPosts = async function (user_ids, ...args) {
    // ... (Code for bulk adding posts to timelines)
}

// Define an instance method for adding posts to a user's timeline
timelineSchema.methods.bulkAddPosts = async function ({
    id_friend_added = null,
    id_post_added = null
}) {
    // ... (Code for adding posts to a user's timeline)
}

// Define a static method for bulk removing posts from multiple timelines
timelineSchema.statics.bulkRemovePosts = async function (user_ids, ...args) {
    // ... (Code for bulk removing posts from timelines)
}

// Define an instance method for removing posts from a user's timeline
timelineSchema.methods.bulkRemovePosts = async function ({
    id_friend_removed = null,
    id_post_removed = null
}) {
    // ... (Code for removing posts from a user's timeline)
}

module.exports = mongoose.model('home_timeline', timelineSchema)
