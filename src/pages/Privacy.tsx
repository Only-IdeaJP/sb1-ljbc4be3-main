import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">個人情報保護方針</h1>

      <div className="prose prose-indigo max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 個人情報の取り扱いについて</h2>
          <p className="text-gray-600 mb-4">
            当社は、お客様の個人情報を適切に取り扱うことが重要な責務であると認識し、以下の方針に基づき個人情報の保護に努めます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 収集する個人情報</h2>
          <p className="text-gray-600 mb-4">
            当社が収集する個人情報は以下の通りです：
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>氏名</li>
            <li>メールアドレス</li>
            <li>住所</li>
            <li>電話番号</li>
            <li>お子様の生年月</li>
            <li>サービス利用履歴</li>
            <li>その他サービス提供に必要な情報</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 個人情報の利用目的</h2>
          <p className="text-gray-600 mb-4">
            収集した個人情報は、以下の目的で利用いたします：
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>サービスの提供・運営</li>
            <li>お客様サポート</li>
            <li>サービスの改善・新機能の開発</li>
            <li>お知らせやメールマガジンの配信</li>
            <li>利用規約や法令に違反する行為への対応</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 個人情報の管理</h2>
          <p className="text-gray-600 mb-4">
            当社は、個人情報の漏洩、滅失、毀損等を防止するため、適切なセキュリティ対策を実施します。
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>アクセス制御による不正アクセスの防止</li>
            <li>SSL暗号化通信の使用</li>
            <li>定期的なセキュリティ監査の実施</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 個人情報の第三者提供</h2>
          <p className="text-gray-600 mb-4">
            当社は、以下の場合を除き、お客様の同意なく個人情報を第三者に提供いたしません：
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要な場合</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要な場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 個人情報の開示・訂正・削除</h2>
          <p className="text-gray-600 mb-4">
            お客様ご自身の個人情報の開示・訂正・削除をご希望の場合は、お問い合わせフォームよりご連絡ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. プライバシーポリシーの変更</h2>
          <p className="text-gray-600 mb-4">
            当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本ウェブサイトに掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. お問い合わせ</h2>
          <p className="text-gray-600 mb-4">
            個人情報の取り扱いに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
};