// src/constant/Constant.ts

import {
    Brain,
    Clock,
    Edit3,
    Lock,
    Printer,
    RefreshCcw,
    Shield,
    Sparkles,
    Upload,
    Users,
} from "lucide-react";

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


export const DEFAULT_TAGS = [
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
];

export const TAG_STYLES: Record<string, string> = {
    未測量: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    位置表象: "bg-red-100 text-red-800 hover:bg-red-200",
    数: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    図形: "bg-green-100 text-green-800 hover:bg-green-200",
    言語: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    推理: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    記憶: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    論理: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    理科的常識: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    社会的常識: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    その他: "bg-teal-100 text-teal-800 hover:bg-teal-200",
};

export const getTagStyle = (tag: string): string =>
    TAG_STYLES[tag];

// ナビゲーションリンク
export const NAV_LINKS = [
    { to: "/", label: "ホーム" },
    { to: "/all", label: "全ページ管理" },
    { to: "/practice", label: "ペーパー演習" },
    { to: "/grade", label: "丸付け" },
    { to: "/upload", label: "問題アップロード" },
];

// フッターリンク
export const FOOTER_LINKS = [
    { to: "/faq", label: "よくある質問" },
    { to: "/features", label: "特徴" },
    { to: "/contact", label: "お問い合わせ" },
    { to: "/terms", label: "利用規約" },
    { to: "/privacy", label: "個人情報保護方針" },
    { to: "/commerce", label: "特定商取引法表示" },
];

export const FAQS = [
    {
        question: "サービスの利用料金はいくらですか？",
        answer: "月額4,546円（税抜）です。1週間の無料トライアル期間がございます。",
    },
    {
        question: "無料トライアル期間中に解約できますか？",
        answer:
            "はい、無料トライアル期間中であれば、料金は一切発生せずに解約できます。",
    },
    {
        question: "アップロードできるファイル形式は？",
        answer: "JPEGとPDFファイルに対応しています。",
    },
    {
        question: "アップロードした問題は他のユーザーに見られますか？",
        answer:
            "いいえ、アップロードした問題は他のユーザーが閲覧・使用することはできません。",
    },
    {
        question: "復習のタイミングはカスタマイズできますか？",
        answer:
            "今後のアップデートでカスタマイズ機能の追加を検討しています。ご要望があれば、お問い合わせください。",
    },
    {
        question: "対応しているブラウザは？",
        answer:
            "最新版のGoogle Chrome、Firefox、Safari、Microsoft Edgeに対応しています。",
    },
    {
        question: "データのバックアップは可能ですか？",
        answer:
            "すべてのデータは自動的にクラウドに保存され、バックアップされています。",
    },
    {
        question: "複数の子どもの問題を管理できますか？",
        answer:
            "現在は1アカウントにつき1人の子どもの管理となっています。複数人の管理機能は今後のアップデートで追加予定です。",
    },
];
export const Main_Features = [
    {
        icon: Upload,
        title: "かんたんアップロード",
        description:
            "PDFやJPEGファイルをドラッグ＆ドロップでアップロード。面倒な作業は一切ありません。",
    },
    {
        icon: Printer,
        title: "最適な問題セット",
        description:
            "20枚前後の最適な問題セットを自動生成。お子様の学習状況に合わせて問題を選択します。",
    },
    {
        icon: Edit3,
        title: "Web上で丸付け",
        description:
            "スマートフォンやタブレットからでも簡単に丸付けができます。結果は自動で記録されます。",
    },
    {
        icon: RefreshCcw,
        title: "忘却曲線に基づく復習",
        description:
            "間違えた問題は、子どもの忘却曲線に沿ったタイミングで表示されます。",
    },
    {
        icon: Lock,
        title: "プライバシー保護",
        description:
            "アップロードした問題は他のユーザーからアクセスできません。安心してご利用いただけます。",
    },
];
export const ADDITONAL_FEATURES = [
    {
        icon: Brain,
        title: "AIによる問題分析",
        description: "お子様の得意・不得意を分析し、効率的な学習をサポートします。",
    },
    {
        icon: Clock,
        title: "時間の有効活用",
        description:
            "問題の選択や進捗管理の手間を削減し、お子様との大切な時間を確保できます。",
    },
    {
        icon: Shield,
        title: "セキュアな環境",
        description: "データは暗号化して安全に保管。プライバシーを厳重に守ります。",
    },
    {
        icon: Sparkles,
        title: "定期的なアップデート",
        description: "ユーザーの声を反映し、継続的に機能改善を行っています。",
    },
    {
        icon: Users,
        title: "充実したサポート",
        description: "困ったときはチャットやメールでお気軽にご相談ください。",
    },
];
export const TERMS_CONTENT = [
    {
        title: "第1条（適用）",
        content: [
            "本規約は、小学校受験ペーパー管理くん（以下「本サービス」）の利用に関する条件を定めるものです。",
        ],
    },
    {
        title: "第2条（利用登録）",
        content: [
            "1. 本サービスの利用を希望する者は、本規約に同意の上、所定の方法によって利用登録を申請するものとします。",
            "2. 利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります：",
        ],
        list: [
            "虚偽の事項を届け出た場合",
            "本規約に違反したことがある者からの申請である場合",
            "その他、利用登録を相当でないと判断した場合",
        ],
    },
    {
        title: "第3条（アカウント情報の管理）",
        content: [
            "1. 利用者は、自己の責任において、本サービスのアカウント情報を適切に管理するものとします。",
            "2. アカウント情報の管理不十分、使用上の過誤、第三者の使用等によって生じた損害に関する責任は利用者が負うものとし、本サービスは一切の責任を負いません。",
        ],
    },
    {
        title: "第4条（禁止事項）",
        content: [
            "利用者は、本サービスの利用にあたり、以下の行為をしてはなりません：",
        ],
        list: [
            "法令または公序良俗に違反する行為",
            "犯罪行為に関連する行為",
            "本サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為",
            "本サービスの運営を妨害するおそれのある行為",
            "他の利用者に関する個人情報等を収集または蓄積する行為",
            "不正アクセスをし、またはこれを試みる行為",
            "他の利用者に成りすます行為",
            "本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為",
        ],
    },
    {
        title: "第5条（本サービスの提供の停止等）",
        content: [
            "以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができます：",
        ],
        list: [
            "本サービスにかかるコンピュータシステムの保守点検または更新を行う場合",
            "地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合",
            "コンピュータまたは通信回線等が事故により停止した場合",
            "その他、本サービスの提供が困難と判断した場合",
        ],
    },
    {
        title: "第6条（利用制限および登録抹消）",
        content: [
            "以下の場合には、事前の通知なく、利用者に対して、本サービスの全部もしくは一部の利用を制限し、または利用者としての登録を抹消することができます：",
        ],
        list: [
            "本規約のいずれかの条項に違反した場合",
            "登録事項に虚偽の事実があることが判明した場合",
            "料金等の支払債務の不履行があった場合",
            "その他、本サービスの利用を適当でないと判断した場合",
        ],
    },
    {
        title: "第7条（退会）",
        content: [
            "利用者は、所定の退会手続により、本サービスから退会できるものとします。",
        ],
    },
    {
        title: "第8条（保証の否認および免責事項）",
        content: [
            "1. 本サービスは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。",
            "2. 本サービスに起因して利用者に生じたあらゆる損害について一切の責任を負いません。",
        ],
    },
    {
        title: "第9条（サービス内容の変更等）",
        content: [
            "利用者に通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによって利用者に生じた損害について一切の責任を負いません。",
        ],
    },
    {
        title: "第10条（利用規約の変更）",
        content: [
            "必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができます。なお、本規約の変更後、本サービスの利用を開始した場合には、当該利用者は変更後の規約に同意したものとみなします。",
        ],
    },
    {
        title: "第11条（個人情報の取扱い）",
        content: [
            "本サービスの利用によって取得する個人情報については、プライバシーポリシーに従い適切に取り扱うものとします。",
        ],
    },
    {
        title: "第12条（通知または連絡）",
        content: [
            "利用者と本サービスとの間の通知または連絡は、本サービスの定める方法によって行うものとします。本サービスは、利用者から、本サービスが別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時に利用者へ到達したものとみなします。",
        ],
    },
    {
        title: "第13条（権利義務の譲渡の禁止）",
        content: [
            "利用者は、本サービスの書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。",
        ],
    },
    {
        title: "第14条（準拠法・裁判管轄）",
        content: [
            "1. 本規約の解釈にあたっては、日本法を準拠法とします。",
            "2. 本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。",
        ],
    },
];

export const PRIVACY_CONTENT = [
    {
        title: "1. 個人情報の取り扱いについて",
        content: [
            "当社は、お客様の個人情報を適切に取り扱うことが重要な責務であると認識し、以下の方針に基づき個人情報の保護に努めます。",
        ],
    },
    {
        title: "2. 収集する個人情報",
        content: ["当社が収集する個人情報は以下の通りです："],
        list: [
            "氏名",
            "メールアドレス",
            "住所",
            "電話番号",
            "お子様の生年月",
            "サービス利用履歴",
            "その他サービス提供に必要な情報",
        ],
    },
    {
        title: "3. 個人情報の利用目的",
        content: ["収集した個人情報は、以下の目的で利用いたします："],
        list: [
            "サービスの提供・運営",
            "お客様サポート",
            "サービスの改善・新機能の開発",
            "お知らせやメールマガジンの配信",
            "利用規約や法令に違反する行為への対応",
        ],
    },
    {
        title: "4. 個人情報の管理",
        content: [
            "当社は、個人情報の漏洩、滅失、毀損等を防止するため、適切なセキュリティ対策を実施します。",
        ],
        list: [
            "アクセス制御による不正アクセスの防止",
            "SSL暗号化通信の使用",
            "定期的なセキュリティ監査の実施",
        ],
    },
    {
        title: "5. 個人情報の第三者提供",
        content: [
            "当社は、以下の場合を除き、お客様の同意なく個人情報を第三者に提供いたしません：",
        ],
        list: [
            "法令に基づく場合",
            "人の生命、身体または財産の保護のために必要な場合",
            "公衆衛生の向上または児童の健全な育成の推進のために特に必要な場合",
        ],
    },
    {
        title: "6. 個人情報の開示・訂正・削除",
        content: [
            "お客様ご自身の個人情報の開示・訂正・削除をご希望の場合は、お問い合わせフォームよりご連絡ください。",
        ],
    },
    {
        title: "7. プライバシーポリシーの変更",
        content: [
            "当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本ウェブサイトに掲載した時点から効力を生じるものとします。",
        ],
    },
    {
        title: "8. お問い合わせ",
        content: [
            "個人情報の取り扱いに関するお問い合わせは、お問い合わせフォームよりご連絡ください。",
        ],
    },
];
export const COMMERCE_CONTENT = [
    {
        title: "販売事業者",
        table: [
            { label: "事業者名", value: "自宅学習支援すみれスクール" },
            { label: "所在地", value: "〒108-0072 東京都港区白金1-17-1" },
        ],
    },
    {
        title: "サービス内容",
        table: [
            { label: "サービス名", value: "小学校受験ペーパー管理くん" },
            { label: "サービス価格", value: "月額4,546円（税抜）" },
            {
                label: "支払方法",
                value:
                    "Squareによるクレジットカード決済（VISA, MasterCard, JCB, American Express, Diners Club）",
            },
        ],
    },
    {
        title: "お支払いについて",
        table: [
            { label: "支払時期", value: "毎月1日に当月分を請求" },
            { label: "無料期間", value: "初回登録から7日間" },
            {
                label: "解約・退会",
                value: "マイページより随時可能。日割り返金はございません。",
            },
        ],
    },
    {
        title: "お問い合わせ",
        table: [
            { label: "受付方法", value: "メールフォーム" },
            {
                label: "受付時間",
                value: "平日10:00〜18:00（土日祝日・年末年始を除く）",
            },
            { label: "メールアドレス", value: "support@mrpapermanagement.com" },
        ],
    },
    {
        title: "その他",
        content: [
            "・当サービスは、お客様のご都合による返品・返金はお受けできません。",
            "・サービスの利用開始後は、お客様のご都合による中途解約の場合でも、日割り返金等は行いません。",
            "・当サービスに関するお客様の個人情報は、プライバシーポリシーに従って適切に取り扱います。",
        ],
    },
];