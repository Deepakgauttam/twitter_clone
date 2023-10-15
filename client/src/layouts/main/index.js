// Import necessary modules and components
import React from 'react';
import Home from './Home'; // Import the Home component
import Sidebar from './sidebar'; // Import the Sidebar component
import MediaQuery from 'react-responsive'; // Import MediaQuery for responsive rendering
import { Row, Col } from 'react-bootstrap'; // Import Row and Col components from React Bootstrap
import { Route, Switch } from 'react-router-dom'; // Import Route and Switch for routing
import PostDetail from 'features/posts/PostDetail'; // Import the PostDetail component
import Explore from './Explore'; // Import the Explore component
import Search from 'features/search/Search'; // Import the Search component
import UserDetail from 'features/users/UserDetail'; // Import the UserDetail component
import Compose from 'features/posts/compose-modal'; // Import the Compose component for post composition
import Notifies from 'features/notify/notify-page'; // Import the Notifies component for notifications
import Settings from 'features/settings/settings-page.js'; // Import the Settings component for user settings
import UserFriends from 'features/users/user-friends'; // Import the UserFriends component
import UserFollowers from 'features/users/user-followers'; // Import the UserFollowers component
import PostLikes from 'features/users/post-likes'; // Import the PostLikes component
import PostReposts from 'features/users/post-reposts'; // Import the PostReposts component
import ChatRoom from 'comps/chat-room-placeholder'; // Import a placeholder component for chat rooms
import { useAlerts } from 'features/alerts/alertsContext'; // Import the useAlerts hook for handling alerts
import { useEffect } from 'react'; // Import useEffect for side effects and lifecycle management

export default props => {
    const { ensureCompleteProfile } = useAlerts(); // Get the ensureCompleteProfile function from the useAlerts hook
    useEffect(() => {
        ensureCompleteProfile(); // Ensure a complete user profile on component load
        // eslint-disable-next-line
    }, []);

    return (
        <Row>
            <Col className="px-sm-4" sm="12" lg="8">
                <Col className="border">
                    <Switch>
                        {/* Define routes and corresponding components for the application */}
                        <Route path='/explore' component={Explore} />
                        <Route path='/search' component={Search} />
                        <Route path='/post/:postId/likes' component={PostLikes} />
                        <Route path='/post/:postId/reposts' component={PostReposts} />
                        <Route path='/post/:postId' component={PostDetail} />
                        <Route path='/user/:username/friends' component={UserFriends} />
                        <Route path='/user/:username/followers' component={UserFollowers} />
                        <Route path='/user/:username' component={UserDetail} />
                        <Route path='/notifications' component={Notifies} />
                        <Route path='/settings' component={Settings} />
                        <Route path='/chats' component={ChatRoom} />
                        <Route path='/' component={Home} />
                    </Switch>
                    <Route path='/compose/post' component={Compose} />
                </Col>
            </Col>

            {/* Use MediaQuery to conditionally render the Sidebar on screens with a minimum width of 992 pixels */}
            <MediaQuery minWidth={992}>
                <Col lg="4" className="vh-100 overflow-y-auto hide-scroll sticky-top">
                    <Sidebar />
                </Col>
            </MediaQuery>
        </Row>
    );
}
