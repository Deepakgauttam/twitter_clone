import React from 'react'; // Import React library.
import { useCallback } from 'react'; // Import useCallback from React.
import Heading from 'comps/Heading'; // Import the Heading component.
import UsersList from 'comps/UsersList'; // Import the UsersList component.

import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector from React Redux.
import { selectReposts, getReposts, followUser, unFollowUser } from './usersSlice'; // Import Redux actions and selectors from the 'usersSlice' module.

export default (props) => {
    const dispatch = useDispatch(); // Initialize the dispatch function from Redux.
    const { match: { params: { postId } = {} } = {} } = props; // Destructure the postId from the component's props.

    const users = useSelector(state => selectReposts(state, postId)); // Select the list of users who reposted the post from the Redux store.
    const { post_reposts_status: status } = useSelector(state => state.users); // Select the status of post reposts from the Redux store.

    const getUsers = useCallback(() => {
        dispatch(getReposts(postId)); // Define a function to fetch users who reposted the post and dispatch the action.
    }, [postId, dispatch]);

    return (
        <>
            <Heading
                title="Reposted by"
                backButton
                btnProfile
            />
            <UsersList
                followUser={username => { dispatch(followUser(username)) }}
                unFollowUser={username => { dispatch(unFollowUser(username)) }}
                status={status}
                users={users}
                getUsers={getUsers}
                noPop
            />
        </>
    );
}
