// Import the Notification model and the serializeNotifs function from their respective files
const Notification = require('../models/notification.model')
const { serializeNotifs } = require('../serializers/notification.serializer')

// Define a function for marking a notification as read
exports.notificationRead = async (req, res, next) => {
    try {
        // Extract the notification _id from the request parameters
        let { _id = null } = req.params;

        // Get the user from the request object
        let user = req.user;

        // Update the Notification document to mark the notification as read
        await Notification.updateOne({ user_id: user._id, 'notifications._id': _id }, {
            $set: { 'notifications.$.read': true }
        })

        // Respond with a success message
        res.json({ msg: "Notification marked as read" })
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err)
    }
}

// Define a function for retrieving notifications
exports.getNotifications = async (req, res, next) => {
    try {
        // Get the user from the request object
        let user = req.user;

        // Find a Notification document for the user and select the 'notifications' field
        let doc = await Notification.findOne({ user_id: user._id }, 'notifications')

        // If a document is found, serialize the notifications and respond with them
        if (doc)
            res.json({ notifications: await serializeNotifs(doc) })
        else
            // If no document is found, respond with a message indicating an empty result
            res.json({ notifications: null, message: "Empty" })
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err)
    }
}

// Define a function for subscribing a device
exports.subscribeDevice = async (req, res, next) => {
    try {
        const user = req.user;
        const subscription = req.body;

        // Check if the subscription has required fields ('endpoint' and 'keys')
        if (!subscription.endpoint || !subscription.keys) {
            // Respond with an error message if the subscription is invalid
            res.status(400).json({ msg: 'Invalid subscription' })
            return
        }

        // Check if the subscription already exists for the user
        if (!await Notification.exists({
            user_id: user._id,
            'subscriptions.endpoint': subscription.endpoint
        })) {
            // If it doesn't exist, save the subscription in the database
            console.log('saving subscription in db')
            await Notification.updateOne({ user_id: user._id }, {
                $push: { subscriptions: subscription }
            }, { upsert: true })

            // Store the subscription endpoint in the session
            const session = req.session;
            session.endpoint = subscription.endpoint;
            session.save();
        } else {
            console.log('Subscription already exists')
        }

        // Respond with a success message
        res.status(200).json({ 'success': true })
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err)
    }
}

// Define a function for unsubscribing a device
exports.unsubscribeDevice = async (req, res, next) => {
    try {
        const user = req.user;

        // Get the subscription endpoint from the session
        const endpoint = req.session.endpoint;

        if (!endpoint) {
            console.log('no endpoint in session');
            return res.status(400).json({ msg: 'Not subscribed' });
        }

        // Remove the subscription with the specified endpoint from the user's document
        await Notification.updateOne({ user_id: user._id }, {
            $pull: { subscriptions: { endpoint } }
        })

        // Respond with a success message
        res.json({ msg: 'Ok' })
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err)
    }
}



// const Notification = require('../models/notification.model')
// const { serializeNotifs } = require('../serializers/notification.serializer')

// exports.notificationRead = async (req, res, next) => {
//     try {
//         let { _id = null } = req.params;
//         let user = req.user;
//         await Notification.updateOne({ user_id: user._id, 'notifications._id': _id }, {
//             $set: { 'notifications.$.read': true }
//         })
//         res.json({ msg: "Notification marked read" })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.getNotifications = async (req, res, next) => {
//     try {
//         let user = req.user
//         let doc = await Notification.findOne({ user_id: user._id }, 'notifications')
//         if (doc)
//             res.json({ notifications: await serializeNotifs(doc) })
//         else
//             res.json({ notifications: null, message: "Empty" })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.subscribeDevice = async (req, res, next) => {
//     try {
//         const user = req.user;
//         const subscription = req.body
//         if (!subscription.endpoint || !subscription.keys) { // Not a valid subscription.
//             res.status(400).json({ msg: 'Invalid subscription' })
//             return
//         }
//         if (!await Notification.exists({
//             user_id: user._id,
//             'subscriptions.endpoint': subscription.endpoint
//         })) {
//             console.log('saving subscription in db')
//             await Notification.updateOne({ user_id: user._id }, {
//                 $push: { subscriptions: subscription }
//             }, { upsert: true })
//             const session = req.session;
//             session.endpoint = subscription.endpoint;
//             session.save()
//         } else { console.log('Subscription already exists') }

//         res.status(200).json({ 'success': true })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.unsubscribeDevice = async (req, res, next) => {
//     try {
//         const user = req.user;
//         const endpoint = req.session.endpoint;
//         if (!endpoint) {
//             console.log('no endpoint in session')
//             return res.status(400).json({ msg: 'Not subscripbed' })
//         }
//         await Notification.updateOne({ user_id: user._id }, {
//             $pull: { subscriptions: { endpoint } }
//         })
//         res.json({ msg: 'Ok' })
//     } catch (err) {
//         next(err)
//     }
// }