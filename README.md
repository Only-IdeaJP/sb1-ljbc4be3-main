# ペーパー管理くん

![ロゴ](public/images/pelican-logo2.png)

## 📝 概要

**ペーパー管理くん**は、お子様の学習をサポートするためのペーパー（問題プリント）管理システムです。ITの力で親子の時間を作り、子どもの忘却リズムに沿って最適な問題を構成するアルゴリズムにより、効率的な学習をサポートします。

## ✨ 特徴

- **かんたんアップロード**: PDFやJPEG形式の問題をドラッグ＆ドロップするだけで簡単にアップロードできます
- **最適な問題セット**: お子様の学習状況に合わせて、20枚前後の最適な問題セットを自動生成します
- **Web上で丸付け**: スマートフォンやタブレットからでも簡単に丸付けができ、結果は自動で記録されます
- **忘却曲線に基づく復習**: 間違えた問題は、子どもの忘却曲線に沿ったタイミングで表示されます
- **プライバシー保護**: アップロードした問題は他のユーザーがアクセスできないため、安心してご利用いただけます

## 🔧 システム要件

- Node.js 18.x 以上
- npm 8.x 以上
- Supabase アカウント

## 🚀 セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/your-username/paper-management.git
cd paper-management
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env` ファイルを作成し、以下の変数を設定します：

```
VITE_SUPABASE_URL=あなたのSupabaseプロジェクトURL
VITE_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
VITE_SUPABASE_SERVICE_KEY=あなたのSupabaseサービスキー
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:5173` で実行されます。

## 📂 プロジェクト構造

```
src/
├── app/                    # アプリケーションのコア
├── components/             # 再利用可能なUIコンポーネント
│   ├── common/             # ヘッダー、フッターなど
│   ├── form/               # フォーム関連コンポーネント
│   ├── ui/                 # 基本的なUIコンポーネント
│   └── upload/             # アップロード関連コンポーネント
├── features/               # 機能別モジュール
│   ├── auth/               # 認証関連
│   ├── papers/             # ペーパー管理
│   ├── practice/           # 演習機能
│   └── grade/              # 採点機能
├── hooks/                  # カスタムフック
├── lib/                    # ライブラリ統合
├── pages/                  # ページコンポーネント
├── services/               # APIサービス
├── store/                  # 状態管理
├── types/                  # TypeScript型定義
└── utils/                  # ユーティリティ関数
```

## 📊 主な機能

### 問題のアップロード

PDFやJPEG形式の問題をアップロードし、科目やレベルなどのタグを付けて整理できます。

### 問題の管理

アップロードした問題を一覧で確認、検索、フィルタリングできます。タグ別に整理して、効率的に管理できます。

### 演習問題の作成

お子様の学習状況に合わせて、最適な演習問題セットを自動で生成します。タグや難易度でカスタマイズも可能です。

### 採点機能

Web上で簡単に採点ができます。間違えた問題は自動的に復習リストに追加されます。

### 復習システム

子どもの忘却曲線に基づいて、最適なタイミングで復習問題を表示します。効率的な記憶定着をサポートします。

## 🏷️ タグシステム

問題の整理や検索を効率化するために、様々なタグを利用できます：

- **科目タグ**: 国語、算数、理科、社会
- **スキルタグ**: 未測量、位置表象、数、図形、言語、推理、記憶、論理
- **その他**: 理科的常識、社会的常識、その他

## 🔐 認証とセキュリティ

- メールアドレスとパスワードによる安全な認証
- Row Level Security (RLS) によるデータ分離
- ユーザーごとのデータアクセス制限

## 📱 レスポンシブデザイン

スマートフォン、タブレット、デスクトップなど、さまざまなデバイスに対応したレスポンシブデザインを採用しています。

## 🤝 貢献について

プロジェクトへの貢献をご希望の方は、以下の手順に従ってください：

1. リポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。

## 📞 お問い合わせ

ご質問やご意見がございましたら、[support@mrpapermanagement.com](mailto:support@mrpapermanagement.com) までお気軽にご連絡ください。
