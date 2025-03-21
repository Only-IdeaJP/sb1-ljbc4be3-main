// src/hooks/useAuth.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { LoginCredentials, SignUpData, User } from '../models';
import { AuthService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updatePassword: (password: string) => Promise<void>;
}

/**
 * 認証状態を管理するフック
 */
export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  /**
   * ユーザー情報を設定
   */
  setUser: (user) => set({ user }),

  /**
   * 認証状態の初期化
   */
  initialize: async () => {
    try {
      set({ loading: true });

      // セッションの取得
      const response = await AuthService.getSession();

      if (response.error) {
        throw new Error(response.error.message);
      }

      set({ user: response.data, loading: false });

      // 認証状態の変更をリッスン
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const userResponse = await AuthService.fetchUserData(session.user.id);
          set({ user: userResponse.data, loading: false });
        } else {
          set({ user: null, loading: false });
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('認証初期化エラー:', error);
      set({ error: error.message, loading: false });
    }
  },

  /**
   * ユーザー情報の再取得
   */
  refreshUser: async () => {
    try {
      const currentUser = get().user;
      if (!currentUser) throw new Error('認証されたユーザーがいません');

      const response = await AuthService.fetchUserData(currentUser.id);

      if (response.error) {
        throw new Error(response.error.message);
      }

      set({ user: response.data });
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
      set({ error: error.message });
    }
  },

  /**
   * 認証状態のチェック
   */
  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('認証チェックエラー:', error);
      return false;
    }
  },

  /**
   * 新規登録
   */
  signUp: async (data) => {
    try {
      set({ loading: true, error: null });

      const response = await AuthService.signUp(data);

      if (response.error) {
        throw new Error(response.error.message);
      }

      set({ user: response.data, loading: false });
    } catch (error) {
      console.error('登録エラー:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * ログイン
   */
  signIn: async ({ email, password }) => {
    try {
      set({ loading: true, error: null });

      const response = await AuthService.signIn({ email, password });

      if (response.error) {
        throw new Error(response.error.message);
      }

      set({ user: response.data, loading: false });
    } catch (error) {
      console.error('ログインエラー:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * ログアウト
   */
  signOut: async () => {
    try {
      set({ loading: true, error: null });

      const response = await AuthService.signOut();

      if (response.error) {
        throw new Error(response.error.message);
      }

      set({ user: null, loading: false });
    } catch (error) {
      console.error('ログアウトエラー:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * パスワード更新
   */
  updatePassword: async (password) => {
    try {
      set({ loading: true, error: null });

      const response = await AuthService.updatePassword(password);

      if (response.error) {
        throw new Error(response.error.message);
      }

      set({ loading: false });
    } catch (error) {
      console.error('パスワード更新エラー:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

// 認証状態の初期化
useAuth.getState().initialize();