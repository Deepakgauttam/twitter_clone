import React from 'react'
import UserLink from 'comps/user-link'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Define a functional component that displays a reply tag or retweet information for a post
export default ({ post, no_reply_tag = false }) => {
    // Get the authenticated user's information from the Redux store
    const { user: authUser } = useSelector(state => state.auth)

    // Extract the 'retweeted_by' field from the 'post' object
    let { retweeted_by } = post

    // Determine the name of the post's author based on whether it's the authenticated user
    let name1 = authUser && (authUser.screen_name === post.user.screen_name) ? 'You' : '@' + post.user.screen_name

    // Determine the name of the user being replied to, based on whether it's the authenticated user
    let name2 = authUser && (authUser.screen_name === post.in_reply_to_screen_name) ? 'you' : '@' + post.in_reply_to_screen_name

    // Create the reply tag text
    let reply_tag_text = `${name1} replied to ${name2}`

    // Return the following JSX elements conditionally based on 'no_reply_tag' and 'post.in_reply_to_screen_name'
    return (
        <>
            {/* Display the retweet information if 'retweeted_by' exists and 'no_reply_tag' is true */}
            {retweeted_by && (no_reply_tag = true) && (
                <UserLink
                    user={retweeted_by}
                    className="text-muted"
                    to={`/user/${retweeted_by.screen_name}`}
                >
                    <small>@{retweeted_by.screen_name} retweeted</small>
                </UserLink>
            )}

            {/* Display the reply tag if 'no_reply_tag' is not true and 'post.in_reply_to_screen_name' exists */}
            {!no_reply_tag && post.in_reply_to_screen_name && (
                <Link
                    className="text-muted"
                    to={`/post/${post.in_reply_to_status_id_str}`}
                >
                    <small>{reply_tag_text}</small>
                </Link>
            )}
        </>
    )
}
