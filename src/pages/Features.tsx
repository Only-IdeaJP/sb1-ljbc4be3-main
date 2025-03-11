import React from "react";
import { Link } from "react-router-dom";
import { ADDITONAL_FEATURES, Main_Features } from "../../constant/Constant";
import { ArrowLeft } from "lucide-react";

// Reusable Feature Card Component
const FeatureCard: React.FC<{
  feature: { icon: React.ElementType; title: string; description: string };
}> = ({ feature: { icon: Icon, title, description } }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export const Features: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          トップページに戻る
        </Link>
      </div>

      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">特徴</h1>
        <p className="text-xl text-gray-600">
          ITの力で親子の時間を作る、新しい学習管理システム
        </p>
      </div>

      {/* メイン機能 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
        {Main_Features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </div>

      {/* 追加機能 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ADDITONAL_FEATURES.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </div>

      {/* Contact Link */}
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
