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
 *  – タグごとに色分け
 *  – ドラッグ＆ドロップ機能
 */
const DraggableTag: React.FC<DraggableTagProps> = ({
    tag,
    onClick,
    onDragStart,
    onDragEnd,
    className = "",
}) => {
    // タグ色を取得
    const tagStyle: TagStyle =
        TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;

    /* ────────────── Drag handlers ────────────── */
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        // ドラッグデータをセット
        e.dataTransfer.setData("tag", tag);

        // デバッグ情報
        console.log(`Drag started for tag: ${tag}`);
        console.log("DataTransfer effectAllowed:", e.dataTransfer.effectAllowed);
        e.dataTransfer.effectAllowed = "copy";

        // カスタム drag image
        if (e.dataTransfer.setDragImage) {
            const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
            ghost.style.position = "absolute";
            ghost.style.top = "-1000px";
            ghost.style.opacity = "0.8";
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 10, 10);
            setTimeout(() => document.body.removeChild(ghost), 0);
        }

        // ドラッグ開始時のクラスを追加
        document.body.classList.add("tag-dragging");

        // 親への通知
        onDragStart?.();
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        // デバッグ情報
        console.log(`Drag ended for tag: ${tag}`);
        console.log("Drag result:", e.dataTransfer.dropEffect);

        // クラスを除去
        document.body.classList.remove("tag-dragging");

        // 親への通知
        onDragEnd?.();
    };

    // アンマウント時に必ずクリーンアップ
    useEffect(() => {
        return () => {
            document.body.classList.remove("tag-dragging");
        };
    }, []);

    /* ────────────── JSX ────────────── */
    return (
        <div
            draggable
            onClick={onClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  text-sm font-medium select-none
                  border transition-transform duration-150 ease-in-out
                  hover:scale-105 active:scale-95
                  ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border} ${tagStyle.hoverBg}
                  cursor-pointer ${className}`}
        >
            <TagIcon size={14} aria-hidden="true" />
            {tag}
        </div>
    );
};

export default DraggableTag;
