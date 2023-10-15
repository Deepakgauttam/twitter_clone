import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import requestAnimationFrame from 'raf'

// This functional component scrolls the window to the top when the URL pathname changes.
export default function ScrollToTop() {
    // Get the current pathname from the react-router-dom's useLocation hook.
    const { pathname } = useLocation();

    // Use the useEffect hook to trigger the scroll when the pathname changes.
    useEffect(() => {
        // Request an animation frame to smoothly scroll to the top of the page.
        requestAnimationFrame(() => {
            window.scrollTo(0, 0); // Scroll to the top of the page (x=0, y=0).
        })
    }, [pathname]); // Re-run this effect when the 'pathname' changes.

    // This component doesn't render anything, so it returns null.
    return null;
}
