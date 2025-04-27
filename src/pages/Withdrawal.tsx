import { AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotToast } from '../components/Toaster';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';


export const Withdrawal: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleWithdrawal = async () => {
    if (!user) return;

    if (confirmText !== '退会します') {
      setMessage('確認文が正しくありません');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // エッジ関数を呼び出してユーザーを完全に削除
      const { data, error } = await supabase.functions.invoke('complete-user-deletion', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('ユーザー削除エラー:', error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error('ユーザー削除に失敗しました');
      }

      // ローカルのセッションをクリアしてログアウト
      await signOut();
      // 5. ローカルストレージのクリア
      localStorage.clear();
      sessionStorage.clear();

      // 6. 成功メッセージを表示してログインページにリダイレクト
      HotToast.success('退会処理が完了しました。ご利用ありがとうございました。');

      // ログインページにリダイレクト
      navigate('/login?withdrawal_complete=true');
    } catch (error: any) {
      console.error('退会処理エラー:', error);
      setMessage(`エラー: アカウントの削除に失敗しました。お手数ですが、サポートまでお問い合わせください。`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">退会</h2>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-gray-800">退会時の注意事項：</h3>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              <li>• アカウントを削除すると、すべてのデータが完全に削除されます</li>
              <li>• 一度削除したデータは復元できません</li>
              <li>• 退会後に再登録する場合は、新規登録が必要です</li>
              <li>• サブスクリプションの停止とは異なり、退会ではすべてのデータが削除されます</li>
            </ul>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-md mb-6 bg-red-50 text-red-700">
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            確認のため「退会します」と入力してください
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleWithdrawal}
            disabled={loading || confirmText !== '退会します'}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? '処理中...' : '退会する'}
          </button>
        </div>
      </div>
    </div>
  );
};