import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Gate a route behind authentication, and optionally a specific role.
 *
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>              -> any logged-in user
 *   <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>  -> admins only
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="page-loader" role="status" aria-label="Loading">
        <span className="page-loader__spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Signed in, but wrong role — send them to their own home.
    return <Navigate to={user?.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}
