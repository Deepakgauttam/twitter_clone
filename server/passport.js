const passport = require('passport'); // Import the Passport.js library
const LocalStrategy = require('passport-local'); // Import the LocalStrategy for username/password authentication
const User = require('./models/user.model'); // Import the User model for user data

// Configure Passport to use a LocalStrategy for username/password authentication
passport.use(new LocalStrategy(
    async function (username, password, done) {
        try {
            // Attempt to find a user with the given username in the database
            let user = await User.findOne({ screen_name: username }, '_id');

            // If no user is found, return an error message
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            // Check if the provided password is valid for the user
            if (!await user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            // Authentication successful, return the user object
            return done(null, user);

        } catch (error) {
            console.log('Error in LocalStrategy', error);
            return done(error);
        }
    }
));

// Serialize the user object to the session
passport.serializeUser(function (user, done) {
    done(null, user._id); // Store the user's ID in the session
});

// Deserialize the user object from the session
passport.deserializeUser(function (_id, done) {
    User.findById(_id, function (err, user) {
        done(err, user); // Retrieve the user object from the database using the stored ID
    });
});

module.exports = passport; // Export the configured Passport instance

