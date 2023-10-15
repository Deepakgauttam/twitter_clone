// Importing necessary modules and components from external libraries and files
import React from 'react'; // Import the React library for building components
import { Link } from 'react-router-dom'; // Import the Link component for client-side routing
import { filterInput } from 'utils/helpers'; // Import a utility function for filtering input data
// import { AuthContext } from 'utils/context/auth'; // Import an authentication context (currently not used)
import { connect } from 'react-redux'; // Import the connect function for connecting to Redux store
import { login } from 'store/authSlice'; // Import the login action from the Redux store
import { Figure, Form, Col } from 'react-bootstrap'; // Import components from React Bootstrap library

// Define a class component named "Login"
class Login extends React.Component {
    // static contextType = AuthContext; (currently not used)

    // Initialize the component's state with default values
    state = {
        disabled: false, // Flag for disabling form elements
        error: null, // Variable to store error messages
        password: '', // Variable to store the user's password
        username: '', // Variable to store the user's username
    }

    // Event handler for input field changes
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value, // Update the state based on the input field's name
        })
    }

    // Event handler for form submission
    handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        // Check if the form is disabled; if it is, do nothing
        if (this.state.disabled) {
            return;
        }

        // Update the state to clear any previous errors and disable the form
        this.setState({ error: null, disabled: true });

        try {
            // Get form data
            let form = e.target;
            let username = filterInput(form.username.value, 'username', { min_length: 4 }); // Filter and validate the username
            let password = filterInput(form.password.value, 'password'); // Filter and validate the password

            // Send a POST request to the '/auth/login' endpoint
            let response = await fetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            // Handle different response statuses
            if (response.status >= 500) {
                throw Error('Something went wrong.');
            } else if (response.status >= 400) {
                throw Error('Incorrect credentials');
            } else if (response.ok) {
                // If the response is successful, parse the JSON data
                let data = await response.json();
                console.log(data.message);
                // Update the state to enable the form and call the 'login' action from Redux
                this.setState({ disabled: false });
                this.props.login(data.user);
            }
        } catch (error) {
            // Handle errors and update the state with the error message
            console.log(error.message);
            this.setState({ error: error.message, disabled: false });
        }
    }

    // Render method to display the component
    render() {
        let disabled = this.state.disabled; // Retrieve the 'disabled' state from the component's state

        return (
            <Col style={{ maxWidth: "400px" }} className="mx-auto border px-3 pb-3">
                {/* Render a figure if not in compact mode */}
                {!this.props.compact && (
                    <Figure className='d-flex flex-column align-items-end'>
                        <Figure.Image
                            className='align-self-start'
                            width={250}
                            height={250}
                            src="/img/explore-thumb-vector.svg"
                            alt="people vector"
                        />
                    </Figure>
                )}

                {/* Display a title */}
                <h5 className="font-weight-bolder mt-3">
                    Login to Twitter Clone
                </h5>

                <fieldset disabled={disabled}>
                    {/* Render the login form */}
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                onChange={this.handleChange}
                                value={this.state.username}
                                type="text"
                                name="username"
                                autoCapitalize="off"
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-0" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                onChange={this.handleChange}
                                value={this.state.password}
                                autoCorrect="off"
                                type="password"
                                name="password"
                            ></Form.Control>
                        </Form.Group>

                        <p>
                            {/* Render a link for password recovery (currently commented out) */}
                            {/* <small ><Link disabled to="/help">Forgot password?</Link></small>
                            <br /> */}
                            {/* Display error message, if any */}
                            <small className="text-danger">{this.state.error}</small>
                        </p>

                        <div className="d-flex flex-column align-items-center">
                            {/* Render the login button */}
                            <button type="submit" className="btn btn-outline-primary btn-block rounded-pill font-weight-bold">
                                Log in
                            </button>

                            {/* Render a message and a link for user registration */}
                            <small className="text-muted m-2">or</small>
                            <Link
                                to="/signup"
                                className="btn btn-primary btn-block rounded-pill font-weight-bold"
                            >
                                Sign up
                            </Link>
                        </div>
                    </Form>
                </fieldset>
            </Col>
        )
    }
}

// Connect the component to the Redux store, passing the 'login' action
export default connect(null, { login })(Login);
