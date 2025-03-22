// pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { ChildBirthSelector } from '../components/form/ChildBirthSelector';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    email: '',
    child_birth_year: null as number | null,
    child_birth_month: null as number | null,
  });

  // プロフィール情報を取得する関数
  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, child_birth_year, child_birth_month')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // データがnullの場合の対応
      setProfile({
        email: data?.email || '',
        child_birth_year: data?.child_birth_year || null,
        child_birth_month: data?.child_birth_month || null,
      });
    } catch (error: any) {
      console.error('プロフィール情報の読み込みエラー:', error.message);
    }
  };

  // コンポーネントマウント時にプロフィール情報を取得
  useEffect(() => {
    fetchProfile();
  }, [user]);

  // 年の変更ハンドラ
  const handleYearChange = (year: number | null) => {
    setProfile(prev => ({ ...prev, child_birth_year: year }));
  };

  // 月の変更ハンドラ
  const handleMonthChange = (month: number | null) => {
    setProfile(prev => ({ ...prev, child_birth_month: month }));
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          child_birth_year: profile.child_birth_year,
          child_birth_month: profile.child_birth_month,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage('プロフィールを更新しました');
      await fetchProfile(); // 最新の値を再取得
    } catch (error: any) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">プロフィール変更</h2>

      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.startsWith('エラー') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* メールアドレス（変更不可） */}
        <div>
          <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-not-allowed"
          />
          <p className="mt-1 text-sm text-gray-500">メールアドレスは変更できません</p>
        </div>

        {/* お子様の生年月選択 */}
        <ChildBirthSelector
          birthYear={profile.child_birth_year}
          birthMonth={profile.child_birth_month}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
        />

        {/* 送信ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? '更新中...' : '更新する'}
          </button>
        </div>
      </form>
    </div>
  );
};