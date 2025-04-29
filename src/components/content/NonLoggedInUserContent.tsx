/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CheckCircle2,
  CreditCard,
  Edit3,
  Lock,
  Printer,
  RefreshCcw,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";

const FeatureCard = ({
  icon: Icon,
  bgColor,
  iconColor,
  title,
  description,
}: {
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  title: string;
  description: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div
      className={`flex items-center justify-center w-12 h-12 ${bgColor} rounded-full mb-4`}
    >
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const PlanFeature = ({ text, subtext }: { text: string; subtext?: string }) => (
  <div className="flex items-start">
    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm text-gray-600">{text}</p>
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
  </div>
);

const NonLoggedInUserContent = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ITの力で親子の時間を作る
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          できる子がやっている勉強法＜子どもの忘却リズムに沿って最適な問題を構成するアルゴリズム＞により、ぐんぐん伸びる
        </p>
        {/* ログインページではなく新規登録フォームを表示するためにregisterパラメータを追加 */}
        <Link
          to="/login?register=true"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          1週間無料で始める
        </Link>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <FeatureCard
          icon={Upload}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          title="①デジタル化"
          description="ペーパー（PDFやJPG）を画像アップロード"
        />
        <FeatureCard
          icon={Printer}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          title="②問題作成"
          description="20枚前後で、今日最適なペーパーを作成！印刷できる"
        />
        <FeatureCard
          icon={Edit3}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          title="③丸付け"
          description="お子さんが解いたら、保護者さまが丸つけをWeb上で行う"
        />
        <FeatureCard
          icon={RefreshCcw}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          title="④復習"
          description="間違えた問題は、子どもの忘却曲線に沿ったタイミングで表示される"
        />
        <FeatureCard
          icon={Lock}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          title="⑤プライバシー"
          description="アップロードした問題は、他のユーザが閲覧・使用することはできません"
        />
      </div>

      {/* Pricing Section */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          料金プラン
        </h2>
        <div className="max-w-lg mx-auto border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              合格プラン(1GBまで)
            </h3>
            <span className="text-2xl font-bold text-gray-900">
              ￥4,546<span className="text-sm font-normal">/月（税抜）</span>
            </span>
          </div>
          <p className="text-sm text-indigo-600 font-medium mb-6">
            1週間の無料トライアル付き
          </p>
          <div className="space-y-4 mb-6">
            <PlanFeature
              text="1GBまでのデータ保存"
              subtext="※1枚200KBのペーパーが約5,000枚分"
            />
            <PlanFeature
              text="最適ドリルの自動生成"
              subtext="※不正解だった問題は、子どもの忘却曲線に沿ったタイミングで復習が設定されます"
            />
          </div>
          {/* こちらも新規登録フォームを表示するためのリンクを修正 */}
          <Link
            to="/login?register=true"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            1週間無料で始める
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NonLoggedInUserContent;