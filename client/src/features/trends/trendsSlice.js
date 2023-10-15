import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'; // Import Redux Toolkit functions.

import { request } from 'api'; // Import the 'request' function from an 'api' module.

// Create an entity adapter for managing trending topics.
const trendsAdapter = createEntityAdapter({
    selectId: trend => trend.locations[0].woeid, // Define a selector function to get the entity ID.
    sortComparer: (a, b) => (b.trends.length - a.trends.length) // Define a sorting function for entities.
});

// Define the initial state for the trending topics slice using the entity adapter.
const initialState = trendsAdapter.getInitialState({
    status: 'idle' // Initialize the status to 'idle'.
});

// Create an asynchronous thunk to fetch trending topics from an API.
export const getTrends = createAsyncThunk(
    'trends/getTrends',
    async (woeid = 1, { dispatch }) => {
        // Send a request to the API to fetch trending topics for a specified location.
        let { locations, trends } = await request(`/api/trends?woeid=${woeid}`, { dispatch });
        return { locations, trends }; // Return the retrieved data as the action payload.
    }
);

// Create a Redux slice for trending topics.
const trendsSlice = createSlice({
    name: 'trends', // Define the name of the slice.
    initialState, // Set the initial state.
    reducers: {}, // Define any additional reducer functions if needed (none in this case).
    extraReducers: {
        [getTrends.rejected]: state => { state.status = 'error' }, // Handle a rejected action by setting the status to 'error'.
        [getTrends.pending]: state => { state.status = 'loading' }, // Handle a pending action by setting the status to 'loading'.
        [getTrends.fulfilled]: (state, action) => {
            state.status = 'idle'; // Handle a fulfilled action by setting the status to 'idle'.
            trendsAdapter.upsertOne(state, action.payload); // Update the state with the retrieved data.
        }
    }
});

const { actions, reducer } = trendsSlice; // Destructure the actions and reducer from the slice.
export default reducer; // Export the reducer as the default export.
export const { queryChanged } = actions; // Export any additional actions.

// Export selectors using the entity adapter for accessing trending topics in the Redux store.
export const trendsSelectors = trendsAdapter.getSelectors(state => state.trends);
