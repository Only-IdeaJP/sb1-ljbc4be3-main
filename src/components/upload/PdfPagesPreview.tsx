// src/components/upload/PdfPagesPreview.tsx
import { ChevronLeft, ChevronRight, TagIcon, X } from "lucide-react";
import React, { useState } from "react";
import { DEFAULT_TAGS, TAG_COLORS } from "../../constant/Constant";
import DroppableArea from "./DroppableArea";
interface PdfPage {
    id: string;
    index: number;
    imageData?: string;
    tags: string[];
}

interface PdfPagesPreviewProps {
    fileId: string;
    filename: string;
    pages: PdfPage[];
    uploading: boolean;
    uploaded: boolean;
    onRemoveTag: (fileId: string, pageId: string, tag: string) => void;
    onApplyTag: (fileId: string, pageId: string, tag: string) => void;
    onApplyTagToAllPages?: (tag: string) => void; // タグを全ページに適用するオプション
    disableControls?: boolean;
}

/**
 * PDFの各ページをプレビューするコンポーネント
 * 各ページに個別のタグ付けが可能
 */
const PdfPagesPreview: React.FC<PdfPagesPreviewProps> = ({
    fileId,
    filename,
    pages,
    uploading,
    uploaded,
    onRemoveTag,
    onApplyTag,
    onApplyTagToAllPages,
    disableControls = false
}) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const currentPage = pages[currentPageIndex] || null;

    // 前のページに移動
    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        }
    };

    // 次のページに移動
    const goToNextPage = () => {
        if (currentPageIndex < pages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        }
    };

    // ページがない場合は何も表示しない
    if (!currentPage) {
        return null;
    }

    // 現在のページにタグを適用
    const applyTagToCurrentPage = (tag: string) => {
        if (!currentPage.tags.includes(tag)) {
            onApplyTag(fileId, currentPage.id, tag);
        }
    };

    // タグを全ページに適用
    const handleApplyTagToAllPages = (tag: string) => {
        if (onApplyTagToAllPages) {
            onApplyTagToAllPages(tag);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-gray-50 shadow-sm transition-shadow hover:shadow">
            {/* ファイル名とページナビゲーション */}
            <div className="flex items-center justify-between bg-gray-100 p-2 border-b">
                <h4 className="font-medium text-gray-900 truncate" title={filename}>
                    {filename} ({currentPageIndex + 1}/{pages.length})
                </h4>
                <div className="flex space-x-2">
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPageIndex === 0 || disableControls}
                        className="p-1 rounded-full bg-white shadow-sm disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPageIndex === pages.length - 1 || disableControls}
                        className="p-1 rounded-full bg-white shadow-sm disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* ページプレビュー */}
            <DroppableArea
                id={currentPage.id}
                onDrop={(_, tag) => applyTagToCurrentPage(tag)} // 現在のページにのみタグを適用
                className="relative"
            >
                <div className="relative h-48 bg-gray-200">
                    {currentPage.imageData ? (
                        <img
                            src={currentPage.imageData}
                            alt={`Page ${currentPage.index}`}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <span className="text-gray-400">ページデータなし</span>
                        </div>
                    )}

                    {/* アップロード状態 */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-white text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                                <p>アップロード中...</p>
                            </div>
                        </div>
                    )}

                    {uploaded && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-30 flex items-center justify-center">
                            <div className="text-white text-center">
                                <svg
                                    className="w-10 h-10 mx-auto mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <p>完了</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* タグ */}
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 mb-1">ページ {currentPage.index} のタグ:</p>
                        {onApplyTagToAllPages && (
                            <div className="dropdown relative">
                                <button className="text-xs text-indigo-600 hover:text-indigo-800 mb-1">
                                    タグ適用オプション
                                </button>
                                <div className="dropdown-menu absolute hidden hover:block right-0 mt-1 bg-white rounded shadow-lg p-2 z-10">
                                    <div className="w-40">
                                        {/* タグをページに適用 */}
                                        {DEFAULT_TAGS.map((tag) => {
                                            const tagStyle = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleApplyTagToAllPages(tag)}
                                                    className={`block w-full text-left px-2 py-1 text-xs ${tagStyle.text} ${tagStyle.bg} rounded mb-1`}
                                                >
                                                    <span className="flex items-center">
                                                        <TagIcon className="w-3 h-3 mr-1" />
                                                        すべてに「{tag}」を追加
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {currentPage.tags.length > 0 ? (
                            currentPage.tags.map((tag) => {
                                const tagStyle = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
                                return (
                                    <span
                                        key={tag}
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tagStyle.bg} ${tagStyle.text}`}
                                    >
                                        <TagIcon className="w-3 h-3 mr-1" />
                                        {tag}
                                        {!disableControls && !uploading && !uploaded && (
                                            <button
                                                className="ml-1 text-gray-500 hover:text-red-600"
                                                onClick={() => onRemoveTag(fileId, currentPage.id, tag)}
                                                aria-label={`${tag}タグを削除`}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-xs text-gray-400">タグなし</span>
                        )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                        <p>ヒント: タグをドラッグ＆ドロップして現在のページにタグを適用できます</p>
                    </div>
                </div>
            </DroppableArea>
        </div>
    );
};

export default PdfPagesPreview;