// src/app/App.tsx
import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import { useAuth } from "../hooks/useAuth";
import { AppRoutes } from "./routes";

/**
 * アプリケーションのメインコンポーネント
 * ルーティングやレイアウトを定義
 */
const App: React.FC = () => {
    const { initialize } = useAuth();

    // アプリ起動時に認証状態を初期化
    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <AppRoutes />
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;