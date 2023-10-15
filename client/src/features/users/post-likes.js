import React from 'react'; // Import React library.
import { useCallback } from 'react'; // Import useCallback from React.
import Heading from 'comps/Heading'; // Import the Heading component.
import UsersList from 'comps/UsersList'; // Import the UsersList component.

import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector from React Redux.
import { selectLikes, getLikes, followUser, unFollowUser } from './usersSlice'; // Import Redux actions and selectors from the 'usersSlice' module.

export default (props) => {
    const dispatch = useDispatch(); // Initialize the dispatch function from Redux.
    const { match: { params: { postId } = {} } = {} } = props; // Destructure the postId from the component's props.

    const users = useSelector(state => selectLikes(state, postId)); // Select the list of users who liked the post from the Redux store.
    const { post_likes_status: status } = useSelector(state => state.users); // Select the status of post likes from the Redux store.

    const getUsers = useCallback(() => {
        dispatch(getLikes(postId)); // Define a function to fetch users who liked the post and dispatch the action.
    }, [postId, dispatch]);

    return (
        <>
            <Heading
                title="Liked by"
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
