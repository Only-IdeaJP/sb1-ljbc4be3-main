// src/pages/EmailConfirmSuccess.tsx

import { CheckCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HotToast } from "../components/Toaster";
import { supabase } from "../lib/supabase";

/**
 * メール確認成功ページ
 * ユーザーがメール内の確認リンクをクリックした後に表示されるページ
 */
export const EmailConfirmSuccess: React.FC = () => {
    const location = useLocation();
    const [updating, setUpdating] = useState(false);
    const [updated, setUpdated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toastShownRef = useRef(false);
    const processedRef = useRef(false);

    // メール確認ステータスを更新
    useEffect(() => {
        // 既に処理済みの場合はスキップ
        if (processedRef.current) return;

        const updateEmailConfirmation = async () => {
            try {
                setUpdating(true);
                processedRef.current = true;

                // URLフラグメントからトークンを抽出
                const fragment = location.hash.substring(1);
                const params = new URLSearchParams(fragment || location.search);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                // 現在のセッションをチェック
                const { data, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Session error:", sessionError);
                    setError("セッションの取得に失敗しました");
                    return;
                }

                // ユーザーIDを確認
                let userId = data.session?.user?.id;

                // セッションがない場合はトークンを使用してセッションを設定
                if (!userId && accessToken) {
                    // トークンがある場合、セッションを設定
                    try {
                        const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                        });

                        if (setSessionError) {
                            throw setSessionError;
                        }

                        userId = sessionData.session?.user?.id;
                    } catch (error) {
                        console.error("Error setting session:", error);
                    }
                }

                if (userId) {
                    // ユーザーのメール確認ステータスを更新
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

                    // トースト通知を表示
                    if (!toastShownRef.current) {
                        HotToast.success('メールアドレスの確認が完了しました！');
                        toastShownRef.current = true;
                        localStorage.setItem('email_confirmation_toast_shown', 'true');
                    }

                    // 成功！ここで明示的にサインアウトしないようにする
                    // 注意: 以前はこの後にサインアウト処理があったが、これを削除
                } else {
                    setError("認証情報が見つかりません。リンクをもう一度クリックするか、ログインしてください。");
                }
            } catch (error) {
                console.error('メール確認ステータスの更新エラー:', error);
                setError('メール確認ステータスの更新に失敗しました');
            } finally {
                setUpdating(false);
            }
        };

        // 処理を実行
        updateEmailConfirmation();
    }, [location]);

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
                            {updating ? "確認処理中..." : "確認が完了しました。ログインして利用を開始してください。"}
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
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        トップページへ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmSuccess;