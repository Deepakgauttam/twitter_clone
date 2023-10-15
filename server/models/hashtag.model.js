// Import the Mongoose library for database interaction
const mongoose = require('mongoose');

// Define the 'Hashtag' schema for the Mongoose model
const hashtagSchema = mongoose.Schema({
    name: String, // Name of the hashtag
    tweet_volume: {
        type: Number,
        default: 0 // Default tweet volume is 0
    },
    score: {
        type: Number,
        default: 0 // Default score is 0
    }
}, {
    timestamps: { // Define timestamps for creation and update
        createdAt: 'created_at', // Created timestamp
        updatedAt: 'updated_at' // Updated timestamp
    }
});

// Export the 'Hashtag' model with the defined schema
module.exports = mongoose.model('Hashtag', hashtagSchema);
