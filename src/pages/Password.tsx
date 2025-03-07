{/* Password.tsxの修正 - パスワード要件の説明と検証を更新 */}
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const Password: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validatePassword = (password: string) => {
    const isLongEnough = password.length >= 8;
    const isAscii = /^[\x00-\x7F]*$/.test(password);
    return {
      isValid: isLongEnough && isAscii,
      errors: {
        length: !isLongEnough,
        ascii: !isAscii
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('エラー: パスワードが一致しません');
      setLoading(false);
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      let errorMessage = 'エラー: パスワードは以下の条件を満たす必要があります：\n';
      if (validation.errors.length) errorMessage += '- 8文字以上\n';
      if (validation.errors.ascii) errorMessage += '- 半角英数字記号のみ使用可能\n';
      
      setMessage(errorMessage);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage('パスワードを更新しました');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">パスワード変更</h2>
      
      {message && (
        <div className={`p-4 rounded-md mb-6 ${
          message.startsWith('エラー') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          <pre className="whitespace-pre-wrap font-sans">{message}</pre>
        </div>
      )}

      <div className="mb-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">パスワード要件：</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 8文字以上</li>
          <li>• 半角英数字記号のみ使用可能</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">新しいパスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="8文字以上の半角英数記号"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">新しいパスワード（確認）</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="もう一度入力してください"
          />
        </div>

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