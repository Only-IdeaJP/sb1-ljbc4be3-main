
// pages/Login.tsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { useAuth } from '../hooks/useAuth';

/**
 * ログイン・新規登録ページ
 */
export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();

  // すでにログインしている場合はダッシュボードにリダイレクト
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleRegistrationComplete = () => {
    // 登録完了後、ログインフォームに切り替える
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fadeIn">
        <div>
          <div className="mx-auto w-24 h-24 relative mb-4">
            <img
              src="/images/pelican-logo2.png"
              alt="小学校受験ペーパー管理くん"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "ログイン" : "新規登録"}
          </h2>
        </div>

        {isLogin ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <RegisterForm onToggleForm={toggleForm} onComplete={handleRegistrationComplete} />
        )}
      </div>
    </div>
  );
}