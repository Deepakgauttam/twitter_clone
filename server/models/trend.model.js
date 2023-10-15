// Import required libraries and models
const mongoose = require('mongoose');
const Hashtag = require('./hashtag.model'); // Import Hashtag model

// Define the schema for the Trend model
const trendSchema = mongoose.Schema({
    trends: [{
        name: {
            type: String,
            required: true,
        },
        url: String,
        promoted_content: {
            type: String,
            default: null
        },
        query: String,
        tweet_volume: Number
    }],
    as_of: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    locations: [{
        name: String,
        woeid: {
            type: Number,
            required: true
        }
    }]
})

var trendInterval; // Declare a variable to hold the trend refresh interval

// Define the 'refreshTrends' static method for the Trend schema
trendSchema.statics.refreshTrends = async function () {
    if (!trendInterval) {
        // Set up a refresh interval if it doesn't exist
        trendInterval = setInterval(async () => {
            await this.refreshTrends();
        }, 30 * 1000); // Refresh trends every 30 seconds
    }
    console.log('refreshing trends');
    
    // Iterate through hashtags and update their scores
    (await Hashtag.find({})).forEach(async tag => {
        const dt = tag.updated_at || tag.created_at;
        if (!dt || !tag.tweet_volume) {
            return;
        }
        const score = (tag.tweet_volume * 10000000) / (Date.now() - dt);
        tag.score = score;
        await tag.save();
    });

    // Retrieve the top 20 trends
    let trends = await Hashtag.find({}).sort('-score -tweet_volume').limit(20);
    
    // Map the trends to the desired format
    trends = trends.map(obj => ({
        name: obj.name,
        tweet_volume: obj.tweet_volume,
        query: encodeURIComponent(obj.name)
    }));

    // Create a default location if it doesn't exist
    if (!await this.exists({ 'locations.woeid': 1 })) {
        this.create({
            locations: [{
                name: "Worldwide",
                woeid: 1
            }]
        });
    }

    // Update the trends for the "Worldwide" location
    return this.updateOne({ "locations.woeid": 1 }, {
        $set: { trends: trends }
    });
}

module.exports = mongoose.model('Trend', trendSchema); // Export the Trend model


// const mongoose = require('mongoose')
// const Hashtag = require('./hashtag.model')

// const trendSchema = mongoose.Schema({
//     trends: [{
//         name: {
//             type: String,
//             required: true,
//         },
//         url: String,
//         promoted_content: {
//             type: String,
//             default: null
//         },
//         query: String,
//         tweet_volume: Number
//     }],
//     as_of: {
//         type: Date,
//     },
//     created_at: {
//         type: Date,
//         default: Date.now
//     },
//     locations: [{
//         name: String,
//         woeid: {
//             type: Number,
//             required: true
//         }
//     }]
// })
// var trendInterval
// trendSchema.statics.refreshTrends = async function () {
//     if (!trendInterval) {
//         trendInterval = setInterval(async () => {
//             await this.refreshTrends()
//         }, 30 * 1000)
//     }
//     console.log('refreshing trends')
//         ; (await Hashtag.find({})).forEach(async tag => {
//             const dt = tag.updated_at || tag.created_at
//             if (!dt || !tag.tweet_volume)
//                 return
//             const score = (tag.tweet_volume * 10000000) / (Date.now() - dt)
//             tag.score = score
//             await tag.save()
//         })
//     let trends = await Hashtag.find({}).sort('-score -tweet_volume').limit(20)
//     trends = trends.map(obj => ({
//         name: obj.name,
//         tweet_volume: obj.tweet_volume,
//         query: encodeURIComponent(obj.name)
//     }))
//     if (!await this.exists({ 'locations.woeid': 1 })) {
//         this.create({
//             locations: [{
//                 name: "Worldwide",
//                 woeid: 1
//             }]
//         })
//     }
//     return this.updateOne({ "locations.woeid": 1 }, {
//         $set: { trends: trends }
//     })
// }

// module.exports = mongoose.model('Trend', trendSchema)