import React from 'react'; // Import React library.
import { useCallback } from 'react'; // Import useCallback from React.
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector from React Redux.
import { getFollowers, selectFollowers, followUser, unFollowUser } from './usersSlice'; // Import Redux actions and selectors from the 'usersSlice' module.
import UserList from 'comps/UsersList'; // Import the UserList component.
import Heading from 'comps/Heading'; // Import the Heading component.

export default props => {
    const dispatch = useDispatch(); // Initialize the dispatch function from Redux.
    const { match: { params: { username } = {} } = {} } = props; // Destructure the username from the component's props.

    const users = useSelector(state => selectFollowers(state, username)); // Select the list of followers for the specified user from the Redux store.
    const { user_followerlist_status: status } = useSelector(state => state.users); // Select the status of the user's followers from the Redux store.

    const getUsers = useCallback(() => {
        dispatch(getFollowers(username)); // Define a function to fetch the user's followers and dispatch the action.
    }, [username, dispatch]);

    return (
        <>
            <Heading
                title="Followers"
                backButton
                btnProfile
            />
            <UserList
                followUser={username => { dispatch(followUser(username)) }}
                unFollowUser={username => { dispatch(unFollowUser(username)) }}
                getUsers={getUsers}
                status={status}
                users={users}
                noPop
            />
        </>
    );
}
