import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FAQS } from "../../constant/Constant";

export const FAQ: React.FC = () => {
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
        {FAQS.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Q. {faq.question}
            </h3>
            <p className="text-gray-600">A. {faq.answer}</p>
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
