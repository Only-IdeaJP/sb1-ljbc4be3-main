import { Link } from "react-router-dom";
import { NAV_LINKS } from "../../constant/Constant";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
  const { user } = useAuth();

  return (

    <header className="bg-white shadow-sm">
      <div className="no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            {/* Logo & Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-20 h-20 flex items-center justify-center">
                  <img
                    src="/images/pelican-logo2.png"
                    alt="ロゴ"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ペーパー管理くん
                </h1>
              </div>

              {/* User Info & Authentication */}
              <div className="flex items-center space-x-6">
                <p className="text-sm text-gray-600">
                  今日最適な20枚を自動生成する。親子にハグするゆとりを。
                </p>
                <Link
                  to={user ? "/mypage/profile" : "/login"}
                  className="text-gray-600 hover:text-indigo-600 flex items-center space-x-2"
                >
                  <span>{user ? "マイページ" : "ログイン"}</span>
                </Link>
              </div>
            </div>

            {/* Navigation Menu */}
            {user && (
              <nav className="flex items-center space-x-6">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>        </div>
    </header>
  );
};

export default Header;
