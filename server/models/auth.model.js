// Import the Mongoose library for database interaction
const mongoose = require('mongoose');

// Import the bcrypt library for password hashing
const bcrypt = require('bcryptjs');

// Define the authentication schema for the 'Auth' model
const authSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    passwordHash: String, // Stores the hashed password
});

// Define a static method to validate a password for a given user_id
authSchema.statics.validPassword = async function (user_id, password) {
    // Find the authentication data for the provided user_id
    let auth = await this.findOne({ user_id }, 'passwordHash');
    if (!auth) {
        console.log('error in auth.validPassword');
        throw Error('Invalid user_id.');
    }
    // Compare the provided password with the stored passwordHash
    return bcrypt.compare(password, auth.passwordHash);
};

// Define a static method to create new authentication data for a user
authSchema.statics.createNew = async function (user_id, authData) {
    let password = authData.password;
    if (!password || password.length === 0) {
        throw Error('Password is required for auth.createNew');
    }
    // Generate a password hash with an automatically generated salt
    let passwordHash = await bcrypt.hash(password, 10);
    // Create a new authentication record
    await this.create({
        user_id,
        passwordHash,
    });
};

// Export the 'Auth' model with the defined schema
module.exports = mongoose.model('Auth', authSchema);


// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const authSchema = mongoose.Schema({
//     user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         index: true,
//     },
//     passwordHash: String, //hashed password
// })

// authSchema.statics.validPassword = async function (user_id, password) {
//     let auth = await this.findOne({ user_id }, 'passwordHash');
//     if (!auth) {
//         console.log('erorr in auth.validpassword')
//         throw Error('Invalid user_id.')
//     }
//     return bcrypt.compare(password, auth.passwordHash)
// }
// authSchema.statics.createNew = async function (user_id, authDat) {
//     let password = authDat.password;
//     if (!password && password.length === 0) {
//         throw Error('password required for auth.createNew')
//     }
//     let passwordHash = await bcrypt.hash(password, 10) //auto gens salt
//     await this.create({
//         user_id,
//         passwordHash
//     })
// }
// module.exports = mongoose.model('Auth', authSchema)
