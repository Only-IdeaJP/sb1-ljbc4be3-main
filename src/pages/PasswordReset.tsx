// src/pages/PasswordReset.tsx
import { CheckCircle, Eye, EyeOff, Lock, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HotToast } from "../components/Toaster";
import { supabase } from "../lib/supabase";

const PasswordReset: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [manualToken, setManualToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // リンクがすでに期限切れかどうかを示すフラグ
    const [isTokenExpired, setIsTokenExpired] = useState(false);

    // パスワードのバリデーション
    const passwordValidation = {
        length: password.length >= 8,
        ascii: /^[\x00-\x7F]*$/.test(password),
        match: password === confirmPassword,
    };

    // URLからエラー情報を取得
    useEffect(() => {
        const checkForErrors = () => {
            // URLからエラーパラメータを取得
            const hash = location.hash.replace('#', '');
            const searchParams = new URLSearchParams(hash);

            // エラーコードを確認
            const errorCode = searchParams.get('error_code');
            const errorDescription = searchParams.get('error_description');

            console.log("URL error parameters:", { errorCode, errorDescription });

            // トークンが期限切れかどうか確認
            if (errorCode === 'otp_expired' || (errorDescription && errorDescription.includes('expired'))) {
                console.log("Detected expired token in URL");
                setIsTokenExpired(true);
                setError("パスワードリセットリンクの有効期限が切れています。新しいリセットリンクをリクエストするか、メールに記載されているリカバリーコードを使用してください。");
            }
        };

        checkForErrors();
    }, [location]);

    // 初期化時の処理
    useEffect(() => {
        const init = async () => {
            try {
                // セッションを確認して、あれば自動的にログアウト
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    console.log("Found existing session, signing out first");
                    await supabase.auth.signOut();
                }
            } catch (err) {
                console.error("Error during initialization:", err);
            } finally {
                setInitialLoading(false);
            }
        };

        init();
    }, []);

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

        // メールアドレスバリデーション
        if (!userEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail)) {
            setError("有効なメールアドレスを入力してください");
            return;
        }

        // リカバリーコードのバリデーション
        if (!manualToken) {
            setError("リカバリーコードを入力してください");
            return;
        }

        setLoading(true);

        try {
            // ステップ1: リカバリーコードでの認証
            console.log("Attempting password recovery with token");
            const { error: otpError } = await supabase.auth.verifyOtp({
                email: userEmail,
                token: manualToken,
                type: 'recovery'
            });

            if (otpError) {
                console.error("OTP verification error:", otpError);
                throw new Error("リカバリーコードが無効または期限切れです。新しいパスワードリセットをリクエストしてください。");
            }

            // ステップ2: パスワードの更新
            console.log("OTP verified, updating password");
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

            // 3秒後にログアウトしてログイン画面へリダイレクト
            setTimeout(async () => {
                try {
                    // 明示的にログアウト
                    await supabase.auth.signOut();
                    console.log("Successfully signed out after password reset");
                } catch (err) {
                    console.error("Error signing out:", err);
                } finally {
                    navigate("/login?password_reset=success");
                }
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

    // トークンが期限切れの場合の表示
    if (isTokenExpired && !success) {
        return (
            <div className="max-w-md mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            リンクの有効期限が切れています
                        </h1>
                        <p className="text-gray-600 mt-4 mb-6">
                            パスワードリセットリンクの有効期限が切れています。新しいリセットリンクをリクエストするか、メールに記載されているリカバリーコードを使用してください。
                        </p>

                        <div className="flex flex-col items-center space-y-4">
                            <button
                                onClick={() => setIsTokenExpired(false)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                リカバリーコードを使用する
                            </button>

                            <button
                                onClick={handleRequestNewReset}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                新しいリセットリンクをリクエスト
                            </button>
                        </div>
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
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            パスワードの更新が完了しました
                        </h1>
                        <p className="text-gray-600 mt-2">
                            新しいパスワードでログインできるようになりました。
                            <br />
                            自動的にログイン画面へリダイレクトします...
                        </p>
                    </div>

                    <div className="mt-6 text-center bg-green-50 p-4 rounded-lg">
                        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700">
                            パスワードの更新が完了しました。
                            <br />
                            ログイン画面へ移動中...
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
                        メールに記載されているリカバリーコードを使用して、新しいパスワードを設定してください。
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <p className="text-yellow-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700 mb-1">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            id="recovery-email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="登録したメールアドレスを入力"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            パスワードリセットを申請したメールアドレスを入力してください
                        </p>
                    </div>

                    <div>
                        <label htmlFor="recovery-token" className="block text-sm font-medium text-gray-700 mb-1">
                            リカバリーコード
                        </label>
                        <input
                            type="text"
                            id="recovery-token"
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                            placeholder="メールに記載されているコードを入力"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            メールに記載されているリカバリーコードを入力してください
                        </p>
                    </div>

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
                                className={`w-3 h-3 rounded-full mr-2 ${passwordValidation.length ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span className="text-xs text-gray-600">8文字以上</span>
                        </div>
                        <div className="mt-1 flex items-center">
                            <div
                                className={`w-3 h-3 rounded-full mr-2 ${passwordValidation.ascii ? "bg-green-500" : "bg-gray-300"}`}
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
                                className={`w-3 h-3 rounded-full mr-2 ${passwordValidation.match && password ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span className="text-xs text-gray-600">パスワードが一致</span>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !userEmail || !manualToken || !password || !confirmPassword}
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

                <div className="mt-6">
                    <div className="border-t border-gray-200 my-4"></div>
                    <p className="text-center text-sm text-gray-600 mb-2">
                        リカバリーコードをお持ちでない場合や期限切れの場合は、新しいパスワードリセットをリクエストしてください。
                    </p>
                    <div className="text-center">
                        <Link
                            to="/forget-password"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
                        >
                            パスワードリセットを再リクエスト
                        </Link>
                    </div>
                </div>

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