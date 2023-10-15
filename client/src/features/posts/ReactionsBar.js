import React from 'react'; // Importing the React library for building components
import { useDispatch } from 'react-redux'; // Importing the useDispatch hook from the React Redux library
import { likePost, unlikePost, repostPost, unRepostPost } from './postsSlice'; // Importing Redux action creators from the 'postsSlice' file
import { Dropdown } from 'react-bootstrap'; // Importing a Dropdown component from the 'react-bootstrap' library
import { Link } from 'react-router-dom'; // Importing the Link component for client-side routing
import { useSelector } from 'react-redux'; // Importing the useSelector hook from the React Redux library
import { useHistory } from 'react-router-dom'; // Importing the useHistory hook from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importing the FontAwesomeIcon component for using FontAwesome icons
import { faComment } from '@fortawesome/free-regular-svg-icons/faComment'; // Importing a comment icon from FontAwesome (regular style)
import { faComment as commentSolid } from '@fortawesome/free-solid-svg-icons/faComment'; // Importing a solid-style comment icon from FontAwesome
import { faHeart } from '@fortawesome/free-regular-svg-icons/faHeart'; // Importing a heart icon from FontAwesome (regular style)
import { faHeart as heartSolid } from '@fortawesome/free-solid-svg-icons/faHeart'; // Importing a solid-style heart icon from FontAwesome
import { faReply } from '@fortawesome/free-solid-svg-icons/faReply'; // Importing a reply icon from FontAwesome (solid style)
import { numFormatter } from 'utils/helpers'; // Importing a function 'numFormatter' from a 'helpers' module

export default props => {
    const history = useHistory(); // Creating a history object for navigation

    let { isAuthenticated } = useSelector(state => state.auth); // Using useSelector to access the 'isAuthenticated' value from the Redux store
    let dispatch = useDispatch(); // Initializing the Redux dispatch function
    let handleLike = e => {
        e.preventDefault();
        if (!isAuthenticated) {
            history.push(`/login`); // Redirecting to the login page if not authenticated
            return;
        }
        post.favorited ? dispatch(unlikePost(post)) : dispatch(likePost(post)); // Dispatching Redux actions based on 'favorited' status
    }
    let handleRepost = post => {
        if (!isAuthenticated) {
            history.push(`/login`); // Redirecting to the login page if not authenticated
            return;
        }
        post.retweeted ? dispatch(unRepostPost(post)) : dispatch(repostPost(post)); // Dispatching Redux actions based on 'retweeted' status
    }
    let { post } = props; // Destructuring 'post' from the props

    return (
        <div className='d-flex align-items-center'>
            <Dropdown drop="up" className="bg-clear high-index">
                <Dropdown.Toggle
                    className="btn btn-naked-primary rounded-pill"
                    id="comment-dropdown"
                >
                    {post.retweeted ? (
                        <FontAwesomeIcon icon={commentSolid} className="text-success" />
                    ) : <FontAwesomeIcon icon={faComment} />}
                    <small className="m-1">{numFormatter(post.retweet_count)}</small>
                </Dropdown.Toggle>
                <Dropdown.Menu alignRight className="higher-index rounded-0">
                    <Dropdown.Item
                        className="high-index"
                        as='button'
                        onClick={e => handleRepost(post)}
                    >{post.retweeted ? "Undo Repost" : "Repost"}</Dropdown.Item>
                    <Dropdown.Item
                        as={Link}
                        className="high-index"
                        to={`/compose/post?quote=${post.id_str}`}
                    >Quote this post</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            {/* reply */}
            <Link
                to={`/compose/post?reply_to=${post.id_str}`}
                className="btn btn-naked-secondary rounded-pill high-index"
            >
                <FontAwesomeIcon style={{ fontSize: '1.2em' }} className='mb-1 text-muted' icon={faReply} />
            </Link>
            {/* like */}
            <button
                onClick={handleLike}
                className="btn btn-naked-danger rounded-pill high-index"
            >
                {post.favorited ? (
                    <FontAwesomeIcon icon={heartSolid} className="text-danger" />
                ) : <FontAwesomeIcon icon={faHeart} />}

                <small className="m-1">{numFormatter(post.favorite_count)}</small>
            </button>
        </div>
    );
}
