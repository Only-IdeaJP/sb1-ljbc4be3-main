// src/pages/EmailConfirmSuccess.tsx

import { CheckCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HotToast } from "../components/Toaster";
import { useAuth } from "../hooks/useAuth";
import { serverSupabase } from "../lib/server-supabase";
import { extractAuthTokens } from "../utils/token-extractor";

/**
 * メール確認成功ページ
 * ユーザーがメール内の確認リンクをクリックした後に表示されるページ
 */
export const EmailConfirmSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [updating, setUpdating] = useState(false);
    const [updated, setUpdated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const processedRef = useRef(false);
    const { refreshUserData } = useAuth(); // 追加: ユーザーデータ更新関数を取得

    // 1回だけ処理を実行するための副作用
    useEffect(() => {
        // すでに処理済みの場合は何もしない
        if (processedRef.current || updated) return;
        processedRef.current = true;

        const updateEmailConfirmation = async () => {
            try {
                setUpdating(true);
                console.log("Email confirmation process started");

                // URLからトークン情報を抽出
                const { userId, email, accessToken, refreshToken } = extractAuthTokens();
                console.log(`Extracted token info: userId=${userId}, email=${email}`);

                // アクセストークンがある場合はセッションを復元
                if (accessToken) {
                    console.log('Restoring session from token');
                    await serverSupabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    // Supabase Auth自体がemail_confirmed_atを管理するため、
                    // ユーザーテーブルのemail_confirmedフィールドの更新は不要

                    setUserEmail(email);
                    setUpdated(true);
                    HotToast.success('メールアドレスの確認が完了しました！');

                    // セッションが確立したらユーザーデータを更新
                    await refreshUserData();
                    return;
                }

                // アクセストークンはないがメールアドレスがある場合
                if (email) {
                    const { data: userData, error: userError } = await serverSupabase
                        .from('users')
                        .select('id')
                        .eq('email', email)
                        .single();

                    if (userError || !userData) {
                        console.error("User lookup error:", userError);
                        throw new Error("ユーザー情報が見つかりませんでした");
                    }

                    const { error: updateError } = await serverSupabase
                        .from('users')
                        .update({ email_confirmed: true })
                        .eq('id', userData.id);

                    if (updateError) {
                        console.error("Database update error:", updateError);
                        throw new Error("メール確認ステータスの更新に失敗しました");
                    }

                    console.log(`Successfully updated email confirmation for email ${email}`);
                    setUserEmail(email);
                    setUpdated(true);
                    HotToast.success('メールアドレスの確認が完了しました！');

                    // 成功したらユーザーデータを更新して、5秒後にホームページに遷移
                    await refreshUserData();


                    return;
                }

                // 保存されているメールアドレスを確認
                const pendingEmail = localStorage.getItem('pending_email');
                if (pendingEmail) {
                    const { data: userData, error: userError } = await serverSupabase
                        .from('users')
                        .select('id')
                        .eq('email', pendingEmail)
                        .single();

                    if (userError || !userData) {
                        console.error("User lookup error:", userError);
                        throw new Error("ユーザー情報が見つかりませんでした");
                    }

                    const { error: updateError } = await serverSupabase
                        .from('users')
                        .update({ email_confirmed: true })
                        .eq('id', userData.id);

                    if (updateError) {
                        console.error("Database update error:", updateError);
                        throw new Error("メール確認ステータスの更新に失敗しました");
                    }

                    console.log(`Successfully updated email confirmation for pending email ${pendingEmail}`);
                    setUserEmail(pendingEmail);
                    localStorage.removeItem('pending_email');
                    setUpdated(true);
                    HotToast.success('メールアドレスの確認が完了しました！');

                    // 成功したらユーザーデータを更新して、5秒後にホームページに遷移
                    await refreshUserData();


                    return;
                }

                // ユーザー識別情報が見つからない場合
                throw new Error("認証情報が見つかりません。リンクをもう一度クリックするか、ログインしてください。");

            } catch (error) {
                console.error("Email confirmation error:", error);
                setError(error instanceof Error ? error.message : "メール確認中にエラーが発生しました");
            } finally {
                setUpdating(false);
            }
        };

        updateEmailConfirmation();
    }, [updated, navigate, refreshUserData]);

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
                    これでサービスの全ての機能をご利用いただけます。<br />
                    間もなくホームページに自動的に移動します。
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
                            {updating ? "確認処理中..." :
                                updated ? `${userEmail ? userEmail + 'の' : ''}メール確認が完了しました。5秒後にホームページに移動します。` :
                                    "メール確認処理中..."}
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