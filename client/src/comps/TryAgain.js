import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedo } from '@fortawesome/free-solid-svg-icons/faRedo'
import { Col } from 'react-bootstrap'

// A functional component for displaying a "Try Again" message with a retry button.
function TryAgain(props) {
    return (
        <>
            <Col className="d-flex flex-column align-items-center py-3">
                <h6 className="text-muted mb-3">
                    {props.message || 'Something went wrong'} {/* Display a message or a default message. */}
                </h6>
                <button
                    className="btn btn-primary rounded-pill font-weight-bold d-flex align-items-center px-3"
                    onClick={props.fn} // Call the provided function when the button is clicked.
                >
                    <FontAwesomeIcon className="mr-2" icon={faRedo} /> {/* Display a redo/retry icon. */}
                    <span>Try again</span> {/* Display the "Try again" text. */}
                </button>
            </Col>
        </>
    )
}

export default TryAgain; // Export the TryAgain component for use in other parts of the application.
