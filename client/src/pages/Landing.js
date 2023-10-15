// Import necessary modules and components
import React from 'react';
import Login from 'layouts/landing/Login'; // Import the Login component
import Signup from 'layouts/landing/Signup'; // Import the Signup component
import Navbar from 'layouts/landing/Navbar'; // Import the Navbar component
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'; // Import routing components from react-router-dom
import { Container, Col, Row } from 'react-bootstrap'; // Import Container, Col, and Row components from React Bootstrap
import MediaQuery from 'react-responsive'; // Import MediaQuery for responsive rendering
import Explore from 'layouts/main/Explore'; // Import the Explore component
import Search from 'features/search/Search'; // Import the Search component
import PostDetail from 'features/posts/PostDetail'; // Import the PostDetail component
import UserDetail from 'features/users/UserDetail'; // Import the UserDetail component

// Define the main App component

export default props => {
    return (
        // Routting using switch, route and browser
        <Router>
            <>
                <Navbar />
                <Container>
                    <Row>
                        <Col xs="12" lg="7">
                            <Switch>
                                <Route path="/signup">
                                    <MediaQuery maxWidth={992}>
                                        <Signup />
                                    </MediaQuery>
                                    <MediaQuery minWidth={993}>
                                        <Explore noSearchBar />
                                    </MediaQuery>
                                </Route>
                                <Route path="/login">
                                    <MediaQuery maxWidth={992}>
                                        <Login />
                                    </MediaQuery>
                                    <MediaQuery minWidth={993}>
                                        <Explore noSearchBar />
                                    </MediaQuery>
                                </Route>
                                <Route path="/search" component={Search} />
                                <Route path='/post/:postId' component={PostDetail} />
                                <Route path='/user/:username' component={UserDetail} />
                                <Route path="/">
                                    <MediaQuery maxWidth={992}>
                                        <Login compact />
                                        <Explore noSearchBar noSuggestions compact />
                                    </MediaQuery>
                                    <MediaQuery minWidth={993}>
                                        <Explore noSearchBar noSuggestions />
                                    </MediaQuery>
                                </Route>
                            </Switch>
                        </Col>
                        <MediaQuery minWidth={993}>
                            <Col className="mx-auto vh-100 sticky-top overflow-y-auto hide-scroll" xs lg="5">
                                <Switch>
                                    <Route path="/signup">
                                        <Signup />
                                    </Route>
                                    <Route path="/">
                                        {/* <Redirect to="/" /> */}
                                        <Login />
                                    </Route>
                                </Switch>
                            </Col>
                        </MediaQuery>
                    </Row>
                </Container>
            </>
        </Router>
    )
}