// components/ProtectedRoute.tsx

import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * 認証済みのユーザーのみアクセス可能
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, refreshUserData } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // 保護されたルートの定義
  const protectedRoutes = ["/upload", "/all", "/practice", "/grade"];
  const requiresAuth =
    protectedRoutes.includes(pathname) || pathname.startsWith("/mypage");

  // メール確認のチェックをSupabaseの内部状態に任せる
  useEffect(() => {
    if (user && requiresAuth) {
      // ユーザーが存在する場合はセッション状態をチェック
      supabase.auth.getSession().then(({ data }) => {
        // メール確認状態はAuthユーザーから直接確認
        const emailConfirmed = data.session?.user?.email_confirmed_at != null;

        if (!emailConfirmed) {
          // メール未確認の場合は確認ページにリダイレクト
          navigate('/email-confirmation?error=true', { replace: true });
        }
      });
    }
  }, [user, requiresAuth, navigate]);

  // 認証状態の読み込み中はローディングスピナーを表示
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-500">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  // 認証が必要なページで未認証の場合はログインページにリダイレクト
  if (requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};