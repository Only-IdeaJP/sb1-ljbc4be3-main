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
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
        if (userError) {
          console.error('User fetch error:', userError);
          await supabase.auth.signOut();
          set({ user: null, loading: false });
          return;
        }

        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user?.id)
          .eq('is_withdrawn', false)
          .single();

        if (userDataError || !userData) {
          console.error('User data fetch error:', userDataError);
          await supabase.auth.signOut();
          set({ user: null, loading: false });
          return;
        }

        set({ user, loading: false });
      } else {
        set({ user: null, loading: false });
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.access_token) {
          const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
          if (userError) {
            console.error('Auth state change user error:', userError);
            set({ user: null, loading: false });
            return;
          }

          const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user?.id)
            .eq('is_withdrawn', false)
            .single();

          if (userDataError || !userData) {
            console.error('Auth state change user data error:', userDataError);
            await supabase.auth.signOut();
            set({ user: null, loading: false });
            return;
          }

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

  signUp: async (email, password, userData) => {
    try {
      set({ loading: true, error: null });

      // Create a new user account in Supabase authentication
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        throw new Error('Failed to register. Please try again.');
      }

      if (!data.user) {
        throw new Error('User registration failed.');
      }

      // Store additional user information in the 'users' table
      const { data: newUserData, error: userInsertError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email,
          child_birth_year: userData.child_birth_year,
          child_birth_month: userData.child_birth_month,
          full_name: userData.full_name || null,
          nickname: userData.nickname || null,
          address: userData.address || null,
          phone: userData.phone || null,
          is_withdrawn: false
        }]);

      if (userInsertError) {
        console.error('User data insertion error:', userInsertError);
        await supabase.auth.signOut(); // If data insertion fails, sign the user out
        throw new Error('Registration failed. Please try again.');
      }

      set({ user: data.user, loading: false });
    } catch (error: any) {
      console.error('Sign up process error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      // Clear any existing session first
      await supabase.auth.signOut();

      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('is_withdrawn')
        .eq('email', email)
        .single();

      if (existingUser?.is_withdrawn) {
        throw new Error('このアカウントは退会済みです。新規登録が必要です。');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        if (error.message === 'Invalid login credentials') {
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('ログインに失敗しました');
      }

      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .eq('is_withdrawn', false)
        .single();

      if (userDataError || !userData) {
        console.error('User data fetch error after login:', userDataError);
        await supabase.auth.signOut();
        throw new Error('このアカウントは退会済みです。新規登録が必要です。');
      }

      set({ user: data.user, loading: false });
    } catch (error: any) {
      console.error('Sign in process error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },



  signOut: async () => {
  try {
    set({ loading: true, error: null });

    // Ensure Supabase signOut function is called
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to log out. Please try again.');
    }

    // Clear the user state after signing out
    set({ user: null, loading: false });

  } catch (error: any) {
    console.error('Sign out process error:', error);
    set({ error: error.message, loading: false });
    throw error;
  }
}




  // ... 他のメソッドは変更なし
}));

// Initialize auth state
useAuth.getState().initialize();