/* eslint-disable @typescript-eslint/ban-ts-comment */
// import React, { useState } from 'react';
// import { Send, AlertCircle, ArrowLeft } from 'lucide-react';
// import { Link } from 'react-router-dom';

// export const Contact: React.FC = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     subject: '',
//     message: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage(null);

//     try {
//       // メール送信処理
//       const emailBody = `
// 名前: ${formData.name}
// メールアドレス: ${formData.email}
// 件名: ${formData.subject}
// 内容:
// ${formData.message}
//       `;

//       // メールクライアントを開く
//       window.location.href = `mailto:support@mrpapermanagement.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;

//       setMessage({
//         type: 'success',
//         text: 'メールクライアントが開きます。メールを送信してください。'
//       });
//       setFormData({ name: '', email: '', subject: '', message: '' });
//     } catch (error) {
//       setMessage({
//         type: 'error',
//         text: 'エラーが発生しました。時間をおいて再度お試しください。'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-8">
//       <div className="mb-6">
//         <Link
//           to="/"
//           className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
//         >
//           <ArrowLeft className="w-4 h-4 mr-1" />
//           トップページに戻る
//         </Link>
//       </div>

//       <h1 className="text-3xl font-bold text-gray-900 mb-8">お問い合わせ</h1>

//       {message && (
//         <div className={`p-4 rounded-md mb-6 ${
//           message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
//         }`}>
//           <div className="flex">
//             <AlertCircle className="h-5 w-5 mr-2" />
//             {message.text}
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             お名前
//           </label>
//           <input
//             type="text"
//             required
//             value={formData.name}
//             onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             メールアドレス
//           </label>
//           <input
//             type="email"
//             required
//             value={formData.email}
//             onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             件名
//           </label>
//           <input
//             type="text"
//             required
//             value={formData.subject}
//             onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             お問い合わせ内容
//           </label>
//           <textarea
//             required
//             rows={6}
//             value={formData.message}
//             onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>

//         <div className="flex justify-end">
//           <button
//             type="submit"
//             disabled={loading}
//             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             {loading ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 送信中...
//               </>
//             ) : (
//               <>
//                 <Send className="w-4 h-4 mr-2" />
//                 送信する
//               </>
//             )}
//           </button>
//         </div>
//       </form>

//       <div className="mt-12 bg-gray-50 rounded-lg p-6">
//         <h2 className="text-lg font-medium text-gray-900 mb-4">
//           お問い合わせ先
//         </h2>
//         <div className="space-y-4 text-gray-600">
//           <p>
//             <strong>メールでのお問い合わせ：</strong><br />
//             support@mrpapermanagement.com
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState } from "react";
import { Send, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const emailBody = `名前: ${formData.name}\nメールアドレス: ${formData.email}\n件名: ${formData.subject}\n内容:\n${formData.message}`;
      window.location.href = `mailto:support@mrpapermanagement.com?subject=${encodeURIComponent(
        formData.subject
      )}&body=${encodeURIComponent(emailBody)}`;

      setMessage({
        type: "success",
        text: "メールクライアントが開きます。メールを送信してください。",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setMessage({
        type: "error",
        text: "エラーが発生しました。時間をおいて再度お試しください。",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          トップページに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">お問い合わせ</h1>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-md mb-6 ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            {message.text}
          </div>
        </div>
      )}

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          { label: "お名前", type: "text", name: "name" },
          { label: "メールアドレス", type: "email", name: "email" },
          { label: "件名", type: "text", name: "subject" },
        ].map(({ label, type, name }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type={type}
              name={name}
              required
              // @ts-ignore
              value={formData[name]}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            お問い合わせ内容
          </label>
          <textarea
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                送信中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                送信する
              </>
            )}
          </button>
        </div>
      </form>

      {/* Contact Info */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          お問い合わせ先
        </h2>
        <p className="text-gray-600">
          <strong>メールでのお問い合わせ：</strong>
          <br />
          support@mrpapermanagement.com
        </p>
      </div>
    </div>
  );
};

