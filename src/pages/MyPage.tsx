import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { UserCircle, Key, CreditCard, UserX, LogOut } from "lucide-react";
import { Profile } from "./Profile";
import { Password } from "./Password";
import { Subscription } from "./Subscription";
import { Withdrawal } from "./Withdrawal";
import { useAuth } from "../hooks/useAuth";

export const MyPage: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout =  () => {
    console.log("handleLogout called");
    try {
    signOut();
      console.log("signOut completed successfully");

      // Ensure state updates before navigation
      setTimeout(() => {
        console.log("Navigating to login...");
        navigate("/login");
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* サイドナビゲーション */}
        <div className="md:col-span-1">
          <nav className="space-y-2">
            <Link
              to="/mypage/profile"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              <span>プロフィール変更</span>
            </Link>
            <Link
              to="/mypage/password"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Key className="h-5 w-5" />
              <span>パスワード変更</span>
            </Link>
            <Link
              to="/mypage/subscription"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              <span>プラン申込・変更</span>
            </Link>
            <div className="border-t border-gray-200 my-4"></div>
            <Link
              to="/mypage/withdrawal"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserX className="h-5 w-5" />
              <span>退会</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>ログアウト</span>
            </button>
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/password" element={<Password />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
