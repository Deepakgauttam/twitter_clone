// Import necessary modules and components
import React from 'react';
import { useDispatch } from 'react-redux'; // Import useDispatch to access the Redux dispatch function
import { logout } from 'store/authSlice'; // Import the 'logout' action from the authSlice in the Redux store

// Define a functional component named "Logout"
const Logout = () => {
  const dispatch = useDispatch(); // Get the dispatch function from the Redux store

  // Define a function to handle the logout action
  const handleLogout = () => {
    // Dispatch the 'logout' action to log the user out
    dispatch(logout());
  };

  return (
    <div>
      {/* Render a button that triggers the handleLogout function when clicked */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// Export the Logout component
export default Logout;
