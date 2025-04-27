// pages/Login.tsx

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { HotToast } from '../components/Toaster';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { useAuth } from '../hooks/useAuth';

/**
 * ログイン・新規登録ページ
 */
export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  const location = useLocation();


  // クエリパラメータを確認
  useEffect(() => {
    // URLのクエリパラメータを解析
    const params = new URLSearchParams(location.search);

    // 確認メール送信後のリダイレクトを確認
    if (params.get('email_confirmed') === 'true') {
      HotToast.success('メールアドレスが確認されました。ログインしてください。');
    }

    // メール確認待ちの場合
    if (params.get('email_sent') === 'true') {
      HotToast.info('確認メールを送信しました。メールのリンクをクリックして登録を完了してください。');
    }

    // パスワードリセット成功の場合
    if (params.get('password_reset_complete') === 'true') {
      HotToast.success('パスワードを変更しました。新しいパスワードでログインしてください。');
    }

    // 退会完了の場合
    if (params.get('withdrawal_complete') === 'true') {


      // ローカルストレージをクリア
      localStorage.clear();
      sessionStorage.clear();

      // URLからパラメータを削除
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }


    // エラーがある場合
    const errorParam = params.get('error');
    if (errorParam) {
      HotToast.error(decodeURIComponent(errorParam));
    }
  }, [location]);

  // すでにログインしている場合はダッシュボードにリダイレクト
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const toggleForm = () => {
    setIsLogin(!isLogin);
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
          <RegisterForm onToggleForm={toggleForm} />
        )}
      </div>
    </div>
  );
};