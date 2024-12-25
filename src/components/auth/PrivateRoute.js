import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (isAdminRoute && !user?.isAdmin) {
    // Redirect non-admin users trying to access admin routes to login
    return <Navigate to="/login" state={{ 
      from: location,
      message: "Admin access required. Please login as an administrator."
    }} />;
  }

  return children;
}

export default PrivateRoute;
