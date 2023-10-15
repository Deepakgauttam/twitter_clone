// Import necessary modules and components
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for client-side routing
import { Card } from 'react-bootstrap'; // Import the Card component from React Bootstrap
import Trends from 'features/trends/Trends'; // Import a component for displaying trends

// Define a functional component named "TrendingCard" that takes props as input
function TrendingCard(props) {
    // Define a 'footer' object with an 'href' property
    let footer = {
        href: "/explore", // Set the 'href' to a specific URL
    };

    // Destructure the 'className' from the props
    let { className } = props;

    return (
        <Card className={className}>
            <Card.Header>{props.title}</Card.Header>

            {/* Render the Trends component with a specified length */}
            <Trends length={4} />

            <Card.Footer>
                <Card.Link as={Link} to={footer.href}>Show more</Card.Link>
            </Card.Footer>
        </Card>
    );
}

// Export the TrendingCard component
export default TrendingCard;
