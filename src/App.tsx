import React, { useEffect, useRef, useState } from "react";
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
  const { user, loading: authLoading } = useAuth();
  const visibilityRef = useRef<string>(document.visibilityState);
  const [appInitialized, setAppInitialized] = useState(false);
  // 認証セッションの検証が進行中かどうかのフラグを追加
  const authSessionCheckingRef = useRef(false);

  // Combined useEffect to handle both auth events and app initialization
  useEffect(() => {
    // App initialization logic
    const initializeApp = async () => {
      try {
        // 既に検証中なら実行しない
        if (authSessionCheckingRef.current) {
          return;
        }

        authSessionCheckingRef.current = true;
        console.log("Initializing app and checking session...");
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", !!data.session);

        // Short delay to ensure all async processes complete
        setTimeout(() => {
          setAppInitialized(true);
          authSessionCheckingRef.current = false;
        }, 500);
      } catch (err) {
        console.error("Error during app initialization:", err);
        setAppInitialized(true); // Still mark as initialized on error
        authSessionCheckingRef.current = false;
      }
    };

    // Start initialization process
    initializeApp();

    // Auth event listener setup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event} (visibility: ${document.visibilityState})`);

      // Ignore SIGNED_OUT events that happen due to tab switching
      if (event === 'SIGNED_OUT' &&
        document.visibilityState !== 'visible' &&
        visibilityRef.current === 'visible') {
        console.log('Preventing automatic sign out during tab visibility change');
        return;
      }

      // Special handling for confirmation page
      if (event === 'SIGNED_OUT' && window.location.pathname === '/confirm-success') {
        console.log('Preventing automatic sign out on confirmation page');

        // Get tokens from URL
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment || window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        // Restore session if possible
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

    // Visibility change handler
    const handleVisibilityChange = () => {
      const prevState = visibilityRef.current;
      const currentState = document.visibilityState;

      console.log(`Visibility changed: ${prevState} -> ${currentState}`);

      if (prevState !== 'visible' && currentState === 'visible') {
        console.log('Tab became visible, checking session status');

        // 既に検証中なら処理をスキップ
        if (!authSessionCheckingRef.current) {
          authSessionCheckingRef.current = true;

          // Light session check
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
              console.log('Session exists after tab visibility change');
            }
            authSessionCheckingRef.current = false;
          }).catch(() => {
            authSessionCheckingRef.current = false;
          });
        }
      }

      // Update reference
      visibilityRef.current = currentState;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!appInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">ロード中...</p>
        </div>
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
}
export default App;