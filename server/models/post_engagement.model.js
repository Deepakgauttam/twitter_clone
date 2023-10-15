const mongoose = require('mongoose');
const Notification = require('./notification.model');

// Define the schema for post engagements
const engageSchema = mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post' // Reference to a Post document
    },
    liked_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to a User document
    }],
    reposted_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to a User document
    }],
    reply_posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post' // Reference to a Post document
    }]
});

// Static method to handle when a post gets liked
engageSchema.statics.gotLiked = async function (post_id, user_id) {
    if (await this.exists({ post_id, liked_by: user_id }))
        return;

    const post = await mongoose.model('Post').findById(post_id);

    await post.updateOne({
        $inc: {
            favorite_count: 1
        }
    });

    await Notification.push(post.user, {
        type: 'liked',
        title: 'You got a like',
        body: {
            post: post_id, // Post which was liked
            user: user_id // User who liked
        }
    });

    return this.updateOne({ post_id }, {
        $push: {
            liked_by: {
                $each: [user_id],
                $position: 0
            }
        }
    }, { upsert: true });
}

// Static method to handle when a post gets unliked
engageSchema.statics.gotUnliked = async function (post_id, user_id) {
    if (!await this.exists({ post_id, liked_by: user_id }))
        return;

    await mongoose.model('Post').updateOne({ _id: post_id }, {
        $inc: {
            favorite_count: -1
        }
    });

    return this.updateOne({ post_id }, {
        $pull: {
            liked_by: user_id
        }
    });
}

// Static method to handle when a post gets reposted
engageSchema.statics.gotReposted = async function (post_id, user_id) {
    if (await this.exists({ post_id, reposted_by: user_id }))
        return;

    const post = await mongoose.model('Post').findById(post_id);

    await post.updateOne({
        $inc: {
            retweet_count: 1
        }
    });

    await Notification.push(post.user, {
        type: 'reposted',
        title: 'Your post was reposted',
        body: {
            post: post_id, // Post which was reposted
            user: user_id // User who reposted
        }
    });

    return this.updateOne({ post_id }, {
        $push: {
            reposted_by: {
                $each: [user_id],
                $position: 0
            }
        }
    }, { upsert: true });
}

// Static method to handle when a post gets un-reposted
engageSchema.statics.gotUnreposted = async function (post_id, user_id) {
    if (!await this.exists({ post_id, reposted_by: user_id }))
        return;

    await mongoose.model('Post').updateOne({ _id: post_id }, {
        $inc: {
            retweet_count: -1
        }
    });

    return this.updateOne({ post_id }, {
        $pull: {
            reposted_by: user_id
        }
    });
}

// Static method to handle when a post gets replied to
engageSchema.statics.gotReplied = async function (post_id, reply_post_id) {
    if (await this.exists({ post_id, reply_posts: reply_post_id }))
        return;

    const post = await mongoose.model('Post').findById(post_id);

    await Notification.push(post.user, {
        type: 'replied',
        title: 'You got a reply',
        body: {
            post: reply_post_id // Reply post
        }
    });

    return this.updateOne({ post_id }, {
        $push: {
            reply_posts: {
                $each: [reply_post_id],
                $position: 0
            }
        }
    }, { upsert: true });
}

module.exports = mongoose.model('PostEngagement', engageSchema);
