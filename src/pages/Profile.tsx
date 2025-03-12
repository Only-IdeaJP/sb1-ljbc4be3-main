
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    email: '',
    child_birth_year: '',
    child_birth_month: '',
  });

  // Function to fetch user profile
  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, child_birth_year, child_birth_month')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data || {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    }
  };

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
      await fetchProfile(); // ✅ Refetch data to get latest values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        {/* Email Field */}
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

        {/* Birth Year & Month Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">お子様の生年月</label>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <select
              name="child_birth_year"
              value={profile.child_birth_year}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">年を選択</option>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}年
                </option>
              ))}
            </select>
            <select
              name="child_birth_month"
              value={profile.child_birth_month}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">月を選択</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>
                  {i + 1}月
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
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
