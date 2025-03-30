// src/services/email.service.ts

import { serverSupabase } from '../lib/server-supabase';
import { supabase } from '../lib/supabase';

/**
 * メール送信サービス
 * Supabaseと連携してメール送信を行います
 */
export const EmailService = {
    /**
     * パスワードリセット用のメールを送信する
     * ユーザーの存在確認を行ってから送信します
     * 
     * @param email メールアドレス
     * @returns {Promise<{success: boolean, error?: string, userExists: boolean}>}
     */
    async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string; userExists: boolean }> {
        try {
            // まずユーザーが存在するか確認する
            const { data: existingUser, error: checkError } = await serverSupabase
                .from('users')
                .select('id, is_withdrawn')
                .eq('email', email)
                .maybeSingle();

            // ユーザーが見つからない場合
            if (!existingUser) {
                console.log(`パスワードリセット: 存在しないメールアドレス: ${email}`);
                return {
                    success: false,
                    error: 'このメールアドレスは登録されていません',
                    userExists: false
                };
            }

            // 退会済みユーザーの場合
            if (existingUser.is_withdrawn) {
                return {
                    success: false,
                    error: 'このアカウントは退会済みです。新規登録が必要です。',
                    userExists: true
                };
            }

            // Supabaseのパスワードリセット機能を利用
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            return { success: true, userExists: true };
        } catch (error: any) {
            console.error('パスワードリセットメール送信エラー:', error);
            return {
                success: false,
                error: error.message || 'パスワードリセットメールの送信に失敗しました',
                userExists: true // 技術的なエラーの場合は、ユーザーは存在するとみなす
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
    },

    /**
     * メールアドレスの確認状態を更新する
     * @param userId ユーザーID
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async updateEmailConfirmation(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // ユーザーテーブルの email_confirmed フラグを更新
            const { error } = await supabase
                .from('users')
                .update({ email_confirmed: true })
                .eq('id', userId);

            if (error) throw error;

            return { success: true };
        } catch (error: any) {
            console.error('メール確認状態更新エラー:', error);
            return {
                success: false,
                error: error.message || 'メール確認状態の更新に失敗しました',
            };
        }
    },

    /**
     * メールアドレスの確認状態を取得する
     * @param userId ユーザーID
     * @returns {Promise<{confirmed: boolean, error?: string}>}
     */
    async checkEmailConfirmation(userId: string): Promise<{ confirmed: boolean; error?: string }> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('email_confirmed')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return { confirmed: data?.email_confirmed || false };
        } catch (error: any) {
            console.error('メール確認状態取得エラー:', error);
            return {
                confirmed: false,
                error: error.message || 'メール確認状態の取得に失敗しました',
            };
        }
    }
};