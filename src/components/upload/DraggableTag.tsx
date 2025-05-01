// src/components/upload/DraggableTag.tsx
import { Tag as TagIcon } from "lucide-react";
import React, { useEffect } from "react";
import { TAG_COLORS, TagStyle } from "../../constant/Constant";

interface DraggableTagProps {
    tag: string;
    onClick?: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
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
    onDragEnd,
    className = "",
}) => {
    // タグ用の色を直接TAG_COLORSから取得
    const tagStyle: TagStyle =
        TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;

    /**
     * ドラッグ開始ハンドラ
     */
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        // ドラッグデータをセット
        e.dataTransfer.setData("tag", tag);

        // デバッグ情報
        console.log(`Drag started for tag: ${tag}`);
        console.log("DataTransfer effectAllowed:", e.dataTransfer.effectAllowed);
        e.dataTransfer.effectAllowed = "copy";

        // フィードバック画像のカスタマイズ
        if (e.dataTransfer.setDragImage) {
            const tagEl = e.currentTarget.cloneNode(true) as HTMLElement;
            tagEl.style.position = "absolute";
            tagEl.style.top = "-1000px";
            tagEl.style.opacity = "0.8";
            document.body.appendChild(tagEl);

            e.dataTransfer.setDragImage(tagEl, 10, 10);

            setTimeout(() => {
                document.body.removeChild(tagEl);
            }, 0);
        }

        // ドラッグ開始時のクラスを追加
        document.body.classList.add("tag-dragging");

        onDragStart?.();
    };

    /**
     * ドラッグ終了ハンドラ
     */
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        console.log(`Drag ended for tag: ${tag}`);
        console.log("Drag result:", e.dataTransfer.dropEffect);

        document.body.classList.remove("tag-dragging");

        onDragEnd?.();
    };

    // コンポーネントのアンマウント時にクラスを削除
    useEffect(() => {
        return () => {
            document.body.classList.remove("tag-dragging");
        };
    }, []);

    return (
        <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${tagStyle.bg} ${tagStyle.text} ${tagStyle.hoverBg} border ${tagStyle.border} cursor-pointer transition-colors transform hover:scale-105 ${className}`}
            onClick={onClick}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <TagIcon className="w-3.5 h-3.5 mr-1.5" />
            {tag}
        </div>
    );
};

export default DraggableTag;
