// src/features/auth/components/LoginForm.tsx

import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { AuthService } from '../../../services/auth.service';

interface LoginFormProps {
    onToggleForm: () => void;
}

/**
 * ログインフォームコンポーネント
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
    const navigate = useNavigate();
    const { signIn, isAuthenticated } = useAuth();

    // フォーム状態
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isEmailConfirmationError, setIsEmailConfirmationError] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    // フォームデータが変更されたときにエラーをクリア
    useEffect(() => {
        setValidationErrors([]);
        setError(null);
        setIsEmailConfirmationError(false);
    }, [formData]);

    // 認証状態が変わったらリダイレクト
    useEffect(() => {
        if (isAuthenticated && loginSuccess) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, loginSuccess, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { email, password } = formData;

        // バリデーション
        const errors = AuthService.validateCredentials(email, password);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);

            // ログイン成功をマーク
            setLoginSuccess(true);

            // ページ内の状態を更新して、ログイン完了のUIを表示する
            // この部分はリダイレクト前に表示される
            setFormData({ email: '', password: '' });

            // ユーザーエクスペリエンス向上のために短いディレイを設ける
            // これによりログイン成功のフィードバックが表示される時間を確保
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 300);
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';

            // メール確認エラーを検出
            if (errorMessage.includes('メールアドレスの確認が完了していません')) {
                setIsEmailConfirmationError(true);
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ログイン成功後の表示
    if (loginSuccess) {
        return (
            <div className="bg-green-50 p-6 rounded-lg text-center animate-fadeIn">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-green-800">ログインに成功しました</h3>
                <p className="text-green-700 mt-2">トップページにリダイレクトしています...</p>
            </div>
        );
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* メール確認エラーメッセージ */}
            {isEmailConfirmationError && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md border border-yellow-200 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                        <p>メールアドレスの確認が完了していません。</p>
                        <p className="text-sm">
                            登録時に送信された確認メールのリンクをクリックして、アカウント登録を完了してください。
                            確認メールが見つからない場合は、迷惑メールフォルダをご確認ください。
                        </p>
                        <div>
                            <Link
                                to="/email-confirmation"
                                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                                確認メールについての詳細はこちら
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* 一般的なエラーメッセージ表示 */}
            {(validationErrors.length > 0 || (error && !isEmailConfirmationError)) && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    {validationErrors.length > 0 ? (
                        <ul className="list-disc pl-5">
                            {validationErrors.map((err, index) => (
                                <li key={index}>{err}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>{error}</p>
                    )}
                </div>
            )}

            <div className="space-y-4">
                {/* メールアドレス入力 */}
                <div>
                    <label
                        htmlFor="email-address"
                        className="block text-sm font-medium text-gray-700"
                    >
                        メールアドレス
                    </label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="example@example.com"
                    />
                </div>

                {/* パスワード入力 */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        パスワード
                    </label>
                    <div className="relative mt-1">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
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

                {/* ログイン状態保持チェックボックス */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="remember-me"
                            className="ml-2 block text-sm text-gray-900"
                        >
                            ログイン状態を保持する
                        </label>
                    </div>
                    <div className="text-sm">
                        <Link to="/forget-password" className="text-indigo-600 hover:text-indigo-500">
                            パスワードをお忘れですか？
                        </Link>
                    </div>
                </div>

                {/* ログインボタン */}
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                処理中...
                            </>
                        ) : "ログイン"}
                    </button>
                </div>

                {/* 新規登録へのリンク */}
                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={onToggleForm}
                        className="text-indigo-600 hover:text-indigo-500 focus:outline-none"
                    >
                        アカウントをお持ちではありませんか？ 無料登録はこちら
                    </button>
                </div>
            </div>
        </form>
    );
};