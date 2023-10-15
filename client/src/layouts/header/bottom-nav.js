import React from 'react';  // Import the React library

// Import FontAwesome icons used for various navigation menu items
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faBell } from '@fortawesome/free-regular-svg-icons/faBell';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { faUser } from '@fortawesome/free-regular-svg-icons/faUser';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt';

import { NavLink, Link } from 'react-router-dom';  // Import components for navigation
import { Badge } from 'react-bootstrap';  // Import the Badge component from React Bootstrap

import { useSelector } from 'react-redux';  // Import the useSelector function from Redux
import { selectUnread } from 'features/notify/notifySlice';  // Import a selector from the notifySlice feature


function Nav() {
    let notifsCount = useSelector(selectUnread).length
    let { user: { screen_name } } = useSelector(state => state.auth)
    let list = [
        {
            name: "Home",
            href: "/home",
            icon: faHome
        },
        {
            name: "Explore",
            href: "/explore",
            icon: faSearch
        },
        {
            name: "Logout",
            href: "/logout",
            icon: faSignOutAlt
        },
        {
            name: "Notifications",
            href: "/notifications",
            icon: faBell,
            count: notifsCount
        },
        {
            name: "Profile",
            href: `/user/${screen_name}`,
            icon: faUser,
        }
    ]
    let compose = {
        name: "Tweet",
        icon: faPlusCircle,
        href: '/compose/post',
        style: {
            right: '.5em',
            bottom: '4em',
            fontSize: '1.1em'
        }
    }
    return (
        <div className="fixed-bottom bg-white d-flex justify-content-around border">
            <Link style={compose.style} to={compose.href} className="btn btn-primary rounded-circle position-absolute">
                <FontAwesomeIcon className="" size="2x" icon={compose.icon} />
            </Link>
            {list.map(item => {
                let vis = item.disabled ? 'disabled' : ''
                let badge = item.count ? <><Badge className="position-absolute" variant="primary" style={{ top: 6, right: 6, left: 'unset' }}>{item.count}</Badge><span className="sr-only">new items</span></> : null
                return (<div key={item.name} className="d-flex align-items-top position-relative">
                    <NavLink
                        key={item.name}
                        to={item.href}
                        activeClassName="active"
                        className={`${vis} btn btn-naked-primary rounded-pill p-3`}
                    >
                        <FontAwesomeIcon
                            icon={item.icon}
                            size='lg'
                        />
                    </NavLink>
                    {badge}
                </div>)
            })}
        </div>
    )
}
export default Nav