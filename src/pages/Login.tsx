import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    child_birth_year: '',
    child_birth_month: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    const isLongEnough = password.length >= 8;
    const isAscii = /^[\x00-\x7F]*$/.test(password);
    return isLongEnough && isAscii;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && !agreeToTerms) {
      setError('利用規約に同意する必要があります');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('メールアドレスの形式が正しくありません');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('パスワードは8文字以上の半角英数字記号で入力してください');
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        navigate('/');
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('パスワードが一致しません');
        }

        if (!formData.child_birth_year || !formData.child_birth_month) {
          throw new Error('すべての必須項目を入力してください');
        }

        await signUp(formData.email, formData.password, {
          child_birth_year: formData.child_birth_year,
          child_birth_month: formData.child_birth_month,
          address: '',
          phone: ''
        });

        setError('アカウントを作成しました。ログインしてください。');
        setIsLogin(true);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          child_birth_year: '',
          child_birth_month: '',
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errorMessage = 'エラーが発生しました';
      
      if (err.message === 'Invalid login credentials') {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません';
      } else if (err.message === 'User already registered') {
        errorMessage = 'このメールアドレスは既に登録されています';
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = 'メールアドレスの確認が完了していません。確認メールをご確認ください。';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            {isLogin ? 'ログイン' : '新規登録'}
          </h2>
          {isLogin && (
            <p className="mt-2 text-center text-sm text-gray-600">
              アカウントをお持ちではありませんか？{' '}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    child_birth_year: '',
                    child_birth_month: '',
                  });
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
              >
                無料登録はこちら
              </button>
            </p>
          )}
        </div>

        {error && (
          <div className={`rounded-md p-4 ${
            error.includes('作成しました') ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className={`h-5 w-5 ${
                  error.includes('作成しました') ? 'text-green-400' : 'text-red-400'
                }`} />
              </div>
              <div className="ml-3">
                <pre className="text-sm font-medium whitespace-pre-wrap font-sans ${
                  error.includes('作成しました') ? 'text-green-800' : 'text-red-800'
                }">{error}</pre>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* メールアドレス */}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="example@example.com"
              />
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10"
                  placeholder="8文字以上の半角英数字記号"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* パスワード（確認） - 新規登録時のみ */}
            {!isLogin && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  パスワード（確認）
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10"
                    placeholder="もう一度入力してください"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 新規登録時のみ表示する追加フィールド */}
            {!isLogin && (
              <>
                {/* お子様の生年月 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">お子様の生年月</label>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <select
                      value={formData.child_birth_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, child_birth_year: e.target.value }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">年を選択</option>
                      {Array.from({ length: 20 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>{year}年</option>
                        );
                      })}
                    </select>
                    <select
                      value={formData.child_birth_month}
                      onChange={(e) => setFormData(prev => ({ ...prev, child_birth_month: e.target.value }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">月を選択</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, '0');
                        return (
                          <option key={month} value={month}>{month}月</option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ログイン時のみ表示 */}
          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  ログイン状態を保持する
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  パスワードをお忘れですか?
                </a>
              </div>
            </div>
          )}

          {/* 新規登録時のみ表示 */}
          {!isLogin && (
            <>
              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                  <Link 
                    to="/terms"
                    className="text-indigo-600 hover:text-indigo-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    利用規約
                  </Link>
                  に同意します
                </label>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">パスワード要件：</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 8文字以上</li>
                  <li>• 半角英数字記号のみ使用可能</li>
                </ul>
              </div>
            </>
          )}

          {/* 送信ボタン */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isLogin ? (
                <LogIn className="h-5 w-5 text-white group-hover:text-white mr-2" />
              ) : (
                <UserPlus className="h-5 w-5 text-white group-hover:text-white mr-2" />
              )}
              {loading ? '処理中...' : (isLogin ? 'ログイン' : '新規登録')}
            </button>
          </div>

          {/* 新規登録時のみ表示 */}
          {!isLogin && (
            <div className="text-sm text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    child_birth_year: '',
                    child_birth_month: '',
                  });
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out"
              >
                すでにアカウントをお持ちの方はこちら
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};