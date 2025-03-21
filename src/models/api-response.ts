
// src/models/api-response.ts
/**
 * API レスポンスモデル
 */
export interface ApiResponse<T> {
    data?: T;
    error?: {
        message: string;
        code?: string;
    };
}