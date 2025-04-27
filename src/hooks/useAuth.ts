// src/hooks/useAuth.ts

import { useCallback, useEffect, useRef, useState } from 'react';
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
    initialize,
    forceRefresh // 強制再読み込み関数
  } = useAuthStore();

  // 初期化フラグを追加
  const initializedRef = useRef(false);
  // ローカルのセッション状態を追跡
  const [sessionChecked, setSessionChecked] = useState(false);
  // refreshing フラグを追加して再帰的な更新を防止
  const refreshingRef = useRef(false);

  // セッション変更を監視して状態を同期する
  useEffect(() => {
    // 既に初期化済みの場合は処理をスキップ
    if (initializedRef.current) return;

    // 初期化前に現在のセッションを確認
    const checkCurrentSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // セッションが存在する場合は初期化
          await initialize();

          // ユーザーが正しく取得できたがemail_confirmedがfalseの場合は強制更新
          // ただし、refreshingRef を使って再帰呼び出しを防止
          if (user && !user.email_confirmed && !refreshingRef.current) {
            console.log('ユーザーのメール確認状態が未確認です。強制更新を試みます');
            refreshingRef.current = true;

            setTimeout(() => {
              forceRefresh().catch(e => {
                console.error('強制更新中にエラーが発生しました:', e);
              }).finally(() => {
                refreshingRef.current = false;
              });
            }, 500);
          }
        }
        setSessionChecked(true);
        initializedRef.current = true;
      } catch (err) {
        console.error("Error checking current session:", err);
        setSessionChecked(true);
        initializedRef.current = true;
      }
    };

    checkCurrentSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`);

      // INITIALセッションイベントは特別に処理
      if (event === 'INITIAL_SESSION') {
        // すでに初期化済みの場合は処理をスキップ
        if (initializedRef.current) {
          console.log("Initial session event ignored - already initialized");
          return;
        }

        if (session) {
          console.log("Initial session detected, initializing auth state");
          await initialize();
        }
        initializedRef.current = true;
        setSessionChecked(true);
        return;
      }

      // タブフォーカス変更による偽のSIGNED_OUTイベントを無視
      if (event === 'SIGNED_OUT' && document.visibilityState !== 'visible') {
        console.log("Ignoring SIGNED_OUT event during tab visibility change");
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // セッションがあれば、ユーザー情報を再取得
        if (session?.user && !refreshingRef.current) {
          // refreshingRef を使って再帰呼び出しを防止
          refreshingRef.current = true;
          // ストアの初期化関数を呼び出して最新のユーザー情報を取得
          console.log("Auth event requires user refresh, initializing...");
          initialize().catch(err => {
            console.error("Error initializing auth state after sign in:", err);
          }).finally(() => {
            refreshingRef.current = false;
          });
        }
      }
    });

    // visibilitychange イベントリスナーを追加
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !refreshingRef.current) {
        // タブが再表示されたときのセッション確認は軽く行う
        console.log('Tab is visible again, checking session status');
        supabase.auth.getSession().then(({ data }) => {
          const hasSession = !!data.session;
          const hasUser = !!user;

          // セッションとユーザーの不一致がある場合のみ初期化
          if (hasSession !== hasUser && !refreshingRef.current) {
            refreshingRef.current = true;
            console.log("Session state mismatch detected, re-initializing");
            initialize().catch(err => {
              console.error("Error refreshing auth state on visibility change:", err);
            }).finally(() => {
              refreshingRef.current = false;
            });
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // クリーンアップ関数
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialize, forceRefresh, user]);

  // 安全なデータ更新関数 - 再帰呼び出し防止
  const safeRefreshUserData = useCallback(async (): Promise<void> => {
    if (refreshingRef.current) {
      console.log("Refresh already in progress, skipping...");
      return;
    }

    refreshingRef.current = true;
    try {
      await forceRefresh();
    } catch (err) {
      console.error("Error during safe user refresh:", err);
    } finally {
      refreshingRef.current = false;
    }
  }, [forceRefresh]);

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
      // メール確認の有無に関わらずログイン処理を行う
      const userData = await signInWithEmailConfirmation({ email, password });

      // ユーザー情報を更新
      setUser(userData);

      console.log('ログインしました');
      HotToast.success('ログインしました');

      // 1秒後に1回だけユーザー情報を再取得
      setTimeout(() => {
        if (!refreshingRef.current) {
          safeRefreshUserData().catch(err => {
            console.error("Error refreshing user data after login:", err);
          });
        }
      }, 1000);
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
  }, [setUser, safeRefreshUserData]);

  return {
    user,
    loading: loading && !sessionChecked, // セッションチェック済みならローディング状態を緩和
    error,
    isAuthenticated: !!user,
    confirmEmail,
    restoreSession,
    checkEmailConfirmed,
    signIn,
    refreshUserData: safeRefreshUserData, // 安全な更新関数を公開

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
  }
}