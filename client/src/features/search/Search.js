import React from 'react'
import PostsList from 'comps/PostsList'
import UsersList from 'comps/UsersList'
import { Redirect, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    changeQuery,
    trySearch,
    selectSearchPosts,
    selectSearchUsers,
} from './searchSlice'
import { followUser, unFollowUser } from 'features/users/usersSlice'
import { useEffect } from 'react'
import Spinner from 'comps/Spinner'
import TryAgain from 'comps/TryAgain'
import Heading from 'comps/Heading'

export default () => {
    // Get the current route's location using useLocation from React Router.
    let location = useLocation()

    // Access Redux's dispatch and useSelector hooks.
    let dispatch = useDispatch()
    let { search } = location
    let { status, query } = useSelector(state => state.search)
    let posts = useSelector(state => selectSearchPosts(state, query))
    let users = useSelector(state => selectSearchUsers(state, query))
    let urlq = new URLSearchParams(search).get('q')

    // If there is no search query, redirect to the explore page.
    if (!urlq || !urlq.trim()) {
        return <Redirect to="/explore" />
    }

    // Use the useEffect hook to change the query when the URL query parameter changes.
    useEffect(() => {
        if (query !== urlq)
            dispatch(changeQuery(urlq))
    })

    // If the data is still loading and no posts or users have been loaded, show a loading spinner.
    if (status === 'loading' && !(posts.length || users.length))
        return <Spinner />

    return (
        <>
            {/* Display a heading with a title (query) and optional back button and profile button */}
            <Heading title={query || 'Search'} backButton btnProfile />

            {/* Display the list of users with follow and unfollow actions */}
            <UsersList
                users={users}
                followUser={username => { dispatch(followUser(username)) }}
                unFollowUser={username => { dispatch(unFollowUser(username)) }}
            />

            {/* If there are posts, display the posts list. If not, show a message. */}
            {posts.length ? (
                <PostsList
                    posts={posts}
                    status={status}
                    getPosts={() => { dispatch(trySearch()) }}
                />
            ) : (
                <div className="message">No posts to show</div>
            )}

            {/* If there was an error in the request, provide a "Try Again" option. */}
            {status === 'error' && <TryAgain fn={() => { dispatch(changeQuery(urlq)) }} />}
        </>
    )
}
