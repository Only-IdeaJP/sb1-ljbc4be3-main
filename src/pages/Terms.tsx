import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { TERMS_CONTENT } from "../constant/Constant";

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        トップページに戻る
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

      <div className="prose prose-indigo max-w-none">
        {TERMS_CONTENT.map(({ title, content, list }, index) => (
          <section key={index} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {title}
            </h2>
            {content.map((p, i) => (
              <p key={i} className="text-gray-600 mb-4">
                {p}
              </p>
            ))}
            {list && (
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                {list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};
