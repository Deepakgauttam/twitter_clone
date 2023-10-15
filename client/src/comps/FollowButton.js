import React from 'react'
import { useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useAlerts } from 'features/alerts/alertsContext'

export default props => {
    // Extract 'isAuthenticated' and 'user' from the Redux store using 'useSelector'
    let { isAuthenticated, user: AuthUser } = useSelector(state => state.auth)
    
    // Access the 'alerts' from the alertsContext
    const alerts = useAlerts()
    let ensureNotifPermission;

    /**
     * Dirty fix, as in unauthenticated, this button won't be visible
     * (hence no 'handleFollow' call, below), but body still executes, giving error.
     * 'ensureNotifPermission' will only be assigned a value if 'alerts' is defined.
     */
    if (alerts)
        ensureNotifPermission = alerts.ensureNotifPermission

    // Extract 'followUser', 'user', and 'unFollowUser' from the 'props'
    let { followUser, user, unFollowUser } = props
    
    // Extract 'following' from the 'user' object
    let { following } = user;
    
    // State variables to manage hover text and variant
    let [hoverText, setHoverText] = React.useState('')
    let [hoverVariant, setHoverVariant] = React.useState('')

    // Handle the 'Follow' button click event
    let handleFollow = async e => {
        e.preventDefault()
        followUser(user.screen_name)
        ensureNotifPermission()
    }

    // Handle the 'Unfollow' button click event
    let handleUnFollow = async e => {
        e.preventDefault()
        unFollowUser(user.screen_name)
        setHoverText("Unfollowed")
    }

    // Handle mouse enter event to display 'Unfollow' and change the variant
    let handleMouseEnter = useCallback(async _ => {
        following && setHoverText("Unfollow")
        following && setHoverVariant('danger')
    }, [following])

    // Handle mouse leave event to reset hover text and variant
    let handleMouseLeave = async _ => {
        setHoverText('')
        setHoverVariant('')
    }

    // Determine the text and variant for the button
    let text = !following ? "Follow" : "Following"
    let variant = following ? "primary" : "outline-primary"

    // If the user is not authenticated or is trying to follow themselves, return an empty component
    if (!isAuthenticated || (AuthUser && AuthUser.screen_name === user.screen_name))
        return <></>

    // Render the button
    return (
        <>
            <Button
                onClick={following ? handleUnFollow : handleFollow}
                variant={hoverVariant || variant}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="rounded-pill px-3 py-1 font-weight-bold">
                <span>{hoverText || text}</span>
            </Button>
        </>
    )
}



// import React from 'react'
// import { useCallback } from 'react'
// import { Button } from 'react-bootstrap'
// import { useSelector } from 'react-redux'
// import { useAlerts } from 'features/alerts/alertsContext'

// export default props => {
//     let { isAuthenticated, user: AuthUser } = useSelector(state => state.auth)
//     const alerts = useAlerts()
//     let ensureNotifPermission;
//     /**
//      * dirty fix, as in unauthenticated, this button wont be visble (hence no handleFollow call, below)
//      * but body still executes, giving error
//      */
//     if (alerts)
//         ensureNotifPermission = alerts.ensureNotifPermission

//     let { followUser, user, unFollowUser } = props
//     let { following } = user;
//     let [hoverText, setHoverText] = React.useState('')
//     let [hoverVariant, setHoverVariant] = React.useState('')
//     let handleFollow = async e => {
//         e.preventDefault()
//         followUser(user.screen_name)
//         ensureNotifPermission()
//     }
//     let handleUnFollow = async e => {
//         e.preventDefault()
//         unFollowUser(user.screen_name)
//         setHoverText("Unfollowed")
//     }
//     let handleMouseEnter = useCallback(async _ => {
//         following && setHoverText("Unfollow")
//         following && setHoverVariant('danger')
//     }, [following])
//     let handleMouseLeave = async _ => {
//         setHoverText('')
//         setHoverVariant('')
//     }
//     let text = !following ? "Follow" : "Following"
//     let variant = following ? "primary" : "outline-primary"
//     if (!isAuthenticated
//         || (AuthUser && AuthUser.screen_name === user.screen_name))
//         return <></>
//     return (<>
//         <Button
//             onClick={following ? handleUnFollow : handleFollow}
//             variant={hoverVariant || variant}
//             onMouseEnter={handleMouseEnter}
//             onMouseLeave={handleMouseLeave}
//             className="rounded-pill px-3 py-1 font-weight-bold">
//             <span>{hoverText || text}</span>
//         </Button>
//     </>)
// }