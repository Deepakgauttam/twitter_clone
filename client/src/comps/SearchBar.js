import React from 'react'
import { useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'

import { useHistory } from 'react-router-dom'
import { Form, InputGroup } from 'react-bootstrap'

// A functional component that displays a search bar and handles search functionality.
function SearchBar(props) {
    let history = useHistory()
    let [value, setValue] = useState('') // State for storing the search input value.

    // Function to handle changes in the search input field.
    let handleChange = ({ target: { value } }) => {
        setValue(value)
    }

    // Function to handle the form submission (search) when the user presses Enter.
    let handleSubmit = (e) => {
        e.preventDefault()
        let value = e.target.search.value
        value = encodeURIComponent(value) // Encode the search value for URL.
        history.push(`/search?q=${value}`) // Navigate to the search results page.
    }

    let { className } = props

    return (
        <Form className={className} onSubmit={handleSubmit} role="search">
            <Form.Group className="w-100 mb-0 rounded-pill border-0 px-3"
                style={{ backgroundColor: "rgb(233,236,239)" }}>
                <InputGroup className="w-100">
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} /> {/* Display a search icon. */}
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        value={value}
                        onChange={handleChange}
                        style={{ backgroundColor: "rgb(233,236,239)" }}
                        size="sm"
                        type="search"
                        placeholder="Search for posts, #hashtags or @users" // Placeholder text in the search input.
                        name="search"
                        id="tsearch"
                    />
                </InputGroup>
            </Form.Group>
        </Form>
    )
}

export default SearchBar; // Export the SearchBar component for use in other parts of the application.
