// src/pages/EmailConfirmSuccess.tsx

import { CheckCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HotToast } from "../components/Toaster";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

/**
 * メール確認成功ページ
 * ユーザーがメール内の確認リンクをクリックした後に表示されるページ
 */
export const EmailConfirmSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [updating, setUpdating] = useState(false);
    const [updated, setUpdated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toastShownRef = useRef(false);

    // デバッグ - URLの全コンポーネントをログに記録
    useEffect(() => {
        console.log("Current URL:", window.location.href);
        console.log("Path:", location.pathname);
        console.log("Search:", location.search);
        console.log("Hash:", location.hash);
    }, [location]);

    // メール確認ステータスを更新
    useEffect(() => {
        const updateEmailConfirmation = async () => {
            // すでに更新済みの場合は処理しない
            if (updated) return;

            const toastShown = localStorage.getItem('email_confirmation_toast_shown');

            if (updated || toastShown === 'true') return;

            try {
                setUpdating(true);

                // セッションを取得 - ユーザーがメール確認後に自動的にログインしている可能性がある
                const { data, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Session error:", sessionError);
                    setError("セッションの取得に失敗しました");
                    return;
                }

                console.log("Current session:", data.session);

                // セッションがあり、ユーザーIDがある場合
                if (data.session?.user?.id) {
                    const userId = data.session.user.id;
                    console.log("Found authenticated user:", userId);

                    // ユーザーが認証済みなら、email_confirmedを更新
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ email_confirmed: true })
                        .eq('id', userId);

                    if (updateError) {
                        console.error("Error updating user:", updateError);
                        setError("ユーザー情報の更新に失敗しました");
                        return;
                    }

                    setUpdated(true);
                    // Only show the toast if it hasn't been shown yet
                    if (!toastShownRef.current) {
                        HotToast.success('メールアドレスの確認が完了しました！');
                        toastShownRef.current = true;
                    }
                    if (toastShown !== 'true') {
                        HotToast.success('メールアドレスの確認が完了しました！');
                        localStorage.setItem('email_confirmation_toast_shown', 'true');

                        // Clear this flag after a while (e.g., 10 minutes)
                        setTimeout(() => {
                            localStorage.removeItem('email_confirmation_toast_shown');
                        }, 10 * 60 * 1000);
                    }

                } else {
                    // セッションがない場合、直接アクセスしたか、確認リンクが機能していない
                    console.log("No active session found");

                    // URLからトークンを取得しようとする（フォールバック）
                    const params = new URLSearchParams(location.search);
                    const accessToken = params.get('access_token');

                    if (!accessToken && !location.hash.includes('access_token')) {
                        setError("認証トークンが見つかりません。リンクをもう一度クリックするか、ログインしてください。");
                        return;
                    }

                    setError("セッションが存在しません。ログインしてください。");
                }
            } catch (error) {
                console.error('メール確認ステータスの更新エラー:', error);
                setError('メール確認ステータスの更新に失敗しました');
            } finally {
                setUpdating(false);
            }
        };

        updateEmailConfirmation();
    }, [updated, location]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    メール確認が完了しました
                </h1>

                <p className="text-gray-600 mb-6">
                    おめでとうございます！メールアドレスの確認が完了しました。<br />
                    これでサービスの全ての機能をご利用いただけます。
                </p>

                {error ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800">
                            {error}
                        </p>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800">
                            確認が完了しましたので、ログインして利用を開始してください。
                        </p>
                    </div>
                )}

                <div className="flex justify-center space-x-4">
                    <Link
                        to="/login"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        ログインする
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmSuccess;