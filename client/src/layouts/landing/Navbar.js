// Importing necessary modules and components from external libraries and files
import React from 'react';
import Search from 'comps/SearchBar'; // Importing a custom SearchBar component
import { Link } from 'react-router-dom';
import { Navbar, Row, Container } from 'react-bootstrap';

// Define a class component named "Navigationbar"
class Navigationbar extends React.Component {
    render() {
        return (
            // Create a navigation bar using the Navbar component from React Bootstrap
            <Navbar bg="white" sticky="top" className="py-1 border" style={{ zIndex: 10000 }}>
                <Container>
                    {/* Create a clickable brand link that leads to the homepage */}
                    <Navbar.Brand as={Link} className="btn btn-naked-primary rounded-circle text-primary" to="/">
                        <img className="rounded-circle" height="45" width="45" src="/android-chrome-192x192.png" alt="logo" />
                        {/* You can choose to use a FontAwesomeIcon instead of an image */}
                        {/* <FontAwesomeIcon size="lg" icon={faTwitter} /> */}
                    </Navbar.Brand>

                    {/* Render the custom Search component */}
                    <Search className="form-inline w-100" />

                    {/* Create a row for login and signup links on the right side of the navigation bar */}
                    <Row className="ml-auto d-none d-lg-flex justify-content-end w-50">
                        <Link to="/login" className="btn btn-outline-primary rounded-pill px-3 py-2 font-weight-bold">Log in</Link>
                        <Link to="/signup" className="btn btn-primary rounded-pill px-3 py-2 font-weight-bold ml-2">Sign up</Link>
                    </Row>
                </Container>
            </Navbar>
        )
    }
}

// Export the Navigationbar component
export default Navigationbar;
