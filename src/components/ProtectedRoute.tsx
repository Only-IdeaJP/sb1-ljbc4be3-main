import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  // アップロードページのみログインが必要
  const isUploadPage = window.location.pathname === '/upload';
  const isAllPagesPage = window.location.pathname === '/all';
  const isPracticePage = window.location.pathname === '/practice';
  const isGradePage = window.location.pathname === '/grade';
  const isMyPage = window.location.pathname.startsWith('/mypage');

  const requiresAuth = isUploadPage || isAllPagesPage || isPracticePage || isGradePage || isMyPage;

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