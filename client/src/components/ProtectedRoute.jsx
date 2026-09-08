import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Frontend guards are a UX convenience only. Real protection is server-side:
// every admin/organization API route checks the JWT's role itself
// (see server/middleware/authMiddleware.js's requireRole).
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    const loginPath =
      role === "admin" ? "/admin/login" : role === "organization" ? "/organization/login" : "/login";
    return <Navigate to={loginPath} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
