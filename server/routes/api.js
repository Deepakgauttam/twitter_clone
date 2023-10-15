const express = require('express'); // Import the Express.js framework
const { ensureLoggedIn } = require('../utils/middlewares'); // Import the ensureLoggedIn middleware
const {
    createPost,
    getPost,
    likePost,
    unlikePost,
    repostPost,
    unrepostPost,
    getLikes,
    getReposts,
    replyToPost,
    getReplies,
} = require('../controllers/post.controller'); // Import various post-related controllers
const {
    getUser,
    followUser,
    unFollowUser,
    updateUser,
    getFollowers,
    getFriends,
} = require('../controllers/user.controller'); // Import various user-related controllers
const { homeTimeline, userTimeline } = require('../controllers/timeline.controller'); // Import timeline-related controllers
const { search, trends, userSuggests } = require('../controllers/search.controller'); // Import controllers for searching and trends
const {
    notificationRead,
    getNotifications,
    subscribeDevice,
    unsubscribeDevice,
} = require('../controllers/notifications.controller'); // Import controllers for notifications

const router = express.Router(); // Create an Express Router

/* POST read notification */
router.post('/notification_read/:_id', ensureLoggedIn, notificationRead);

/* GET all notifications */
router.get('/notifications', ensureLoggedIn, getNotifications);

/* Push subscribe, unsubscribe */
router.post('/notifications/subscribe', ensureLoggedIn, subscribeDevice);
router.post('/notifications/unsubscribe', ensureLoggedIn, unsubscribeDevice);

/* GET home page. */
router.get('/home_timeline', ensureLoggedIn, homeTimeline);

/* GET user timeline */
router.get('/user_timeline/:username', userTimeline);

/* GET user friends and followers */
router.get('/followers/:username', getFollowers);
router.get('/friends/:username', getFriends);

/* POST post a reply */
router.post('/post/:postId/reply', ensureLoggedIn, replyToPost);

/* GET Post liked_by and reposted_by */
router.get('/post/:postId/likes', getLikes);
router.get('/post/:postId/reposts', getReposts);

/* GET Post replies */
router.get('/post/:postId/replies', getReplies);

/* POST create a new post. */
router.post('/post', ensureLoggedIn, createPost);

/* POST repost a post. */
router.post('/repost', ensureLoggedIn, repostPost);

/* POST unrepost a post. */
router.post('/unrepost', ensureLoggedIn, unrepostPost);

/* GET get a single post. */
router.get('/post/:postId', getPost);

router.post('/like/:postId', ensureLoggedIn, likePost);
router.post('/unlike/:postId', ensureLoggedIn, unlikePost);

/* GET get a single user detail. */
router.get('/user/:username', getUser);

router.post('/follow/:username', ensureLoggedIn, followUser);
router.post('/unfollow/:username', ensureLoggedIn, unFollowUser);

/* POST update an authenticated user */
router.post('/updateuser', ensureLoggedIn, updateUser);

/* GET search results */
router.get('/search', search);

/* GET trends. */
router.get('/trends', trends);

/* GET user suggestions */
router.get('/users', ensureLoggedIn, userSuggests);

module.exports = router;




