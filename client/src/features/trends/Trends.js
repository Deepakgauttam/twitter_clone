import React from 'react'; // Import the React library for building UI components.
import { useEffect } from 'react'; // Import the useEffect hook for side effects.
import TryAgain from 'comps/TryAgain'; // Import the 'TryAgain' component.
import Spinner from 'comps/Spinner'; // Import the 'Spinner' component.
import { Link } from 'react-router-dom'; // Import the 'Link' component for navigation.
import { ListGroup } from 'react-bootstrap'; // Import the 'ListGroup' component from react-bootstrap.

import { useDispatch, useSelector } from 'react-redux'; // Import the useDispatch and useSelector functions for accessing Redux store.
import { getTrends, trendsSelectors } from './trendsSlice'; // Import Redux actions and selectors from 'trendsSlice'.

export default (props) => {
    let dispatch = useDispatch(); // Create a dispatch function to dispatch Redux actions.
    let { status } = useSelector(state => state.trends); // Get the 'status' from the 'trends' slice in the Redux store.
    let trendObj = useSelector(state => trendsSelectors.selectById(state, 1)); // Get a specific trend object from the Redux store.
    
    if (trendObj)
        var { locations: [location], trends } = trendObj; // Destructure 'location' and 'trends' from the 'trendObj' if it exists.
    else
        trends = null; // Set 'trends' to null if 'trendObj' doesn't exist.
    
    useEffect(() => {
        if (status === 'idle')
            dispatch(getTrends()); // Dispatch the 'getTrends' action when the status is 'idle'.
        // eslint-disable-next-line
    }, []); // Run the effect only once when the component mounts.

    if (status === 'loading' && (!trends || !trends.length))
        return <Spinner />; // Display a loading spinner if the status is 'loading' and there are no trends.

    if (status === 'error' && (!trends || !trends.length))
        return <TryAgain fn={() => { dispatch(getTrends()) }} />; // Display a 'TryAgain' component if there's an error and there are no trends.

    if (!trends || !trends.length)
        return <div className="message"></div>; // Display an empty message if there are no trends.

    return (
        <ListGroup variant="flush"> {/* Render a ListGroup component with a 'flush' variant. */}
            {(trends.slice(0, props.length).map(itm => { // Map through the trends and render ListGroup items.
                return (
                    <ListGroup.Item
                        as={Link} // Render as a Link component for navigation.
                        action
                        key={itm.name} // Set a unique key for the ListGroup item.
                        to={`/search?q=${itm.query}`} // Set the navigation URL with the search query.
                    >
                        <small className="text-muted">Trending {location.name}</small> {/* Display location name. */}
                        <p className="mb-1 text-dark font-weight-bold text-capitalize">{itm.name}</p> {/* Display trend name. */}
                        <em className="">{itm.tweet_volume + ' Tweets'} </em> {/* Display the number of tweets for the trend. */}
                    </ListGroup.Item>
                )
            }))}
        </ListGroup>
    )
}
