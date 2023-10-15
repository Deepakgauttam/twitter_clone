import React from 'react'

// A functional component that displays a centered logo image.
export default props => {
    return (
        <div className='vw-100 d-flex' style={{ height: '75vh' }}>
            <img
                className='m-auto'
                width={75}
                heigh={75} // Typo: should be "height" instead of "heigh"
                src="/android-chrome-192x192.png"
                alt="logo"
            />
        </div>
    )
}
