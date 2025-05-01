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
    // タグ色の取得
    const tagStyle: TagStyle =
        TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;

    /* ────────────── Drag handlers ────────────── */
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("tag", tag);
        e.dataTransfer.effectAllowed = "copy";

        // カスタム drag image
        if (e.dataTransfer.setDragImage) {
            const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
            ghost.style.position = "absolute";
            ghost.style.top = "-1000px";
            ghost.style.opacity = "0.85";
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 12, 12);
            setTimeout(() => document.body.removeChild(ghost), 0);
        }

        document.body.classList.add("tag-dragging");
        onDragStart?.();
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        document.body.classList.remove("tag-dragging");
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
