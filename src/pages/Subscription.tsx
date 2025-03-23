import { CheckCircle2, CreditCard, Timer } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const Subscription: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTrialPeriod = async () => {
      if (!user) return;

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const createdDate = new Date(userData.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(7 - diffDays, 0);

        setTrialDaysLeft(daysLeft);

        // トライアル期間が終了している場合、支払いページにリダイレクト
        if (daysLeft === 0) {
          window.location.href = 'https://square.link/u/BLnKKWoH';
        }
      } catch (error) {
        console.error('Error checking trial period:', error);
      }
    };

    checkTrialPeriod();
  }, [user]);

  return (
    <div className="p-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900">プラン申込</h2>
        <p className="mt-2 text-gray-600">現在のご利用状況とプラン内容をご確認いただけます</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {trialDaysLeft !== null && trialDaysLeft > 0 && (
          <div className="mb-6 flex items-center justify-between bg-blue-50 rounded-lg p-4">
            <div className="flex items-center text-blue-800">
              <Timer className="w-5 h-5 mr-2" />
              <span>無料トライアル期間残り: {trialDaysLeft}日</span>
            </div>
            <button
              onClick={() => navigate('/withdrawal')}
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              合格プランには申し込まない
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">合格プラン(1GBまで)</h3>
            <span className="text-2xl font-bold text-gray-900">
              ￥4,546<span className="text-sm font-normal">/月（税抜）</span>
            </span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p>1GBまでのデータ保存</p>
                <p className="text-xs text-gray-500">※1枚200KBのペーパーが約5,000枚分</p>
              </div>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p>最適ドリルの自動生成</p>
                <p className="text-xs text-gray-500">
                  ※不正解だった問題は、最後のペーパー演習日からの経過日数に応じて、次の間隔で復習が設定されます：
                  3日未満: 1日後、3-6日: 3日後、7-29日: 7日後、30日以上: 30日後
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <a
              href="https://square.link/u/BLnKKWoH"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              プランに加入する
            </a>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>ご注意：</strong><br />
            • 1週間の無料トライアル期間が終了すると、自動的に月額5,000円（税込）の課金が開始されます<br />
            • すべてのお客さまは、毎回支払い後に自動送信されるメールからサブスクリプションをキャンセルできます。サブスクリプションがキャンセルされると、お客さま宛に確認メールが送信されます。<br />
            • 月の途中での解約による日割り返金はできません
          </p>
        </div>
      </div>
    </div>
  );
};