// src/components/upload/DraggableTag.tsx
import { Tag as TagIcon } from "lucide-react";
import React from "react";

// タグの色設定
const TAG_COLORS: Record<string, { bg: string, text: string, hoverBg: string }> = {
    "算数": { bg: "bg-indigo-100", text: "text-indigo-800", hoverBg: "hover:bg-indigo-200" },
    "国語": { bg: "bg-red-100", text: "text-red-800", hoverBg: "hover:bg-red-200" },
    "理科": { bg: "bg-green-100", text: "text-green-800", hoverBg: "hover:bg-green-200" },
    "社会": { bg: "bg-yellow-100", text: "text-yellow-800", hoverBg: "hover:bg-yellow-200" },
    "英語": { bg: "bg-blue-100", text: "text-blue-800", hoverBg: "hover:bg-blue-200" },
    "プリント": { bg: "bg-purple-100", text: "text-purple-800", hoverBg: "hover:bg-purple-200" },
    "テスト": { bg: "bg-pink-100", text: "text-pink-800", hoverBg: "hover:bg-pink-200" },
    "宿題": { bg: "bg-orange-100", text: "text-orange-800", hoverBg: "hover:bg-orange-200" },
    "復習": { bg: "bg-teal-100", text: "text-teal-800", hoverBg: "hover:bg-teal-200" },
    "予習": { bg: "bg-cyan-100", text: "text-cyan-800", hoverBg: "hover:bg-cyan-200" },
    // デフォルトカラー
    "default": { bg: "bg-gray-100", text: "text-gray-800", hoverBg: "hover:bg-gray-200" }
};

interface DraggableTagProps {
    tag: string;
    onClick?: () => void;
    onDragStart?: () => void;
    className?: string;
}

/**
 * ドラッグ可能なタグコンポーネント
 * タグのドラッグ＆ドロップ機能を提供、タグごとに色分け
 */
const DraggableTag: React.FC<DraggableTagProps> = ({
    tag,
    onClick,
    onDragStart,
    className = "",
}) => {
    // タグ用の色を取得 (設定にない場合はデフォルト色を使用)
    const { bg, text, hoverBg } = TAG_COLORS[tag] || TAG_COLORS.default;

    /**
     * ドラッグ開始ハンドラ
     */
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        // ドラッグデータをセット
        e.dataTransfer.setData('tag', tag);

        // フィードバック画像のカスタマイズ
        if (e.dataTransfer.setDragImage) {
            // タグのクローンを作成
            const tagEl = e.currentTarget.cloneNode(true) as HTMLElement;
            tagEl.style.position = 'absolute';
            tagEl.style.top = '-1000px';
            tagEl.style.opacity = '0.8';
            document.body.appendChild(tagEl);

            // ドラッグ画像を設定
            e.dataTransfer.setDragImage(tagEl, 10, 10);

            // 遅延してクリーンアップ
            setTimeout(() => {
                document.body.removeChild(tagEl);
            }, 0);
        }

        if (onDragStart) {
            onDragStart();
        }
    };

    return (
        <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${bg} ${text} ${hoverBg} cursor-pointer transition-colors transform hover:scale-105 ${className}`}
            onClick={onClick}
            draggable
            onDragStart={handleDragStart}
        >
            <TagIcon className="w-3.5 h-3.5 mr-1.5" />
            {tag}
        </div>
    );
};

export default DraggableTag;