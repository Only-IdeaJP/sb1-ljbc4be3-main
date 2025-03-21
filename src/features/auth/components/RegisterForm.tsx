// features/auth/components/RegisterForm.tsx
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { AuthService } from '../../../services/auth.service';

interface RegisterFormProps {
    onToggleForm: () => void;
    onComplete: () => void;
}

/**
 * 新規ユーザー登録フォームコンポーネント
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm, onComplete }) => {
    const { signUp } = useAuth();

    // フォーム状態
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        child_birth_year: '',
        child_birth_month: ''
    });
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // フォームデータが変更されたときにエラーをクリア
    useEffect(() => {
        setValidationErrors([]);
        setError(null);
    }, [formData, agreeToTerms]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): string[] => {
        const errors: string[] = [];

        // メールとパスワードの基本バリデーション
        const credentialErrors = AuthService.validateCredentials(formData.email, formData.password);
        errors.push(...credentialErrors);

        // パスワード確認
        if (formData.password !== formData.confirmPassword) {
            errors.push('パスワードが一致しません');
        }

        // 生年月のバリデーション
        if (!formData.child_birth_year) {
            errors.push('お子様の生年は必須です');
        }

        if (!formData.child_birth_month) {
            errors.push('お子様の生月は必須です');
        }

        // 利用規約の同意
        if (!agreeToTerms) {
            errors.push('利用規約に同意する必要があります');
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // バリデーション
        const errors = validateForm();
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);
        try {
            await signUp(
                formData.email,
                formData.password,
                {
                    child_birth_year: formData.child_birth_year,
                    child_birth_month: formData.child_birth_month
                }
            );

            // 登録成功
            onComplete();
        } catch (err) {
            console.error('Registration error:', err);
            setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* エラーメッセージ表示 */}
            {(validationErrors.length > 0 || error) && (
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
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        メールアドレス
                    </label>
                    <input
                        id="email"
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
                        htmlFor="register-password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        パスワード
                    </label>
                    <div className="relative mt-1">
                        <input
                            id="register-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
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

                {/* パスワード確認入力 */}
                <div>
                    <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        パスワード（確認）
                    </label>
                    <div className="relative mt-1">
                        <input
                            id="confirm-password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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

                {/* お子様の生年 */}
                <div>
                    <label
                        htmlFor="child_birth_year"
                        className="block text-sm font-medium text-gray-700"
                    >
                        お子様の生年
                    </label>
                    <input
                        id="child_birth_year"
                        name="child_birth_year"
                        type="text"
                        value={formData.child_birth_year}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="例：2020"
                    />
                </div>

                {/* お子様の生月 */}
                <div>
                    <label
                        htmlFor="child_birth_month"
                        className="block text-sm font-medium text-gray-700"
                    >
                        お子様の生月
                    </label>
                    <input
                        id="child_birth_month"
                        name="child_birth_month"
                        type="text"
                        value={formData.child_birth_month}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="例：5"
                    />
                </div>

                {/* 利用規約の同意 */}
                <div className="flex items-center">
                    <input
                        id="agree-to-terms"
                        name="agree-to-terms"
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={() => setAgreeToTerms(!agreeToTerms)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                        htmlFor="agree-to-terms"
                        className="ml-2 block text-sm text-gray-900"
                    >
                        <span>利用規約に同意する</span>
                        <a href="/terms" target="_blank" className="text-indigo-600 hover:text-indigo-500 ml-1">(規約を確認)</a>
                    </label>
                </div>

                {/* 登録ボタン */}
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? "処理中..." : "登録"}
                    </button>
                </div>

                {/* ログインフォームへの切り替え */}
                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={onToggleForm}
                        className="text-indigo-600 hover:text-indigo-500 focus:outline-none"
                    >
                        すでにアカウントをお持ちの方はこちら
                    </button>
                </div>
            </div>
        </form>
    );
};