const express = require('express'); // Import the Express.js framework
const passport = require('passport'); // Import Passport.js for authentication
const User = require('../models/user.model'); // Import the User model
const { ensureLoggedIn } = require('../utils/middlewares'); // Import the ensureLoggedIn middleware
const { filterInput } = require('../utils/helpers'); // Import a helper function for input filtering

// Create an Express Router
const router = express.Router();

// Handle user login
router.post('/login', passport.authenticate('local'), async (req, res) => {
    try {
        res.json({
            user: await User.findById(req.user._id),
            message: 'logged in',
        });
    } catch (err) {
        console.log('error in /login', err);
        res.status(500).json({
            msg: 'Something went wrong!, cannot process your request at this moment!',
        });
    }
});

// Check if the user is logged in
router.get('/login', ensureLoggedIn, async (req, res) => {
    try {
        res.json({
            user: await User.findById(req.user._id),
            message: 'logged in',
        });
    } catch (err) {
        console.log('error in get.login (checks if logged in)', err);
        res.status(500).json({
            msg: 'Something went wrong cannot process your request right now',
        });
    }
});

// Handle user logout
router.post('/logout', (req, res) => {
    let { socketId } = req.session;
    req.logout();
    req.session.destroy(err => {
        if (err) console.log('error /logout', err);
        res.redirect('/');
    });
    // destroySocketSession(socketId)
});

// Handle user signup
router.post('/signup', async (req, res) => {
    try {
        let { password, fullname, username } = req.body;
        password = filterInput(password, 'password');
        username = filterInput(username, 'username', { min_length: 4 });
        fullname = filterInput(fullname, 'name', { min_length: 0 });
        if (await User.exists({ screen_name: username })) {
            res.status(409).json({
                message: 'username is taken',
            });
            return;
        }
        let user = await User.createNew(
            {
                screen_name: username,
                name: fullname,
            },
            { password }
        );
        if (user)
            req.login(
                {
                    _id: user._id,
                },
                err => {
                    if (err) {
                        console.log('error logging in new user', err);
                        res.status(409).json({
                            message: 'user created, log in now',
                        });
                        return;
                    }
                    res.json({
                        message: 'user successfully created, logging in',
                        user,
                    });
                }
            );
        console.log('user created', user);
    } catch (err) {
        console.log('error in /signup', err);
        res.status(400).json({
            message: 'Your request could not be completed',
        });
    }
});

module.exports = router;
