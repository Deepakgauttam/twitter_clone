import React from 'react'

import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from 'store/authSlice'

import { Link } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { Row, Figure } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'

function Heading(props) {
    // Extract the props passed to the Heading component
    let { title, btnLogout, backButton, btnProfile } = props

    // Initialize useDispatch and useHistory for handling actions and navigation
    let dispatch = useDispatch()
    let history = useHistory()

    // Check if the screen is considered mobile based on the screen width
    const isMobile = useMediaQuery({ query: '(max-width: 576px)' })

    // Extract user information and authentication status from the Redux store
    let { user: authUser, isAuthenticated } = useSelector(state => state.auth)

    // Initialize state for the button text
    let [btnTxt, setBtnTxt] = React.useState("Don't click")

    // Check if backButton should be displayed
    if (backButton) {
        backButton = (
            <button
                onClick={() => { isAuthenticated ? history.goBack() : history.push('/') }}
                className="ml-2 btn btn-naked-primary rounded-circle text-primary">
                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </button>
        )
    }

    // Check if btnLogout should be displayed
    if (btnLogout) {
        btnLogout = (
            <button onClick={() => { dispatch(logout()) }}
                onMouseEnter={() => { setBtnTxt("Signout") }}
                onMouseLeave={() => { setBtnTxt("Logout") }}
                className="btn btn-outline-primary rounded-pill px-2 py-1 mr-2 font-weight-bold"
            >{btnTxt}
            </button>
        )
    }

    // Check if btnProfile should be displayed and the user is authenticated
    if (btnProfile && isAuthenticated) {
        btnProfile = (
            <Link
                className="d-flex align-items-end"
                to={`/user/${authUser.screen_name}`}
            >
                <Figure
                    className="bg-border-color rounded-circle overflow-hidden my-auto ml-2"
                    style={{ height: "35px", width: "35px" }}
                >
                    <Figure.Image
                        src={(authUser.default_profile_image) ? '/img/default-profile-vector.svg' : authUser.profile_image_url_https}
                        className="w-100 h-100"
                    />
                </Figure>
            </Link>
        )
    }

    // Render the Heading component, including the title, back button, profile button, and logout button
    return (
        <div className="d-flex justify-content-between border-bottom sticky-top bg-white align-items-center">
            <Row className="d-flex align-items-center">
                {backButton}
                {isMobile && btnProfile}
                <h5 className="my-3 mx-2 font-weight-bold">{title}</h5>
            </Row>
            {btnLogout}
        </div>
    )
}

export default Heading
