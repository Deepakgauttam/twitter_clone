// Import necessary modules and components
import React from 'react';
import Compose from 'features/posts/Compose'; // Import a component for composing posts
import Feed from 'features/posts/Feed'; // Import a component for displaying a feed of posts
import Heading from 'comps/Heading'; // Import a custom Heading component
import MediaQuery from 'react-responsive'; // Import MediaQuery for responsive rendering

// Define a class component named "Home"
class Home extends React.Component {
    render() {
        return (<>
            <Heading title="Home" btnLogout btnProfile />
            <MediaQuery minWidth={576}>
                <Compose className='mt-2' />
                <div style={{ height: "10px" }} className="w-100 bg-border-color border"></div>
            </MediaQuery>
            <Feed />
        </>)
    }
}

export default Home