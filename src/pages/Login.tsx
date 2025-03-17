/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

// Validation Functions
const validateEmail = (email: string) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const validatePassword = (password: string) =>
  // eslint-disable-next-line no-control-regex
  password.length >= 8 && /^[\x00-\x7F]*$/.test(password);

// Error Message Component
const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
  const isSuccess = error.includes("作成しました");
  return (
    <div
      className={`rounded-md p-4 ${isSuccess ? "bg-green-50" : "bg-red-50"}`}
    >
      <div className="flex">
        <AlertCircle
          className={`h-5 w-5 ${isSuccess ? "text-green-400" : "text-red-400"}`}
        />
        <pre
          className={`ml-3 text-sm font-medium ${
            isSuccess ? "text-green-800" : "text-red-800"
          }`}
        >
          {error}
        </pre>
      </div>
    </div>
  );
};

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    child_birth_year: "",
    child_birth_month: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Clear error when form changes
  useEffect(() => {
    setError(""); // Reset error on any form change
  }, [formData.email, formData.password, formData.confirmPassword]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset any previous error

    // Start with a fresh validation object
    let validationErrors: string[] = [];

    // Validation
    if (!isLogin && !agreeToTerms) {
      validationErrors.push("利用規約に同意する必要があります");
    }

    if (!formData.email) {
      validationErrors.push("メールアドレスは必須です");
    } else if (!validateEmail(formData.email)) {
      validationErrors.push("メールアドレスの形式が正しくありません");
    }

    if (!formData.password) {
      validationErrors.push("パスワードは必須です");
    } else if (!validatePassword(formData.password)) {
      validationErrors.push(
        "パスワードは8文字以上の半角英数字記号で入力してください"
      );
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      validationErrors.push("パスワードが一致しません");
    }

    if (
      !isLogin &&
      (!formData.child_birth_year || !formData.child_birth_month)
    ) {
      validationErrors.push("すべての必須項目を入力してください");
    }

    // If any validation errors exist, stop the form submission
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      return;
    }

    setLoading(true); // Start loading state

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        navigate("/");
      } else {
        await signUp(formData.email, formData.password, {
          child_birth_year: formData.child_birth_year,
          child_birth_month: formData.child_birth_month,
          address: "",
          phone: "",
        });

        setError("アカウントを作成しました。ログインしてください。");
        setIsLogin(true);
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          child_birth_year: "",
          child_birth_month: "",
        });
      }
    } catch (err: any) {
      console.error("Auth error:", err);

      // Customize error messages for specific known errors
      if (err.message === "Invalid login credentials") {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else if (err.message.includes("User already registered")) {
        setError("このメールアドレスは既に登録されています");
      } else if (err.message.includes("Email not confirmed")) {
        setError(
          "メールアドレスの確認が完了していません。確認メールをご確認ください。"
        );
      } else {
        setError(err.message || "エラーが発生しました");
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleFormDataChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fadeIn">
        <div>
          <div className="mx-auto w-24 h-24 relative mb-4">
            <img
              src="/images/pelican-logo2.png"
              alt="小学校受験ペーパー管理くん"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "ログイン" : "新規登録"}
          </h2>
          {isLogin && (
            <p className="mt-2 text-center text-sm text-gray-600">
              アカウントをお持ちではありませんか？{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setFormData({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    child_birth_year: "",
                    child_birth_month: "",
                  });
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
              >
                無料登録はこちら
              </button>
            </p>
          )}
        </div>
        {error && <ErrorMessage error={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleFormDataChange("email", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="example@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleFormDataChange("password", e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10"
                  placeholder="8文字以上の半角英数字記号"
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
            </div>

            {!isLogin && (
              <>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    パスワード（確認）
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      // required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleFormDataChange("confirmPassword", e.target.value)
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10"
                      placeholder="もう一度入力してください"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="child_birth_year"
                    className="block text-sm font-medium text-gray-700"
                  >
                    お子様の生年
                  </label>
                  <input
                    id="child_birth_year"
                    name="child_birth_year"
                    type="text"
                    value={formData.child_birth_year}
                    onChange={(e) =>
                      handleFormDataChange("child_birth_year", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="例：2020"
                  />
                </div>

                <div>
                  <label
                    htmlFor="child_birth_month"
                    className="block text-sm font-medium text-gray-700"
                  >
                    お子様の生月
                  </label>
                  <input
                    id="child_birth_month"
                    name="child_birth_month"
                    type="text"
                    value={formData.child_birth_month}
                    onChange={(e) =>
                      handleFormDataChange("child_birth_month", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="例：5"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  ログイン状態を保持する
                </label>

                <div className="text-sm ms-3">
                  <a
                    href="/forget-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    パスワードをお忘れですか?
                  </a>
                </div>
              </div>

              {!isLogin && (
                <div className="flex items-center">
                  <input
                    id="agree-to-terms"
                    name="agree-to-terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={() => setAgreeToTerms(!agreeToTerms)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="agree-to-terms"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    利用規約に同意する
                  </label>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading && "cursor-not-allowed"
                }`}
              >
                {loading ? "処理中..." : isLogin ? "ログイン" : "登録"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
