// src/services/auth.service.ts
import { supabase } from '../lib/supabase';
import { ApiResponse, LoginCredentials, SignUpData, User } from '../models';

/**
 * 認証サービス - Supabaseを使用した認証機能を提供
 */
export const AuthService = {
    /**
     * 現在のセッションを取得
     */
    async getSession(): Promise<ApiResponse<User>> {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            if (!session?.user) {
                return { data: null };
            }

            return await this.fetchUserData(session.user.id);
        } catch (error) {
            console.error('セッション取得エラー:', error);
            return {
                error: {
                    message: error.message || 'セッションの取得に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * ログイン処理
     */
    async signIn({ email, password }: LoginCredentials): Promise<ApiResponse<User>> {
        try {
            // まず退会状態をチェック
            const { data: existingUser, error: userCheckError } = await supabase
                .from('users')
                .select('is_withdrawn')
                .eq('email', email)
                .single();

            if (existingUser?.is_withdrawn) {
                return {
                    error: {
                        message: 'このアカウントは退会済みです。新規登録が必要です。',
                        code: 'USER_WITHDRAWN'
                    }
                };
            }

            // ログイン実行
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                return {
                    error: {
                        message: 'メールアドレスまたはパスワードが正しくありません',
                        code: error.code
                    }
                };
            }

            // ユーザーデータを取得
            return await this.fetchUserData(data.user.id);
        } catch (error) {
            console.error('ログインエラー:', error);
            return {
                error: {
                    message: error.message || 'ログインに失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * 新規登録処理
     */
    async signUp({ email, password, ...userData }: SignUpData): Promise<ApiResponse<User>> {
        try {
            // 認証アカウント作成
            const { data, error } = await supabase.auth.signUp({ email, password });

            if (error || !data.user) {
                return {
                    error: {
                        message: '登録に失敗しました',
                        code: error?.code
                    }
                };
            }

            // ユーザープロファイルデータ作成
            const { error: userInsertError } = await supabase
                .from('users')
                .insert([{
                    id: data.user.id,
                    email,
                    ...userData,
                    is_withdrawn: false,
                    subscription_tier: 'free',
                    subscription_status: 'trial'
                }]);

            if (userInsertError) {
                // 登録に失敗した場合は認証アカウントをクリア
                await supabase.auth.signOut();
                return {
                    error: {
                        message: 'ユーザー情報の登録に失敗しました',
                        code: userInsertError.code
                    }
                };
            }

            return await this.fetchUserData(data.user.id);
        } catch (error) {
            console.error('登録エラー:', error);
            return {
                error: {
                    message: error.message || '登録に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * ログアウト処理
     */
    async signOut(): Promise<ApiResponse<null>> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return {
                    error: {
                        message: 'ログアウトに失敗しました',
                        code: error.code
                    }
                };
            }

            return { data: null };
        } catch (error) {
            console.error('ログアウトエラー:', error);
            return {
                error: {
                    message: error.message || 'ログアウトに失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * パスワード変更
     */
    async updatePassword(password: string): Promise<ApiResponse<null>> {
        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                return {
                    error: {
                        message: 'パスワードの更新に失敗しました',
                        code: error.code
                    }
                };
            }

            return { data: null };
        } catch (error) {
            console.error('パスワード更新エラー:', error);
            return {
                error: {
                    message: error.message || 'パスワードの更新に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * ユーザーデータをデータベースから取得
     */
    async fetchUserData(userId: string): Promise<ApiResponse<User>> {
        try {
            const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .eq('is_withdrawn', false)
                .single();

            if (error || !userData) {
                // ユーザーデータが見つからない場合は認証をクリア
                await supabase.auth.signOut();
                return {
                    error: {
                        message: 'ユーザーデータが見つかりません',
                        code: error?.code
                    }
                };
            }

            return { data: userData };
        } catch (error) {
            console.error('ユーザーデータ取得エラー:', error);
            return {
                error: {
                    message: error.message || 'ユーザーデータの取得に失敗しました',
                    code: error.code
                }
            };
        }
    }
};