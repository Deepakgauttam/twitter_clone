import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit'
import { request } from 'api'
import { usersAdded } from 'features/users/usersSlice'
import { parsePosts } from 'features/posts/utils'

// This function is used to initiate a search. It checks the current status and dispatches 'getSearch'.
export const trySearch = () => async (dispatch, getState) => {
    let { search: { status } } = getState()
    if (status === 'loading')
        return
    dispatch(getSearch())
}

// This async thunk is responsible for making an API request to search for posts and users.
export const getSearch = createAsyncThunk(
    'search/getSearch',
    async (_, { getState, dispatch }) => {
        let { search: { page: p, query: q } } = getState()
        if (!q || !q.trim())
            throw Error('No Query')
        let query = encodeURIComponent(q)
        let url = `/api/search?q=${query}&p=${p + 1}`
        let { posts = [], users = [] } = await request(url, { dispatch })
        posts = posts || []
        users = users || []
        posts = posts.map(post => ({ ...post, searched: true, query: q }))
        users = users.map(user => ({ ...user, searched: true, query: q })).filter(Boolean)
        dispatch(usersAdded(users))

        dispatch(parsePosts(posts))
        return posts.length
    }
)

// This async thunk is used to change the search query and trigger a new search.
export const changeQuery = createAsyncThunk(
    'search/changeQuery',
    async (query, { dispatch }) => {
        dispatch(queryChanged(query))
        return dispatch(getSearch())
    }
)

// Define the initial state and reducers for the search slice.
const searchSlice = createSlice({
    name: 'search',
    initialState: {
        status: 'idle', // || 'loading', 'error', 'done'
        page: 0, //page currently on, page to fetch is the next one
        query: '',
    },
    reducers: {
        queryChanged: (state, action) => {
            state.query = action.payload
            state.page = 0
        }
    },
    extraReducers: {
        [getSearch.rejected]: state => { state.status = 'error' },
        [getSearch.pending]: state => { state.status = 'loading' },
        [getSearch.fulfilled]: (state, action) => {
            let length = action.payload
            if (length) {
                state.status = 'idle'
                state.page += 1
            } else
                state.status = 'done'
        }
    }
})

// Extract actions and reducer from the slice.
const { actions, reducer } = searchSlice
export default reducer

// Export the 'queryChanged' action.
export const { queryChanged } = actions

// Import and re-export selectors from other slices for easier access.
export { selectSearchUsers } from 'features/users/usersSlice'
export { selectSearchPosts } from 'features/posts/postsSlice'
