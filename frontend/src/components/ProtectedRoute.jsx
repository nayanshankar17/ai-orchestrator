import { Navigate } from "react-router-dom";


// children: the component that we want to render if the user is authenticated
export default function ProtectedRoute({ children }) {

  //fetch the token from local storage
  const token = localStorage.getItem("access_token");
  
  // If there's no token, redirect to the login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children; // If there's a token, render the children components (the protected page)
}