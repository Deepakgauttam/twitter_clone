import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
} from '@reduxjs/toolkit'
import { request } from 'api'
import { getFeed, selectUserPosts } from 'features/posts/postsSlice'
import { parsePosts } from 'features/posts/utils'
import { userUpdated as authUserUpdated } from 'store/authSlice'

// Custom sorting function for comparing users
let usersComparer = (a, b) => {
    // Determine which field to use for comparison based on conditions
    let statusesEither = b.statuses_count || a.statuses_count
    if (statusesEither && statusesEither > 3) {
        return b.statuses_count - a.statuses_count
    } else if (b.followers_count || a.followers_count) {
        return b.followers_count - a.followers_count
    }
    return b.statuses_count - a.statuses_count
}

// Create an entity adapter for managing user data
const usersAdapter = createEntityAdapter({
    selectId: user => user.screen_name,
    // Sort users using the custom comparer (if needed)
    // sortComparer: usersComparer
})

// Initial state for the users slice
const initialState = usersAdapter.getInitialState({
    user_suggests_status: 'idle',
    user_timeline_status: 'idle',
    user_timeline_page: 0,
    user_update_status: 'idle',
    user_friendlist_status: 'idle',
    user_friendlist_page: 0,
    user_followerlist_status: 'idle',
    user_followerlist_page: 0,
    post_likes_status: 'idle',
    post_likes_page: 0,
    post_reposts_status: 'idle',
    post_reposts_page: 0,
})

// Async thunk to update user details
export const updateUserDetails = createAsyncThunk(
    'users/updateUserDetails',
    async (body, { dispatch }) => {
        let { user } = await request('/api/updateuser', { body, dispatch })
        if (!user) throw Error('User field null in response')
        dispatch(authUserUpdated(user))
        return dispatch(userAdded(user))
    }
)

// Async thunk to fetch user suggestions
export const getUserSuggests = createAsyncThunk(
    'users/getUserSuggests',
    async (_, { dispatch }) => {
        let data = await request('/api/users', { dispatch })
        return data.users
    }
)

// Async thunk to fetch a user's timeline
export const getUserTimeline = createAsyncThunk(
    'users/getUserTimeline',
    async (username, { dispatch, getState }) => {
        let { user_timeline_page: p } = getState().users
        let l = selectUserPosts(getState(), username).length
        if (!l || l === 0) {
            dispatch(resetTimelinePage())
            p = 0
        }
        let url = `/api/user_timeline/${username}?p=${p + 1}`
        let { posts, user } = await request(url, { dispatch })
        if (user) {
            dispatch(userAdded(user))
        }
        dispatch(parsePosts(posts))
        return posts.length
    }
)

// Async thunk to follow a user
export const followUser = createAsyncThunk(
    'users/folllowUser',
    async (username, { dispatch, getState }) => {
        dispatch(followingChanged({ username, following: true }))
        username = encodeURIComponent(username)
        await request(`/api/follow/${username}`, { dispatch, body: {} })
        let feedStatus = getState().posts.feed_status
        if (feedStatus === 'done') dispatch(getFeed())
    }
)

// Async thunk to unfollow a user
export const unFollowUser = createAsyncThunk(
    'users/unFolllowUser',
    async (username, { dispatch }) => {
        dispatch(followingChanged({ username, following: false }))
        username = encodeURIComponent(username)
        return request(`/api/unfollow/${username}`, { dispatch, body: {} })
    }
)

// Async thunk to fetch a user's followers
export const getFollowers = createAsyncThunk(
    'users/getFollowers',
    async (username, { dispatch, getState }) => {
        let {
            users: { user_followerlist_page: p },
        } = getState()
        let l = selectFollowers(getState(), username).length
        if (!l) {
            dispatch(resetFollowerlistPage())
            p = 0
        }
        p = parseInt(p)
        username = encodeURIComponent(username)
        let { users = [] } = await request(`/api/followers/${username}?p=${p + 1}`, { dispatch })
        users = users || []
        if (!users.length) return
        users = users
            .map(user => ({ ...user, follower_of: decodeURIComponent(username) }))
            .filter(Boolean)
        dispatch(usersAdded(users))
        return users.length
    }
)

// Async thunk to fetch a user's friends
export const getFriends = createAsyncThunk(
    'users/getFriends',
    async (username, { dispatch, getState }) => {
        let {
            users: { user_friendlist_page: p },
        } = getState()
        let l = selectFriends(getState(), username).length
        if (!l) {
            dispatch(resetFriendlistPage())
            p = 0
        }
        p = parseInt(p)
        username = encodeURIComponent(username)
        let { users = [] } = await request(`/api/friends/${username}?p=${p + 1}`, { dispatch })
        users = users || []
        if (!users.length) return
        users = users
            .map(user => ({ ...user, friend_of: decodeURIComponent(username) }))
            .filter(Boolean)
        dispatch(usersAdded(users))
        return users.length
    }
)

// Async thunk to fetch users who liked a post
export const getLikes = createAsyncThunk(
    'users/getLikes',
    async (postId, { dispatch, getState }) => {
        try {
            let {
                users: { post_likes_page: p },
            } = getState()
            p = parseInt(p)
            let l = selectLikes(getState(), postId).length
            if (!l) {
                dispatch(resetLikesPage())
                p = 0
            }
            let { users = [] } = await request(`/api/post/${postId}/likes?p=${p + 1}`, { dispatch })
            users = users || []
            if (!users.length) return
            users = users.map(user => ({ ...user, liked_post: postId })).filter(Boolean)
            dispatch(usersAdded(users))
            return users.length
        } catch (err) {
            console.log(err)
            throw err
        }
    }
)

// Async thunk to fetch users who reposted a post
export const getReposts = createAsyncThunk(
    'users/getReposts',
    async (postId, { dispatch, getState }) => {
        let {
            users: { post_reposts_page: p },
        } = getState()
        p = parseInt(p)
        let l = selectReposts(getState(), postId).length
        if (!l) {
            dispatch(resetRepostsPage())
            p = 0
        }
        let { users = [] } = await request(`/api/post/${postId}/reposts?p=${p + 1}`, { dispatch })
        users = users || []
        if (!users.length) return
        users = users.map(user => ({ ...user, reposted_post: postId })).filter(Boolean)
        dispatch(usersAdded(users))
        return users.length
    }
)

// Create the users slice
const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        // Reducer to update the 'following' status of a user
        followingChanged: (state, action) => {
            let { username, following } = action.payload
            usersAdapter.updateOne(state, {
                id: username,
                changes: {
                    following,
                    new: true,
                },
            })
        },
        // Reset the timeline pagination page
        resetTimelinePage: state => {
            state.user_timeline_page = 0
        },
        // Reset the follower list pagination page
        resetFollowerlistPage: state => {
            state.user_followerlist_page = 0
        },
        // Reset the friend list pagination page
        resetFriendlistPage: state => {
            state.user_friendlist_page = 0
        },
        // Reset the likes pagination page
        resetLikesPage: state => {
            state.post_likes_page = 0
        },
        // Reset the reposts pagination page
        resetRepostsPage: state => {
            state.post_reposts_page = 0
        },
        // Reducer to add or update a user
        userAdded: usersAdapter.upsertOne,
        // Reducer to add or update multiple users
        usersAdded: usersAdapter.upsertMany,
        // Reducer to add multiple users without updating
        usersAddedDontUpdate: usersAdapter.addMany,
    },
    extraReducers: {
        // Handle the result of fetching user suggestions
        [getUserSuggests.rejected]: state => {
            state.user_suggests_status = 'error'
        },
        [getUserSuggests.pending]: state => {
            state.user_suggests_status = 'loading'
        },
        [getUserSuggests.fulfilled]: (state, action) => {
            state.user_suggests_status = 'idle'
            usersAdapter.addMany(state, action.payload)
        },
        // Handle the result of fetching a user's timeline
        [getUserTimeline.rejected]: state => {
            state.user_timeline_status = 'error'
        },
        [getUserTimeline.pending]: state => {
            state.user_timeline_status = 'loading'
        },
        [getUserTimeline.fulfilled]: (state, action) => {
            let length = action.payload
            if (length > 0) {
                state.user_timeline_status = 'idle'
                state.user_timeline_page += 1
            } else state.user_timeline_status = 'done'
        },
        // Handle the result of updating user details
        [updateUserDetails.rejected]: state => {
            state.user_update_status = 'error'
        },
        [updateUserDetails.pending]: state => {
            state.user_update_status = 'pending'
        },
        [updateUserDetails.fulfilled]: state => {
            state.user_update_status = 'idle'
        },
        // Handle the result of fetching user followers
        [getFollowers.rejected]: state => {
            state.user_followerlist_status = 'error'
        },
        [getFollowers.pending]: state => {
            state.user_followerlist_status = 'loading'
        },
        [getFollowers.fulfilled]: (state, action) => {
            const length = action.payload
            if (length > 0) {
                state.user_followerlist_status = 'idle'
                state.user_followerlist_page += 1
            } else state.user_followerlist_status = 'done'
        },
        // Handle the result of fetching user friends
        [getFriends.rejected]: state => {
            state.user_friendlist_status = 'error'
        },
        [getFriends.pending]: state => {
            state.user_friendlist_status = 'loading'
        },
        [getFriends.fulfilled]: (state, action) => {
            const length = action.payload
            if (length > 0) {
                state.user_friendlist_status = 'idle'
                state.user_friendlist_page += 1
            } else state.user_friendlist_status = 'done'
        },
        // Handle the result of fetching likes on a post
        [getLikes.rejected]: state => {
            state.post_likes_status = 'error'
        },
        [getLikes.pending]: state => {
            state.post_likes_status = 'loading'
        },
        [getLikes.fulfilled]: (state, action) => {
            const length = action.payload
            if (length > 0) {
                state.post_likes_status = 'idle'
                state.post_likes_page += 1
            } else state.post_likes_status = 'done'
        },
        // Handle the result of fetching reposts of a post
        [getReposts.rejected]: state => {
            state.post_reposts_status = 'error'
        },
        [getReposts.pending]: state => {
            state.post_reposts_status = 'loading'
        },
        [getReposts.fulfilled]: (state, action) => {
            const length = action.payload
            if (length > 0) {
                state.post_reposts_status = 'idle'
                state.post_reposts_page += 1
            } else state.post_reposts_status = 'done'
        },
    },
})

const { actions, reducer } = usersSlice
export default reducer
export const {
    followingChanged,
    userAdded,
    usersAdded,
    resetTimelinePage,
    resetFollowerlistPage,
    resetFriendlistPage,
    usersAddedDontUpdate,
    resetLikesPage,
    resetRepostsPage,
} = actions

export const usersSelectors = usersAdapter.getSelectors(state => state.users)

// Select user suggestions and sort based on the custom comparer
export const selectSuggests = createSelector(usersSelectors.selectAll, users =>
    users.filter(user => user.following === false || user.new === true).sort(usersComparer)
)

// Select searched users by query
export const selectSearchUsers = createSelector(
    [usersSelectors.selectAll, (state, query) => query],
    (users, query) => users.filter(user => user.searched === true && user.query === query)
)

// Select friends of a user
export const selectFriends = createSelector(
    [usersSelectors.selectAll, (_, username) => username],
    (users, username) =>
        users
            .filter(user => user.friend_of === username)
            .filter(user => user.friend_of !== user.screen_name)
)

// Select followers of a user
export const selectFollowers = createSelector(
    [usersSelectors.selectAll, (_, username) => username],
    (users, username) =>
        users
            .filter(user => user.follower_of === username)
            .filter(user => user.follower_of !== user.screen_name)
)

// Select users who liked a post
export const selectLikes = createSelector(
    [usersSelectors.selectAll, (_, postId) => postId],
    (users, postId) => users.filter(user => user.liked_post === postId)
)

// Select users who reposted a post
export const selectReposts = createSelector(
    [usersSelectors.selectAll, (_, postId) => postId],
    (users, postId) => users.filter(user => user.reposted_post === postId)
)
