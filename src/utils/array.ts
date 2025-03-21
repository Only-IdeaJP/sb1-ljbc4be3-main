// src/utils/array.ts

/**
 * 配列をランダムに並べ替えるShuffle関数
 * @param array シャッフルする配列
 * @returns シャッフルされた新しい配列
 */
export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * 配列内の重複を除去する関数
 * @param array 重複除去する配列
 * @returns 重複を除去した新しい配列
 */
export function uniqueArray<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

/**
 * ネストされた配列をフラットにする関数
 * @param array フラット化する多次元配列
 * @returns フラット化された配列
 */
export function flattenArray<T>(array: (T | T[])[]): T[] {
    return array.reduce<T[]>((acc, val) =>
        acc.concat(Array.isArray(val) ? flattenArray(val) : val), []);
}

// src/utils/date.ts

/**
 * 指定された日数を加えた日付を取得する
 * @param date 基準日
 * @param days 加算する日数
 * @returns 新しい日付
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * 日付文字列をyyyy-mm-dd形式に変換する
 * @param date 日付オブジェクトまたは文字列
 * @returns yyyy-mm-dd形式の文字列
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}

/**
 * 二つの日付の差分を日数で取得する
 * @param date1 日付1
 * @param date2 日付2
 * @returns 日数差（絶対値）
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// src/utils/validation.ts

/**
 * メールアドレスの検証
 * @param email 検証するメールアドレス
 * @returns 有効なメールアドレスの場合はtrue
 */
export function validateEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * パスワードの検証
 * @param password 検証するパスワード
 * @returns 有効なパスワードの場合はtrue
 */
export function validatePassword(password: string): boolean {
    // 8文字以上の半角英数字記号
    return password.length >= 8 && /^[\x00-\x7F]*$/.test(password);
}

/**
 * パスワード強度を0-4の数値で返す
 * @param password パスワード
 * @returns 強度スコア（0-4）
 */
export function getPasswordStrength(password: string): number {
    let score = 0;

    // 長さチェック
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // 文字種チェック
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    return Math.min(4, score);
}

// src/utils/file.ts

/**
 * ファイルサイズを人が読みやすい形式に変換
 * @param bytes バイト数
 * @param decimals 小数点以下の桁数
 * @returns 読みやすい形式のファイルサイズ
 */
export function formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * ファイルの拡張子を取得
 * @param filename ファイル名
 * @returns 拡張子（ドットなし）
 */
export function getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * ファイルの種類をMIMEタイプから判断
 * @param mimeType MIMEタイプ
 * @returns ファイルタイプ（'image', 'pdf', 'other'など）
 */
export function getFileTypeFromMime(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
}