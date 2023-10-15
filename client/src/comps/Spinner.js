import React from 'react'
import { Spinner, Col } from 'react-bootstrap'

// A functional component that displays a loading spinner.
export default function LoadingSpinner(color) {
    return (
        <Col className="d-flex justify-content-center py-5">
            <Spinner variant="primary" animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>
        </Col>
    )
}

// Export the LoadingSpinner component for use in other parts of the application.
