// Import required libraries and models
const mongoose = require('mongoose');
require('mongoose-long')(mongoose); // Enable support for Long data type in Mongoose
const Friendship = require('./friendship.model');
const home_timeline = require('./home_timeline.model');
const internal_setting = require('./internal_setting.model');
const Auth = require('./auth.model');

// Define the schema for the User model
const userSchema = mongoose.Schema({
    "id": { type: mongoose.Schema.Types.Long, unique: true },
    "id_str": { type: String, unique: true }, // Default in post('save')
    "name": String,
    "screen_name": {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    "location": { type: String, default: null },
    "description": { type: String, default: null },
    "url": { type: String, default: null },
    "entities": {
        "url": {
            "urls": [
                {
                    "url": String,
                    "expanded_url": String,
                    "display_url": String,
                    "indices": [Number]
                }
            ]
        },
        "description": {
            "urls": []
        }
    },
    "protected": { type: Boolean, default: false },
    "followers_count": { type: Number, default: 0 },
    "friends_count": { type: Number, default: 0 },
    "listed_count": { type: Number, default: 0 },
    "created_at": { type: Date, default: Date.now() },
    "favorites_count": { type: Number, default: 0 },
    "verified": { type: Boolean, default: false },
    "statuses_count": { type: Number, default: 0 },
    "default_profile_image": { type: Boolean, default: true },
    "default_profile": { type: Boolean, default: true },
    "profile_image_url_https": { type: String, default: null },
    "profile_banner_url": { type: String, default: null },
    "profile_banner_color": { type: String, default: null },
    "notifications_enabled_device_count": { type: String, default: 0 },

    // Twitter deprecated properties
    // ...
}, { id: false });

/**
 * Creates a new user with associated authentication data
 * @param {Object} userDat - User data
 * @param {Object} authDat - Authentication data containing password and/or sensitive data
 * @returns {Promise} - Created user
 */
userSchema.statics.createNew = async function (userDat, authDat) {
    try {
        let user = await this.create(userDat);
        await Auth.createNew(user._id, authDat);
        return user;
    } catch (error) {
        console.log('error creating a new user', error);
        throw error;
    }
}

/**
 * Counts the number of posts for a given user.
 * @param {String} user_id - User ID
 * @returns {Promise} - Number of posts
 */
userSchema.statics.countPosts = async function (user_id) {
    return mongoose.model('Post').countDocuments({ user: user_id });
}

/**
 * Gets the number of notification devices for a user.
 * @param {String} user_id - User ID
 * @returns {Promise} - Number of notification devices
 */
userSchema.statics.notificationDevices = async function (user_id) {
    const doc = await mongoose.model('Notification').findOne({ user_id }, 'subscriptions');
    if (!doc || !doc.subscriptions) return 0;
    console.log(doc.subscriptions);
    return doc.subscriptions.length;
}

/**
 * Checks if a given password is valid for the user.
 * @param {String} password - Password to validate
 * @returns {Promise} - True if the password is valid, false otherwise
 */
userSchema.methods.validPassword = async function (password) {
    return Auth.validPassword(this._id, password);
}

/**
 * Updates Friendship and User.friends_count, and invokes home_timeline.bulkAddPosts().
 * @param {...String} list_id_tobe_friends - User IDs to follow
 * @returns {Object} - Result of the follow operation
 */
userSchema.methods.follow = async function (...list_id_tobe_friends) {
    let res = { ok: 0 };
    try {
        let res1 = await Friendship.updateOne({ user_id: this._id }, {
            $push: {
                friend_ids: {
                    $each: list_id_tobe_friends,
                    $position: 0
                }
            }
        }, { upsert: true });
        if (res1.ok) {
            await this.update({
                $inc: { friends_count: 1 }
            });

            for (let id of list_id_tobe_friends) {
                await home_timeline.bulkAddPosts([this._id], { id_friend_added: id });
            }
        }
        res = { ...res1 };
    } catch (err) {
        console.log('error in user.follow()', err);
    } finally {
        return res;
    }
}

/**
 * Unfollows users, similar to the follow method.
 * @param {...String} list_id_tobe_not_friends - User IDs to unfollow
 * @returns {Object} - Result of the unfollow operation
 */
userSchema.methods.unfollow = async function (...list_id_tobe_not_friends) {
    let res = { ok: 0 };
    try {
        let res1 = await Friendship.updateOne({ user_id: this._id }, {
            $pull: {
                friend_ids: {
                    $in: list_id_tobe_not_friends
                }
            }
        }, { upsert: true });
        if (res1.ok) {
            await this.update({
                $inc: { friends_count: -1 }
            });

            for (let id of list_id_tobe_not_friends) {
                await home_timeline.bulkRemovePosts([this._id], { id_friend_removed: id });
            }
        }
        res = { ...res1 };
    } catch (err) {
        console.log('error in user.unfollow()', err);
    } finally {
        return res;
    }
}

/**
 * Searches for users by screen_name or name.
 * @param {String} query - Search query
 * @returns {Promise} - List of found users (up to 20)
 */
userSchema.statics.searchUser = function (query) {
    if (query.startsWith('@')) query = query.slice(1);
    query = new RegExp(query, "i");
    return this.find({
        $or: [
            { screen_name: query },
            { name: query }
        ]
    }).limit(20);
}

/**
 * Gets suggestions for users to follow.
 * @param {Object} options - Query options
 * @returns {Promise} - List of user suggestions
 */
userSchema.statics.getSuggestions = async function (options) {
    if (!options.user_id) throw Error('no user_id given');
    let { friend_ids } = await Friendship.findOne({ user_id: options.user_id });
    // Personalized suggestions based on criteria
    return this.find({
        _id: { $ne: options.user_id },
        _id: { $nin: friend_ids }
    })
        .sort('-followers_count -statuses_count -friends_count -created_at') // Sorting algorithm (modify as needed)
        .limit(25);
}

/**
 * Generates a user ID.
 * @returns {Promise} - The generated user ID
 */
async function user_genId() {
    // Generates a simple incrementing value for the user ID
    await internal_setting.updateOne({ ver: '1.0' }, {
        $inc: { current_user_id: 1 }
    }, { upsert: true });
    let { current_user_id } = await internal_setting.findOne({ ver: '1.0' }, 'current_user_id');
    return current_user_id;
}

// Post-save hook for generating user IDs
userSchema.post('save', async (doc, next) => {
    if (!doc.id) {
        let id = await user_genId();
        await mongoose.model('User').updateOne({ _id: doc._id }, {
            $set: {
                id: id,
                id_str: id.toString()
            }
        });
    }
    next();
});

// Post-save hook for creating an empty timeline and other user-related data
userSchema.post('save', async doc => {
    // Create an empty home timeline
    await home_timeline.create({
        user_id: doc._id,
    });
    // Create a Friendship entry
    await Friendship.create({
        user_id: doc._id,
    });
    if (!doc.profile_image_url_https) {
        // Generate a random profile image URL if none exists
        await mongoose.model('User').updateOne({ _id: doc._id }, {
            profile_image_url_https: getRandomProfileUrl(),
            default_profile_image: false
        });
    }
});

module.exports = mongoose.model('User', userSchema); // Export the User model




// const mongoose = require('mongoose')
// require('mongoose-long')(mongoose)
// const Friendship = require('./friendship.model')
// const home_timeline = require('./home_timeline.model')

// const internal_setting = require('./internal_setting.model')
// const Auth = require('./auth.model')

// const userSchema = mongoose.Schema({
//     "id": { type: mongoose.Schema.Types.Long, unique: true },
//     "id_str": { type: String, unique: true }, //default in post('save')
//     "name": String,
//     "screen_name": {
//         type: String,
//         required: true,
//         unique: true,
//         index: true
//     },
//     "location": { type: String, default: null },
//     "description": { type: String, default: null },
//     "url": { type: String, default: null },
//     "entities": {
//         "url": {
//             "urls": [
//                 {
//                     "url": String,
//                     "expanded_url": String,
//                     "display_url": String,
//                     "indices": [Number]
//                 }
//             ]
//         },
//         "description": {
//             "urls": []
//         }
//     },
//     "protected": { type: Boolean, default: false },
//     "followers_count": { type: Number, default: 0 },
//     "friends_count": { type: Number, default: 0 },
//     "listed_count": { type: Number, default: 0 },
//     "created_at": { type: Date, default: Date.now() },
//     "favorites_count": { type: Number, default: 0 },
//     "verified": { type: Boolean, default: false },
//     "statuses_count": { type: Number, default: 0 },
//     "default_profile_image": { type: Boolean, default: true },
//     "default_profile": { type: Boolean, default: true },
//     "profile_image_url_https": { type: String, default: null },
//     "profile_banner_url": { type: String, default: null },

//     "profile_banner_color": { type: String, default: null },

//     "notifications_enabled_device_count": { type: String, default: 0 }
//     //twitter deprecated ones
//     /*
//     "utc_offset": { type: String },
//     "time_zone": { type: String },
//     "lang": { type: String },
//     "geo_enabled": { type: Boolean },
//     "following": { type: Boolean },
//     "follow_request_sent": { type: Boolean },
//     "has_extended_profile": { type: Boolean },
//     "notifications": { type: Boolean },
//     "contributors_enabled": { type: Boolean },
//     "profile_image_url": { type: String },
//     "profile_background_color": { type: String },
//     "profile_background_image_url": { type: String },
//     "profile_background_image_url_https": { type: String },
//     "profile_background_tile": { type: Boolean },
//     "profile_link_color": { type: String },
//     "profile_sidebar_border_color": { type: String },
//     "profile_sidebar_fill_color": { type: String },
//     "profile_text_color": { type: String },
//     "profile_use_background_image": { type: Boolean },
//     "is_translator": { type: Boolean },
//     "is_translation_enabled": { type: Boolean },
//     "translator_type": { type: String },
//     */
// }, { id: false })
// /**
//  * @param {Object} with two userDat, authDat constaing password and/or sensitive data
//  */
// userSchema.statics.createNew = async function (userDat, authDat) {
//     try {
//         let user = await this.create(userDat)
//         await Auth.createNew(user._id, authDat)
//         return user
//     } catch (error) {
//         console.log('error creating new user', error)
//         throw error
//     }
// }
// userSchema.statics.countPosts = async function (user_id) {
//     return mongoose.model('Post').countDocuments({ user: user_id })
// }
// userSchema.statics.notificationDevices = async function (user_id) {
//     const doc = await mongoose.model('Notification').findOne({ user_id }, 'subscriptions')
//     if (!doc || !doc.subscriptions) return 0
//     console.log(doc.subscriptions)
//     return doc.subscriptions.length
// }

// userSchema.methods.validPassword = async function (password) {
//     return Auth.validPassword(this._id, password)
// }
// /**
//  * updates Friendship ans User.friends_count
//  * then invokes home_timeline.bulkAddPosts()
//  * @returns {Object} - like { ok: 1, ...otherinfo } if successfully in adding friends
//  */
// userSchema.methods.follow = async function (...list_id_tobe_friends) {
//     let res = { ok: 0 }
//     try {
//         let res1 = await Friendship.updateOne({ user_id: this._id }, {
//             $push: {
//                 friend_ids: {
//                     $each: list_id_tobe_friends,
//                     $position: 0
//                 }
//             }
//         }, { upsert: true })
//         if (res1.ok) {
//             await this.update({
//                 $inc: { friends_count: 1 }
//             })

//             for (let id of list_id_tobe_friends) {
//                 await home_timeline
//                     .bulkAddPosts([this._id], { id_friend_added: id })
//                 //                  user_ids 
//             }
//         }
//         res = { ...res1 }
//     } catch (err) {
//         console.log('error in user.follow()', err)
//     } finally {
//         return res
//     }
// }
// /**
//  * unfollow() similar to follow()
//  */
// userSchema.methods.unfollow = async function (...list_id_tobe_not_friends) {
//     let res = { ok: 0 }
//     try {
//         let res1 = await Friendship.updateOne({ user_id: this._id }, {
//             $pull: {
//                 friend_ids: {
//                     $in: list_id_tobe_not_friends
//                 }
//             }
//         }, { upsert: true })
//         if (res1.ok) {
//             await this.update({
//                 $inc: { friends_count: -1 }
//             })

//             // remove posts from home_timeline
//             for (let id of list_id_tobe_not_friends) {
//                 await home_timeline
//                     .bulkRemovePosts([this._id], { id_friend_removed: id })
//                 //                  user_ids 
//             }
//         }
//         res = { ...res1 }
//     } catch (err) {
//         console.log('error in user.unfollow()', err)
//     } finally {
//         return res
//     }
// }

// userSchema.statics.searchUser = function (query) {
//     if (query.startsWith('@'))
//         query = query.slice(1)
//     query = new RegExp(query, "i")
//     return this.find({
//         $or: [
//             { screen_name: query },
//             { name: query }
//         ]
//     }).limit(20)
// }

// userSchema.statics.getSuggestions = async function ({
//     //username: screen_name = null,
//     user_id = null
// }) {
//     if (!user_id)
//         throw Error('no user_id given')
//     let { friend_ids } = await Friendship.findOne({ user_id })
//     // personalized later on
//     return this.find({
//         _id: { $ne: user_id },
//         _id: { $nin: friend_ids }
//     })
//         .sort('-followers_count -statuses_count -friends_count -created_at') // my social media algorithm (¬‿¬)
//         .limit(25)
// }

// async function user_genId() {
//     /**
//     * generates simple incrementing value
//     * last value allotted is stored in internals collection as last_id_allotted
//     */
//     await internal_setting.updateOne({ ver: '1.0' }, {
//         $inc: { current_user_id: 1 }
//     }, { upsert: true })
//     let { current_user_id } = await internal_setting.findOne({ ver: '1.0' }, 'current_user_id')
//     return current_user_id
// }
// userSchema.post('save', async (doc, next) => {
//     /**
//      * generates id
//      * keep it minimum
//      */
//     if (!doc.id) {
//         let id = await user_genId()
//         await mongoose.model('User').updateOne({ _id: doc._id }, {
//             $set: {
//                 id: id,
//                 id_str: id.toString()
//             }
//         })
//     }
//     next()
// })
// const { getRandomProfileUrl } = require('../utils/helpers')
// userSchema.post('save', async doc => {
//     // make empty timeline
//     await home_timeline.create({
//         user_id: doc._id,
//     })
//     await Friendship.create({
//         user_id: doc._id,
//     })
//     if (!doc.profile_image_url_https) {
//         await mongoose.model('User').updateOne({ _id: doc._id }, {
//             profile_image_url_https: getRandomProfileUrl(),
//             default_profile_image: false
//         })
//     }
// })

// module.exports = mongoose.model('User', userSchema)