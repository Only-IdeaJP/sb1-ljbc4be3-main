/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  setUser: (user: any | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: UserData) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

interface UserData {
  child_birth_year: string;
  child_birth_month: string;
  full_name?: string;
  nickname?: string;
  address?: string;
  phone?: string;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  // @ts-ignore
  initialize: async () => {
    try {
      set({ loading: true });

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = await fetchUserData(session.user.id);
        set({ user, loading: false });
      } else {
        set({ user: null, loading: false });
      }

      // Listen to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const user = await fetchUserData(session.user.id);
          set({ user, loading: false });
        } else {
          set({ user: null, loading: false });
        }
      });

      return () => subscription.unsubscribe();
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      set({ error: error.message, loading: false });
    }
  },

  refreshUser: async () => {
    try {
      const currentUser = get().user;
      if (!currentUser) throw new Error('No authenticated user.');

      const updatedUser = await fetchUserData(currentUser.id);
      set({ user: updatedUser });
    } catch (error: any) {
      console.error('User refresh error:', error);
      set({ error: error.message });
    }
  },

  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) throw new Error('Registration failed.');

      const { error: userInsertError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email, ...userData, is_withdrawn: false }]);

      if (userInsertError) {
        await supabase.auth.signOut();
        throw new Error('Registration failed. Please try again.');
      }

      set({ user: data.user, loading: false });
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      await supabase.auth.signOut();

      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('is_withdrawn')
        .eq('email', email)
        .single();

      if (existingUser?.is_withdrawn) {
        throw new Error('このアカウントは退会済みです。新規登録が必要です。');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error('メールアドレスまたはパスワードが正しくありません');

      const user = await fetchUserData(data.user.id);
      set({ user, loading: false });
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();
      if (error) throw new Error('Failed to log out.');

      set({ user: null, loading: false });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

// Fetch user data from Supabase
const fetchUserData = async (userId: string) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_withdrawn', false)
      .single();

    if (error || !userData) {
      console.error('User data fetch error:', error);
      await supabase.auth.signOut();
      throw new Error('User data not found.');
    }

    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Initialize auth state
useAuth.getState().initialize();
