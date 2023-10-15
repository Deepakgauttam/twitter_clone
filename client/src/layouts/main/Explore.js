// Import necessary modules and components
import React from 'react';
import Search from 'comps/SearchBar'; // Import a custom SearchBar component
import Trends from 'features/trends/Trends'; // Import a component for displaying trends
import MediaQuery from 'react-responsive'; // Import MediaQuery for responsive rendering
import FollowCard from './sidebar/FollowCard'; // Import the FollowCard component from the current directory
import Users from 'features/users/UserSuggests'; // Import a component for displaying user suggestions
import Heading from 'comps/Heading'; // Import a custom Heading component
import { Route, Switch } from 'react-router-dom'; // Import Route and Switch for routing
import { Figure } from 'react-bootstrap'; // Import the Figure component from React Bootstrap

// Define a functional component


export default (props) => {

    return (<>
        <div className="header">
            {!props.noSearchBar &&
                <MediaQuery maxWidth={1020} >
                    <Search className="w-100 p-2" />
                </MediaQuery>}
        </div>

        {/* Routing for explore user */}
        <Switch>
            <Route path='/explore/users'>
                <Heading title="Users" />
                <Users noPop />
            </Route>
            <Route path='/'>
                {!props.noSuggestions && (
                    <MediaQuery maxWidth={992}>
                        <FollowCard noPop title='Follow more users to see their posts' length={4} />
                    </MediaQuery>
                )}
                <Heading title="Trends near you" />
                {!props.compact && (
                    <Figure className="d-flex flex-column align-items-end">
                        <Figure.Image src="/img/explore-thumb-vector.svg" alt="" />
    
                    </Figure>
                )}
                <Trends />
            </Route>
        </Switch>
    </>)
}