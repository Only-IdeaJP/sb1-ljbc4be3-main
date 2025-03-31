// src/store/auth.store.ts の改善部分

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AuthService } from '../services/auth.service';
import { AuthState, SignInCredentials, SignUpData, User } from '../types/auth.types';

interface AuthStore extends AuthState {
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    initialize: () => Promise<void>;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signUp: (data: SignUpData) => Promise<void>;
    signOut: () => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    forceRefresh: () => Promise<void>; // 新しいメソッド: 強制的にユーザー情報を再取得
}

/**
 * 認証状態を管理するZustandストア
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    loading: true,
    error: null,

    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    /**
     * 認証状態を初期化する
     * メール確認状態もチェックします
     */
    initialize: async () => {
        set({ loading: true, error: null });
        try {
            // Supabaseから認証状態を取得
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                throw sessionError;
            }

            if (sessionData.session) {
                const userId = sessionData.session.user.id;

                // データベースからメール確認状態を取得
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .eq('is_withdrawn', false)
                    .single();

                if (userError) {
                    throw userError;
                }

                // メール確認状態をチェック
                if (!userData || !userData.email_confirmed) {
                    // メール未確認の場合はログアウト
                    await supabase.auth.signOut();
                    set({
                        user: null,
                        loading: false,
                        error: 'メールアドレスの確認が完了していません。メールの確認リンクをクリックしてください。'
                    });
                    return;
                }

                // すべての条件をクリアしたらユーザーを設定
                set({ user: userData as User, loading: false });
                console.log("User state initialized successfully:", userData);
            } else {
                set({ user: null, loading: false });
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({
                error: error instanceof Error ? error.message : '認証エラーが発生しました',
                loading: false,
                user: null
            });
        }
    },

    /**
     * 強制的にユーザー情報を再取得する
     * ログイン状態のUIが更新されない場合に使用
     */
    forceRefresh: async () => {
        // 現在のセッション状態を取得
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData.session?.user?.id) {
            try {
                // ユーザー情報を再取得
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', sessionData.session.user.id)
                    .eq('is_withdrawn', false)
                    .single();

                if (userError) throw userError;

                // ユーザー情報を更新
                set({ user: userData as User });
                console.log("User state forcefully refreshed:", userData);
                return;
            } catch (error) {
                console.error("Error refreshing user data:", error);
            }
        }

        // セッションがなければユーザーをnullに設定
        set({ user: null });
    },

    /**
     * ログイン処理
     * @param credentials ログイン情報
     */
    signIn: async (credentials) => {
        set({ loading: true, error: null });
        try {
            // メール確認済みチェック付きのログイン処理
            const user = await AuthService.signInWithEmailConfirmation(credentials);

            // ユーザー情報を更新
            set({ user, loading: false });

            // ログイン後に強制的に情報を再取得（Supabaseの非同期性に対応）
            setTimeout(async () => {
                try {
                    const { forceRefresh } = get();
                    await forceRefresh();
                } catch (err) {
                    console.error("Error during post-login refresh:", err);
                }
            }, 100);
        } catch (error) {
            console.error('Sign in error:', error);
            set({
                error: error instanceof Error ? error.message : 'ログインに失敗しました',
                loading: false,
                user: null
            });
            throw error;
        }
    },

    /**
     * 新規ユーザー登録
     * @param data 登録情報
     */
    signUp: async (data) => {
        set({ loading: true, error: null });
        try {
            // メール確認ありのサインアップ処理
            await AuthService.signUpWithEmailConfirmation(data);
            // メール確認待ちの状態なので、ユーザーはnullのまま
            set({ loading: false, user: null });
        } catch (error) {
            console.error('Sign up error:', error);
            set({
                error: error instanceof Error ? error.message : 'アカウント登録に失敗しました',
                loading: false
            });
            throw error;
        }
    },

    /**
     * ログアウト処理
     */
    signOut: async () => {
        set({ loading: true, error: null });
        try {
            await AuthService.signOut();
            set({ user: null, loading: false });
        } catch (error) {
            console.error('Sign out error:', error);
            set({
                error: error instanceof Error ? error.message : 'ログアウトに失敗しました',
                loading: false
            });
            throw error;
        }
    },

    /**
     * パスワード更新
     * @param password 新しいパスワード
     */
    updatePassword: async (password) => {
        set({ loading: true, error: null });
        try {
            await AuthService.updatePassword(password);
            set({ loading: false });
        } catch (error) {
            console.error('Password update error:', error);
            set({
                error: error instanceof Error ? error.message : 'パスワード更新に失敗しました',
                loading: false
            });
            throw error;
        }
    }
}));

// 認証状態を初期化する
useAuthStore.getState().initialize();