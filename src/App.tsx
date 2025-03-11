import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { MyPage } from "./pages/MyPage";
import { PracticePapers } from "./pages/PracticePapers";
import { GradePapers } from "./pages/GradePapers";
import { AllPages } from "./pages/AllPages";
import { FAQ } from "./pages/FAQ";
import { Features } from "./pages/Features";
import { Contact } from "./pages/Contact";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { Commerce } from "./pages/Commerce";
import UploadPapers from "./pages/UploadPapers";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

const App: React.FC = () => {
  const { user, loading } = useAuth();

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
