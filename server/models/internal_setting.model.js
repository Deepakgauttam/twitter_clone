const mongoose = require('mongoose');
require('mongoose-long')(mongoose); // Import and configure mongoose-long plugin for handling Long integer types.

/**
 * Internal settings schema, used to store various internal configuration and state data.
 * Multiple documents with different 'ver' values may exist in case of schema changes.
 */
const internalSchema = mongoose.Schema({
    ver: {
        type: String,
        default: '1.0' // Default schema version.
    },
    current_post_id: {
        type: mongoose.Schema.Types.Long, // Use the Long type for storing large integers.
        default: 0 // Default value for current_post_id.
    },
    current_user_id: {
        type: Number, // Store user IDs as regular Numbers.
        default: 0 // Default value for current_user_id.
    }
})

// Export the model based on the internalSchema for interaction with the database.
module.exports = mongoose.model('internal_setting', internalSchema);
