// src/components/upload/FilePreview.tsx
import { CheckCircle, FileText, Image as ImageIcon, Tag as TagIcon, X } from "lucide-react";
import React, { useState } from "react";
import { TAG_COLORS } from "../../constant/Constant";
import PdfPagesPreview from "./PdfPagesPreview";

interface FilePreviewProps {
    id: string;
    filename: string;
    previewUrl: string | null;
    fileType: "image" | "pdf";
    pageCount: number;
    fileSize: number;
    pages: {
        id: string;
        index: number;
        imageData?: string;
        tags: string[];
    }[];
    uploading: boolean;
    uploaded: boolean;
    onRemove: (id: string) => void;
    onRemoveTag: (fileId: string, pageId: string, tag: string) => void;
    onApplyTag: (fileId: string, pageId: string, tag: string) => void;
    onApplyTagToAllPages?: (fileId: string, tag: string) => void; // タグを全ページに適用する関数
    disableControls?: boolean;
}

/**
 * ファイルプレビューコンポーネント
 * アップロードされたファイルのプレビューと情報を表示
 * PDFの場合は各ページのプレビューとタグ付けをサポート
 */
const FilePreview: React.FC<FilePreviewProps> = ({
    id,
    filename,
    previewUrl,
    fileType,
    pageCount,
    fileSize,
    pages,
    uploading,
    uploaded,
    onRemove,
    onRemoveTag,
    onApplyTag,
    onApplyTagToAllPages,
    disableControls = false
}) => {
    const [expanded, setExpanded] = useState(false);

    /**
     * ファイルサイズを読みやすい形式にフォーマットする
     */
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    /**
     * タグを全ページに適用する
     */
    const handleApplyTagToAllPages = (tag: string) => {
        if (onApplyTagToAllPages) {
            onApplyTagToAllPages(id, tag);
        }
    };

    // PDFファイルで、ページタグを表示するモードの場合
    if (fileType === "pdf" && expanded) {
        return (
            <div className="border rounded-lg overflow-hidden bg-gray-50 shadow-sm">
                <div className="flex items-center justify-between bg-indigo-50 p-2 border-b">
                    <h4 className="font-medium text-gray-900">{filename}</h4>
                    <button
                        onClick={() => setExpanded(false)}
                        className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    >
                        概要に戻る
                    </button>
                </div>

                <PdfPagesPreview
                    fileId={id}
                    filename={filename}
                    pages={pages}
                    uploading={uploading}
                    uploaded={uploaded}
                    onRemoveTag={onRemoveTag}
                    onApplyTag={onApplyTag}
                    onApplyTagToAllPages={tag => handleApplyTagToAllPages(tag)} // 現在のファイルの全ページにタグを適用
                    disableControls={disableControls}
                />
            </div>
        );
    }

    // 通常の表示モード（画像またはPDFの概要）
    return (
        <div className="border rounded-lg overflow-hidden bg-gray-50 shadow-sm transition-shadow hover:shadow">
            {/* ファイルプレビュー */}
            <div className="relative h-48 bg-gray-200">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={filename}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        {fileType === "pdf" ? (
                            <FileText className="h-12 w-12 text-gray-400" />
                        ) : (
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                        )}
                    </div>
                )}

                {/* 削除ボタン */}
                {!disableControls && !uploading && !uploaded && (
                    <button
                        onClick={() => onRemove(id)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
                        aria-label="ファイルを削除"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
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
                            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-white" />
                            <p>完了</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ファイル情報 */}
            <div className="p-4">
                <h4 className="font-medium text-gray-900 truncate mb-1" title={filename}>
                    {filename}
                </h4>
                <p className="text-sm text-gray-500 mb-2">
                    {fileType === "pdf"
                        ? `PDF - ${pageCount}ページ`
                        : `画像 - ${formatFileSize(fileSize)}`}
                </p>

                {/* PDFの場合、ページ表示切り替えボタンを表示 */}
                {fileType === "pdf" && !disableControls && !uploading && !uploaded && (
                    <button
                        onClick={() => setExpanded(true)}
                        className="w-full py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 mb-3"
                    >
                        各ページのタグを編集
                    </button>
                )}

                {/* タグ */}
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">ファイル全体のタグ:</p>
                    <div className="flex flex-wrap gap-1">
                        {/* PDFの場合は最初のページのタグを表示、画像の場合はそのまま */}
                        {pages.length > 0 && pages[0].tags.length > 0 ? (
                            pages[0].tags.map((tag) => {
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
                                                onClick={() => onRemoveTag(id, pages[0].id, tag)}
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
                </div>
            </div>
        </div>
    );
};

export default FilePreview;