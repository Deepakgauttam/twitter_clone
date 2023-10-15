// Import necessary modules and reducers
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import postsReducer from 'features/posts/postsSlice';
import searchReducer from 'features/search/searchSlice';
import trendsReducer from 'features/trends/trendsSlice';
import usersReducer from 'features/users/usersSlice';
import notifyReducer from 'features/notify/notifySlice';
import authReducer from './authSlice';

// Configure the Redux store
const store = configureStore({
    reducer: {
        posts: postsReducer, // Posts reducer
        search: searchReducer, // Search reducer
        trends: trendsReducer, // Trends reducer
        users: usersReducer, // Users reducer
        notify: notifyReducer, // Notification reducer
        auth: authReducer, // Authentication reducer
    },
    middleware: [...getDefaultMiddleware({ immutableCheck: false })], // Use default middleware with the 'immutableCheck' option disabled
});

export default store; // Export the configured Redux store
