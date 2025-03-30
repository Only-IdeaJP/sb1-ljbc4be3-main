// src/services/email.service.ts

import { supabase } from '../lib/supabase';

/**
 * メール送信サービス
 * Supabaseと連携してメール送信を行います
 */
export const EmailService = {
    /**
     * パスワードリセット用のメールを送信する
     * @param email メールアドレス
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Supabaseのパスワードリセット機能を利用
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            return { success: true };
        } catch (error: any) {
            console.error('パスワードリセットメール送信エラー:', error);
            return {
                success: false,
                error: error.message || 'パスワードリセットメールの送信に失敗しました',
            };
        }
    },

    /**
     * メールアドレス確認用のメールを再送信する
     * @param email メールアドレス
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async resendConfirmationEmail(email: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/confirm-success`,
                },
            });

            if (error) throw error;

            return { success: true };
        } catch (error: any) {
            console.error('確認メール再送信エラー:', error);
            return {
                success: false,
                error: error.message || '確認メールの再送信に失敗しました',
            };
        }
    }
};