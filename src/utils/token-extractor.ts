// src/utils/token-extractor.ts

/**
 * JWT (JSON Web Token)をデコードして内容を解析する
 * @param token - JWTトークン
 * @returns デコードされたトークンのペイロード、またはnull（失敗時）
 */
export function parseJwt(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("JWT解析エラー:", e);
        return null;
    }
}

/**
 * URLからSupabase認証トークンを抽出する
 * @param url - 解析するURL（デフォルトは現在のURL）
 * @returns トークン情報とユーザー情報を含むオブジェクト
 */
export function extractAuthTokens(url: string = window.location.href): {
    accessToken: string | null;
    refreshToken: string | null;
    tokenType: string | null;
    authType: string | null;
    userId: string | null;
    email: string | null;
} {
    try {
        const parsedUrl = new URL(url);

        // URLハッシュ（#以降）からパラメータを抽出
        const fragment = parsedUrl.hash.substring(1);
        const fragmentParams = new URLSearchParams(fragment);

        // クエリパラメータ（?以降）からも抽出
        const queryParams = new URLSearchParams(parsedUrl.search);

        // トークン情報の抽出
        const accessToken = fragmentParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = fragmentParams.get('refresh_token') || queryParams.get('refresh_token');
        const tokenType = fragmentParams.get('token_type') || queryParams.get('token_type');
        const authType = fragmentParams.get('type') || queryParams.get('type');

        // アクセストークンからユーザー情報の抽出
        let userId = null;
        let email = null;

        if (accessToken) {
            const tokenData = parseJwt(accessToken);
            if (tokenData) {
                userId = tokenData.sub;
                email = tokenData.email;
            }
        }

        return {
            accessToken,
            refreshToken,
            tokenType,
            authType,
            userId,
            email
        };
    } catch (error) {
        console.error("トークン抽出エラー:", error);
        return {
            accessToken: null,
            refreshToken: null,
            tokenType: null,
            authType: null,
            userId: null,
            email: null
        };
    }
}