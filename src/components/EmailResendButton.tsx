// components/EmailResendButton.tsx

import { RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { EmailService } from '../services/email.service';
import { HotToast } from './Toaster';

interface EmailResendButtonProps {
    className?: string;
}

/**
 * 確認メールの再送信ボタンコンポーネント
 */
export const EmailResendButton: React.FC<EmailResendButtonProps> = ({ className }) => {
    const [loading, setLoading] = useState(false);

    const handleResendEmail = async () => {
        try {
            setLoading(true);
            const email = localStorage.getItem('pending_email');

            if (!email) {
                HotToast.error('メールアドレスが見つかりません。新規登録画面からやり直してください。');
                return;
            }

            const result = await EmailService.resendConfirmationEmail(email);

            if (!result.success) {
                throw new Error(result.error);
            }

            HotToast.success('確認メールを再送信しました。メールボックスをご確認ください。');
        } catch (error: any) {
            console.error('Error resending confirmation email:', error);
            HotToast.error('確認メールの再送信に失敗しました。後ほど再度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleResendEmail}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${className || ''}`}
        >
            {loading ? (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
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
            ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {loading ? '送信中...' : '確認メールを再送信する'}
        </button>
    );
};