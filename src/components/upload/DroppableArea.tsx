// src/components/upload/DroppableArea.tsx
import { TagIcon } from "lucide-react";
import React, { useState } from "react";

interface DroppableAreaProps {
    id: string;
    onDrop: (id: string, tag: string) => void;
    children: React.ReactNode;
    className?: string;
}

/**
 * ドロップ可能エリアコンポーネント
 * タグがドロップできるエリアを提供
 */
const DroppableArea: React.FC<DroppableAreaProps> = ({
    id,
    onDrop,
    children,
    className = "",
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    /**
     * ドラッグオーバーハンドラ
     */
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // タグをドロップ可能に
        if (e.dataTransfer.types.includes('tag')) {
            setIsDragOver(true);
        }
    };

    /**
     * ドラッグリーブハンドラ
     */
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    /**
     * ドロップハンドラ
     */
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        // デバッグ情報
        console.log('Drop event detected');
        console.log('Data transfer types:', e.dataTransfer.types);

        // ドロップされたタグを取得
        const tag = e.dataTransfer.getData('tag');
        console.log('Dropped tag:', tag);

        if (tag) {
            // デバッグ情報
            console.log(`Calling onDrop with id=${id}, tag=${tag}`);
            onDrop(id, tag);
        }
    };

    return (
        <div
            className={`${className} ${isDragOver ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''} transition-all`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {children}

            {/* ドラッグオーバー時のオーバーレイ表示 */}
            {isDragOver && (
                <div className="absolute inset-0 bg-indigo-100 bg-opacity-40 flex items-center justify-center pointer-events-none z-10">
                    <div className="bg-white rounded-lg shadow-lg p-3 animate-pulse flex items-center">
                        <TagIcon className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-indigo-700 font-medium">タグをドロップ</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DroppableArea;