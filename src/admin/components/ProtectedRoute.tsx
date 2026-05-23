import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define allowed roles for admin panel access
const ALLOWED_ADMIN_ROLES = ['super_admin', 'editor', 'creator'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, admin, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Security check: Ensure admin has a valid role for admin panel access
  if (!admin || !admin.role || !ALLOWED_ADMIN_ROLES.includes(admin.role)) {
    // Log out the user and redirect to login
    logout();
    return <Navigate to="/admin/login" replace />;
  }

  // Check specific route permissions if requiredRole is specified
  if (requiredRole && !requiredRole.includes(admin.role)) {
    return <Navigate to="/admin/workshops" replace />;
  }

  return <>{children}</>;
};
