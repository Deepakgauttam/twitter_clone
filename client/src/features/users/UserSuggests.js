import React from 'react';
import { useEffect } from 'react';
import TryAgain from 'comps/TryAgain';
import Spinner from 'comps/Spinner';
import UsersList from 'comps/UsersList';

import { useSelector, useDispatch } from 'react-redux';
import {
    getUserSuggests,
    selectSuggests,
    followUser,
    unFollowUser
} from './usersSlice';

// Define the UserSuggestions component
export default (props) => {
    // Access the Redux dispatch function
    let dispatch = useDispatch();
    // Get the user_suggests_status from the Redux store
    let { user_suggests_status: status } = useSelector((state) => state.users);
    // Get the list of user suggestions from the Redux store
    let users = useSelector(selectSuggests);

    // Use the useEffect hook to fetch user suggestions when the component mounts
    useEffect(() => {
        // Fetch user suggestions only when the status is 'idle'
        if (status === 'idle') {
            dispatch(getUserSuggests());
        }
        // eslint-disable-next-line
    }, []);

    // Extract the 'message' prop
    let { message } = props;

    // Render different components based on the status and user suggestions

    // If there was an error and there are no user suggestions, show the 'TryAgain' component
    if (status === 'error' && !users.length) {
        return <TryAgain fn={() => { dispatch(getUserSuggests()) }} />;
    }
    // If user suggestions are loading and there are no users, show the 'Spinner' component
    else if (status === 'loading' && !users.length) {
        return <Spinner />;
    }
    // If there are no user suggestions, display a message
    if (!users.length) {
        return (
            <div className="message">
                {message || 'No user suggestions for you right now'}
            </div>
        );
    }

    // If there are user suggestions, render the 'UsersList' component
    return (
        <UsersList
            {...props}
            users={users}
            followUser={(username) => { dispatch(followUser(username)) }}
            unFollowUser={(username) => { dispatch(unFollowUser(username)) }}
        />
    );
};
