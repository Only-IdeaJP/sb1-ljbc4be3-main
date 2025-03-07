import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Commerce: React.FC = () => {
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

      <h1 className="text-3xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>

      <div className="space-y-8">
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">販売事業者</h2>
          <table className="w-full text-gray-600">
            <tbody>
              <tr className="border-b">
                <th className="py-3 text-left w-1/3">事業者名</th>
                <td className="py-3">自宅学習支援すみれスクール</td>
              </tr>
              <tr className="border-b">
                <th className="py-3 text-left">所在地</th>
                <td className="py-3">〒108-0072 東京都港区白金1-17-1</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">サービス内容</h2>
          <table className="w-full text-gray-600">
            <tbody>
              <tr className="border-b">
                <th className="py-3 text-left w-1/3">サービス名</th>
                <td className="py-3">小学校受験ペーパー管理くん</td>
              </tr>
              <tr className="border-b">
                <th className="py-3 text-left">サービス価格</th>
                <td className="py-3">月額4,546円（税抜）</td>
              </tr>
              <tr className="border-b">
                <th className="py-3 text-left">支払方法</th>
                <td className="py-3">Squareによるクレジットカード決済（VISA, MasterCard, JCB, American Express, Diners Club）</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">お支払いについて</h2>
          <table className="w-full text-gray-600">
            <tbody>
              <tr className="border-b">
                <th className="py-3 text-left w-1/3">支払時期</th>
                <td className="py-3">毎月1日に当月分を請求</td>
              </tr>
              <tr className="border-b">
                <th className="py-3 text-left">無料期間</th>
                <td className="py-3">初回登録から7日間</td>
              </tr>
              <tr className="border-b">
                <th className="py-3 text-left">解約・退会</th>
                <td className="py-3">マイページより随時可能。日割り返金はございません。</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">お問い合わせ</h2>
          <table className="w-full text-gray-600">
            <tbody>
              <tr className="border-b">
                <th className="py-3 text-left w-1/3">受付方法</th>
                <td className="py-3">メールフォーム</td>
              </tr>
              <tr className="border-b">
                <th className="py-3 text-left">受付時間</th>
                <td className="py-3">平日10:00〜18:00（土日祝日・年末年始を除く）</td>
              </tr>
              <tr className="border-b">
                <th className="py-3 text-left">メールアドレス</th>
                <td className="py-3">support@mrpapermanagement.com</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">その他</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              ・当サービスは、お客様のご都合による返品・返金はお受けできません。
            </p>
            <p>
              ・サービスの利用開始後は、お客様のご都合による中途解約の場合でも、日割り返金等は行いません。
            </p>
            <p>
              ・当サービスに関するお客様の個人情報は、プライバシーポリシーに従って適切に取り扱います。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};