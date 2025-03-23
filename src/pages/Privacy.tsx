import React from "react";
import { PRIVACY_CONTENT } from "../constant/Constant";

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        個人情報保護方針
      </h1>

      <div className="prose prose-indigo max-w-none">
        {PRIVACY_CONTENT.map(({ title, content, list }, index) => (
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
