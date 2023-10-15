import React, { useCallback } from 'react'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { notifySelectors, readNotif } from './notifySlice'
import { useAlerts } from 'features/alerts/alertsContext'
import { fetchNotifs } from './notifySlice'

import { Link } from 'react-router-dom'
import { ListGroup, Figure } from 'react-bootstrap'
import QuotePost from 'comps/quoted-post'
import Heading from 'comps/Heading'
// import UserLink from 'comps/user-link'
import PostText from 'comps/PostText'

export default props => {
    const dispatch = useDispatch()
    const notifications = useSelector(notifySelectors.selectAll)
    const { user: authUser } = useSelector(state => state.auth)
    const { ensureNotifPermission } = useAlerts()

    // Fetch notifications, ensure notification permissions, and do this only once when the component mounts.
    useEffect(() => {
        dispatch(fetchNotifs())
        ensureNotifPermission()
        // eslint-disable-next-line
    }, [])

    // Handle clicking on a notification.
    const handleClick = n => {
        if (!n.read) dispatch(readNotif(n))
    }

    // Mark all notifications as read.
    const readAll = useCallback(
        notifications => {
            notifications.forEach(n => {
                if (!n.read) dispatch(readNotif(n))
            })
        },
        [dispatch]
    )

    // Automatically mark all notifications as read when the notifications list changes.
    useEffect(() => {
        readAll(notifications)
    }, [notifications, readAll])

    return (
        <>
            {/* Display the heading with a profile button and a back button */}
            <Heading title="Notifications" btnProfile backButton />
            {/* Create a list group for displaying notifications */}
            <ListGroup variant="flush" className="">
                {notifications.length ? (
                    notifications.map(n => {
                        // Determine if the notification is read or unread and apply appropriate styling.
                        let active = n.read ? '' : 'bg-bg-color border-left-right-primary-custom'
                        let post = n.body.post
                        let user = n.body.user || { screen_name: "<not_found>" }
                        let body,
                            heading,
                            anchor = '',
                            tag = n.title
                        switch (n.type) {
                            case 'mentioned':
                                anchor = `/post/${post.id_str}`
                                body = (
                                    <div className="d-flex flex-column">
                                        <p>
                                            <b>@{user.screen_name}</b> mentioned you in a post
                                        </p>
                                        <blockquote className="bg-light mt-n2 p-2 border-left-right-secondary-custom">
                                            <PostText post={post} />
                                        </blockquote>
                                    </div>
                                )
                                break
                            case 'replied':
                                anchor = `/post/${post.id_str}`
                                body = (
                                    <div className="d-flex flex-column">
                                        <p>
                                            <b>@{user.screen_name}</b> replied
                                        </p>
                                        <QuotePost post={post} />
                                    </div>
                                )
                                break
                            case 'liked':
                                anchor = `/post/${post.id_str}/likes`
                                body = (
                                    <div className="d-flex flex-column">
                                        <p>
                                            <b>@{user.screen_name}</b> liked
                                        </p>
                                        <QuotePost post={post} />
                                    </div>
                                )
                                break
                            case 'followed':
                                anchor = `/user/${authUser.screen_name}/followers`
                                body = (
                                    <div className="d-flex flex-column">
                                        <p>
                                            <b>@{user.screen_name}</b> started following you
                                        </p>
                                    </div>
                                )
                                break
                            case 'unfollowed':
                                anchor = `/user/${user.screen_name}`
                                body = (
                                    <div className="d-flex flex-column">
                                        <p>
                                            <b>@{user.screen_name}</b> no longer follows you
                                        </p>
                                    </div>
                                )
                                break
                            case 'reposted':
                                anchor = `/post/${post.id_str}/reposts`
                                body = (
                                    <div className="d-flex flex-column">
                                        <p>
                                            <b>@{user.screen_name}</b> reposted
                                        </p>
                                        <QuotePost post={post} />
                                    </div>
                                )
                                break
                            default:
                                anchor = '/notifications'
                        }
                        if (user) {
                            // Create a link to the user's profile and display their profile image.
                            heading = (
                                <div className="d-flex">
                                    <Link to={`/user/${user.screen_name}`}>
                                        <Figure
                                            className="bg-border-color rounded-circle overflow-hidden mr-1 mb-2"
                                            style={{ height: '45px', width: '45px' }}
                                        >
                                            <Figure.Image
                                                src={
                                                    user.default_profile_image
                                                        ? '/img/default-profile-vector.svg'
                                                        : user.profile_image_url_https
                                                }
                                                className="w-100 h-100"
                                            />
                                        </Figure>
                                    </Link>
                                </div>
                            )
                        }
                        return (
                            // Display each notification as a list item with appropriate styling and content.
                            <ListGroup.Item
                                className={`${active} px-lg-5 px-xs-2 px-sm-4`}
                                action
                                as={'div'}
                                key={n._id}
                                onClick={() => handleClick(n)}
                            >
                                {/* Create a link that covers the entire item */}
                                <Link className="stretched-link" to={anchor}></Link>
                                <div className="mt-n2 mb-2">
                                    <small>{tag}</small>
                                </div>
                                {heading}
                                {body}
                            </ListGroup.Item>
                        )
                    })
                ) : (
                    // Display a message if there are no notifications.
                    <div className="message font-weight-bold">No notifications yet</div>
                )}
            </ListGroup>
        </>
    )
}
