// src/components/common/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * 未認証の場合はログインページにリダイレクト
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false,
}) => {
    const { user, loading, checkAuth } = useAuth();
    const { pathname } = useLocation();

    // 保護が必要なルートリスト
    const protectedRoutes = ["/upload", "/all", "/practice", "/grade"];

    // 現在のルートが保護必要かどうかを判定
    const requiresAuth =
        protectedRoutes.includes(pathname) || pathname.startsWith("/mypage");

    // コンポーネントマウント時に認証状態を再確認
    useEffect(() => {
        if (requiresAuth) {
            checkAuth();
        }
    }, [checkAuth, requiresAuth]);

    // ローディング中はスピナーを表示
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // 認証が必要なルートで未認証の場合はログインページにリダイレクト
    if (requiresAuth && !user) {
        return <Navigate to="/login" state={{ from: pathname }} replace />;
    }

    // 管理者権限が必要なルートで一般ユーザーの場合はホームにリダイレクト
    if (requireAdmin && user?.subscription_tier !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // 認証済みの場合は子コンポーネントを表示
    return <>{children}</>;
};