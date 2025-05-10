import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Simple token validation for client-side
  const isValid = token && token.length > 0;

  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;