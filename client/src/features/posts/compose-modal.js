import React from 'react'; // Import React for building the component
import { useState, useRef } from 'react'; // Import useState and useRef from React for managing state
import { Modal, Media, Alert, ProgressBar, Popover, OverlayTrigger } from 'react-bootstrap'; // Import components from react-bootstrap for UI elements
import { useHistory, useLocation } from 'react-router-dom'; // Import useHistory and useLocation from react-router-dom for routing

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon from the Font Awesome library
import { faImage } from '@fortawesome/free-regular-svg-icons/faImage'; // Import the 'faImage' icon from Font Awesome
import { faSmile } from '@fortawesome/free-regular-svg-icons/faSmile'; // Import the 'faSmile' icon from Font Awesome

import { useSelector, useDispatch } from 'react-redux'; // Import useSelector and useDispatch from react-redux for handling Redux state
import { composePost, selectPostById } from './postsSlice'; // Import Redux actions and selectors from the postsSlice
import { useEffect } from 'react'; // Import useEffect from React for side effects

import QuotedPost from 'comps/quoted-post'; // Import QuotedPost component for displaying quoted posts

import 'emoji-mart/css/emoji-mart.css'; // Import CSS styles for the emoji picker
import { Picker } from 'emoji-mart'; // Import the emoji picker component from emoji-mart
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitizing input
import { filterInput } from 'utils/helpers'; // Import a utility function for input filtering

export default props => { // Define the functional component
    let location = useLocation(); // Get the current location using useLocation hook
    let history = useHistory(); // Get the history object for navigation
    let dispatch = useDispatch(); // Get the Redux dispatch function

    let { user } = useSelector(state => state.auth); // Get user information from Redux state
    let quoteId = new URLSearchParams(location.search).get("quote"); // Get the 'quote' parameter from the URL query string
    let quotePost = useSelector(state => selectPostById(state, quoteId)); // Get the quoted post from Redux state

    const replyId = new URLSearchParams(location.search).get("reply_to"); // Get the 'reply_to' parameter from the URL query string
    let replyPost = useSelector(state => selectPostById(state, replyId)); // Get the reply post from Redux state

    let { compose_status: status } = useSelector(state => state.posts); // Get the compose status from Redux state

    let ta = useRef(null); // Create a ref for the text area
    const [height, setHeight] = useState("auto"); // Initialize the height state
    const [editor_text, setText] = useState(""); // Initialize the editor_text state for text input
    const [active, setActive] = useState(false); // Initialize the 'active' state for user input activity

    const [error, setError] = useState(null); // Initialize the 'error' state for displaying errors

    let [progress, setProgress] = useState(10); // Initialize the 'progress' state for progress tracking

    // Function to update progress when changes are dirty
    let dirtyProgress = () => {
        if (progress < 90)
            setTimeout(() => { setProgress(90) }, 200);
        return true;
    }

    // Function to handle the modal close event
    const handleClose = () => {
        if (status !== 'error' || true) {
            history.goBack(); // Navigate back when the modal is closed
        }
    }

    // Function to resize the text area
    let resizeTa = () => {
        if (ta.current) {
            setHeight('auto'); // Set the text area's height to 'auto'
        }
    }

    useEffect(() => {
        if (ta.current) {
            let height = ta.current.scrollHeight;
            setHeight(height + 'px'); // Set the height of the text area based on its content
        }
    }, [editor_text]);

    useEffect(() => {
        if (ta.current)
            ta.current.focus(); // Focus on the text area when the component mounts
    }, []);

    // Function to handle changes in the text area
    let handleChange = e => {
        resizeTa(); // Resize the text area
        let text = e.target.value;
        setText(text); // Update the text state
        setActive(DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }).trim().length > 0); // Update the 'active' state based on input content
    }

    // Function to handle form submission
    let handleSubmit = async (e) => {
        if (!active)
            return;
        let text;
        try {
            text = filterInput(editor_text, 'html', { max_length: 500, identifier: 'Post' });
        } catch (err) {
            return setError(err.message);
        }
        setActive(false);
        let body = {
            text
        };
        let url;
        if (replyId) {
            url = `/api/post/${replyId}/reply`;
        }
        else if (quotePost) {
            body = {
                ...body,
                is_quote_status: true,
                quoted_status_id: quotePost.id,
                quoted_status_id_str: quotePost.id_str,
                quoted_status: quotePost._id
            };
        }
        let action = await dispatch(composePost({ body, url }));
        setActive(true);
        if (action.type === 'posts/composePost/fulfilled')
            handleClose();
    }

    // Function to add an emoji to the text input
    let addEmoji = emoji => {
        setText(text => (text + emoji.native));
    }

    // Create the emoji picker overlay
    const picker = (
        <Popover id="popover-basic">
            <Picker
                onSelect={addEmoji}
                color="#3eaaee"
                sheetSize={32}
                emoji='point_up'
                title="Pick your emoji"
                set='twitter'
            />
        </Popover>
    );

    return (
        <>
            <Modal
                className="p-0"
                size="lg"
                scrollable={true}
                show={true}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton className="py-2">
                    <Modal.Title><small className="font-weight-bold">
                        {replyId ? 'Post your reply' : 'Compose post'}
                    </small></Modal.Title>
                </Modal.Header>
                {status === 'pending' && (
                    dirtyProgress() &&
                    <ProgressBar className="rounded-0" now={progress} />
                )}
                {status === "error" && (
                    <Alert variant="danger" className="font-weight-bold text-white">
                        Error submitting post, try again!
                    </Alert>
                )}
                {error && (
                    <Alert variant="danger" className="font-weight-bold text-white">
                        {error}
                    </Alert>
                )}
                <Modal.Body className="pt-1 pb-0">
                    <Media className='h-100 w-100'>
                        <img
                            className="rounded-circle"
                            src={user.default_profile_image ? '/img/default-profile-vector.svg' : user.profile_image_url_https}
                            alt=""
                            width={50}
                            height={50}
                        />
                        <Media.Body className="h-100 w-50" style={{ minHeight: '175px' }}>
                            <textarea
                                ref={ta}
                                className="w-100 p-2 pb-5"
                                style={{
                                    height,
                                }}
                                name="text"
                                onChange={handleChange}
                                value={editor_text}
                                placeholder="What's happening?"
                            >
                            </textarea>
                            <QuotedPost className="mb-2 mt-n5" post={replyPost || quotePost} />
                        </Media.Body>
                    </Media>
                </Modal.Body>
                <Modal.Footer className="py-1">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <div style={{ fontSize: "1.5em" }}>
                            <OverlayTrigger rootClose={true} trigger="click" placement="auto-start" overlay={picker}>
                                <button className="text-primary btn btn-lg rounded-circle btn-naked-primary p-2">
                                    <FontAwesomeIcon size="lg" icon={faSmile} />
                                </button>
                            </OverlayTrigger>
                            <button className="disabled text-primary btn btn-lg rounded-circle btn-naked-primary p-2">
                                <FontAwesomeIcon size="lg" icon={faImage} />
                            </button>
                        </div>
                        <div className="right">
                            <button
                                onClick={handleSubmit}
                                disabled={!active}
                                className="btn btn-primary rounded-pill px-3 py-2 font-weight-bold">
                                Post
                            </button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}
