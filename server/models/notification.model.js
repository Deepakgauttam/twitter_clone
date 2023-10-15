const mongoose = require('mongoose')
const webpush = require('web-push')

// Define the schema for subdocuments within notifications
const subdocSchema = new mongoose.Schema({
    type: String, // Type of notification, e.g., 'replied', 'mentioned', 'followed', 'liked', etc.
    title: String, // Notification title
    body: {
        type: Object,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Reference to a User document
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post' // Reference to a Post document
        },
        link: String // Link associated with the notification
    },
    read: { type: Boolean, default: false } // Whether the notification has been read
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

// Define the schema for the main Notification document
const notifySchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    notifications: [subdocSchema], // List of notifications (subdocuments)
    subscriptions: [{}] // Push subscriptions for each device
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// Static method to push notifications for a user
notifySchema.statics.push = async function (user_id, ...notifs) {
    let doc = await this.findOne({ user_id })
    if (!doc)
        doc = await this.create({ user_id })
    return doc.push(...notifs)
}

// Method to push notifications to a user's document
notifySchema.methods.push = async function (...notifs) {
    const maxSize = 20
    this.notifications.push({
        $each: notifs,
        $sort: { created_at: -1 },
        $slice: maxSize
    })
    notifs = this.notifications.slice(-notifs.length)
    // Push notifications to the user's devices
    notifs.forEach(notif => sendPushNotif(notif, this.subscriptions, this.user_id))
    return this.save()
}

// Function to send push notifications
async function sendPushNotif(notif, subscriptions, user_id) {
    if (!subscriptions.length)
        return
    let page, body, title = notif.title

    // Determine the type of notification and construct content accordingly
    if (notif.type === 'mentioned') {
        // Handle 'mentioned' type notification
        // Fetch related Post information
        let post = await mongoose.model('Post').findById(notif.body.post).populate('user')
        page = `/post/${post.id_str}`
        body = post.text
        title = `@${post.user.screen_name} mentioned you in a post`
    }
    else if (notif.type === 'followed') {
        // Handle 'followed' type notification
        // Fetch information about the user who started following
        const user = await mongoose.model('User').findById(notif.body.user)
        const client = await mongoose.model('User').findById(user_id)
        page = `/user/${client.screen_name}/followers`
        title = `@${user.screen_name} started following you 🥳`
        body = 'Wanna follow them back 🥺'
    }
    // Handle other notification types similarly

    // Construct the push notification payload
    const payload = JSON.stringify({
        title: title,
        options: {
            data: {
                page,
                _id: notif._id
            },
            body: body
        }
    })

    // Send the notification to each subscription
    subscriptions.forEach(subscription =>
        webpush.sendNotification(subscription, payload)
            .catch(e => {
                console.log(e)
                if (e.statusCode === 410 || e.statusCode === 404) {
                    mongoose.model('Notification').updateOne({ 'subscriptions.endpoint': subscription.endpoint }, {
                        $pull: { subscriptions: { endpoint: subscription.endpoint } }
                    }).then(res => {
                        console.log('removed subscription from db', res)
                    })
                }
            }))
}

module.exports = mongoose.model('Notification', notifySchema)
