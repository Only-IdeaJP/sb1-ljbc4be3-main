import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: 'サービスの利用料金はいくらですか？',
      answer: '月額4,546円（税抜）です。1週間の無料トライアル期間がございます。'
    },
    {
      question: '無料トライアル期間中に解約できますか？',
      answer: 'はい、無料トライアル期間中であれば、料金は一切発生せずに解約できます。'
    },
    {
      question: 'アップロードできるファイル形式は？',
      answer: 'JPEGとPDFファイルに対応しています。'
    },
    {
      question: 'アップロードした問題は他のユーザーに見られますか？',
      answer: 'いいえ、アップロードした問題は他のユーザーが閲覧・使用することはできません。'
    },
    {
      question: '復習のタイミングはカスタマイズできますか？',
      answer: '今後のアップデートでカスタマイズ機能の追加を検討しています。ご要望があれば、お問い合わせください。'
    },
    {
      question: '対応しているブラウザは？',
      answer: '最新版のGoogle Chrome、Firefox、Safari、Microsoft Edgeに対応しています。'
    },
    {
      question: 'データのバックアップは可能ですか？',
      answer: 'すべてのデータは自動的にクラウドに保存され、バックアップされています。'
    },
    {
      question: '複数の子どもの問題を管理できますか？',
      answer: '現在は1アカウントにつき1人の子どもの管理となっています。複数人の管理機能は今後のアップデートで追加予定です。'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          トップページに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">よくある質問</h1>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Q. {faq.question}
            </h3>
            <p className="text-gray-600">
              A. {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          その他のご質問がございましたら、お気軽にお問い合わせください。
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          お問い合わせはこちら
        </Link>
      </div>
    </div>
  );
};