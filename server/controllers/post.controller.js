// Import necessary modules and functions
const Post = require('../models/post.model')
const PostEngagement = require('../models/post_engagement.model')
const Friendship = require('../models/friendship.model')
const { serializePost, serializePosts } = require('../serializers/post.serializer')
const { serializeUsers } = require('../serializers/user.serializer')
const assert = require('assert')
const { filterInput } = require('../utils/helpers')

// Define a function for creating a new post
exports.createPost = async (req, res, next) => {
    try {
        // Get the user from the request object
        let user = req.user;

        // Get the request body
        let body = req.body;

        // Destructure the 'text' property from the body and apply input filtering
        let { text, ...rest } = body;
        text = filterInput(text, 'html', { max_length: 500, identifier: 'Post' });

        // Create a new post with the filtered text and other properties
        body = {
            text,
            ...rest
        };

        let post = await Post.addOne({ user_id: user._id }, body);

        // Serialize the post and respond with a success message and the post
        post = await serializePost(post, req.user);
        res.status(200).json({
            'msg': 'post was successfully added',
            post
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for getting a single post by ID
exports.getPost = async (req, res, next) => {
    try {
        // Get the post ID from the request parameters
        let postId = req.params.postId;

        // Find the post with the specified ID
        let post = await Post.findOne({ id_str: postId });

        if (!post) {
            // If no post is found, respond with a bad request message
            res.status(400).json({ msg: "Bad request" });
            return;
        }

        // Serialize the post and respond with it
        post = await serializePost(post, req.user);
        res.status(200).json({
            post
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for liking a post
exports.likePost = async (req, res, next) => {
    try {
        // Get the post ID from the request parameters
        let postId = req.params.postId;

        // Get the user from the request object
        let user = req.user;

        // Call the 'postLiked' function from the Friendship model
        let response = await Friendship.postLiked(user._id, { postId });

        if (response.ok) {
            // If the response is successful, respond with a message
            res.json({ message: "Post was liked" });
        } else {
            // If there's an error, throw an error
            throw Error("Error in like post");
        }
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for unliking a post
exports.unlikePost = async (req, res, next) => {
    try {
        // Get the post ID from the request parameters
        let postId = req.params.postId;

        // Get the user from the request object
        let user = req.user;

        // Call the 'postUnliked' function from the Friendship model
        let response = await Friendship.postUnliked(user._id, { postId });

        if (response.ok) {
            // If the response is successful, respond with a message
            res.json({ message: "Post was un-liked" });
        } else {
            // If there's an error, throw an error
            throw Error("Error in unlike post");
        }
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for reposting a post
exports.repostPost = async (req, res, next) => {
    try {
        // Get the post from the request body
        let post = req.body;

        // Destructure the 'text' property from the post and apply input filtering
        let { text, ...rest } = post;
        text = filterInput(text, 'html', { max_length: 500, identifier: 'Post' });

        // Create a new post with the filtered text and other properties
        post = {
            text,
            ...rest
        };

        let form = {
            text: `RT @${post.user.screen_name}: ${post.text.slice(0, 50)}`,
            retweeted_status: post._id
        };

        // Get the user from the request object
        let user = req.user;

        // Add the new post and update the Friendship model
        await Post.addOne({ user_id: user._id }, form);
        await Friendship.postReposted(user._id, { postId: post.id_str });

        // Respond with a success message
        res.json({
            message: "Successfully reposted"
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for unreposting a post
exports.unrepostPost = async (req, res, next) => {
    try {
        // Get the post from the request body
        let post = req.body;

        // Get the user from the request object
        let user = req.user;
        assert.ok(user);

        // Find the document for the post to be unreposted and delete it
        let doc = await Post.findOne({ retweeted_status: post._id });
        await doc.deleteOne();

        // Update the Friendship model for un-reposting
        await Friendship.postUnreposted(user._id, { post_id: post._id });

        // Respond with a success message
        res.json({
            message: "Successfully unreposted"
        });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for getting the users who liked a post
exports.getLikes = async (req, res, next) => {
    try {
        // Get the post ID and page number from the request parameters and query
        let { postId } = req.params;
        let p = req.query['p'];
        p = parseInt(p); //page/batch number
        const s = 15; //size of page/batch

        // Find the post document with the specified ID
        const post = await Post.findOne({ id_str: postId }, '_id');

        if (!post)
            return res.status(400).json({ msg: 'Bad request' });

        // Find the users who liked the post and serialize them
        let doc = await PostEngagement
            .findOne({ post_id: post._id }, {
                liked_by: {
                    $slice: [s * (p - 1), s]
                }
            }).populate('liked_by');

        if (!doc)
            return res.json({ users: null });

        let users = await serializeUsers(doc.liked_by, req.user);

        // Respond with the serialized users
        res.json({ users });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for getting the users who reposted a post
exports.getReposts = async (req, res, next) => {
    try {
        // Get the post ID and page number from the request parameters and query
        let { postId } = req.params;
        let p = req.query['p'];
        p = parseInt(p); //page/batch number
        const s = 15; //size of page/batch

        // Find the post document with the specified ID
        const post = await Post.findOne({ id_str: postId }, '_id');

        if (!post)
            return res.status(400).json({ msg: 'Bad request' });

        // Find the users who reposted the post and serialize them
        let doc = await PostEngagement
            .findOne({ post_id: post._id }, {
                reposted_by: {
                    $slice: [s * (p - 1), s]
                }
            }).populate('reposted_by');

        if (!doc)
            return res.json({ users: null });

        let users = await serializeUsers(doc.reposted_by, req.user);

        // Respond with the serialized users
        res.json({ users });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for getting the replies to a post
exports.getReplies = async (req, res, next) => {
    try {
        // Get the post ID and page number from the request parameters and query
        const postId = req.params.postId;
        let p = req.query['p'];
        p = parseInt(p); //page/batch number
        const s = 15; //size of page/batch

        // Find the post document with the specified ID
        const post = await Post.findOne({ id_str: postId });

        if (!post)
            return res.status(400).json({ msg: 'Bad request' });

        // Find the reply posts to the specified post and serialize them
        const doc = await PostEngagement
            .findOne({ post_id: post._id }, {
                reply_posts: {
                    $slice: [s * (p - 1), s]
                }
            }).populate('reply_posts');

        if (!doc)
            return res.json({ posts: null });

        const posts = await serializePosts(doc.reply_posts, req.user);

        // Respond with the serialized reply posts
        res.json({ posts });
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}

// Define a function for replying to a post
exports.replyToPost = async (req, res, next) => {
    try {
        // Get the post ID from the request parameters
        const postId = req.params.postId;

        // Get the user from the request object
        const user = req.user;

        // Get the post from the request body
        let post = req.body;

        // Destructure the 'text' property from the post and apply input filtering
        let { text, ...rest } = post;
        text = filterInput(text, 'html', { max_length: 500, identifier: 'Post' });

        // Create a new post with the filtered text and other properties
        post = {
            text,
            ...rest
        };

        // Find the target post to which the reply is being made
        const targetPost = await Post
            .findOne({ id_str: postId })
            .populate('user');

        if (!targetPost)
            return res.status(400).json({ msg: 'Bad request' });

        // Create a new post as a reply to the target post
        let form = {
            ...post,
            "in_reply_to_status_id": targetPost.id,
            "in_reply_to_status_id_str": targetPost.id_str,
            "in_reply_to_user_id": targetPost.user.id,
            "in_reply_to_user_id_str": targetPost.user.id_str,
            "in_reply_to_screen_name": targetPost.user.screen_name,
            "quoted_status": targetPost._id,
            "is_quote_status": false
        };

        // Add the new post, update the PostEngagement model, and serialize the post
        post = await Post.addOne({ user_id: user._id }, form);

        if (post) {
            // If there's no error, update the PostEngagement model and respond with a success message and the post
            await PostEngagement.gotReplied(targetPost._id, post._id);
            post = await serializePost(post, req.user);
            res.json({ msg: "Ok", post });
        } else {
            // If there's an error, throw an error
            throw new Error('Post.addOne response not ok');
        }
    } catch (err) {
        // If an error occurs, pass it to the next middleware
        next(err);
    }
}






// const Post = require('../models/post.model')
// const PostEngagement = require('../models/post_engagement.model')
// const Friendship = require('../models/friendship.model')
// const { serializePost, serializePosts } = require('../serializers/post.serializer')
// const { serializeUsers } = require('../serializers/user.serializer')
// const assert = require('assert')
// const { filterInput } = require('../utils/helpers')

// exports.createPost = async (req, res, next) => {
//     try {
//         let user = req.user;
//         let body = req.body;
//         let { text, ...rest } = body
//         text = filterInput(text, 'html', { max_length: 500, identifier: 'Post' })
//         body = {
//             text,
//             ...rest
//         }
//         let post = await Post.addOne({ user_id: user._id }, body)
//         post = await serializePost(post, req.user)
//         res.status(200).json({
//             'msg': 'post was successfully added',
//             post
//         });
//     } catch (err) {
//         next(err)
//     }
// }
// exports.getPost = async (req, res, next) => {
//     try {
//         let postId = req.params.postId;
//         let post = await Post.findOne({ id_str: postId })
//         if (!post) {
//             res.status(400).json({ msg: "Bad request" })
//             return
//         }
//         post = await serializePost(post, req.user)
//         res.status(200).json({
//             post
//         });
//     } catch (err) { next(err) }
// }
// exports.likePost = async (req, res, next) => {
//     try {
//         let postId = req.params.postId;
//         let user = req.user;
//         let responce = await Friendship.postLiked(user._id, { postId })
//         if (responce.ok)
//             res.json({ message: "Post was liked" })
//         else
//             throw Error("Error in like post")
//     } catch (err) {
//         next(err)
//     }
// }
// exports.unlikePost = async (req, res, next) => {
//     try {
//         let postId = req.params.postId;
//         let user = req.user;
//         let responce = await Friendship.postUnliked(user._id, { postId })
//         if (responce.ok)
//             res.json({ message: "Post was un-liked" })
//         else
//             throw Error("Error in unlike post")
//     } catch (err) {
//         next(err)
//     }
// }
// exports.repostPost = async (req, res, next) => {
//     try {
//         let post = req.body;
//         let { text, ...rest } = post
//         text = filterInput(text, 'html', { max_length: 500, identifier: 'Post' })
//         post = {
//             text,
//             ...rest
//         }
//         let form = {
//             text: `RT @${post.user.screen_name}: ${post.text.slice(0, 50)}`,
//             retweeted_status: post._id
//         }
//         let user = req.user;
//         await Post.addOne({ user_id: user._id }, form)
//         await Friendship.postReposted(user._id, { postId: post.id_str })
//         res.json({
//             message: "Successfully reposted"
//         })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.unrepostPost = async (req, res, next) => {
//     try {
//         let post = req.body;
//         let user = req.user;
//         assert.ok(user)
//         let doc = await Post.findOne({ retweeted_status: post._id })
//         await doc.deleteOne()
//         await Friendship.postUnreposted(user._id, { post_id: post._id })
//         res.json({
//             message: "Successfully unreposted"
//         })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.getLikes = async (req, res, next) => {
//     try {
//         let { postId } = req.params;
//         let p = req.query['p'];
//         p = parseInt(p); //page/batch number
//         const s = 15; //size of page/batch

//         const post = await Post.findOne({ id_str: postId }, '_id');
//         if (!post)
//             return res.status(400).json({ msg: 'Bad request' })

//         let doc = await PostEngagement
//             .findOne({ post_id: post._id }, {
//                 liked_by: {
//                     $slice: [s * (p - 1), s]
//                 }
//             }).populate('liked_by')
//         if (!doc)
//             return res.json({ users: null })
//         let users = await serializeUsers(doc.liked_by, req.user)
//         res.json({ users })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.getReposts = async (req, res, next) => {
//     try {
//         let { postId } = req.params;
//         let p = req.query['p'];
//         p = parseInt(p); //page/batch number
//         const s = 15; //size of page/batch

//         const post = await Post.findOne({ id_str: postId }, '_id');
//         if (!post)
//             return res.status(400).json({ msg: 'Bad request' })

//         let doc = await PostEngagement
//             .findOne({ post_id: post._id }, {
//                 reposted_by: {
//                     $slice: [s * (p - 1), s]
//                 }
//             }).populate('reposted_by')
//         if (!doc)
//             return res.json({ users: null })
//         let users = await serializeUsers(doc.reposted_by, req.user)
//         res.json({ users })
//     } catch (err) {
//         next(err)
//     }
// }
// exports.getReplies = async (req, res, next) => {
//     try {
//         const postId = req.params.postId;
//         let p = req.query['p'];
//         p = parseInt(p); //page/batch number
//         const s = 15; //size of page/batch

//         const post = await Post.findOne({ id_str: postId })
//         if (!post)
//             return res.status(400).json({ msg: 'Bad request' })

//         const doc = await PostEngagement
//             .findOne({ post_id: post._id }, {
//                 reply_posts: {
//                     $slice: [s * (p - 1), s]
//                 }
//             }).populate('reply_posts');
//         if (!doc)
//             return res.json({ posts: null })
//         const posts = await serializePosts(doc.reply_posts, req.user)
//         res.json({ posts })
//     } catch (err) {
//         next(err)
//     }
// }

// exports.replyToPost = async (req, res, next) => {
//     try {
//         const postId = req.params.postId;
//         const user = req.user;
//         let post = req.body;
//         let { text, ...rest } = post
//         text = filterInput(text, 'html', { max_length: 500, identifier: 'Post' })
//         post = {
//             text,
//             ...rest
//         }

//         const targetPost = await Post
//             .findOne({ id_str: postId })
//             .populate('user')
//         if (!targetPost)
//             return res.status(400).json({ msg: 'Bad request' })

//         let form = {
//             ...post,
//             "in_reply_to_status_id": targetPost.id,
//             "in_reply_to_status_id_str": targetPost.id_str, //would be string anyway
//             "in_reply_to_user_id": targetPost.user.id,
//             "in_reply_to_user_id_str": targetPost.user.id_str,
//             "in_reply_to_screen_name": targetPost.user.screen_name,
//             "quoted_status": targetPost._id, //just for UI to look good
//             "is_quote_status": false //maybe use this to distinguish
//         }
//         post = await Post.addOne({ user_id: user._id }, form)
//         if (post) { //no error proceed
//             await PostEngagement.gotReplied(targetPost._id, post._id)
//             post = await serializePost(post, req.user)
//             res.json({ msg: "Ok", post })
//         }
//         else
//             throw new Error('Post.addOne responce not ok')
//     } catch (err) {
//         next(err)
//     }
// }