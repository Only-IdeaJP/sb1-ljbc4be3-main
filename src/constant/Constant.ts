// src/constant/Constant.ts

// タグの型定義
export type TagName =
    | "未測量"
    | "位置表象"
    | "数"
    | "図形"
    | "言語"
    | "推理"
    | "記憶"
    | "論理"
    | "理科的常識"
    | "社会的常識"
    | "その他"
    | "default";

// タグスタイルの型定義
export interface TagStyle {
    bg: string;
    text: string;
    hoverBg: string;
    border: string;
}

// タグの色設定の定義
export const TAG_COLORS: Record<TagName, TagStyle> = {
    "未測量": {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        hoverBg: "hover:bg-indigo-200",
        border: "border-indigo-200"
    },
    "位置表象": {
        bg: "bg-red-100",
        text: "text-red-800",
        hoverBg: "hover:bg-red-200",
        border: "border-red-200"
    },
    "数": {
        bg: "bg-green-100",
        text: "text-green-800",
        hoverBg: "hover:bg-green-200",
        border: "border-green-200"
    },
    "図形": {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        hoverBg: "hover:bg-yellow-200",
        border: "border-yellow-200"
    },
    "言語": {
        bg: "bg-blue-100",
        text: "text-blue-800",
        hoverBg: "hover:bg-blue-200",
        border: "border-blue-200"
    },
    "推理": {
        bg: "bg-purple-100",
        text: "text-purple-800",
        hoverBg: "hover:bg-purple-200",
        border: "border-purple-200"
    },
    "記憶": {
        bg: "bg-pink-100",
        text: "text-pink-800",
        hoverBg: "hover:bg-pink-200",
        border: "border-pink-200"
    },
    "論理": {
        bg: "bg-orange-100",
        text: "text-orange-800",
        hoverBg: "hover:bg-orange-200",
        border: "border-orange-200"
    },
    "理科的常識": {
        bg: "bg-teal-100",
        text: "text-teal-800",
        hoverBg: "hover:bg-teal-200",
        border: "border-teal-200"
    },
    "社会的常識": {
        bg: "bg-cyan-100",
        text: "text-cyan-800",
        hoverBg: "hover:bg-cyan-200",
        border: "border-cyan-200"
    },
    "その他": {
        bg: "bg-gray-100",
        text: "text-gray-800",
        hoverBg: "hover:bg-gray-200",
        border: "border-gray-200"
    },
    // デフォルトカラー
    "default": {
        bg: "bg-gray-100",
        text: "text-gray-800",
        hoverBg: "hover:bg-gray-200",
        border: "border-gray-200"
    }
};


/**
 * タグの色スタイルを取得する関数
 * @param tag タグ名
 * @returns タグの色スタイル設定オブジェクト
 */
export const getTagStyle = (tag: string): TagStyle => {
    return TAG_COLORS[tag as TagName] || TAG_COLORS.default;
};

// デフォルトのタグ一覧
export const DEFAULT_TAGS: TagName[] = [
    "未測量",
    "位置表象",
    "数",
    "図形",
    "言語",
    "推理",
    "記憶",
    "論理",
    "理科的常識",
    "社会的常識",
    "その他",
    "default",
];

// ナビゲーションリンク
export const NAV_LINKS = [
    { to: "/", label: "ホーム" },
    { to: "/upload", label: "アップロード" },
    { to: "/all", label: "全ページ管理" },
    { to: "/practice", label: "ペーパー演習" },
    { to: "/grade", label: "丸付け" }
];

// フッターリンク
export const FOOTER_LINKS = [
    { to: "/terms", label: "利用規約" },
    { to: "/privacy", label: "プライバシーポリシー" },
    { to: "/commerce", label: "特定商取引法に基づく表記" },
    { to: "/faq", label: "よくある質問" },
    { to: "/features", label: "特徴" },
    { to: "/contact", label: "お問い合わせ" }
];

// よくある質問（FAQ）
export const FAQS = [
    {
        question: "「ペーパー管理くん」とはどのようなサービスですか？",
        answer: "小学校受験のペーパー学習をデジタル管理するサービスです。PDFや画像をアップロードし、タグ付けすることで、子どもの忘却曲線に基づいた復習最適化ができます。"
    },
    {
        question: "無料体験はありますか？",
        answer: "はい、1週間の無料トライアル期間があります。すべての機能を試していただくことができます。無料トライアル期間終了後は、自動的に月額プランに移行します。"
    },
    {
        question: "料金はいくらですか？",
        answer: "月額4,546円（税抜）となっております。決済はクレジットカードのみとなります。"
    },
    {
        question: "どのようなファイル形式に対応していますか？",
        answer: "現在、JPGとPDF形式のファイルに対応しています。"
    },
    {
        question: "アップロードしたデータは他の人に見られますか？",
        answer: "いいえ、あなたがアップロードしたデータは他のユーザーが閲覧・使用することはできません。各ユーザーごとに独立したデータ管理を行っています。"
    }
];

// そのほかの定数も同様に定義...