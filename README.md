# 小学校受験ペーパー管理くん

[![ライセンス: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

小学校受験を準備するお子様のための練習問題ペーパーを管理するアプリケーションです。忘却曲線に基づいた復習タイミングを最適化する間隔反復学習アルゴリズムを使用しています。

## 主な機能

- 📝 **デジタル化**: ペーパー（PDFやJPG）を画像アップロード
- 🖨️ **最適な問題セット**: 20枚前後で、今日最適なペーパーを作成
- ✅ **Web上での丸付け**: スマートフォンやタブレットからでも簡単に丸付け
- 🔄 **忘却曲線に基づく復習**: 間違えた問題は、子どもの忘却曲線に沿ったタイミングで表示
- 🔒 **プライバシー保護**: アップロードした問題は他のユーザーからアクセス不可

## 技術スタック

- **フロントエンド**: React with TypeScript
- **スタイリング**: TailwindCSS
- **バックエンド**: Supabase (PostgreSQL, 認証, ストレージ)
- **デプロイ**: Netlify/Vercel

## プロジェクトアーキテクチャ

このプロジェクトはクリーンアーキテクチャパターンを採用し、関心の分離を強調しています：

```
src/
├── app/                    # アプリケーションのコア
│   ├── routes.tsx          # メインルーティング定義
│   └── App.tsx             # メインアプリケーションコンポーネント
├── assets/                 # 静的アセット（画像、フォントなど）
├── components/             # 再利用可能なUIコンポーネント
│   ├── common/             # 汎用コンポーネント（ヘッダー、フッターなど）
│   ├── form/               # フォーム関連コンポーネント
│   ├── layout/             # レイアウトコンポーネント
│   └── ui/                 # 基本的なUI要素
├── config/                 # アプリケーション設定
├── constants/              # アプリケーション定数
├── features/               # 機能モジュール
│   ├── auth/               # 認証関連
│   ├── papers/             # ペーパー管理
│   ├── practice/           # 練習セッション
│   ├── upload/             # アップロード機能
│   └── profile/            # ユーザープロファイル
├── hooks/                  # カスタムフック
├── lib/                    # 外部ライブラリアダプター
│   ├── supabase/           # Supabaseクライアント
│   └── pdf/                # PDF処理
├── models/                 # ドメインモデルとインターフェース
├── pages/                  # ページコンポーネント
├── services/               # API呼び出し用のサービスレイヤー
│   ├── auth.service.ts
│   ├── papers.service.ts
│   └── events.service.ts
├── store/                  # グローバル状態管理
├── types/                  # TypeScript型定義
└── utils/                  # ユーティリティ関数
```

## 始め方

### 前提条件

- Node.js 16.x以上
- npmまたはyarn
- Supabaseアカウント

### 環境設定

ルートディレクトリに以下の変数を含む`.env`ファイルを作成してください：

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key (オプション、サーバー関数用)
```

### インストール

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/paper-management-app.git
cd paper-management-app
```

2. 依存関係のインストール
```bash
npm install
# または
yarn
```

3. 開発サーバーの起動
```bash
npm run dev
# または
yarn dev
```

4. アプリケーションは http://localhost:3000 で実行されているはずです

### データベースセットアップ

データベースマイグレーションはルートディレクトリのSQLファイルにあります。これらを順番にSupabaseプロジェクトに適用してください。

## デプロイ

### 本番用ビルド

```bash
npm run build
# または
yarn build
```

### Netlify/Vercelへのデプロイ

1. コードをGitリポジトリにプッシュ
2. Netlify/Vercelアカウントをリポジトリに接続
3. ビルドコマンドを`npm run build`または`yarn build`に設定
4. 公開ディレクトリを`dist`に設定
5. Netlify/Vercelダッシュボードで環境変数を追加

## プロジェクト構造ガイドライン

- **コンポーネント**: 1ファイルに1コンポーネント、機能ごとに整理
- **フック**: ロジックの再利用のためのカスタムフック
- **サービス**: APIとの対話レイヤー
- **モデル**: データ構造のためのTypeScriptインターフェース

## コーディング規約

- **命名規則**:
  - コンポーネント: PascalCase
  - 関数/変数: camelCase
  - ファイル名: ケバブケース
- **型安全性**:
  - `any`型を避ける
  - インターフェースを適切に定義する
- **コード品質**:
  - ESLintとPrettierを使用
  - 単一責任の原則に従う

## 貢献方法

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## ライセンス

このプロジェクトはMITライセンスの下で公開されています - 詳細はLICENSEファイルをご覧ください。

## 謝辞

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Vite](https://vitejs.dev/)