// Import necessary modules and components
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for client-side routing
import { Card } from 'react-bootstrap'; // Import the Card component from React Bootstrap
import { useSelector } from 'react-redux'; // Import useSelector for accessing Redux store data
import Users from 'features/users/UserSuggests'; // Import a component for displaying user suggestions

// Define a functional component named "FollowCard" that takes props as input
function FollowCard(props) {
    // Retrieve the 'isAuthenticated' state from the Redux store
    let { isAuthenticated } = useSelector(state => state.auth);

    // Define a 'footer' object with an 'href' property
    let footer = {
        href: "/explore/users", // Set the 'href' to a specific URL
    };

    // Destructure the 'className' from the props
    let { className, ...rest } = props;

    return (
        <Card className={className}>
            <Card.Header>{props.title}</Card.Header>

            {/* Conditional rendering: Display user suggestions if authenticated, or a message if not */
            isAuthenticated ? (
                <Users length={props.length} {...rest} />
            ) : (
                <div className="message">Login to see users and their posts</div>
            )}

            <Card.Footer>
                <Card.Link
                    as={Link}
                    to={footer.href}
                >Show more</Card.Link>
            </Card.Footer>
        </Card>
    );
}

// Export the FollowCard component
export default FollowCard;
