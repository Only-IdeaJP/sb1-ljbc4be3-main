import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  // Define protected routes in an array
  const protectedRoutes = ["/upload", "/all", "/practice", "/grade"];
  const requiresAuth =
    protectedRoutes.includes(pathname) || pathname.startsWith("/mypage");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
