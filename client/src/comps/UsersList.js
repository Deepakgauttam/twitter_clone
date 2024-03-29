import React from 'react'
import { useEffect, useCallback } from 'react'
import FollowButton from 'comps/FollowButton'
import { Link } from 'react-router-dom'
import { ListGroup, Media, Row, Col } from 'react-bootstrap'
import UserLink from 'comps/user-link'
import Spinner from 'comps/Spinner'
import TryAgain from './TryAgain'
import { useBottomScrollListener } from 'react-bottom-scroll-listener'

import { truncateText } from 'utils/helpers'

// A component for displaying a list of users with options like following/unfollowing.
export default props => {
    let {
        users,
        status,
        getUsers,
        followUser,
        unFollowUser,
        className,
        length,
        compact,
        noPop
    } = props

    // Fetch users when the component mounts and if the status and users meet specific conditions.
    useEffect(useCallback(() => {
        if ((status === 'idle' || status === 'done') && !users.length) {
            getUsers()
            console.log('Fetching users on component load, status:', status)
        }
    }, [status, users, getUsers]), [getUsers])

    // Load more users when the user scrolls to the bottom of the list.
    useBottomScrollListener(useCallback(() => {
        if (status === "idle" && users.length) {
            getUsers()
            console.log('Loading more user list, status:', status)
        }
    }, [status, users, getUsers]), 500)

    // If the status is 'loading' and there are no users, display a loading spinner.
    if (status === 'loading' && !users.length)
        return <Spinner />

    return (
        <>
            <ListGroup className={"border-bottom " + className} variant="flush">
                {users && users.length ? users.slice(0, length).map(user => {
                    return (
                        <ListGroup.Item
                            className="px-1 text-truncate"
                            action
                            key={user.screen_name}
                            as={noPop ? Link : UserLink}
                            user={user}
                            to={`/user/${user.screen_name}`}
                        >
                            <Media>
                                <img
                                    width={50}
                                    height={50}
                                    className="rounded-circle mx-1"
                                    src={user.profile_image_url_https}
                                    alt=''
                                />
                                <Media.Body>
                                    <Row>
                                        <Col className="pr-5 pr-lg-4 pr-xl-2" xs="8">
                                            <p className="text-dark mb-0 text-truncate text-capitalize font-weight-bold">{user.name}</p>
                                            <p className="text-muted text-truncate mt-n1"> @{user.screen_name}</p>
                                        </Col>
                                        <Col className="d-flex align-items-center justify-content-end px-1" xs="4">
                                            <FollowButton
                                                user={user}
                                                unFollowUser={unFollowUser}
                                                followUser={followUser}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        {!compact && <blockquote className="mb-0 mt-n2">{truncateText(user.description, 5)}</blockquote>}
                                    </Row>
                                </Media.Body>
                            </Media>
                        </ListGroup.Item>
                    )
                }) : (status === 'idle' &&
                    <div className="message font-weight-bold">No users to show</div>
                )}
                {status === 'loading' ? <Spinner /> : null}
                {status === 'error' && <TryAgain fn={getUsers} />}
            </ListGroup>
        </>
    )
}
