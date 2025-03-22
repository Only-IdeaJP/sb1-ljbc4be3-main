// src/components/upload/FilePreview.tsx
import { CheckCircle, FileText, Image as ImageIcon, Tag as TagIcon, X } from "lucide-react";
import React from "react";

// タグの色設定 (DraggableTagと同じ設定を使用)
const TAG_COLORS: Record<string, { bg: string, text: string }> = {
    "算数": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "国語": { bg: "bg-red-100", text: "text-red-800" },
    "理科": { bg: "bg-green-100", text: "text-green-800" },
    "社会": { bg: "bg-yellow-100", text: "text-yellow-800" },
    "英語": { bg: "bg-blue-100", text: "text-blue-800" },
    "プリント": { bg: "bg-purple-100", text: "text-purple-800" },
    "テスト": { bg: "bg-pink-100", text: "text-pink-800" },
    "宿題": { bg: "bg-orange-100", text: "text-orange-800" },
    "復習": { bg: "bg-teal-100", text: "text-teal-800" },
    "予習": { bg: "bg-cyan-100", text: "text-cyan-800" },
    // デフォルトカラー
    "default": { bg: "bg-gray-100", text: "text-gray-800" }
};

interface FilePreviewProps {
    id: string;
    filename: string;
    previewUrl: string | null;
    fileType: "image" | "pdf";
    pageCount: number;
    fileSize: number;
    tags: string[];
    uploading: boolean;
    uploaded: boolean;
    onRemove: (id: string) => void;
    onRemoveTag: (id: string, tag: string) => void;
    disableControls?: boolean;
}

/**
 * ファイルプレビューコンポーネント
 * アップロードされたファイルのプレビューと情報を表示
 */
const FilePreview: React.FC<FilePreviewProps> = ({
    id,
    filename,
    previewUrl,
    fileType,
    pageCount,
    fileSize,
    tags,
    uploading,
    uploaded,
    onRemove,
    onRemoveTag,
    disableControls = false
}) => {
    /**
     * ファイルサイズを読みやすい形式にフォーマットする
     */
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    /**
     * タグの色を取得する
     */
    const getTagColors = (tag: string) => {
        return TAG_COLORS[tag] || TAG_COLORS.default;
    };

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

                {/* タグ */}
                <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">タグ:</p>
                    <div className="flex flex-wrap gap-1">
                        {tags.length > 0 ? (
                            tags.map((tag) => {
                                const { bg, text } = getTagColors(tag);
                                return (
                                    <span
                                        key={tag}
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}
                                    >
                                        <TagIcon className="w-3 h-3 mr-1" />
                                        {tag}
                                        {!disableControls && !uploading && !uploaded && (
                                            <button
                                                className="ml-1 text-indigo-600 hover:text-indigo-800"
                                                onClick={() => onRemoveTag(id, tag)}
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