
// components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  // 保護されたルートの定義
  const protectedRoutes = ["/upload", "/all", "/practice", "/grade"];
  const requiresAuth =
    protectedRoutes.includes(pathname) || pathname.startsWith("/mypage");

  // 認証状態の読み込み中はローディングスピナーを表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" > </div>
      </div>
    );
  }

  // 認証が必要なページで未認証の場合はログインページにリダイレクト
  if (requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children} </>;
};