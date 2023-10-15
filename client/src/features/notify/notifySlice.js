import {
    createAsyncThunk,
    createSlice,
    createEntityAdapter,
    createSelector,
} from '@reduxjs/toolkit'
import { request } from 'api'

// Create an entity adapter to manage notifications in the state
const notifyAdapter = createEntityAdapter({
    selectId: notification => notification._id.toString(),
    sortComparer: (a, b) => b.created_at.localeCompare(a.created_at),
})

// Set the interval time for fetching notifications and initialize the interval variable
const interval = 15 * 1000
var notifsInterval

// Action to fetch notifications
export const fetchNotifs = () => async (dispatch, getState) => {
    // Check if the user is authenticated
    const {
        auth: { isAuthenticated },
    } = getState()

    if (isAuthenticated && !notifsInterval) {
        // If authenticated and interval is not set, set up an interval to periodically fetch notifications
        notifsInterval = setInterval(() => {
            dispatch(fetchNotifs())
        }, interval)
    } else if (!isAuthenticated && notifsInterval) {
        // If not authenticated and interval is set, clear the interval
        clearInterval(notifsInterval)
    }

    // Check the status of notification fetching
    const {
        notify: { status },
    } = getState()

    // If notifications are already loading, return
    if (status === 'loading') return

    // Otherwise, dispatch the fetch notification action
    dispatch(_fetchNotifs())
}

// Create an async thunk to fetch notifications
export const _fetchNotifs = createAsyncThunk('notifs/fetchAll', async (_, { dispatch }) => {
    // Fetch notifications from the API using the request function
    let { notifications } = await request('/api/notifications', { dispatch })

    // If no notifications are returned, throw an error
    if (!notifications) throw Error('No notifications')

    // Dispatch an action to add the fetched notifications to the state
    return dispatch(notificationsAdded(notifications))
})

// Create an async thunk to mark a notification as read
export const readNotif = createAsyncThunk(
    'notifs/readNotif',
    async (notification, { dispatch }) => {
        // Dispatch an action to mark the notification as read
        dispatch(notifRead(notification))

        // Send a request to mark the notification as read on the server
        return request(`/api/notification_read/${notification._id}`, { dispatch, body: {} })
    }
)

// Define the initial state for the notifications slice
const initialState = notifyAdapter.getInitialState({
    status: 'idle', // or 'loading'
})

// Create the notifications slice
const notifySlice = createSlice({
    name: 'notify',
    initialState,
    reducers: {
        notificationAdded: notifyAdapter.upsertOne,
        notificationsAdded: notifyAdapter.upsertMany,
        notifRead: (state, action) => {
            let notif = action.payload
            // Mark the notification as read
            notifyAdapter.upsertOne(state, {
                ...notif,
                read: true,
            })
        },
    },
    extraReducers: {
        [fetchNotifs.pending]: state => {
            // Set the status to 'loading' when fetching notifications
            state.status = 'loading'
        },
        [fetchNotifs.rejected]: state => {
            // Set the status back to 'idle' if fetching notifications is rejected
            state.status = 'idle'
        },
        [fetchNotifs.fulfilled]: state => {
            // Set the status to 'idle' when fetching notifications is successful
            state.status = 'idle'
        },
    },
})

// Extract the reducer and actions from the slice
const { reducer, actions } = notifySlice

// Export the actions
export const { notificationAdded, notificationsAdded, notifRead } = actions

// Export the reducer
export default reducer

// Create selectors using the entity adapter
export const notifySelectors = notifyAdapter.getSelectors(state => state.notify)

// Create a selector to filter unread notifications
export const selectUnread = createSelector([notifySelectors.selectAll], all =>
    all.filter(one => !one.read)
)
