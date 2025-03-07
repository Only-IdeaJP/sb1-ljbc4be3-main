import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MyPage } from './pages/MyPage';
import { PracticePapers } from './pages/PracticePapers';
import { GradePapers } from './pages/GradePapers';
import { AllPages } from './pages/AllPages';
import { FAQ } from './pages/FAQ';
import { Features } from './pages/Features';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Commerce } from './pages/Commerce';
import UploadPapers from './pages/UploadPapers';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img
                      src="/images/pelican-logo2.png"
                      alt="ロゴ"
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">ペーパー管理くん</h1>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">今日最適な20枚を自動生成する。親子にハグするゆとりを。</p>
                  </div>
                  {user ? (
                    <Link
                      to="/mypage/profile"
                      className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
                    >
                      <span>マイページ</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
                    >
                      <span>ログイン</span>
                    </Link>
                  )}
                </div>
              </div>
              
              {user && (
                <nav className="flex items-center space-x-6">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    ホーム
                  </Link>
                  <Link
                    to="/all"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    全ページ管理
                  </Link>
                  <Link
                    to="/practice"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    ペーパー演習
                  </Link>
                  <Link
                    to="/grade"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    丸付け
                  </Link>
                  <Link
                    to="/upload"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    問題アップロード
                  </Link>
                </nav>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/" replace /> : <Login />
            } />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/commerce" element={<Commerce />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/all" element={<ProtectedRoute><AllPages /></ProtectedRoute>} />
            <Route path="/mypage/*" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><PracticePapers /></ProtectedRoute>} />
            <Route path="/grade" element={<ProtectedRoute><GradePapers /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadPapers /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
                <Link to="/faq" className="hover:text-indigo-600">よくある質問</Link>
                <Link to="/features" className="hover:text-indigo-600">特徴</Link>
                <Link to="/contact" className="hover:text-indigo-600">お問い合わせ</Link>
                <Link to="/terms" className="hover:text-indigo-600">利用規約</Link>
                <Link to="/privacy" className="hover:text-indigo-600">個人情報保護方針</Link>
                <Link to="/commerce" className="hover:text-indigo-600">特定商取引法表示</Link>
              </div>
              <div className="text-center text-sm text-gray-500">
                © 2025 Sumire AI School. All Rights Reserved
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;