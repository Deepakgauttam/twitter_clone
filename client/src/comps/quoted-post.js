import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import { Link } from 'react-router-dom';
import { Row, Card, Figure } from 'react-bootstrap';
import MultiMedia from 'comps/MultiMedia';
import PostText from 'comps/PostText';
import UserLink from 'comps/user-link';

// This component displays a post card with user information, timestamp, and multimedia content.
// It takes post data, a CSS class name, and an "expanded" flag as props.
export default ({ post, className, expanded = false }) => {
    // If there's no post data, return an empty fragment.
    if (!post) {
        return <></>;
    }

    return (
        <>
            {/* Card to display the post */}
            <Card className={`${className} w-100 border bg-white overflow-hidden`}>
                {/* Link to the post detail page */}
                <Link className="stretched-link" to={`/post/${post.id_str}`}></Link>
                <div className="p-2">
                    {/* Row to display user information and timestamp */}
                    <Row className="d-flex align-items-center">
                        {/* Link to the user's profile */}
                        <UserLink
                            user={post.user}
                            className="rounded-circle d-block"
                            to={`/user/${post.user.screen_name}`}
                        >
                            {/* User profile image */}
                            <Figure
                                className="bg-border-color rounded-circle overflow-hidden mr-1 mb-0"
                                style={{ height: "25px", width: "25px" }}
                            >
                                <Figure.Image
                                    // Display the user's profile image or a default image if unavailable
                                    src={(post.user.default_profile_image) ? '/img/default-profile-vector.svg' : post.user.profile_image_url_https}
                                    className="w-100 h-100"
                                />
                            </Figure>
                        </UserLink>
                        {/* User's name with a link to their profile */}
                        <UserLink
                            user={post.user}
                            to={`/user/${post.user.screen_name}`}
                            className="text-dark font-weight-bold mr-1"
                        >
                            {post.user.name}
                        </UserLink>
                        {/* Display user's screen name */}
                        <span className="text-muted">@{post.user.screen_name}</span>
                        <pre className="m-0 text-muted">{" - "}</pre>
                        {/* Display the post's timestamp using ReactTimeAgo */}
                        <span className="text-muted"><ReactTimeAgo date={Date.parse(post.created_at)} timeStyle="twitter" /></span>
                    </Row>
                    <Row className="">
                        <blockquote className="mb-1">
                            {/* Display the post text with a link to the post's detail page */}
                            <PostText to={`/post/${post.id_str}`} expanded={expanded} post={post} />
                        </blockquote>
                    </Row>
                </div>
                <Row>
                    {/* Display multimedia content (e.g., images or videos) related to the post */}
                    <MultiMedia
                        // Commented out "expanded" prop
                        // expanded={expanded}
                        className="rounded-0"
                        post={post}
                    />
                </Row>
            </Card>
        </>
    );
}
