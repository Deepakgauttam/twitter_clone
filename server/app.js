// Import required modules and libraries
var express = require('express'); // Import the Express framework
var path = require('path'); // Provides utilities for working with file and directory paths
var fs = require('fs'); // File system module for handling file operations
var cookieParser = require('cookie-parser'); // Middleware for parsing cookies in HTTP requests
var morgan = require('morgan'); // HTTP request logger middleware
var compression = require('compression'); // Middleware for compressing HTTP responses
var mongoose = require('mongoose'); // MongoDB ODM (Object Data Modeling)
const webpush = require('web-push'); // Library for sending web push notifications

const { sessionMiddleware } = require('./utils/middlewares'); // Custom session middleware
const apiRouter = require('./routes/api'); // Router for API routes
const authRouter = require('./routes/auth'); // Router for authentication routes

const pre_populate = require('./dummy-data/pre_populate'); // Data pre-population script
require('dotenv').config(); // Load environment variables from a .env file

// Connect to the MongoDB database
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log('Connected to the database!', 'Pre-populating now...');
        pre_populate(); // Call the data pre-population function
    })
    .catch(err => {
        console.log('Error starting the database', err);
    });

// Create an Express application
var app = express();

const passport = require('./passport'); // Passport.js for user authentication

// Uncomment the following line to trust the first proxy when Node.js is behind a proxy server
// app.set('trust proxy', 1);

app.use(sessionMiddleware); // Use the custom session middleware

// Create a write stream (in append mode) for logging HTTP requests
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Setup request logging using Morgan middleware (combined and dev formats)
app.use(morgan('combined'));
app.use(morgan('dev'));

// Enable response compression and parse JSON and URL-encoded request bodies
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser()); // Parse cookies in incoming requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

app.use(passport.initialize()); // Initialize Passport for user authentication
app.use(passport.session()); // Enable Passport session support

// Set VAPID details for web push notifications
webpush.setVapidDetails(
    process.env.WEB_PUSH_CONTACT,
    process.env.PUBLIC_VAPID_KEY,
    process.env.PRIVATE_VAPID_KEY
);

// Define routes for API and authentication
app.use('/api', apiRouter);
app.use('/auth', authRouter);

// Error handling middleware
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const port = process.env.PORT || 8000; // Use the PORT environment variable or default to port 8000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

exports.app = app; // Export the Express app

