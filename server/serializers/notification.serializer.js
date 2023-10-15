const { Document } = require('mongoose'); // Import the Document class from Mongoose
const Friendship = require('../models/friendship.model'); // Import the Friendship model
const { serializeUser } = require('./user.serializer'); // Import the serializeUser function
const { serializePost } = require('./post.serializer'); // Import the serializePost function

// Serialize a single notification
exports.serializeNotif = async (notif, client) => {
    if (!notif) // Check if the notification exists
        return; // Return early if it doesn't

    // Serialize the user field
    let user = null;
    if (notif.body.user)
        user = await serializeUser(notif.body.user, client);

    // Serialize the post field
    let post = null;
    if (notif.body.post)
        post = await serializePost(notif.body.post, client);

    notif = notif.toObject(); // Convert the notification to a plain JavaScript object

    return ({
        ...notif,
        body: {
            ...notif.body,
            user,
            post,
        },
    });
}

// Serialize an array of notifications
exports.serializeNotifs = async doc => {
    if (!doc instanceof Document) // Check if doc is an instance of Document
        throw Error('Unknown Notification object'); // Throw an error if it's not

    doc = await doc
        .populate({
            path: 'notifications.body.user',
            model: 'User',
        })
        .populate({
            path: 'notifications.body.post',
            model: 'Post',
        })
        .execPopulate(); // Populate the user and post fields

    return Promise.all(doc.notifications.map(notif => this.serializeNotif(notif, doc.user_id)));
    // Serialize each notification in the array and return a Promise
}
