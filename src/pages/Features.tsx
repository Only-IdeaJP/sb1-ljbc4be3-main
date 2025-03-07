import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Printer, Edit3, RefreshCcw, Lock, Brain, Clock, Shield, Sparkles, Users, ArrowLeft } from 'lucide-react';

export const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Upload,
      title: 'かんたんアップロード',
      description: 'PDFやJPEGファイルをドラッグ＆ドロップでアップロード。面倒な作業は一切ありません。'
    },
    {
      icon: Printer,
      title: '最適な問題セット',
      description: '20枚前後の最適な問題セットを自動生成。お子様の学習状況に合わせて問題を選択します。'
    },
    {
      icon: Edit3,
      title: 'Web上で丸付け',
      description: 'スマートフォンやタブレットからでも簡単に丸付けができます。結果は自動で記録されます。'
    },
    {
      icon: RefreshCcw,
      title: '忘却曲線に基づく復習',
      description: '間違えた問題は、子どもの忘却曲線に沿ったタイミングで表示されます。'
    },
    {
      icon: Lock,
      title: 'プライバシー保護',
      description: 'アップロードした問題は他のユーザーからアクセスできません。安心してご利用いただけます。'
    }
  ];

  const additionalFeatures = [
    {
      icon: Brain,
      title: 'AIによる問題分析',
      description: 'お子様の得意・不得意を分析し、効率的な学習をサポートします。'
    },
    {
      icon: Clock,
      title: '時間の有効活用',
      description: '問題の選択や進捗管理の手間を削減し、お子様との大切な時間を確保できます。'
    },
    {
      icon: Shield,
      title: 'セキュアな環境',
      description: 'データは暗号化して安全に保管。プライバシーを厳重に守ります。'
    },
    {
      icon: Sparkles,
      title: '定期的なアップデート',
      description: 'ユーザーの声を反映し、継続的に機能改善を行っています。'
    },
    {
      icon: Users,
      title: '充実したサポート',
      description: '困ったときはチャットやメールでお気軽にご相談ください。'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          トップページに戻る
        </Link>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">特徴</h1>
        <p className="text-xl text-gray-600">
          ITの力で親子の時間を作る、新しい学習管理システム
        </p>
      </div>

      {/* メイン機能 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
        {mainFeatures.map((feature, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
              <feature.icon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* 追加機能 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {additionalFeatures.map((feature, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                  <feature.icon className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          to="/contact"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          お問い合わせはこちら
        </Link>
      </div>
    </div>
  );
};