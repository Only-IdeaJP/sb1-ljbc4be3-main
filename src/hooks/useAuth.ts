// hooks/useAuth.ts
import { HotToast } from '../components/Toaster';
import { useAuthStore } from '../store/auth.store';

/**
 * 認証機能を提供するカスタムフック
 */
export const useAuth = () => {
  const {
    user,
    loading,
    error,
    signIn: storeSignIn,
    signUp: storeSignUp,
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
        await storeSignIn({ email, password });
        console.log('ログインしました');
        HotToast.success('ログインしました');
      } catch (error) {
        HotToast.error(error instanceof Error ? error.message : 'ログインに失敗しました');
        // エラーはストアで処理されているので、ここでは何もしない
        console.error('Login error:', error);
      }
    },

    /**
     * 新規ユーザー登録
     * @param email メールアドレス
     * @param password パスワード
     * @param userData ユーザー情報
     */
    signUp: async (
      email: string,
      password: string,
      userData: {
        child_birth_year: string;
        child_birth_month: string;
        full_name?: string;
        nickname?: string;
        address?: string;
        phone?: string;
      }
    ): Promise<void> => {
      try {
        await storeSignUp({ email, password, userData });
        HotToast.success('アカウントを作成しました');
      } catch (error) {
        HotToast.error(error instanceof Error ? error.message : 'アカウント登録に失敗しました');
        // エラーはストアで処理されているので、ここでは何もしない
        console.error('Create account error:', error);
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
        // エラーはストアで処理されているので、ここでは何もしない
        console.error('Logout error:', error);
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
        // エラーはストアで処理されているので、ここでは何もしない
        console.error('Update password error:', error);
      }
    }
  };
};