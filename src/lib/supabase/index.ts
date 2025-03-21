// src/lib/supabase/index.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 環境変数の検証
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase環境変数が設定されていません');
}

/**
 * 通常のクライアント（認証含む）
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'X-Client-Info': 'exam-paper-management'
        }
    },
    db: {
        schema: 'public'
    }
});

/**
 * 認証状態イベントのリスナー設定
 */
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('ユーザーがサインインしました:', session?.user?.id);
    } else if (event === 'SIGNED_OUT') {
        console.log('ユーザーがサインアウトしました');
    }
});

/**
 * サーバーサイド用のクライアント（管理者権限）
 * 注: このクライアントはサーバーサイドコード（APIルートなど）でのみ使用する
 */
export const serverSupabase = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

/**
 * オプションのヘルパー関数
 */

/**
 * 指定されたバケット内のファイルURLを取得
 */
export const getFileUrl = (bucket: string, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
};

/**
 * Supabaseストレージにファイルをアップロード
 */
export const uploadFile = async (
    bucket: string,
    path: string,
    file: File
): Promise<{ url: string | null; error: Error | null }> => {
    try {
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
            cacheControl: '3600',
            upsert: false
        });

        if (error) throw error;

        const url = getFileUrl(bucket, path);
        return { url, error: null };
    } catch (error) {
        console.error('ファイルアップロードエラー:', error);
        return { url: null, error: error as Error };
    }
};

/**
 * Supabaseストレージからファイルを削除
 */
export const deleteFile = async (
    bucket: string,
    path: string
): Promise<{ error: Error | null }> => {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        console.error('ファイル削除エラー:', error);
        return { error: error as Error };
    }
};

/**
 * 認証ヘルパー関数
 */

/**
 * 現在のセッションを取得
 */
export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
};

/**
 * 現在のユーザーを取得
 */
export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    return { user: data?.user, error };
};