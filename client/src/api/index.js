import { logout } from 'store/authSlice';

/**
 * request - general method for all requests handling authorization within
 * @param {String} url - URL to fetch
 * @param {{ dispatch: Function, body: Object, headers: Object }} data - Data for the request
 * @returns {Promise<Object>} - A promise that resolves to the response data
 */
export async function request(url, { dispatch, body, headers } = {}) {
    // Use the fetch API to send a GET or POST request based on the presence of a request body
    let res = await fetch(url, {
        method: body !== undefined ? 'POST' : 'GET', // Determine the request method
        headers: {
            'Content-Type': 'application/json',
            ...headers, // Merge any additional headers with the default content-type header
        },
        body: JSON.stringify(body), // Convert the request body to a JSON string
    });

    if (res.ok) {
        // If the response status is OK (2xx), parse the JSON response and return it
        return res.json();
    } else if (res.status === 401) {
        // If the response status is 401 (Unauthorized), perform logout and throw an error
        await dispatch(logout()); // Logout the user (you should have an action to handle this)
        throw Error('Not Authorized');
    } else {
        // If the response status is not OK or 401, throw a generic error
        throw Error('Something went wrong');
    }
}
