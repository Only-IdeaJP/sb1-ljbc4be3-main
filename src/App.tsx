// App.tsx

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
import { EmailConfirmation, EmailConfirmSuccess } from "./pages/EmailConfirmation";
import { FAQ } from "./pages/FAQ";
import { Features } from "./pages/Features";
import ForgetPassword from "./pages/ForgetPassword";
import { GradePapers } from "./pages/GradePapers";
import { Login } from "./pages/Login";
import { MyPage } from "./pages/MyPage";
import { PracticePapers } from "./pages/PracticePapers";
import { Privacy } from "./pages/Privacy";
import ResetPassword from "./pages/ResetPassword";
import { Terms } from "./pages/Terms";
import UploadPapers from "./pages/UploadPapers";

const App: React.FC = () => {
  const { user, loading } = useAuth();

  // Supabaseのハッシュパラメータを処理
  useEffect(() => {
    // URLからハッシュパラメータを取得
    const handleEmailConfirmation = async () => {
      const { hash } = window.location;
      if (hash && hash.includes('type=signup')) {
        try {
          // セッションを取得
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Session error:', error);
            return;
          }

          // ユーザーが認証されていればメール確認成功とみなす
          if (data.session) {
            // メール確認フラグを更新
            const { error: updateError } = await supabase
              .from('users')
              .update({ email_confirmed: true })
              .eq('id', data.session.user.id);

            if (updateError) {
              console.error('Error updating email confirmation:', updateError);
              return;
            }

            // 成功したら確認完了ページにリダイレクト（URLハッシュをクリア）
            // 一時的にログアウトして状態をクリアする
            await supabase.auth.signOut();

            // ハッシュを削除して確認成功ページに移動
            window.location.href = '/confirm-success';
          }
        } catch (error) {
          console.error('Email confirmation error:', error);
        }
      }
    };

    handleEmailConfirmation();
  }, []);

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
    { path: "/reset-password", element: <ResetPassword /> },
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