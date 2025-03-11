import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { COMMERCE_CONTENT } from "../../constant/Constant";

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

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        特定商取引法に基づく表記
      </h1>

      <div className="space-y-8">
        {COMMERCE_CONTENT.map(({ title, table, content }, index) => (
          <section key={index} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {title}
            </h2>
            {table && (
              <table className="w-full text-gray-600">
                <tbody>
                  {table.map(({ label, value }, i) => (
                    <tr key={i} className="border-b">
                      <th className="py-3 text-left w-1/3">{label}</th>
                      <td className="py-3">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {content && (
              <div className="space-y-4 text-gray-600">
                {content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};
