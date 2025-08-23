// client/src/components/common/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect them to the page they were trying to access before logging in
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
