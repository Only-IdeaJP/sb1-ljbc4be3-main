// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// セッションストレージキー
const STORAGE_KEY = 'paper-management-auth';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: STORAGE_KEY, // カスタムストレージキーを設定
    storage: localStorage  // 明示的にlocalStorageを使用
  },
  global: {
    headers: {
      'X-Client-Info': 'exam-paper-management',
      // エラー発生時にタイムスタンプを含める
      'X-Client-Timestamp': new Date().toISOString()
    }
  },
  db: {
    schema: 'public'
  }
  // デバッグオプションは削除されました - SupabaseClientOptionsに存在しないため
});

// セッション状態の監視を設定 - ただしタブ切り替えによる偽のSIGNED_OUTイベントを無視する機能を追加
supabase.auth.onAuthStateChange((event, session) => {
  // タブ切り替えによる偽のSIGNED_OUTイベントの場合は処理をスキップ
  if (event === 'SIGNED_OUT' && document.visibilityState !== 'visible') {
    console.log('Ignoring SIGNED_OUT event during tab visibility change');
    return;
  }

  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.id);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});

// visibility変更を監視してセッショントークンを保持
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // タブが表示状態になったときにセッション状態を確認するが、
    // 強制的な再取得は行わない
    console.log('Tab visibility changed to visible, checking session');
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        console.log('Session exists during visibility change');
      }
    });
  }
});