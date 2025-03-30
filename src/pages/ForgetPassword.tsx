// src/pages/ForgetPassword.tsx
import { ArrowLeft, Mail, Send } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HotToast } from "../components/Toaster";
import { EmailService } from "../services/email.service";

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError("メールアドレスを入力してください");
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError("有効なメールアドレスを入力してください");
      setLoading(false);
      return;
    }

    try {
      const result = await EmailService.sendPasswordResetEmail(email);

      if (!result.success) {
        // ユーザー存在チェックのエラーを適切に処理
        if (!result.userExists) {
          throw new Error("このメールアドレスは登録されていません。");
        } else {
          throw new Error(result.error);
        }
      }

      // メール送信が成功したら、フィードバックを表示
      setSubmitted(true);
      HotToast.success("パスワードリセット用のメールを送信しました");
    } catch (err: any) {
      setError(err.message || "パスワードリセットメールの送信に失敗しました");
      HotToast.error(err.message || "エラーが発生しました");

      // エラーの場合もsubmittedは変更しない（falseのまま）
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          ログイン画面に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            パスワードをお忘れですか？
          </h1>
          {!submitted ? (
            <p className="text-gray-600 mt-2">
              アカウント登録時のメールアドレスを入力してください。パスワード再設定用のリンクをメールでお送りします。
            </p>
          ) : (
            <p className="text-gray-600 mt-2">
              パスワードリセット用のメールを送信しました。メールに記載されたリンクをクリックして、パスワードを再設定してください。
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
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
        ) : (
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ログイン画面に戻る
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない場合は、
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              新規登録
            </Link>
            してください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;