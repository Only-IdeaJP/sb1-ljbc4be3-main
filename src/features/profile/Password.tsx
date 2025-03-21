// src/features/profile/Password.tsx
import React, { useCallback, useMemo, useState } from "react";
import { Message } from "../../components/ui/Message";
import { useAuth } from "../../hooks/useAuth";

/**
 * パスワード変更コンポーネント
 * ユーザーのパスワード変更機能を提供
 */
export const Password: React.FC = () => {
    const { updatePassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

    // パスワードバリデーション
    const validation = useMemo(() => {
        if (!password) return { isValid: false, errors: { empty: true } };

        const isLongEnough = password.length >= 8;
        const isAscii = /^[\x00-\x7F]*$/.test(password);

        return {
            isValid: isLongEnough && isAscii,
            errors: {
                length: !isLongEnough,
                ascii: !isAscii,
            },
        };
    }, [password]);

    // 送信ハンドラー
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setMessage("");
            setPasswordTouched(true);
            setConfirmPasswordTouched(true);

            // バリデーションチェック
            if (!password) {
                setMessage("エラー: パスワードを入力してください");
                setLoading(false);
                return;
            }

            if (password !== confirmPassword) {
                setMessage("エラー: パスワードが一致しません");
                setLoading(false);
                return;
            }

            if (!validation.isValid) {
                setMessage(
                    "エラー: パスワードは以下の条件を満たす必要があります：\n" +
                    (validation.errors.length ? "- 8文字以上\n" : "") +
                    (validation.errors.ascii ? "- 半角英数字記号のみ使用可能\n" : "")
                );
                setLoading(false);
                return;
            }

            try {
                // パスワード更新
                await updatePassword(password);

                // 成功メッセージとフォームリセット
                setMessage("パスワードを更新しました");
                setPassword("");
                setConfirmPassword("");
                setPasswordTouched(false);
                setConfirmPasswordTouched(false);
            } catch (error) {
                setMessage(`エラー: ${error.message}`);
            } finally {
                setLoading(false);
            }
        },
        [password, confirmPassword, validation, updatePassword]
    );

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                パスワード変更
            </h2>

            {/* 成功/エラーメッセージ */}
            {message && (
                <Message
                    type={message.startsWith("エラー") ? "error" : "success"}
                    text={message}
                    preserveWhitespace={true}
                    className="mb-6"
                />
            )}

            {/* パスワード要件表示 */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                    パスワード要件：
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 8文字以上</li>
                    <li>• 半角英数字記号のみ使用可能</li>
                </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 新しいパスワード入力フィールド */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        新しいパスワード
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setPasswordTouched(true)}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 ${passwordTouched && !validation.isValid
                                ? "border-red-500"
                                : "focus:border-indigo-500"
                            }`}
                        placeholder="8文字以上の半角英数記号"
                    />
                    {passwordTouched && (
                        <p className="text-xs text-red-600 mt-1">
                            {!password && "• パスワードを入力してください"}
                            {validation.errors.length && "• 8文字以上必要です"}
                            {validation.errors.ascii && "• 半角英数字記号のみ使用可能"}
                        </p>
                    )}
                </div>

                {/* パスワード確認フィールド */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        新しいパスワード（確認）
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setConfirmPasswordTouched(true)}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 ${confirmPasswordTouched &&
                                password &&
                                confirmPassword &&
                                password !== confirmPassword
                                ? "border-red-500"
                                : "focus:border-indigo-500"
                            }`}
                        placeholder="もう一度入力してください"
                    />
                    {confirmPasswordTouched &&
                        password &&
                        confirmPassword &&
                        password !== confirmPassword && (
                            <p className="text-xs text-red-600 mt-1">
                                • パスワードが一致しません
                            </p>
                        )}
                </div>

                {/* 送信ボタン */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? "更新中..." : "更新する"}
                    </button>
                </div>
            </form>
        </div>
    );
};