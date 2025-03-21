// services/auth.service.ts
import { supabase } from '../lib/supabase';
import { SignInCredentials, SignUpData, User } from '../types/auth.types';

/**
 * 認証に関連する操作を提供するサービス
 */
export const AuthService = {
    /**
     * 現在のセッションからユーザー情報を取得する
     * @returns ユーザー情報またはnull
     */
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) return null;

            const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(session.access_token);

            if (userError || !authUser) {
                console.error('User fetch error:', userError);
                return null;
            }

            const { data: userData, error: userDataError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .eq('is_withdrawn', false)
                .single();

            if (userDataError || !userData) {
                console.error('User data fetch error:', userDataError);
                return null;
            }

            return userData as User;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    /**
     * メールとパスワードでログインする
     * @param credentials ログイン情報
     * @returns ユーザー情報
     */
    signIn: async ({ email, password }: SignInCredentials): Promise<User> => {
        // まず既存のセッションをクリア
        await supabase.auth.signOut();

        // 退会済みユーザーチェック
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('is_withdrawn')
            .eq('email', email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
            throw new Error(`ユーザー情報の確認中にエラーが発生しました: ${checkError.message}`);
        }

        if (existingUser?.is_withdrawn) {
            throw new Error('このアカウントは退会済みです。新規登録が必要です。');
        }

        // ログイン処理
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message === 'Invalid login credentials') {
                throw new Error('メールアドレスまたはパスワードが正しくありません');
            }
            throw new Error(`ログイン処理中にエラーが発生しました: ${error.message}`);
        }

        if (!data.user) {
            throw new Error('ログインに失敗しました');
        }

        // ユーザーデータを取得
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .eq('is_withdrawn', false)
            .single();

        if (userDataError || !userData) {
            await supabase.auth.signOut();
            throw new Error('このアカウントは退会済みです。新規登録が必要です。');
        }

        return userData as User;
    },

    /**
     * 新規ユーザー登録
     * @param data 登録情報
     * @returns 作成されたユーザー情報
     */
    signUp: async ({ email, password, userData }: SignUpData): Promise<User> => {
        try {
            // 新規ユーザーアカウントをSupabase認証に作成
            const { data: authData, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error('Sign up error:', error);
                throw new Error(`アカウント登録に失敗しました: ${error.message}`);
            }

            if (!authData.user) {
                throw new Error('ユーザー登録に失敗しました。');
            }

            // ユーザー情報をデータベースに保存
            // Using upsert to handle duplicate key errors if the user already exists.
            const { data: newUserData, error: userInsertError } = await supabase
                .from('users')
                .upsert([{
                    id: authData.user.id,
                    email,
                    child_birth_year: userData.child_birth_year,
                    child_birth_month: userData.child_birth_month,
                    full_name: userData.full_name || null,
                    nickname: userData.nickname || null,
                    address: userData.address || null,
                    phone: userData.phone || null,
                    is_withdrawn: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (userInsertError || !newUserData) {
                console.error('User data insertion error:', userInsertError);
                // データ挿入に失敗した場合、ユーザーをサインアウトさせる
                await supabase.auth.signOut();
                throw new Error(`ユーザー情報の登録に失敗しました: ${userInsertError?.message}`);
            }

            return newUserData as User;
        } catch (error) {
            console.error('Sign up process error:', error);
            throw error instanceof Error ? error : new Error('登録処理中に予期せぬエラーが発生しました');
        }
    },

    /**
     * ログアウト
     */
    signOut: async (): Promise<void> => {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Sign out error:', error);
                throw new Error(`ログアウト処理中にエラーが発生しました: ${error.message}`);
            }
        } catch (error) {
            console.error('Sign out process error:', error);
            throw error instanceof Error ? error : new Error('ログアウト処理中に予期せぬエラーが発生しました');
        }
    },

    /**
     * パスワードの更新
     * @param password 新しいパスワード
     */
    updatePassword: async (password: string): Promise<void> => {
        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                console.error('Password update error:', error);
                throw new Error(`パスワード更新中にエラーが発生しました: ${error.message}`);
            }
        } catch (error) {
            console.error('Password update process error:', error);
            throw error instanceof Error ? error : new Error('パスワード更新中に予期せぬエラーが発生しました');
        }
    },

    /**
     * メールアドレスとパスワードをバリデーションする
     * @param email メールアドレス
     * @param password パスワード
     * @returns エラーメッセージの配列または空配列
     */
    validateCredentials: (email: string, password: string): string[] => {
        const errors: string[] = [];

        // メールアドレスのバリデーション
        if (!email) {
            errors.push('メールアドレスは必須です');
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            errors.push('メールアドレスの形式が正しくありません');
        }

        // パスワードのバリデーション
        if (!password) {
            errors.push('パスワードは必須です');
        } else if (password.length < 8) {
            errors.push('パスワードは8文字以上必要です');
        } else if (!/^[\x00-\x7F]*$/.test(password)) {
            errors.push('パスワードは半角英数字記号のみ使用可能です');
        }

        return errors;
    }
};
