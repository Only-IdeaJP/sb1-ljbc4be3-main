// src/pages/EmailConfirmation.tsx

import { AlertTriangle, ArrowLeft, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmailResendButton } from "../components/EmailResendButton";
import { useAuth } from "../hooks/useAuth";

/**
 * メール確認ページ
 * ユーザー登録後に表示され、確認メールの送信を通知します
 */
export const EmailConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showError, setShowError] = useState(false);

    // ユーザーがログイン済みの場合はダッシュボードに遷移
    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    // クエリパラメータを確認
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setShowError(params.get('error') === 'true');
    }, [location]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="mb-6">
                <Link
                    to="/login"
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    ログイン画面に戻る
                </Link>
            </div>

            {showError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-medium text-yellow-800">メール確認が必要です</h3>
                        <p className="text-yellow-700 mt-1">
                            このページにアクセスするには、メールアドレスの確認が必要です。
                            登録時に送信された確認メールのリンクをクリックしてください。
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-indigo-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    確認メールを送信しました
                </h1>

                <p className="text-gray-600 mb-6">
                    ご登録いただいたメールアドレスに確認メールを送信しました。<br />
                    メール内のリンクをクリックして、アカウント登録を完了してください。
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">
                        次のステップ
                    </h2>
                    <ol className="text-left text-gray-600 space-y-2">
                        <li className="flex items-start">
                            <span className="bg-indigo-100 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                            <span>メールボックスを確認してください</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-indigo-100 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                            <span>「ペーパー管理くん」からのメールを開いてください</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-indigo-100 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                            <span>メール内の「アカウントを確認する」ボタンをクリックしてください</span>
                        </li>
                    </ol>
                </div>

                <div className="text-gray-600 space-y-4">
                    <p>
                        メールが届かない場合は、迷惑メールフォルダをご確認いただくか、再送信をお試しください。
                    </p>

                    {/* メール再送信ボタン */}
                    <div className="mt-4">
                        <EmailResendButton />
                    </div>

                    <p className="mt-4">
                        すでに確認済みの場合は、
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                            こちらからログイン
                        </Link>
                        してください。
                    </p>
                </div>
            </div>
        </div>
    );
};