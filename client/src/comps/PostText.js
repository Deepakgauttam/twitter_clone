import React from 'react'
import WithUrls from 'comps/with-urls'
import { truncateText } from 'utils/helpers'
import { useHistory } from 'react-router-dom'

/**
 * React Router onclick workaround
 * This component enables routing when clicking on an element.
 *
 * @example
 * <div {...OnClick(onClick)}/>
 */
const OnClick = (() => {
    let clickTime = 0;
    let pos = { x: 0, y: 0 };

    return onClick => ({
        onMouseDown: ({ nativeEvent: e }) => { 
            // Store the click time and position
            clickTime = Date.now();
            pos.x = e.x;
            pos.y = e.y;
        },
        onMouseUp: ({ nativeEvent: e }) => {
            // Check conditions to determine if it's a click event
            if (Date.now() - clickTime < 500 && pos.x === e.x && pos.y === e.y && e.which === 1) {
                onClick();
            }
        },
    });
})();

export default ({ post, expanded = false, to }) => {
    const history = useHistory()
    let { text } = post
    if (!expanded)
        text = truncateText(text, 5)
    return (
        <div {...OnClick((e) => { to && history.push(to) })}>
            {/* Wrap text in WithUrls component */}
            <WithUrls>{text}</WithUrls>
        </div>
    )
}
