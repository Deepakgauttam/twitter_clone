import React from 'react'; // Import the React library for building UI components.
import { Switch, Route } from 'react-router-dom'; // Import the Switch and Route components from react-router-dom.

import Profile from './profile-modal'; // Import the 'Profile' component from a local file.
import Heading from 'comps/Heading'; // Import the 'Heading' component from 'comps/Heading'.

export default props => {
    return (
        <>
            <Switch>
                {/* Define a route that renders the 'Profile' component when the path is '/settings/profile'. */}
                <Route path='/settings/profile' component={Profile} />
            </Switch>
            {/* Render the 'Heading' component with the title 'Settings', a button for the user's profile, and a back button. */}
            <Heading title='Settings' btnProfile backButton />
            {/* Display a message indicating that settings are coming in the future. */}
            <div className="message font-weight-bold">Settings coming in the future</div>
        </>
    );
}
