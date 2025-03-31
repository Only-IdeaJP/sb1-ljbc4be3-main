// src/App.tsx の重要な修正部分

import React, { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "./components/Toaster";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./lib/supabase";
import { AllPages } from "./pages/AllPages";
import { Commerce } from "./pages/Commerce";
import { Contact } from "./pages/Contact";
import { Dashboard } from "./pages/Dashboard";
import { EmailConfirmation } from "./pages/EmailConfirmation";
import EmailConfirmSuccess from "./pages/EmailConfirmSuccess";
import { FAQ } from "./pages/FAQ";
import { Features } from "./pages/Features";
import ForgetPassword from "./pages/ForgetPassword";
import { GradePapers } from "./pages/GradePapers";
import { Login } from "./pages/Login";
import { MyPage } from "./pages/MyPage";
import PasswordReset from "./pages/PasswordReset";
import { PracticePapers } from "./pages/PracticePapers";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import UploadPapers from "./pages/UploadPapers";

const App: React.FC = () => {
  const { user, loading } = useAuth();

  // ↓↓↓ Supabaseの自動サインアウトを防ぐための重要な修正 ↓↓↓
  useEffect(() => {
    // 認証イベントリスナーの設定
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event}`);

      // SIGNED_OUTイベントを検知した場合、それが/confirm-successページからの場合は
      // サインアウトをキャンセルするためにセッションを復元する
      if (event === 'SIGNED_OUT' && window.location.pathname === '/confirm-success') {
        console.log('Preventing automatic sign out on confirmation page');

        // URLからトークンを取得（ハッシュまたはクエリパラメータから）
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment || window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        // トークンがある場合はセッションを復元
        if (accessToken) {
          console.log('Attempting to restore session from token');
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          }).then(({ data, error }) => {
            if (error) {
              console.error('Failed to restore session:', error);
            } else if (data.session) {
              console.log('Session successfully restored');
            }
          });
        }
      }
    });

    // クリーンアップ関数
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  // ↑↑↑ 重要な修正の終了 ↑↑↑

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Define public and protected routes
  const publicRoutes = [
    { path: "/login", element: user ? <Navigate to="/" replace /> : <Login /> },
    { path: "/faq", element: <FAQ /> },
    { path: "/features", element: <Features /> },
    { path: "/contact", element: <Contact /> },
    { path: "/terms", element: <Terms /> },
    { path: "/privacy", element: <Privacy /> },
    { path: "/commerce", element: <Commerce /> },
    { path: "/", element: <Dashboard /> },
    { path: "/forget-password", element: <ForgetPassword /> },
    { path: "/reset-password", element: <PasswordReset /> },
    // メール確認関連の新しいルート
    { path: "/email-confirmation", element: <EmailConfirmation /> },
    { path: "/confirm-success", element: <EmailConfirmSuccess /> },
  ];

  const protectedRoutes = [
    { path: "/all", element: <AllPages /> },
    { path: "/mypage/*", element: <MyPage /> },
    { path: "/practice", element: <PracticePapers /> },
    { path: "/grade", element: <GradePapers /> },
    { path: "/upload", element: <UploadPapers /> },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* ToastContainer renders toast notifications globally */}
        <ToastContainer />
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Public Routes */}
            {publicRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}

            {/* Protected Routes */}
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={<ProtectedRoute>{element}</ProtectedRoute>}
              />
            ))}

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;