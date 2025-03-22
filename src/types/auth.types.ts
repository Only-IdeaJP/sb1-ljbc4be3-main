// types/auth.types.ts

export interface User {
    id: string;
    email: string;
    child_birth_year: number | null;
    child_birth_month: number | null;
    full_name?: string;
    nickname?: string;
    address?: string;
    phone?: string;
    is_withdrawn: boolean;
    email_confirmed: boolean; // 追加: メール確認フラグ
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface SignInCredentials {
    email: string;
    password: string;
}

export interface SignUpData {
    email: string;
    password: string;
    userData: {
        child_birth_year: number | null;
        child_birth_month: number | null;
        full_name?: string;
        nickname?: string;
        address?: string;
        phone?: string;
    };
}

// AuthServiceのインターフェースを定義
export interface IAuthService {
    getCurrentUser: () => Promise<User | null>;
    signIn: (credentials: SignInCredentials) => Promise<User>;
    signUp: (data: SignUpData) => Promise<User>;
    signUpWithEmailConfirmation: (data: SignUpData) => Promise<void>; // メール確認付き登録関数
    signInWithEmailConfirmation: (credentials: SignInCredentials) => Promise<User>; // メール確認チェック付きログイン関数
    signOut: () => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    validateCredentials: (email: string, password: string) => string[];
    checkEmailConfirmation: (userId: string) => Promise<boolean>; // メール確認状態チェック関数
    updateEmailConfirmation: (userId: string) => Promise<void>; // メール確認状態更新関数
}