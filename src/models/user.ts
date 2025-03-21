// src/models/user.ts
/**
 * ユーザーデータモデル
 */
export interface User {
    id: string;
    email: string;
    full_name?: string;
    nickname?: string;
    address?: string;
    phone?: string;
    subscription_tier: string;
    subscription_status: string;
    child_birth_year?: string;
    child_birth_month?: string;
    is_withdrawn: boolean;
    withdrawn_at?: string;
    created_at: string;
    updated_at: string;
}




