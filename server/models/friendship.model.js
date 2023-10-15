// Import the Mongoose library for database interaction
const mongoose = require('mongoose');
const PostEngagement = require('./post_engagement.model');

// Define the 'Friendship' schema for the Mongoose model
const friendshipSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    follower_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friend_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reposted_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    liked_posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

// Define a static method to count the number of friends for a user
friendshipSchema.statics.countFriends = async function (user_id) {
    // Find the 'friend_ids' array for the provided user_id and count its length
    let doc = await this.findOne({ user_id }, 'friend_ids');
    if (!doc || !doc.friend_ids)
        return 0;
    let length = doc.friend_ids.length;
    if (doc.friend_ids.includes(user_id))
        length--;
    return length;
};

// Define a static method to count the number of followers for a user
friendshipSchema.statics.countFollowers = async function (user_id) {
    // Find the 'follower_ids' array for the provided user_id and count its length
    let doc = await this.findOne({ user_id }, 'follower_ids');
    if (!doc || !doc.follower_ids)
        return 0;
    let length = doc.follower_ids.length;
    if (doc.follower_ids.includes(user_id))
        length--;
    return length;
};

// Define a static method to check if user1 is following user2
friendshipSchema.statics.isFollowing = async function (user1_id = null, user2_id = null) {
    return this.exists({
        user_id: user1_id,
        friend_ids: user2_id
    });
};

// Define a static method to check if user1 is being followed by user2
friendshipSchema.statics.isFollowed = async function (user1_id = null, user2_id = null) {
    return this.exists({
        user_id: user1_id,
        follower_ids: user2_id
    });
};

// Define a static method to check if user likes a post
friendshipSchema.statics.isLiked = async function (user_id = null, post_id = null) {
    return this.exists({
        user_id,
        liked_posts: post_id
    });
};

// Define a static method to check if a user has reposted a post
friendshipSchema.statics.isReposted = async function (user_id = null, post_id = null) {
    return this.exists({
        user_id,
        reposted_ids: post_id
    });
};

// Define a static method to indicate that a user has liked a post
friendshipSchema.statics.postLiked = async function (user_id = null, { post_id, postId }) {
    // Handle cases where postId is provided instead of post_id
    if (postId) {
        post = await mongoose.model("Post").findOne({ id_str: postId }, "_id");
        post_id = post._id;
    } else if (!post_id)
        throw Error('Cannot determine post');
    
    // Check if the post is already liked by the user
    let liked = await this.isLiked(user_id, post_id);
    if (liked)
        return ({ ok: 1, nModified: 0 });
    
    // Update the 'liked_posts' array for the user
    let res1 = await this.updateOne({ user_id }, {
        $push: {
            liked_posts: {
                $each: [post_id],
                $position: 0
            }
        }
    }, { upsert: true });

    // Update the post engagement data to indicate that the post was liked
    await PostEngagement.gotLiked(post_id, user_id);
    
    return res1;
};

// Define a static method to indicate that a user has unliked a post
friendshipSchema.statics.postUnliked = async function (user_id = null, { post_id, postId }) {
    // Handle cases where postId is provided instead of post_id
    if (postId) {
        post = await mongoose.model("Post").findOne({ id_str: postId }, "_id");
        post_id = post._id;
    } else if (!post_id)
        throw Error('Cannot determine post');
    
    // Check if the post is already liked by the user
    let liked = await this.isLiked(user_id, post_id);
    if (!liked)
        return ({ ok: 1, nModified: 0 });
    
    // Update the 'liked_posts' array for the user to remove the post
    let res1 = await this.updateOne({ user_id }, {
        $pull: { liked_posts: post_id }
    });

    // Update the post engagement data to indicate that the post was unliked
    await PostEngagement.gotUnliked(post_id, user_id);
    
    return res1;
};

// Define a static method to indicate that a user has reposted a post
friendshipSchema.statics.postReposted = async function (user_id = null, { post_id, postId }) {
    // Handle cases where postId is provided instead of post_id
    if (postId) {
        post = await mongoose.model("Post").findOne({ id_str: postId }, "_id");
        post_id = post._id;
    } else if (!post_id)
        throw Error('Cannot determine post');
    
    // Check if the post is already reposted by the user
    let reposted = await this.isReposted(user_id, post_id);
    if (reposted)
        return ({ ok: 1, nModified: 0 });
    
    // Update the 'reposted_ids' array for the user
    let res1 = await this.updateOne({ user_id }, {
        $push: {
            reposted_ids: {
                $each: [post_id],
                $position: 0
            }
        }
    });

    // Update the post engagement data to indicate that the post was reposted
    await PostEngagement.gotReposted(post_id, user_id);
    
    return res1;
};

// Define a static method to indicate that a user has unreposted a post
friendshipSchema.statics.postUnreposted = async function (user_id = null, { post_id, postId }) {
    // Handle cases where postId is provided instead of post_id
    if (postId) {
        post = await mongoose.model("Post").findOne({ id_str: postId }, "_id");
        post_id = post._id;
    }
    if (!post_id)
        throw Error('Cannot determine post');
    
    // Check if the post is already reposted by the user
    let reposted = await this.isReposted(user_id, post_id);
    if (!reposted)
        return ({ ok: 1, nModified: 0 });
    
    // Update the 'reposted_ids' array for the user to remove the post
    let res1 = await this.updateOne({ user_id }, {
        $pull: { reposted_ids: post_id }
    });

    // Update the post engagement data to indicate that the post was unreposted
    await PostEngagement.gotUnreposted(post_id, user_id);
    
    return res1;
};

// Define a static method to indicate that a user got followed by another user
friendshipSchema.statics.gotFollowed = async function (user1_id = null, user2_id = null) {
    // Check if user2 is already a follower, if so, skip (bug in front-end app)
    let follower = await this.isFollowed(user1_id, user2_id);
    if (follower)
        return ({ ok: 1, nModified: 0 });

    // Increment the followers_count for user1
    await mongoose.model('User').findByIdAndUpdate(user1_id, {
        $inc: { followers_count: 1 }
    });

    // Create a notification for user1 to indicate that they were followed by user2
    await mongoose.model('Notification').push(user1_id, {
        type: 'followed',
        title: `You were followed`,
        body: {
            user: user2_id
        }
    });

    // Update the 'follower_ids' array for user1 to indicate the new follower (upsert if needed)
    return this.updateOne({ user_id: user1_id }, {
        $push: {
            follower_ids: {
                $each: [user2_id],
                $position: 0
            }
        }
    }, { upsert: true });
};

// Define a static method to indicate that a user got unfollowed by another user
friendshipSchema.statics.gotUnfollowed = async function (user1_id = null, user2_id = null) {
    // Check if user2 is not a follower, skip (bug in front-end app)
    let follower = await this.isFollowed(user1_id, user2_id);
    if (!follower)
        return ({ ok: 1, nModified: 0 });

    // Decrement the followers_count for user1
    await mongoose.model('User').findByIdAndUpdate(user1_id, {
        $inc: { followers_count: -1 }
    });

    // Create a notification for user1 to indicate that they were unfollowed by user2
    await mongoose.model('Notification').push(user1_id, {
        type: 'unfollowed',
        title: `You were unfollowed`,
        body: {
            user: user2_id
        }
    });

    // Update the 'follower_ids' array for user1 to remove the unfollower
    return this.updateOne({ user_id: user1_id }, {
        $pull: { follower_ids: user2_id }
    });
};

// Export the 'Friendship' model with the defined schema
module.exports = mongoose.model('Friendship', friendshipSchema);


