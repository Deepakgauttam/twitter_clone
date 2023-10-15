// Import necessary modules and components
import React from 'react';
import Main from 'layouts/main'; // Import the Main component
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'; // Import routing components from react-router-dom
import MediaQuery from 'react-responsive'; // Import MediaQuery for responsive rendering
import { Row, Col, Container } from 'react-bootstrap'; // Import Row, Col, and Container components from React Bootstrap
import Nav from 'layouts/header/bottom-nav'; // Import the Nav component
import Header from 'layouts/header'; // Import the Header component
import { useDispatch } from 'react-redux'; // Import useDispatch to access the Redux dispatch function
import { fetchNotifs } from 'features/notify/notifySlice'; // Import an action for fetching notifications from the Redux store
import { useEffect } from 'react'; // Import useEffect for side effects and lifecycle management
import { AlertsProvider } from 'features/alerts/alertsContext'; // Import AlertsProvider for managing alerts
import { subscribeUserToPush } from '../subscription'; // Import a function to subscribe a user to push notifications

// Define the main App component

export default function App() {
  const dispatch = useDispatch()

  // Fetch notifications on component load
  useEffect(() => {
    dispatch(fetchNotifs())
  }, [dispatch])

  // Subscribe the user to push notifications if the permission is granted
  useEffect(() => {
    if (window.Notification?.permission === 'granted')
      subscribeUserToPush()
  }, [])
  return (
    <Router>
      <AlertsProvider>
        {/* Create a container with a bottom margin */}
        <Container className="mb-5 mb-sm-1">
          <Row>
            {/* Render the Header component on screens with a minimum width of 576 pixels */}
            <MediaQuery minWidth={576}>
              <Col sm="1" xl="2" className="d-flex flex-column align-items-end p-0 sticky-top vh-100">
                <Header></Header>
              </Col>
            </MediaQuery>
            <Col sm="11" xl="10">
              <Switch>
                <Route path='/login'>
                  <Redirect to="/" />
                </Route>
                <Route path='/' >
                  <Main />
                </Route>
              </Switch>
            </Col>
          </Row>
          <MediaQuery maxWidth={576}>
            <Nav />
          </MediaQuery>
        </Container>
      </AlertsProvider>
    </Router>
  );
}