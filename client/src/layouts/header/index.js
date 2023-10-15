import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon component
import { faBell } from '@fortawesome/free-regular-svg-icons/faBell'; // Import the bell icon
import { faEnvelope } from '@fortawesome/free-regular-svg-icons/faEnvelope'; // Import the envelope icon
import { faUser } from '@fortawesome/free-regular-svg-icons/faUser'; // Import the user icon
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome'; // Import the home icon
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons/faEllipsisH'; // Import the ellipsis icon
import { faHashtag } from '@fortawesome/free-solid-svg-icons/faHashtag'; // Import the hashtag icon
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle'; // Import the plus-circle icon
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt'; // Import the sign-out icon
import { NavLink, Link } from 'react-router-dom'; // Import NavLink and Link components from react-router-dom
import { Col, Badge } from 'react-bootstrap'; // Import Col and Badge components from react-bootstrap
import { useSelector } from 'react-redux'; // Import useSelector function from react-redux
import { selectUnread } from 'features/notify/notifySlice'; // Import selectUnread selector from your notifySlice

function Header(props) {
    // Use Redux's useSelector to get the unread notification count
    let notifsCount = useSelector(selectUnread).length;

    // Destructure the user's screen name from Redux state
    let { user: { screen_name } } = useSelector(state => state.auth);

    // Define objects for the logo and compose button
    let logo = {
        href: "/home",
    };

    let compose = {
        name: "Post",
        icon: faPlusCircle,
    };

    // Define an array of navigation links with their respective properties
    let list = [
        {
            name: "Home",
            href: "/home",
            icon: faHome,
        },
        {
            name: "Explore",
            href: "/explore",
            icon: faHashtag,
        },
        {
            name: "Profile",
            href: `/user/${screen_name}`,
            icon: faUser,
        },
        {
            name: "Notifications",
            href: "/notifications",
            icon: faBell,
            count: notifsCount, // Include the notification count
        },
        {
            name: "Settings",
            href: "/settings",
            icon: faEllipsisH,
        },
        {
            name: "Messages",
            href: "/messages",
            icon: faEnvelope,
            disabled: true, // Disable the Messages link
        },
        // You can add more navigation links here with their properties
    ];

    return (
        <Col className="d-flex flex-column align-items-end vh-100 overflow-y-auto mr-sm-n3 mr-md-0 mr-xl-3 hide-scroll">
            <div className="my-2 mr-xl-auto ml-xl-4">
                <Link
                    className='btn text-primary btn-naked-primary rounded-circle p-2'
                    to={logo.href}>
                    {/* Display the logo (an image) */}
                    <img className="rounded-circle" height="45" width="45" src="/android-chrome-192x192.png" alt="logo" />
                </Link>
            </div>
            <div className="ml-0 d-flex flex-column mb-2 align-items-start">
                {list.map(itm => {
                    let vis = itm.disabled ? "disabled" : "";
                    let badge = itm.count ? (
                        <>
                            <Badge className="position-absolute" variant="primary" style={{ top: 5, right: 5, left: 'unset' }}>{itm.count}</Badge>
                            <span className="sr-only">new items</span>
                        </>
                    ) : null;
                    return (
                        <div key={itm.name} className="d-flex align-items-top position-relative">
                            <NavLink
                                to={itm.href}
                                className={`${vis} px-xl-2 py-xl-1 p-1 mb-2 mx-lg-0 mx-auto btn btn-naked-primary rounded-pill font-weight-bold btn-lg d-flex align-items-center`}
                                activeClassName="active"
                            >
                                <FontAwesomeIcon className="m-2" size="lg" icon={itm.icon} />
                                <span className="d-none d-xl-block mr-2">{itm.name}</span>
                            </NavLink>
                            {badge}
                        </div>
                    );
                })}
            </div>
            <Link className="d-flex btn btn-primary font-weight-bold p-xl-3 rounded-pill" id="compose" to="/compose/post">
                <span className="d-none d-xl-block mx-auto px-5">{compose.name}</span>
                <FontAwesomeIcon className="d-xl-none mx-auto" size="2x" icon={compose.icon} />
            </Link>
        </Col>
    );
}

export default Header;
