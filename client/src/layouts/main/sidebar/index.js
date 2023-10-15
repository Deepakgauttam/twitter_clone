// Import necessary modules and components
import React from 'react';
import Search from 'comps/SearchBar'; // Import a custom SearchBar component
import FollowCard from './FollowCard'; // Import the FollowCard component from the current directory
import TrendingCard from './TrendingCard'; // Import the TrendingCard component from the current directory
import { Col } from 'react-bootstrap'; // Import the Col component from React Bootstrap
import { useLocation } from 'react-router-dom'; // Import useLocation for accessing the current route's location

// Define a functional component named "Sidebar"
function Sidebar() {
    // Use the useLocation hook to access the current route's location
    const location = useLocation();

    return (
        <Col>
            <Search className="sticky-top my-2" />

            {/* Conditionally render the FollowCard if the current route is not '/explore/users' */}
            {!(location.pathname === '/explore/users') ? (
                <FollowCard compact className="my-3" length={5} title="Who to follow" />
            ) : undefined}
            {/* <br /> (currently commented out) */}
            
            {/* Conditionally render the TrendingCard if the current route is not '/explore' */}
            {!(location.pathname === '/explore') ? (
                <TrendingCard className="my-3" title="Trends for you" />
            ) : undefined}

            {/* Create a footer section with links and information */}
            <footer className="m-2 mt-3 overflow-hidden">
                <p className="text-black font-weight-bold mb-0 mt-1">
                    <a className="text-monospace" href="">
                        the twitter clone
                    </a>
                </p>
                <div className="text-muted mb-1 mt-n1">
                    <small>Created using MERN-Stack by Deepak Gauttam</small>
                </div>
            </footer>
        </Col>
    );
}

// Export the Sidebar component
export default Sidebar;
