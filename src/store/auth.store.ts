// src/store/auth.store.ts

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
    forceRefresh: () => Promise<void>; // 強制的にユーザー情報を再取得
}

// 初期化フラグ
let initializeAttempted = false;
// 更新中フラグを追加して再帰的な更新を防止
let isRefreshing = false;

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
        // すでに進行中の初期化がある場合は重複した実行を避ける
        const { user, loading } = get();

        // すでに認証済みで、ロード中でもない場合は処理をスキップ
        if (user && !loading) {
            console.log("Auth store already initialized with user, skipping");
            return;
        }

        // 初期化試行フラグを設定
        if (initializeAttempted) {
            console.log("Auth initialization already attempted, avoiding duplicate");
            return;
        }

        initializeAttempted = true;
        set({ loading: true, error: null });

        try {
            // Supabaseから認証状態を取得
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                throw sessionError;
            }

            if (sessionData.session) {
                const userId = sessionData.session.user.id;

                // メール確認状態はセッションのユーザー情報から直接確認可能
                const isEmailConfirmed = sessionData.session.user.email_confirmed_at != null;

                if (!isEmailConfirmed) {
                    console.log('User email is not confirmed');
                    // メール未確認の場合の処理をここに追加
                }

                // データベースからユーザー情報を取得
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .eq('is_withdrawn', false)
                    .single();

                if (userError) {
                    throw userError;
                }

                // ユーザー情報を設定する
                set({ user: userData as User, loading: false, error: null });
                console.log("User state initialized successfully:", userData);
            } else {
                set({ user: null, loading: false, error: null });
                console.log("No active session found during initialization");
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({
                error: error instanceof Error ? error.message : '認証エラーが発生しました',
                loading: false,
                user: null
            });
        } finally {
            // 初期化処理が完了
            set({ loading: false });
        }
    },

    /**
     * 強制的にユーザー情報を再取得する
     * ログイン状態のUIが更新されない場合に使用
     * 再帰的な呼び出しを防止するためにisRefreshingフラグを使用
     */
    forceRefresh: async () => {
        // すでに更新中なら処理を中止
        if (isRefreshing) {
            console.log("Already refreshing user data, skipping redundant call");
            return;
        }

        // 更新フラグを設定
        isRefreshing = true;

        // 現在のセッション状態を取得
        const { user } = get();
        set({ loading: true });

        try {
            const { data: sessionData } = await supabase.auth.getSession();

            if (sessionData.session?.user?.id) {
                // ユーザー情報を再取得
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', sessionData.session.user.id)
                    .eq('is_withdrawn', false)
                    .single();

                if (userError) throw userError;

                // ユーザー情報に変更がある場合のみ更新とログを出す
                if (!user || user.id !== userData.id || user.email_confirmed !== userData.email_confirmed) {
                    console.log("User state forcefully refreshed:", userData);
                    set({ user: userData as User, loading: false, error: null });
                } else {
                    // 変更がない場合は静かに更新
                    set({ user: userData as User, loading: false, error: null });
                }
                return;
            } else {
                // セッションがなければユーザーをnullに設定
                if (user !== null) {
                    console.log("User session expired, clearing user state");
                    set({ user: null, loading: false, error: null });
                } else {
                    set({ user: null, loading: false, error: null });
                }
            }
        } catch (error) {
            console.error("Error refreshing user data:", error);
            set({ loading: false, error: error instanceof Error ? error.message : '更新エラーが発生しました' });
        } finally {
            // 更新完了後にフラグをリセット
            isRefreshing = false;
            set({ loading: false });
        }
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
            set({ user, loading: false, error: null });

            // ログイン後に一度だけ情報を再取得
            // ただし既に更新中でなければ
            if (!isRefreshing) {
                setTimeout(async () => {
                    try {
                        const { forceRefresh } = get();
                        await forceRefresh();
                    } catch (err) {
                        console.error("Error during post-login refresh:", err);
                    }
                }, 100);
            }
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
            set({ loading: false, user: null, error: null });
        } catch (error) {
            console.error('Sign up error:', error);
            set({
                error: error instanceof Error ? error.message : 'アカウント登録に失敗しました',
                loading: false,
                user: null
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
            set({ user: null, loading: false, error: null });
            // 初期化フラグをリセット
            initializeAttempted = false;
            // 更新フラグもリセット
            isRefreshing = false;
        } catch (error) {
            console.error('Sign out error:', error);
            set({
                error: error instanceof Error ? error.message : 'ログアウトに失敗しました',
                loading: false,
                user: null
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
            set({ loading: false, error: null });
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

// 認証状態を初期化する - アプリ起動時に一度だけ実行
// ただし非同期処理なので、結果は待たない
useAuthStore.getState().initialize().catch(err => {
    console.error("Initial auth state initialization failed:", err);
});