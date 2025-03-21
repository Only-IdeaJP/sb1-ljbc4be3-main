// store/auth.store.ts

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
}

/**
 * 認証状態を管理するZustandストア
 */
export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: true,
    error: null,

    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    /**
     * 認証状態を初期化する
     */
    initialize: async () => {
        set({ loading: true, error: null });
        try {
            const user = await AuthService.getCurrentUser();
            set({ user, loading: false });

            // 認証状態の変更を監視
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session) {
                        const currentUser = await AuthService.getCurrentUser();
                        set({ user: currentUser });
                    }
                } else if (event === 'SIGNED_OUT') {
                    set({ user: null });
                }
            });

            // No return statement here since we must resolve as Promise<void>
            // If you want a cleanup function, store the subscription somewhere
            // and unsubscribe it manually later when needed.

        } catch (error) {
            console.error('Auth initialization error:', error);
            set({
                error: error instanceof Error ? error.message : '認証エラーが発生しました',
                loading: false
            });
        }
    },

    /**
     * ログイン処理
     * @param credentials ログイン情報
     */
    signIn: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const user = await AuthService.signIn(credentials);
            set({ user, loading: false });
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
            const user = await AuthService.signUp(data);
            set({ user, loading: false });
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
