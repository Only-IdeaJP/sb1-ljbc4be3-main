// src/pages/Password.tsx
import { AlertCircle, CheckCircle, Eye, EyeOff, Key, Shield } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { HotToast } from "../components/Toaster";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export const Password: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      setMessage(null);
      setPasswordTouched(true);
      setConfirmPasswordTouched(true);

      // フォームが有効でない場合は処理を中止
      if (!isFormValid) {
        setLoading(false);
        setMessage({
          type: "error",
          text: "入力内容に問題があります。修正してください。"
        });
        return;
      }

      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error; // エラーがあれば処理を中止

        setMessage({
          type: "success",
          text: "パスワードを更新しました"
        });
        HotToast.success("パスワードが更新されました");
        setPassword("");
        setConfirmPassword("");
        setPasswordTouched(false);
        setConfirmPasswordTouched(false);
      } catch (error: any) {
        console.error("パスワード更新エラー:", error);
        setMessage({
          type: "error",
          text: `エラー: ${error.message}`
        });
        HotToast.error("パスワードの更新に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [password, confirmPassword, isFormValid]
  );

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
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
          <Key className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">パスワード変更</h2>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md mb-6 flex items-start ${message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mb-6 bg-blue-50 rounded-lg p-4 flex items-start">
        <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            パスワード要件：
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 8文字以上</li>
            <li>• 半角英数字記号のみ使用可能</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            新しいパスワード
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${passwordTouched && !validation.isValid
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-indigo-500"
                }`}
              placeholder="8文字以上の半角英数記号"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${password && !validation.errors.length ? "bg-green-500" : "bg-gray-300"}`}
            ></div>
            <span className="text-xs text-gray-600">8文字以上</span>
          </div>
          <div className="mt-1 flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${password && !validation.errors.ascii ? "bg-green-500" : "bg-gray-300"}`}
            ></div>
            <span className="text-xs text-gray-600">半角英数字記号のみ</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            新しいパスワード（確認）
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmPasswordTouched(true)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${confirmPasswordTouched &&
                  password &&
                  confirmPassword &&
                  password !== confirmPassword
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-indigo-500"
                }`}
              placeholder="もう一度入力してください"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${confirmPassword && password && confirmValidation.isValid
                  ? "bg-green-500"
                  : "bg-gray-300"
                }`}
            ></div>
            <span className="text-xs text-gray-600">パスワードが一致</span>
          </div>
        </div>

        {/* エラーメッセージの表示 - すべてのエラーを表示 */}
        {errorMessages.length > 0 && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-200">
            {errorMessages.map((error, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{error.substring(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`px-4 py-2 rounded-md shadow-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading || !isFormValid
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
              } transition-all duration-200 flex items-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                更新中...
              </>
            ) : (
              "更新する"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};