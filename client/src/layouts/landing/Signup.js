// Import necessary modules and components
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for client-side routing
import { filterInput } from 'utils/helpers'; // Import a utility function for filtering input data
import { connect } from 'react-redux'; // Import the connect function for connecting to the Redux store
import { login } from 'store/authSlice'; // Import the login action from the Redux store
import { Figure, Form, Col } from 'react-bootstrap'; // Import components from React Bootstrap library

// Define a class component named "Signup"
class Signup extends React.Component {
    state = {
        disabled: false, // Flag for disabling form elements
        error: null, // Variable to store error messages
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
            let fullname = filterInput(form.fullname.value, 'name', { min_length: 0 }); // Filter and validate the full name

            // Send a POST request to the '/auth/signup' endpoint
            let response = await fetch('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password,
                    fullname,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 409) // Conflict (username already exists)
                    throw Error((await response.json()).message);
                throw Error('Something went wrong');
            }

            // If the response is successful, parse the JSON data
            let data = await response.json();
            console.log(data.message);

            // Update the state to enable the form and call the 'login' action from Redux
            this.setState({ disabled: false });
            this.props.login(data.user);
        } catch (error) {
            // Handle errors and update the state with the error message
            console.log(error.message);
            this.setState({ error: error.message, disabled: false });
        }
    }

    render() {
        let disabled = this.state.disabled; // Retrieve the 'disabled' state from the component's state

        return (
            <Col style={{ maxWidth: "400px" }} className="mx-auto border px-3 pb-3">
                {/* Display a figure on the left side of the form */}
                <Figure className='d-flex flex-column align-items-end'>
                    <Figure.Image
                        className='align-self-start'
                        width={250}
                        height={250}
                        src="/img/explore-thumb-vector.svg"
                        alt="people vector"
                    />
                </Figure>

                {/* Display a title for the signup form */}
                <h5 className="font-weight-bolder">
                    Signup to Twitter_Clone
                </h5>

                <fieldset disabled={disabled}>
                    {/* Render the signup form */}
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>Choose a username - <small className="text-muted">required</small></Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                autoCapitalize="off"
                                autoComplete="off"
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId="fillname">
                            <Form.Label>Full name - <small className="text-muted">optional</small></Form.Label>
                            <Form.Control
                                type="text"
                                name="fullname"
                                autoCapitalize="on"
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId="password">
                            <Form.Label>Choose a password - <small className="text-muted">required</small></Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                            ></Form.Control>
                        </Form.Group>

                        <p className="mt-n2">
                            <small>Already have an account? <Link to="/login">Login instead</Link></small>
                            <br />
                            <small className="text-danger">{this.state.error}</small>
                        </p>

                        <div className="d-flex flex-column align-items-center">
                            {/* Render the "Sign up" button */}
                            <button
                                type="submit"
                                className="btn btn-outline-primary font-weight-bold rounded-pill btn-block">
                                <span>Sign up</span>
                            </button>

                            {/* Render a separator */}
                            <div className="seperator"><span>or</span></div>

                            {/* Render a link to the login page */}
                            <Link
                                to="login"
                                className="btn btn-primary font-weight-bold rounded-pill btn-block">
                                <span>Log in</span>
                            </Link>
                        </div>
                    </Form>
                </fieldset>
            </Col>
        )
    }
}

// Connect the component to the Redux store, passing the 'login' action
export default connect(null, { login })(Signup);
