// hooks/useAuth.ts を更新

import { HotToast } from '../components/Toaster';
import { signInWithEmailConfirmation, signUpWithEmailConfirmation } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

/**
 * 認証機能を提供するカスタムフック
 */
export const useAuth = () => {
  const {
    user,
    loading,
    error,
    signOut: storeSignOut,
    updatePassword: storeUpdatePassword
  } = useAuthStore();

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,

    /**
     * ログイン処理
     * @param email メールアドレス
     * @param password パスワード
     */
    signIn: async (email: string, password: string): Promise<void> => {
      try {
        // メール確認済みのユーザーのみログイン可能
        await signInWithEmailConfirmation({ email, password });
        console.log('ログインしました');
        HotToast.success('ログインしました');
      } catch (error) {
        // メール確認エラーの場合は特別なメッセージを表示
        if (error instanceof Error &&
          error.message.includes('メールアドレスの確認が完了していません')) {
          HotToast.error('メールアドレスの確認が必要です。メールの確認リンクをクリックしてください。');
        } else {
          HotToast.error(error instanceof Error ? error.message : 'ログインに失敗しました');
        }
        // エラーを上位に伝播させる
        throw error;
      }
    },

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
        HotToast.error(error instanceof Error ? error.message : 'アカウント登録に失敗しました');
        // エラーを上位に伝播させる
        throw error;
      }
    },

    /**
     * ログアウト処理
     */
    signOut: async (): Promise<void> => {
      try {
        await storeSignOut();
        HotToast.success('ログアウトしました');
      } catch (error) {
        HotToast.error(error instanceof Error ? error.message : 'ログアウトに失敗しました',);
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
        await storeUpdatePassword(password);
        HotToast.success('パスワードを更新しました');
      } catch (error) {
        HotToast.error(error instanceof Error ? error.message : 'パスワード更新に失敗しました',);
        // エラーを上位に伝播させる
        throw error;
      }
    }
  };
};