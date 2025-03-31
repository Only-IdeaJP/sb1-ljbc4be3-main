// src/hooks/useAuth.ts の改善部分

import { useCallback, useEffect } from 'react';
import { HotToast } from '../components/Toaster';
import { supabase } from '../lib/supabase';
import {
  signOut as authSignOut,
  updatePassword as authUpdatePassword,
  checkEmailConfirmation,
  setUserSession,
  signInWithEmailConfirmation,
  signUpWithEmailConfirmation,
  updateEmailConfirmation
} from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { handleSupabaseError } from '../utils/errorHandler';
/**
 * 認証機能を提供するカスタムフック
 */
export const useAuth = () => {
  const {
    user,
    loading,
    error,
    signOut: storeSignOut,
    updatePassword: storeUpdatePassword,
    setUser,
    initialize
  } = useAuthStore();

  // セッション変更を監視して状態を同期する
  useEffect(() => {
    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // セッションがあれば、ユーザー情報を再取得
        if (session?.user) {
          // ストアの初期化関数を呼び出して最新のユーザー情報を取得
          initialize().catch(err => {
            console.error("Error initializing auth state after sign in:", err);
          });
        }
      }
    });

    // クリーンアップ関数
    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  /**
   * メール確認状態を更新する
   * @param userId ユーザーID
   */
  const confirmEmail = useCallback(async (userId: string): Promise<boolean> => {
    try {
      await updateEmailConfirmation(userId);
      return true;
    } catch (error) {
      console.error('Error confirming email:', error);
      return false;
    }
  }, []);

  /**
   * URLのトークンからセッションを復元する
   * @param accessToken アクセストークン
   * @param refreshToken リフレッシュトークン
   */
  const restoreSession = useCallback(async (
    accessToken: string,
    refreshToken?: string
  ): Promise<boolean> => {
    try {
      const success = await setUserSession(accessToken, refreshToken);
      if (success) {
        // セッションを設定したら、ユーザー情報も更新
        await initialize();
      }
      return success;
    } catch (error) {
      console.error('Error restoring session:', error);
      return false;
    }
  }, [initialize]);

  /**
   * メール確認状態を確認
   * @param userId ユーザーID
   */
  const checkEmailConfirmed = useCallback(async (userId: string): Promise<boolean> => {
    try {
      return await checkEmailConfirmation(userId);
    } catch (error) {
      console.error('Error checking email confirmation:', error);
      return false;
    }
  }, []);

  /**
   * ログイン処理
   * @param email メールアドレス
   * @param password パスワード
   */
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      // メール確認済みのユーザーのみログイン可能
      const userData = await signInWithEmailConfirmation({ email, password });

      // ユーザー情報を更新
      setUser(userData);

      console.log('ログインしました');
      HotToast.success('ログインしました');

      // 強制的にページリロードせずに状態を更新する対策
      // ちょっと遅延させてからユーザー情報を再更新（UIが反映される時間を確保）
      setTimeout(() => {
        initialize().catch(err => {
          console.error("Error refreshing user data after login:", err);
        });
      }, 100);
    } catch (error) {
      // エラーメッセージを日本語に変換
      const errorMessage = handleSupabaseError(error);

      // メール確認エラーの場合は特別なメッセージを表示
      if (errorMessage.includes('メールアドレスが確認されていません') ||
        errorMessage.includes('メールアドレスの確認が完了していません')) {
        HotToast.error('メールアドレスの確認が必要です。メールの確認リンクをクリックしてください。');
      } else {
        HotToast.error(errorMessage);
      }
      // エラーを上位に伝播させる
      throw error;
    }
  }, [initialize, setUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    confirmEmail,
    restoreSession,
    checkEmailConfirmed,
    signIn,

    /**
     * 新規ユーザー登録（メール確認あり）
     * @param email メールアドレス
     * @param password パスワード
     * @param userData ユーザー情報
     */
    signUp: async (
      email: string,
      password: string,
      userData: {
        child_birth_year: number | null;
        child_birth_month: number | null;
        full_name?: string;
        nickname?: string;
        address?: string;
        phone?: string;
      }
    ): Promise<void> => {
      try {
        // メール確認フローを使ってユーザー登録
        await signUpWithEmailConfirmation({ email, password, userData });
        HotToast.success('確認メールを送信しました。メールのリンクをクリックしてアカウント登録を完了してください。');
      } catch (error) {
        // エラーメッセージを日本語に変換
        const errorMessage = handleSupabaseError(error);
        HotToast.error(errorMessage);
        // エラーを上位に伝播させる
        throw error;
      }
    },

    /**
     * ログアウト処理
     */
    signOut: async (): Promise<void> => {
      try {
        await authSignOut();
        await storeSignOut();
        HotToast.success('ログアウトしました');
      } catch (error) {
        // エラーメッセージを日本語に変換
        const errorMessage = handleSupabaseError(error);
        HotToast.error(errorMessage);
        // エラーを上位に伝播させる
        // エラーを上位に伝播させる
        throw error;
      }
    },

    /**
     * パスワード更新
     * @param password 新しいパスワード
     */
    updatePassword: async (password: string): Promise<void> => {
      try {
        await authUpdatePassword(password);
        await storeUpdatePassword(password);
        HotToast.success('パスワードを更新しました');
      } catch (error) {
        // エラーメッセージを日本語に変換
        const errorMessage = handleSupabaseError(error);
        HotToast.error(errorMessage);
        // エラーを上位に伝播させる
        throw error;
      }
    }
  };
};