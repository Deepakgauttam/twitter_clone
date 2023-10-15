import {
    usersAdded,
    usersAddedDontUpdate,
    usersSelectors
} from 'features/users/usersSlice'; // Import user-related Redux actions, selectors, and slices

import { postsAdded } from './postsSlice'; // Import the 'postsAdded' action from the 'postsSlice'

export const populatePost = (post, state) => ({
    ...post,
    user: usersSelectors.selectById(state, post.user) || post.backup_user, // Populate 'user' using Redux selector or backup user data
    retweeted_by: (post.retweeted_by && usersSelectors.selectById(state, post.retweeted_by)) || post.backup_retweeted_by, // Populate 'retweeted_by' using Redux selector or backup data
    quoted_status: (post.quoted_status && populatePost(post.quoted_status, state)) // Recursively populate 'quoted_status' if available
});

export const parsePosts = (posts, { dont_dispatch_posts = false, dont_update_users = false } = {}) => dispatch => {
    try {
        posts = posts.filter(Boolean); // Filter out falsy posts
        if (!posts.length)
            return; // Return if there are no valid posts

        // Extract user data from posts and retweeted posts
        let users = posts.map(post => post.user).filter(Boolean);
        let users1 = posts.map(post => post.retweeted_status && post.retweeted_status.user).filter(Boolean);
        users.push(...users1);

        // Extract and process retweeted status, if any
        posts = posts.map(post => {
            let { retweeted_status } = post;
            if (retweeted_status) {
                return {
                    ...retweeted_status,
                    is_feed_post: post.is_feed_post,
                    is_retweeted_status: true,
                    retweeted_by: post.user,
                    created_at: post.created_at
                };
            }
            return post;
        }).filter(Boolean);

        // Replace user objects with their 'screen_name' property
        posts = posts.map(post => ({
            ...post,
            user: post.user.screen_name,
            retweeted_by: post.retweeted_by && post.retweeted_by.screen_name,
            backup_user: post.user,
            backup_retweeted_by: post.retweeted_by
        }));

        // Parse quoted posts recursively
        posts = posts.map(post => {
            if (post.quoted_status) {
                let [quote] = dispatch(parsePosts([post.quoted_status], { dont_dispatch_posts: true, dont_update_users: true }));
                post.quoted_status = quote;
            }
            return post;
        });

        // Dispatch parsed posts to Redux if 'dont_dispatch_posts' is not true
        if (!dont_dispatch_posts)
            dispatch(postsAdded(posts));

        // Dispatch user data to Redux based on 'dont_update_users' flag
        if (dont_update_users)
            dispatch(usersAddedDontUpdate(users));
        else
            dispatch(usersAdded(users));

        return posts; // Return the parsed posts
    } catch (err) {
        console.log('error parsing', err); // Log and throw any errors that occur during parsing
        throw err;
    }
};
