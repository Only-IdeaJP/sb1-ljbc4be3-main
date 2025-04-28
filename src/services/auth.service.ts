// src/services/auth.service.ts

import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
    IAuthService,
    SignInCredentials,
    SignUpData,
    User
} from '../types/auth.types';

// Get the environment variables for the service role client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Create a service role client for operations that need to bypass RLS
// This client has admin privileges and should only be used when necessary
const serverSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * メールとパスワードでログインする（メール確認チェック付き）
 * @param credentials ログイン情報
 * @returns ユーザー情報
 */
export const signInWithEmailConfirmation = async ({ email, password }: SignInCredentials): Promise<User> => {
    // まず既存のセッションをクリア
    await supabase.auth.signOut();

    // 退会済みユーザーチェック
    const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('is_withdrawn, email_confirmed')
        .eq('email', email)
        .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
        throw new Error(`ユーザー情報の確認中にエラーが発生しました: ${checkError.message}`);
    }

    if (existingUser?.is_withdrawn) {
        throw new Error('このアカウントは退会済みです。新規登録が必要です。');
    }

    // メール確認チェック
    if (existingUser && existingUser.email_confirmed === false) {
        throw new Error('メールアドレスの確認が完了していません。メールの確認リンクをクリックしてください。');
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

    // メール確認チェック - 未確認ならここで確認済みに更新する
    if (!userData.email_confirmed) {
        console.log('メール確認済みに更新します');

        // サービスロールを使ってメール確認ステータスを更新
        const { error: updateError } = await serverSupabase
            .from('users')
            .update({ email_confirmed: true })
            .eq('id', data.user.id);

        if (updateError) {
            console.error('メール確認ステータス更新エラー:', updateError);
            // 更新に失敗した場合でもユーザーにはエラーを表示しない
        } else {
            console.log('メール確認ステータスの更新に成功しました');

            // 更新成功後、userData.email_confirmedも更新
            userData.email_confirmed = true;
        }
    }

    return userData as User;
};

/**
 * メール認証付きでユーザー登録を行う
 * @param data 登録情報
 * @returns 作成されたユーザー情報
 */
export const signUpWithEmailConfirmation = async ({ email, password, userData }: SignUpData): Promise<void> => {
    try {
        // 既存のユーザーをチェック - 退会済みかどうか
        const { data: existingUser, error: userCheckError } = await serverSupabase
            .from('users')
            .select('is_withdrawn')
            .eq('email', email)
            .maybeSingle();

        // 退会済みユーザーが存在し、auth.usersから削除されていない場合の処理
        if (existingUser?.is_withdrawn) {
            // サービスロールを使用して古いユーザーデータをクリーンアップ
            const { error: deleteError } = await serverSupabase
                .from('users')
                .delete()
                .eq('email', email);

            if (deleteError) {
                console.error('Error cleaning up withdrawn user:', deleteError);
                // エラーを無視して続行 - 可能であれば新規登録を試みる
            }
        }

        // リダイレクトURLを設定（メール認証後にリダイレクトされるURL）
        const redirectTo = `${window.location.origin}/confirm-success`;

        // Supabaseの認証にメール確認オプションを指定して新規ユーザーを作成
        const { data: authData, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectTo,
                data: {
                    child_birth_year: userData.child_birth_year,
                    child_birth_month: userData.child_birth_month,
                    full_name: userData.full_name || null,
                    nickname: userData.nickname || null,
                    address: userData.address || null,
                    phone: userData.phone || null,
                }
            }
        });

        if (error) {
            console.error('Sign up error:', error);
            throw new Error(`アカウント登録に失敗しました: ${error.message}`);
        }

        if (!authData.user) {
            throw new Error('ユーザー登録に失敗しました。');
        }

        // メール確認が必要かどうかを確認
        if (authData.user.identities && authData.user.identities.length === 0) {
            throw new Error('このメールアドレスはすでに登録されています。');
        }

        // メール確認のステータスを確認
        if (authData.user.confirmation_sent_at && !authData.user.confirmed_at) {
            // メール確認が送信されていて、まだ確認されていない場合は成功
            // サービスロールクライアントを使用してユーザー情報をデータベースに保存
            const { error: userInsertError } = await serverSupabase
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
                }]);

            if (userInsertError) {
                console.error('User data insertion error:', userInsertError);
                // データ挿入に失敗した場合でも、認証ユーザーは作成されている
                throw new Error(`ユーザー情報の登録に失敗しました: ${userInsertError.message}`);
            }

            // メールアドレスをローカルストレージに保存（メール再送信用）
            localStorage.setItem('pending_email', email);

            return;
        } else if (authData.user.confirmed_at) {
            // すでに確認済みの場合
            throw new Error('このメールアドレスはすでに確認済みです。ログインしてください。');
        }

    } catch (error) {
        console.error('Sign up process error:', error);
        throw error instanceof Error ? error : new Error('登録処理中に予期せぬエラーが発生しました');
    }
};

/**
 * ユーザーの完全削除
 * @param userId ユーザーID
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
    try {
        // 認証システムからユーザーを削除（サービスロール必要）
        const { error: authError } = await serverSupabase.auth.admin.deleteUser(
            userId,
            false,
        );

        if (authError) {
            console.error('認証削除エラー:', authError);
            return false;
        }

        // アプリケーションデータからユーザー関連データを削除
        const { error: dataError } = await serverSupabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (dataError) {
            console.error('ユーザーデータ削除エラー:', dataError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('ユーザー削除エラー:', error);
        return false;
    }
};

/**
 * メール確認のステータスを確認する
 * @param userId ユーザーID
 * @returns 確認済みかどうか
 */
export const checkEmailConfirmation = async (userId: string): Promise<boolean> => {
    try {
        // Supabaseから直接ユーザー情報を取得
        const { data: userData, error } = await supabase.auth.admin.getUserById(userId);

        if (error) throw error;

        // email_confirmedではなく、Supabaseの内部状態を確認
        return userData?.user?.email_confirmed_at != null;
    } catch (error) {
        console.error('Email confirmation check error:', error);
        return false;
    }
};
/**
 * メール確認処理後の追加処理 - カスタムフィールドの更新は不要に
 * @param userId ユーザーID
 */
export const handleSuccessfulEmailConfirmation = async (userId: string): Promise<void> => {
    // 特別な処理が必要な場合はここに追加
    console.log(`User ${userId} has confirmed their email address`);
}

/**
 * メール確認状態を更新する
 * @param userId ユーザーID
 */
export const updateEmailConfirmation = async (userId: string): Promise<void> => {
    try {
        // サービスロールクライアントを使用してRLSをバイパス
        const { error } = await serverSupabase
            .from('users')
            .update({ email_confirmed: true })
            .eq('id', userId);

        if (error) throw error;

        console.log(`User ${userId} email confirmation status updated to true`);
    } catch (error) {
        console.error('Email confirmation update error:', error);
        throw error instanceof Error ? error : new Error('メール確認状態の更新に失敗しました');
    }
};

/**
 * ログアウト処理
 */
export const signOut = async (): Promise<void> => {
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
};

/**
 * パスワードの更新
 * @param password 新しいパスワード
 */
export const updatePassword = async (password: string): Promise<void> => {
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
};

/**
 * 現在のユーザー情報を取得する
 * @returns ユーザー情報またはnull
 */
export const getCurrentUser = async (): Promise<User | null> => {
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

        // ユーザーデータが存在するがメール確認がまだの場合は確認済みに更新
        if (userData && !userData.email_confirmed) {
            console.log('getCurrentUser: メール確認済みに更新します');

            try {
                // サービスロールを使ってメール確認ステータスを更新
                const { error: updateError } = await serverSupabase
                    .from('users')
                    .update({ email_confirmed: true })
                    .eq('id', authUser.id);

                if (updateError) {
                    console.error('メール確認ステータス更新エラー:', updateError);
                } else {
                    console.log('メール確認ステータスの更新に成功しました');
                    userData.email_confirmed = true;
                }
            } catch (updateErr) {
                console.error('メール確認更新時の例外:', updateErr);
            }
        }

        return userData as User;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
};

/**
 * メールアドレスとパスワードをバリデーションする
 * @param email メールアドレス
 * @param password パスワード
 * @returns エラーメッセージの配列または空配列
 */
export const validateCredentials = (email: string, password: string): string[] => {
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
};

/**
 * セッションの存在をチェックする
 * このメソッドは認証状態の確認のみを行い、詳細なユーザー情報は取得しない
 * @returns 認証済みかどうか
 */
export const hasActiveSession = async (): Promise<boolean> => {
    try {
        const { data } = await supabase.auth.getSession();
        return !!data.session;
    } catch (error) {
        console.error('Session check error:', error);
        return false;
    }
};

/**
 * ユーザーのセッションを設定する
 * 主にURLのトークンから認証状態を復元するために使用
 * @param accessToken アクセストークン
 * @param refreshToken リフレッシュトークン
 * @returns 設定に成功したかどうか
 */
export const setUserSession = async (accessToken: string, refreshToken?: string): Promise<boolean> => {
    try {
        const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
        });

        if (error) {
            console.error('Error setting user session:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error setting user session:', error);
        return false;
    }
};

// このオブジェクトはレガシーコードのサポート用に残します
// 将来的には個別の関数にアクセスするように変更することをお勧めします
export const AuthService: IAuthService = {
    getCurrentUser,
    signIn: async (credentials) => {
        // まず既存のセッションをクリア
        await supabase.auth.signOut();

        // 退会済みユーザーチェック
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('is_withdrawn')
            .eq('email', credentials.email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`ユーザー情報の確認中にエラーが発生しました: ${checkError.message}`);
        }

        if (existingUser?.is_withdrawn) {
            throw new Error('このアカウントは退会済みです。新規登録が必要です。');
        }

        // ログイン処理
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
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

        // メール確認されていない場合は確認済みに更新
        if (!userData.email_confirmed) {
            console.log('AuthService.signIn: メール確認済みに更新します');

            try {
                // サービスロールを使ってメール確認ステータスを更新
                const { error: updateError } = await serverSupabase
                    .from('users')
                    .update({ email_confirmed: true })
                    .eq('id', data.user.id);

                if (updateError) {
                    console.error('メール確認ステータス更新エラー:', updateError);
                } else {
                    console.log('メール確認ステータスの更新に成功しました');
                    userData.email_confirmed = true;
                }
            } catch (updateErr) {
                console.error('メール確認更新時の例外:', updateErr);
            }
        }

        return userData as User;
    },
    signUp: async ({ email, password, userData }) => {
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
            const { data: newUserData, error: userInsertError } = await serverSupabase
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
                    email_confirmed: true, // メール確認フラグ（この方法だと確認不要）
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
    signUpWithEmailConfirmation,
    signInWithEmailConfirmation,
    signOut,
    updatePassword,
    validateCredentials,
    checkEmailConfirmation,
    updateEmailConfirmation
};