import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export const Password: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // パスワードのバリデーション
  const validation = useMemo(() => {
    if (!password) return { isValid: false, errors: { empty: true } };

    const isLongEnough = password.length >= 8;
    const isAscii = /^[\x00-\x7F]*$/.test(password);

    return {
      isValid: isLongEnough && isAscii,
      errors: {
        length: !isLongEnough,
        ascii: !isAscii,
      },
    };
  }, [password]);

  // 確認用パスワードのバリデーション
  const confirmValidation = useMemo(() => {
    if (!confirmPassword) return { isValid: false, errors: { empty: true } };

    const matches = password === confirmPassword;

    return {
      isValid: matches,
      errors: {
        mismatch: !matches,
      },
    };
  }, [password, confirmPassword]);

  // 全体のバリデーション
  const isFormValid = useMemo(() => {
    return validation.isValid && confirmValidation.isValid && password.length > 0 && confirmPassword.length > 0;
  }, [validation.isValid, confirmValidation.isValid, password, confirmPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      setPasswordTouched(true);
      setConfirmPasswordTouched(true);

      // フォームが有効でない場合は処理を中止
      if (!isFormValid) {
        setLoading(false);
        setMessage("入力内容に問題があります。修正してください。");
        return;
      }

      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error; // エラーがあれば処理を中止

        setMessage("パスワードを更新しました");
        toast.success("✅ パスワードが更新されました");
        setPassword("");
        setConfirmPassword("");
        setPasswordTouched(false);
        setConfirmPasswordTouched(false);
      } catch (error: any) {
        toast.error(`❌ エラー: ${error.message}`);
        setMessage(`エラー: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [password, confirmPassword, isFormValid]
  );

  // パスワード更新成功のイベントリスナー
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "USER_UPDATED") {
        toast.success("✅ パスワードが更新されました");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // エラーメッセージの生成
  const getErrorMessages = useCallback(() => {
    const errors = [];

    // パスワードのエラー
    if (passwordTouched) {
      if (!password) {
        errors.push("• パスワードを入力してください");
      } else {
        if (validation.errors.length) errors.push("• パスワードは8文字以上必要です");
        if (validation.errors.ascii) errors.push("• パスワードは半角英数字記号のみ使用可能です");
      }
    }

    // 確認用パスワードのエラー
    if (confirmPasswordTouched && password && confirmPassword && !confirmValidation.isValid) {
      errors.push("• パスワードが一致しません");
    }

    return errors;
  }, [password, confirmPassword, passwordTouched, confirmPasswordTouched, validation, confirmValidation]);

  const errorMessages = getErrorMessages();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        パスワード変更
      </h2>

      {message && (
        <div
          className={`p-4 rounded-md mb-6 ${message.startsWith("エラー")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
            }`}
        >
          <pre className="whitespace-pre-wrap font-sans">{message}</pre>
        </div>
      )}

      <div className="mb-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          パスワード要件：
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 8文字以上</li>
          <li>• 半角英数字記号のみ使用可能</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            新しいパスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 ${passwordTouched && !validation.isValid
                ? "border-red-500"
                : "focus:border-indigo-500"
              }`}
            placeholder="8文字以上の半角英数記号"
          />
          {/* フィールドレベルのバリデーションエラーは表示せず、下部のコンテナにまとめる */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            新しいパスワード（確認）
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setConfirmPasswordTouched(true)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 ${confirmPasswordTouched &&
                password &&
                confirmPassword &&
                password !== confirmPassword
                ? "border-red-500"
                : "focus:border-indigo-500"
              }`}
            placeholder="もう一度入力してください"
          />
          {/* フィールドレベルのバリデーションエラーは表示せず、下部のコンテナにまとめる */}
        </div>

        {/* エラーメッセージの表示 - すべてのエラーを表示 */}
        {errorMessages.length > 0 && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {errorMessages.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "更新中..." : "更新する"}
          </button>
        </div>
      </form>
    </div>
  );
};