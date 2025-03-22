// components/ProtectedRoute.tsx

import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { HotToast } from "../components/Toaster";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * メール確認済みのユーザーのみアクセス可能
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, error } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // 保護されたルートの定義
  const protectedRoutes = ["/upload", "/all", "/practice", "/grade"];
  const requiresAuth =
    protectedRoutes.includes(pathname) || pathname.startsWith("/mypage");

  // 認証エラーがある場合（メール未確認など）
  useEffect(() => {
    if (error && error.includes('メールアドレスの確認')) {
      HotToast.error('メールアドレスの確認が必要です');
      // メール確認案内ページへリダイレクト
      navigate('/email-confirmation?error=true');
    }
  }, [error, navigate]);

  // 認証状態の読み込み中はローディングスピナーを表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 認証が必要なページで未認証の場合はログインページにリダイレクト
  if (requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};