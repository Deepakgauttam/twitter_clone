// Import necessary modules and functions
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { unsubscribeUser } from '../subscription';

// Create an asynchronous thunk for user login
export const login = createAsyncThunk('auth/login', async (_, { dispatch }) => {
    let res = await fetch('/auth/login');
    if (res.ok) {
        let data = await res.json();
        if (data.user) {
            dispatch(loggedIn(data.user)); // Dispatch the 'loggedIn' action when a user is successfully logged in
        }
    } else if (res.status >= 500) {
        throw Error('Request Error'); // Handle errors for server errors
    } else if (res.status >= 400) {
        dispatch(loggedOut()); // Dispatch the 'loggedOut' action when login is unsuccessful (e.g., incorrect credentials)
    }
    return null;
});

// Create an asynchronous thunk for user logout
export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
    unsubscribeUser(); // Unsubscribe the user from push notifications
    dispatch(loggedOut()); // Dispatch the 'loggedOut' action to log the user out
    await fetch('/auth/logout', {
        method: 'POST',
    });
});

// Create the authSlice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: !!sessionStorage.getItem('LOGGED_IN'), // Check if the user is authenticated based on sessionStorage
        status: 'loading', // Possible statuses: 'loading', 'idle', 'error'
        user: JSON.parse(sessionStorage.getItem('user')) || null, // User data from sessionStorage
    },
    reducers: {
        loggedIn(state, action) {
            let user = action.payload;
            state.isAuthenticated = true;
            state.user = user;
            sessionStorage.setItem('LOGGED_IN', '1'); // Store authentication status in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(user)); // Store user data in sessionStorage
        },
        loggedOut(state) {
            state.isAuthenticated = false;
            state.user = null;
            sessionStorage.setItem('LOGGED_IN', ''); // Clear the authentication status in sessionStorage
            sessionStorage.removeItem('user'); // Remove user data from sessionStorage
        },
        userUpdated(state, action) {
            let user = action.payload;
            state.user = user;
            sessionStorage.setItem('user', JSON.stringify(user)); // Update user data in sessionStorage
        },
    },
    extraReducers: {
        [login.rejected]: state => {
            state.status = 'error';
        },
        [login.pending]: state => {
            state.status = 'loading';
        },
        [login.fulfilled]: state => {
            state.status = 'idle';
        },
    },
});

let { actions, reducer } = authSlice;
export const { loggedIn, loggedOut, userUpdated } = actions; // Export the action creators
export default reducer; // Export the reducer
