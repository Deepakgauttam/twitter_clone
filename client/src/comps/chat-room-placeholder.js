import React from 'react'

import Heading from 'comps/Heading'
// Define a functional component using arrow function syntax
// This component appears to display a heading and some explanatory text
export default props => {
    return (<>
        <Heading title='Chat room(s)' btnProfile backButton />
        <p className='flex min-vh-100 p-3 text-muted'>
            This feature i want badly, but also have no idea where to head, so i need your help on that<br /><br />
            New unique features would help this project stand out and not be just "one more twitter clone"<br /><br />
            But also if nobody is interested is this, i will also just move on
        </p>
    </>)
}