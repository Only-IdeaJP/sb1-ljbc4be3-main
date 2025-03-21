// src/models/auth.ts
/**
 * 認証関連のモデル
 */

import { User } from './user';

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpData extends LoginCredentials {
    child_birth_year: string;
    child_birth_month: string;
}