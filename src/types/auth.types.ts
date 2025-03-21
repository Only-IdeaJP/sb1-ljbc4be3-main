// types/auth.types.ts
export interface User {
    id: string;
    email: string;
    child_birth_year?: string;
    child_birth_month?: string;
    full_name?: string;
    nickname?: string;
    address?: string;
    phone?: string;
    is_withdrawn: boolean;
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
        child_birth_year: string;
        child_birth_month: string;
        full_name?: string;
        nickname?: string;
        address?: string;
        phone?: string;
    };
}
