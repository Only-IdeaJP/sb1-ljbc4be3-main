import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Terms: React.FC = () => {
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

      <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

      <div className="prose prose-indigo max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
          <p className="text-gray-600 mb-4">
            本規約は、小学校受験ペーパー管理くん（以下「本サービス」）の利用に関する条件を定めるものです。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第2条（利用登録）</h2>
          <p className="text-gray-600 mb-4">
            1. 本サービスの利用を希望する者は、本規約に同意の上、所定の方法によって利用登録を申請するものとします。
          </p>
          <p className="text-gray-600 mb-4">
            2. 利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります：
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>虚偽の事項を届け出た場合</li>
            <li>本規約に違反したことがある者からの申請である場合</li>
            <li>その他、利用登録を相当でないと判断した場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（アカウント情報の管理）</h2>
          <p className="text-gray-600 mb-4">
            1. 利用者は、自己の責任において、本サービスのアカウント情報を適切に管理するものとします。
          </p>
          <p className="text-gray-600 mb-4">
            2. アカウント情報の管理不十分、使用上の過誤、第三者の使用等によって生じた損害に関する責任は利用者が負うものとし、本サービスは一切の責任を負いません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（禁止事項）</h2>
          <p className="text-gray-600 mb-4">
            利用者は、本サービスの利用にあたり、以下の行為をしてはなりません：
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他の利用者に成りすます行為</li>
            <li>本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（本サービスの提供の停止等）</h2>
          <p className="text-gray-600 mb-4">
            以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします：
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
            <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、本サービスの提供が困難と判断した場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（利用制限および登録抹消）</h2>
          <p className="text-gray-600 mb-4">
            以下の場合には、事前の通知なく、利用者に対して、本サービスの全部もしくは一部の利用を制限し、または利用者としての登録を抹消することができるものとします：
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>本規約のいずれかの条項に違反した場合</li>
            <li>登録事項に虚偽の事実があることが判明した場合</li>
            <li>料金等の支払債務の不履行があった場合</li>
            <li>その他、本サービスの利用を適当でないと判断した場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（退会）</h2>
          <p className="text-gray-600 mb-4">
            利用者は、所定の退会手続により、本サービスから退会できるものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（保証の否認および免責事項）</h2>
          <p className="text-gray-600 mb-4">
            1. 本サービスは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
          </p>
          <p className="text-gray-600 mb-4">
            2. 本サービスに起因して利用者に生じたあらゆる損害について一切の責任を負いません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（サービス内容の変更等）</h2>
          <p className="text-gray-600 mb-4">
            利用者に通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによって利用者に生じた損害について一切の責任を負いません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（利用規約の変更）</h2>
          <p className="text-gray-600 mb-4">
            必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該利用者は変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第11条（個人情報の取扱い）</h2>
          <p className="text-gray-600 mb-4">
            本サービスの利用によって取得する個人情報については、プライバシーポリシーに従い適切に取り扱うものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第12条（通知または連絡）</h2>
          <p className="text-gray-600 mb-4">
            利用者と本サービスとの間の通知または連絡は、本サービスの定める方法によって行うものとします。本サービスは、利用者から、本サービスが別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時に利用者へ到達したものとみなします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第13条（権利義務の譲渡の禁止）</h2>
          <p className="text-gray-600 mb-4">
            利用者は、本サービスの書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">第14条（準拠法・裁判管轄）</h2>
          <p className="text-gray-600 mb-4">
            1. 本規約の解釈にあたっては、日本法を準拠法とします。
          </p>
          <p className="text-gray-600 mb-4">
            2. 本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </div>
    </div>
  );
};