import React from 'react'; // Import React for building the component
import { useEffect, useCallback } from 'react'; // Import useEffect and useCallback from React
import Heading from 'comps/Heading'; // Import the Heading component
import { Link } from 'react-router-dom'; // Import Link from react-router-dom for routing
import { Row, Col, Figure } from 'react-bootstrap'; // Import Row, Col, and Figure components from react-bootstrap
import MultiMedia from 'comps/MultiMedia'; // Import the MultiMedia component
import { useSelector, useDispatch } from 'react-redux'; // Import useSelector and useDispatch from react-redux
import { selectPostById, getPost, selectReplies, getReplies } from './postsSlice'; // Import various functions and selectors from 'postsSlice'
import { numFormatter } from 'utils/helpers'; // Import a utility function for number formatting
import ScrollToTop from 'comps/ScrollToTop'; // Import the ScrollToTop component
import ReactionsBar from './ReactionsBar'; // Import the ReactionsBar component
import PostText from 'comps/PostText'; // Import the PostText component
import QuotedPost from 'comps/quoted-post'; // Import the QuotedPost component
import UserLink from 'comps/user-link'; // Import the UserLink component
import Spinner from 'comps/Spinner'; // Import the Spinner component
import PostsList from 'comps/PostsList'; // Import the PostsList component
import PostTag from 'comps/post-tag'; // Import the PostTag component

export default props => {
    let { match: { params: { postId } = {} } = {} } = props; // Extract the 'postId' from props using destructuring
    let dispatch = useDispatch(); // Get the dispatch function from Redux
    let post = useSelector(state => selectPostById(state, postId)); // Select a post using the 'selectPostById' selector
    const replies = useSelector(state => selectReplies(state, postId)); // Select replies using the 'selectReplies' selector
    let { post_detail_status: status, post_replies_status } = useSelector(state => state.posts); // Select post detail status and post replies status

    useEffect(() => {
        if (!post)
            dispatch(getPost(postId)); // Fetch the post if it doesn't exist in the Redux store
    }, [post, postId, dispatch]);

    const getPosts = useCallback(() => {
        dispatch(getReplies(postId)); // Fetch replies for the post
    }, [dispatch, postId]);

    if (status === 'loading')
        return <Spinner />; // Display a loading spinner if the post is still loading
    if (!post) {
        return <div className="message font-weight-bold">Post not Found</div>; // Display a message if the post is not found
    }
    return (<>
        <ScrollToTop /> {/* Scroll to the top of the page */}
        <Heading backButton title="Post" /> {/* Display a Heading component with a back button and title */}
        <Col className="p-3 d-flex flex-column">
            <Row className="d-flex px-3 pb-1 mt-n2 text-muted">
                <PostTag post={post} /> {/* Display the tag for the post */}
            </Row>
            <Row>
                <Row>
                    <UserLink
                        user={post.user}
                        className="rounded-circle"
                        to={`/user/${post.user.screen_name}`}
                    >
                        <Figure
                            className="bg-border-color rounded-circle mr-2 overflow-hidden"
                            style={{ height: "50px", width: "50px" }}
                        >
                            <Figure.Image
                                src={(post.user.default_profile_image) ? '/img/default-profile-vector.svg' : post.user.profile_image_url_https}
                                className="w-100 h-100"
                            />
                        </Figure>
                    </UserLink>
                    <Col className="d-flex flex-column">
                        <UserLink
                            user={post.user}
                            to={`/user/${post.user.screen_name}`}
                            className="text-dark font-weight-bold mr-1">
                            {post.user.name}
                        </UserLink>
                        {/* tick */}
                        <span className="text-muted mr-1">@{post.user.screen_name}</span>
                    </Col>
                </Row>
                <Row></Row>
            </Row>
            <Row><blockquote
                style={{ fontSize: "1.5em" }}
                className="my-2 mw-100">
                <PostText expanded post={post} /> {/* Display the text of the post */}
            </blockquote></Row>
            <Row className="mb-2">
                <MultiMedia
                    expanded
                    post={post}
                /> {/* Display multimedia content of the post */}
                <QuotedPost className="mt-2" post={post.quoted_status} /> {/* Display a quoted post, if available */}
            </Row>
            <Row>
                <span className="text-muted pb-2">
                    {new Date(post.created_at).toLocaleTimeString()}
                    {" - "}
                    {new Date(post.created_at).toDateString()}
                </span>
            </Row>
            <Row className="border-top border-bottom d-flex p-2">
                <div className="py-1 pr-3">
                    <span className="font-weight-bold mr-1">{numFormatter(post.favorite_count)}</span>
                    <Link to={`/post/${post.id_str}/likes`} className="text-muted">Likes</Link>
                </div>
                <div className="py-1 pr-3">
                    <span className="font-weight-bold mr-1">{numFormatter(post.retweet_count)}</span>
                    <Link to={`/post/${post.id_str}/reposts`} className="text-muted">Reposts</Link>
                </div>
            </Row>
            <Row className="d-flex justify-content-end align-items-center mt-2 border-bottom">
                <ReactionsBar post={post} /> {/* Display the ReactionsBar component for post reactions */}
            </Row>
            <PostsList
                no_reply_tag
                posts={replies}
                status={post_replies_status}
                getPosts={getPosts}
            /> {/* Display a list of replies to the post */}
        </Col>
    </>);
}
