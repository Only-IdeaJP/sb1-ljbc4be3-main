// src/pages/PasswordReset.tsx

import { CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HotToast } from "../components/Toaster";
import { supabase } from "../lib/supabase";

const PasswordReset: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tokenVerified, setTokenVerified] = useState(false);

    // パスワードのバリデーション
    const passwordValidation = {
        length: password.length >= 8,
        ascii: /^[\x00-\x7F]*$/.test(password),
        match: password === confirmPassword,
    };

    // 初期化時の処理 - URLパラメータやハッシュからアクセストークンを取得し検証する
    useEffect(() => {
        const initAuth = async () => {
            try {
                // URLハッシュやクエリからパラメータを取得
                const fragment = location.hash.substring(1);
                const params = new URLSearchParams(fragment || location.search);

                // アクセストークンの確認 - URLハッシュから
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const type = params.get('type');

                // 既存のセッションを確認
                const { data: sessionData } = await supabase.auth.getSession();

                console.log("URL params:", { accessToken, refreshToken, type });
                console.log("Session data:", sessionData);

                if (accessToken) {
                    // トークンがあればセッションを作成
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    if (error) {
                        console.error("Error setting session:", error);
                        setError("セッションの設定に失敗しました。新しいパスワードリセットリンクをリクエストしてください。");
                    } else {
                        setTokenVerified(true);
                    }
                } else if (sessionData.session) {
                    // 既存のセッションが有効な場合
                    setTokenVerified(true);
                } else {
                    // セッションがない、トークンも無効
                    setError("有効なリカバリーリンクではありません。新しいパスワードリセットリンクをリクエストしてください。");
                }
            } catch (err) {
                console.error("Error during initialization:", err);
                setError("認証の初期化中にエラーが発生しました。");
            } finally {
                setInitialLoading(false);
            }
        };

        initAuth();
    }, [location]);

    // パスワードリセット処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // バリデーション
        if (!passwordValidation.length) {
            setError("パスワードは8文字以上必要です");
            return;
        }

        if (!passwordValidation.ascii) {
            setError("パスワードは半角英数字記号のみ使用可能です");
            return;
        }

        if (!passwordValidation.match) {
            setError("パスワードが一致しません");
            return;
        }

        setLoading(true);

        try {
            // パスワードを更新
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                console.error("Password update error:", updateError);
                throw new Error("パスワードの更新に失敗しました: " + updateError.message);
            }

            // 成功
            setSuccess(true);
            HotToast.success("パスワードを更新しました");

            // 3秒後にログイン画面へリダイレクト - ログアウトしない
            setTimeout(() => {
                // パラメータを変更してリダイレクト（ユーザーにトーストメッセージが重複して表示されないように）
                navigate("/", { replace: true });
            }, 3000);
        } catch (err: any) {
            console.error("Password reset error:", err);
            setError(err.message || "パスワードのリセットに失敗しました");
            HotToast.error("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    // 新しいパスワードリセットをリクエスト
    const handleRequestNewReset = () => {
        navigate('/forget-password');
    };

    // ローディング表示
    if (initialLoading) {
        return (
            <div className="max-w-md mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <svg className="animate-spin h-16 w-16 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-gray-600">準備中...</p>
                </div>
            </div>
        );
    }

    // トークンが検証されていない場合の表示
    if (!tokenVerified && !success) {
        return (
            <div className="max-w-md mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            認証に問題があります
                        </h1>
                        <p className="text-gray-600 mt-4 mb-6">
                            {error || "パスワードリセットリンクが無効か期限切れです。新しいリセットリンクをリクエストしてください。"}
                        </p>

                        <button
                            onClick={handleRequestNewReset}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            新しいリセットリンクをリクエスト
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 成功状態表示
    if (success) {
        return (
            <div className="max-w-md mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            パスワードの更新が完了しました
                        </h1>
                        <p className="text-gray-600 mt-2">
                            新しいパスワードでログインできるようになりました。
                            <br />
                            トップページへリダイレクトします...
                        </p>
                    </div>

                    <div className="mt-6 text-center bg-green-50 p-4 rounded-lg">
                        <p className="text-green-700">
                            パスワードの更新が完了しました。
                            <br />
                            トップページへ移動中...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        新しいパスワードを設定
                    </h1>
                    <p className="text-gray-600 mt-2">
                        以下のフォームで新しいパスワードを設定してください。
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            新しいパスワード
                        </label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="8文字以上の半角英数字記号"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                                required
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
                        <div className="mt-2 flex items-center">
                            <div
                                className={`w-3 h-3 rounded-full mr-2 ${password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span className="text-xs text-gray-600">8文字以上</span>
                        </div>
                        <div className="mt-1 flex items-center">
                            <div
                                className={`w-3 h-3 rounded-full mr-2 ${password && /^[\x00-\x7F]*$/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span className="text-xs text-gray-600">半角英数字記号のみ</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            新しいパスワード（確認）
                        </label>
                        <div className="relative mt-1">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="もう一度入力してください"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                                required
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
                        <div className="mt-2 flex items-center">
                            <div
                                className={`w-3 h-3 rounded-full mr-2 ${password && confirmPassword && password === confirmPassword ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span className="text-xs text-gray-600">パスワードが一致</span>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
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
                                    更新中...
                                </>
                            ) : (
                                "パスワードを更新する"
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        パスワードを思い出した？
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 ml-1">
                            ログインする
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;