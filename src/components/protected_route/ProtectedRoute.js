// components/protected_route/ProtectedRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, hasPermission } from "../../utils/auth";

const ProtectedRoute = ({ children, requiredPermission }) => {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  if (requiredPermission && !hasPermission(requiredPermission))
    return <Navigate to="/admin-dashboard" replace />;
  return children;
};

export default ProtectedRoute;
