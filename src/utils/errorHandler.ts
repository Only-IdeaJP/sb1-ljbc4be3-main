// src/utils/errorHandler.ts

/**
 * Supabaseのエラーメッセージを日本語に変換するユーティリティ
 */

interface ErrorMapping {
    [key: string]: string;
}

/**
 * 一般的なSupabaseエラーメッセージと対応する日本語訳のマッピング
 */
const ERROR_MESSAGES: ErrorMapping = {
    // 認証関連のエラー
    'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
    'Email not confirmed': 'メールアドレスが確認されていません',
    'Email already confirmed': 'メールアドレスはすでに確認済みです',
    'Invalid or expired token': '無効または期限切れのトークンです',
    'Invalid email': '無効なメールアドレスです',
    'Password should be at least 6 characters': 'パスワードは8文字以上である必要があります',
    'User already registered': 'このメールアドレスはすでに登録されています',
    'Email already registered': 'このメールアドレスはすでに登録されています',
    'User not found': 'ユーザーが見つかりません',
    'No user found with that email': 'そのメールアドレスのユーザーが見つかりません',
    'Cannot sign up with provided authorization code': '提供された認証コードでサインアップできません',
    'New password should be different from the old password': '新しいパスワードは古いパスワードと異なるものにしてください',

    // RLS（Row Level Security）関連のエラー
    'new row violates row-level security policy': '行レベルセキュリティポリシーに違反しています',
    'permission denied for table': 'テーブルへのアクセス権限がありません',
    'Cannot insert into this table': 'このテーブルに挿入する権限がありません',
    'Cannot update this table': 'このテーブルを更新する権限がありません',
    'Cannot delete from this table': 'このテーブルから削除する権限がありません',

    // データベース関連のエラー
    'duplicate key value violates unique constraint': '一意制約に違反しています（データが重複しています）',
    'null value in column violates not-null constraint': '必須項目が入力されていません',
    'foreign key constraint': '関連するデータが存在しないため操作できません',
    'value too long for type': '入力された値が長すぎます',

    // ストレージ関連のエラー
    'The resource already exists': 'そのリソースはすでに存在しています',
    'The resource was not found': 'リソースが見つかりませんでした',
    'Bucket not found': 'バケットが見つかりません',
    'Object not found': 'オブジェクトが見つかりません',
    'Permission denied to access this bucket': 'このバケットへのアクセス権限がありません',
    'Permission denied to access this object': 'このオブジェクトへのアクセス権限がありません',

    // 一般的なエラー
    'Request failed with status code': 'リクエストが失敗しました（ステータスコード',
    'Network Error': 'ネットワークエラーが発生しました',
    'Request timeout': 'リクエストがタイムアウトしました',
    'Internal Server Error': 'サーバー内部エラーが発生しました',
    'Service unavailable': 'サービスが利用できません',
    'JWT expired': '認証が期限切れです。再度ログインしてください',
    'JWT malformed': '不正な認証トークンです',
};

/**
 * エラーメッセージを日本語に変換する
 * @param errorMessage 英語のエラーメッセージ
 * @returns 日本語に変換されたエラーメッセージ
 */
export const translateError = (errorMessage: string | null | undefined): string => {
    if (!errorMessage) return '不明なエラーが発生しました';

    // 完全一致のエラーメッセージがある場合
    if (ERROR_MESSAGES[errorMessage]) {
        return ERROR_MESSAGES[errorMessage];
    }

    // 部分一致のエラーメッセージを探す
    for (const [englishMessage, japaneseMessage] of Object.entries(ERROR_MESSAGES)) {
        if (errorMessage.includes(englishMessage)) {
            return japaneseMessage;
        }
    }

    // マッチするメッセージがない場合はそのまま返す
    return `${errorMessage}`;
};

/**
 * Supabaseのエラーオブジェクトから日本語のエラーメッセージを抽出する
 * @param error Supabaseのエラーオブジェクト
 * @returns 日本語のエラーメッセージ
 */
export const handleSupabaseError = (error: any): string => {
    if (!error) return '不明なエラーが発生しました';

    // エラーメッセージを抽出
    const errorMessage = error.message || error.error_description || error.details || error.toString();

    // 翻訳して返す
    return translateError(errorMessage);
};

/**
 * 一般的なエラーを処理する
 * @param error 任意のエラーオブジェクト
 * @returns 日本語のエラーメッセージ
 */
export const handleError = (error: unknown): string => {
    if (!error) return '不明なエラーが発生しました';

    if (error instanceof Error) {
        return translateError(error.message);
    }

    if (typeof error === 'string') {
        return translateError(error);
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
        return translateError((error as any).message);
    }

    return '予期せぬエラーが発生しました';
};