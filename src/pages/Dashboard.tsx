import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  BarChart3, 
  BookOpen, 
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Database,
  Tag as TagIcon,
  TrendingUp,
  UserPlus,
  CheckCircle,
  Clock,
  Shield,
  CreditCard,
  Upload,
  Printer,
  Edit3,
  RefreshCcw,
  Lock
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: papers, error: papersError } = await supabase
          .from('papers')
          .select('*')
          .eq('user_id', user.id);

        if (papersError) throw papersError;

        const reviewDue = papers?.filter(p => 
          p.next_practice_date && new Date(p.next_practice_date) <= new Date()
        ).length || 0;

        const totalStorageKB = (papers?.length || 0) * 200;

        const tagDistribution: { [key: string]: number } = {};
        papers?.forEach(paper => {
          paper.tags?.forEach(tag => {
            tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
          });
        });

        const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(date.getDate() + 1);
          
          return {
            date: date.toISOString().split('T')[0],
            count: papers?.filter(p => 
              p.last_practiced && 
              new Date(p.last_practiced) >= date &&
              new Date(p.last_practiced) < nextDate
            ).length || 0
          };
        }).reverse();

        const recentActivity = papers
          ?.filter(p => p.last_practiced)
          .map(p => ({
            id: p.id,
            type: p.is_correct ? 'grade' : 'practice',
            timestamp: p.last_practiced
          }))
          .sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 5);

        setStats({
          totalPapers: papers?.length || 0,
          correctRate: papers?.filter(p => p.is_correct).length / (papers?.length || 1) * 100,
          reviewDue,
          totalStorageKB,
          tagDistribution,
          weeklyProgress,
          recentActivity: recentActivity || []
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-16">
        {/* ヒーローセクション */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ITの力で親子の時間を作る
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            できる子がやっている勉強法＜子どもの忘却リズムに沿って最適な問題を構成するアルゴリズム＞により、ぐんぐん伸びる
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            1週間無料で始める
          </Link>
        </div>

        {/* 特徴セクション */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ①デジタル化
            </h3>
            <p className="text-gray-600">
              ペーパー（PDFやJPG）を画像アップロード
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Printer className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ②問題作成
            </h3>
            <p className="text-gray-600">
              20枚前後で、今日最適なペーパーを作成！印刷できる
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Edit3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ③丸付け
            </h3>
            <p className="text-gray-600">
              お子さんが解いたら、保護者さまが丸つけをWeb上で行う
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <RefreshCcw className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ④復習
            </h3>
            <p className="text-gray-600">
              間違えた問題は、子どもの忘却曲線に沿ったタイミングで表示される
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
              <Lock className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ⑤プライバシー
            </h3>
            <p className="text-gray-600">
              アップロードした問題は、他のユーザが閲覧・使用することはできません
            </p>
          </div>
        </div>

        {/* 料金セクション */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            料金プラン
          </h2>
          <div className="max-w-lg mx-auto">
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">合格プラン(1GBまで)</h3>
                <span className="text-2xl font-bold text-gray-900">￥4,546<span className="text-sm font-normal">/月（税抜）</span></span>
              </div>
              <div className="mb-6">
                <p className="text-sm text-indigo-600 font-medium">1週間の無料トライアル付き</p>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">1GBまでのデータ保存</p>
                    <p className="text-xs text-gray-500">※1枚200KBのペーパーが約5,000枚分</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">最適ドリルの自動生成</p>
                    <p className="text-xs text-gray-500">
                      ※不正解だった問題は、子どもの忘却曲線に沿ったタイミングで復習が設定されます
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/login"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                1週間無料で始める
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
      </div>

      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総問題数</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalPapers}<span className="text-base ml-1">ページ</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総データ量</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalStorageKB.toLocaleString()}<span className="text-base ml-1">KB</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">復習予定</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.reviewDue}<span className="text-base ml-1">ページ</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* グラフと分析 */}
      <div className="grid grid-cols-1 gap-6">
        {/* 週間進捗 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <TrendingUp className="w-5 h-5 inline-block mr-2 text-indigo-600" />
            週間進捗
          </h3>
          <div className="h-64">
            <div className="flex h-full items-end space-x-2">
              {stats?.weeklyProgress.map(({ date, count }) => (
                <div key={date} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-indigo-100 rounded-t"
                    style={{ 
                      height: `${Math.max(count / 20 * 100, 5)}%`,
                      transition: 'height 0.3s ease-in-out'
                    }}
                  />
                  <div className="mt-2 text-xs text-gray-500 rotate-45 origin-left">
                    {new Date(date).toLocaleDateString('ja-JP', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <BrainCircuit className="w-5 h-5 inline-block mr-2 text-indigo-600" />
            最近のアクティビティ
          </h3>
          <div className="space-y-4">
            {stats?.recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  activity.type === 'grade' 
                    ? 'bg-green-100' 
                    : activity.type === 'practice'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                }`}>
                  {activity.type === 'grade' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : activity.type === 'practice' ? (
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  ) : (
                    <TagIcon className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'grade' 
                      ? '問題を採点しました'
                      : activity.type === 'practice'
                        ? '問題を演習しました'
                        : '問題をアップロードしました'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};