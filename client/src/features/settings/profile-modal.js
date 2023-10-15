import React from 'react'; // Import the React library for building UI components.
import { useState } from 'react'; // Import the useState hook for managing component state.
import {
    Row,
    Modal,
    Form,
    Figure,
    OverlayTrigger,
    Popover,
    Alert,
    ProgressBar,
} from 'react-bootstrap'; // Import various components and elements from the react-bootstrap library.
import { TwitterPicker } from 'react-color'; // Import the TwitterPicker component for color selection.
import { useHistory } from 'react-router-dom'; // Import useHistory from react-router-dom for managing navigation.
import { filterInput } from 'utils/helpers'; // Import a utility function for filtering input.

import { useSelector, useDispatch } from 'react-redux'; // Import hooks for using Redux state and dispatching actions.
import { updateUserDetails } from 'features/users/usersSlice'; // Import an action for updating user details.

export default props => { // Define the functional component as the default export.
    let history = useHistory(); // Get the history object from react-router-dom.
    let dispatch = useDispatch(); // Get the dispatch function from Redux.
    let { user } = useSelector(state => state.auth); // Select the user object from Redux state.
    let { user_update_status: status } = useSelector(state => state.users); // Select the status of updating user details.

    let [color, setColor] = useState(user.profile_banner_color || '#f5f8fa'); // Initialize state for the profile banner color.
    let [name, setName] = useState(user.name || ''); // Initialize state for the user's name.
    let [bio, setBio] = useState(user.description || ''); // Initialize state for the user's bio.
    let [location, setLocation] = useState(user.location || ''); // Initialize state for the user's location.
    let { entities: { url: { urls: [{ url } = {}] = [] } = {} } = user } = user; // Extract user's URL from entities.
    let [website, setWebsite] = useState(url || ''); // Initialize state for the user's website URL.
    let [profile, setProfile] = useState(user.profile_image_url_https || getRandomProfileUrl()); // Initialize state for the user's profile image URL.

    let [error, setError] = useState(null); // Initialize state for error messages.
    let [progress, setProgress] = useState(10); // Initialize state for progress tracking.

    const redirected = new URLSearchParams(history.location.search).get('redirected'); // Get a query parameter from the URL.

    let dirtyProgress = () => { // A function to increase progress but not exceeding 90.
        if (progress < 90)
            setTimeout(() => {
                setProgress(90);
            }, 250);
        return true;
    }

    const handleClose = () => { // Function to close the modal and handle navigation.
        if (status !== 'error' && !error) {
            if (redirected === 'true') history.push('/home'); // Navigate to '/home' if redirected.
            else history.goBack(); // Go back to the previous page if not redirected.
        }
    }

    const handleSubmit = async () => { // Function to handle form submission.
        setError(null); // Reset any previous error messages.
        try {
            let _name = filterInput(name, 'name', { identifier: 'Name' }); // Filter and validate the user's name.
            let description = filterInput(bio, 'html', { max_length: 200, identifier: 'Bio' }); // Filter and validate the user's bio.
            let profile_banner_color = filterInput(color, null, {
                regex: /^#[0-9A-Fa-f]{3,6}$/,
                identifier: 'Banner color',
            }); // Filter and validate the profile banner color.
            let _location = filterInput(location, 'name', { min_length: 0, identifier: 'Location' }); // Filter and validate the user's location.
            let _website = filterInput(website, 'html', {
                min_length: 0,
                identifier: 'Website URL',
            }); // Filter and validate the user's website URL.
            let profile_image_url_https = profile; // Set the profile image URL.
            let body = { // Create a data object with the user's updated details.
                name: _name,
                description,
                profile_banner_color,
                location: _location,
                website: _website,
                profile_image_url_https,
            };
            let action = await dispatch(updateUserDetails(body)); // Dispatch an action to update user details.
            if (action.type === 'users/updateUserDetails/fulfilled') { // Check if the action was successful.
                handleClose(); // Close the modal if the update is successful.
            }
        } catch (err) {
            setError(err.message); // Handle and display any errors that occur during the update.
        }
    }

    const picker = ( // Define a color picker component using the TwitterPicker.
        <Popover id="popover-banner-color">
            <TwitterPicker
                colors={[
                    '#D9E3F0',
                    '#F47373',
                    '#697689',
                    '#37D67A',
                    '#2CCCE4',
                    '#555555',
                    '#dce775',
                    '#ff8a65',
                    '#ba68c8',
                ]}
                color={color}
                onChangeComplete={color => setColor(color.hex)}
                triangle="hide"
            />
        </Popover>
    );

    return ( // Return the JSX for the component.
        <>
            <Modal
                enforceFocus={false}
                className="p-0"
                size="lg"
                scrollable={true}
                show={true}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton className="py-2">
                    <Modal.Title>
                        <small className="font-weight-bold">
                            {!redirected ? 'Edit profile' : 'Complete your profile'}{' '}
                        </small>
                    </Modal.Title>
                </Modal.Header>
                {status === 'pending' && dirtyProgress() && ( // Display a progress bar when an update is pending.
                    <ProgressBar className="rounded-0" now={progress} />
                )}
                {status === 'error' && ( // Display an error message if an error occurred during the update.
                    <Alert variant="danger" className="mb-0 font-weight-bold text-white">
                        Error updating details, try again!
                    </Alert>
                )}
                {error && ( // Display an error message if there is an error in the 'error' state.
                    <Alert variant="danger" className="mb-0 font-weight-bold text-white">
                        {error}
                    </Alert>
                )}
                <Modal.Body className="pt-1 pb-0 px-0">
                    <fieldset disabled={status === 'pending'}>
                        <Form noValidate onSubmit={e => e.preventDefault()}> // Prevent the form from submitting.
                            <Figure
                                className="d-flex"
                                style={{ height: '200px', width: '100%', backgroundColor: color }}
                            >
                                {user.profile_banner_url && ( // Display the user's banner image if available.
                                    <Figure.Image
                                        src={user.profile_banner_url}
                                        className="w-100 h-100"
                                    />
                                )}
                                <OverlayTrigger
                                    rootClose={true}
                                    trigger="click"
                                    placement="auto-start"
                                    overlay={picker}
                                >
                                    <button
                                        style={{ color: color !== '#f5f8fa' && color }}
                                        className="mx-auto my-auto btn btn-outline border px-2 py-1 font-weight-bold"
                                    >
                                        Pick banner color
                                    </button>
                                </OverlayTrigger>
                            </Figure>
                            <div className="px-3">
                                <Row className="d-flex justify-content-between mt-n2 px-2 align-items-center w-100">
                                    <Figure
                                        style={{ height: '100px', width: '100px' }}
                                        className="mt-n5 rounded-circle overflow-hidden bg-primary"
                                    >
                                        <Figure.Image className="w-100 h-100" src={profile} />
                                    </Figure>
                                    <button
                                        onClick={() => setProfile(getRandomProfileUrl())}
                                        className="btn btn-outline-primary rounded-pill px-2 py-1 btn-sm font-weight-bold"
                                    >
                                        Change Avatar
                                    </button>
                                </Row>
                                <Form.Group controlId="name">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        style={{ fontSize: '1.25rem' }}
                                        type="text"
                                        value={name}
                                        onChange={n => setName(n.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group controlId="bio">
                                    <Form.Label>Bio</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        style={{ fontSize: '1.25rem', minHeight: '100px' }}
                                        value={bio}
                                        onChange={n => setBio(n.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group controlId="location">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        style={{ fontSize: '1.25rem' }}
                                        type="text"
                                        value={location}
                                        onChange={n => setLocation(n.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group controlId="website">
                                    <Form.Label>Website</Form.Label>
                                    <Form.Control
                                        style={{ fontSize: '1.25rem' }}
                                        type="text"
                                        value={website}
                                        onChange={n => setWebsite(n.target.value)}
                                    />
                                </Form.Group>
                            </div>
                        </Form>
                    </fieldset>
                </Modal.Body>
                <Modal.Footer className="py-1">
                    <div className="d-flex w-100 justify_content-between align-items-center">
                        <div></div>
                        <div className="right">
                            <button
                                disabled={status === 'pending'}
                                type="submit"
                                onClick={handleSubmit}
                                className="btn btn-primary rounded-pill px-3 py-1 font-weight-bold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    )
}

// Function to generate a random profile image URL.
function getRandomProfileUrl() {
    let imgs = [ // Array of possible profile image URLs.
        'animals-1298747.svg',
        'bunny-155674.svg',
        'cat-154642.svg',
        'giraffe-2521453.svg',
        'iron-man-3829039.svg',
        'ironman-4454663.svg',
        'lion-2521451.svg',
        'man-1351317.svg',
        'pumpkin-1640465.svg',
        'rat-152162.svg',
        'sherlock-3828991.svg',
        'spider-man-4639214.svg',
        'spiderman-5247581.svg',
        'thor-3831290.svg',
        'tiger-308768.svg',
        'whale-36828.svg',
    ];
    let img = imgs[Math.floor(Math.random() * imgs.length)]; // Select a random image from the array.
    return `/img/${img}`; // Return the URL of the selected image.
}
