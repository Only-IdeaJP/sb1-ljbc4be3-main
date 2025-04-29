// src/pages/UploadPapers.tsx
import {
  AlertCircle,
  CheckCircle,
  Tag as TagIcon,
  Trash2,
  Upload
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { HotToast } from "../components/Toaster";
import DraggableTag from "../components/upload/DraggableTag";
import FilePreview from "../components/upload/FilePreview";
import { DEFAULT_TAGS } from "../constant/Constant";
import { useAuth } from "../hooks/useAuth";
import { usePdfProcessor } from "../hooks/usePdfProcessor";
import { UploadService } from "../services/upload.service";

interface UploadFile {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "pdf";
  pages: {
    id: string;
    index: number;
    imageData?: string;
    tags: string[];
  }[];
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

/**
 * 問題ペーパーのアップロードページコンポーネント
 * JPG/PDF形式の問題をアップロードし、タグ付けする
 */
const UploadPapers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { processPdf, generatePdfThumbnail, loading: pdfLoading } = usePdfProcessor();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [draggedTags, setDraggedTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // アップロードを処理する関数
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setMessage(null);

    // ファイルタイプのバリデーション（JPGとPDFのみ）
    const validFiles = acceptedFiles.filter(file =>
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "application/pdf"
    );

    if (validFiles.length < acceptedFiles.length) {
      setMessage({
        type: "error",
        text: "JPGとPDF形式のファイルのみ対応しています。"
      });

      if (validFiles.length === 0) return;
    }

    // ファイルサイズの検証
    const invalidSizeFiles = validFiles.filter(file => file.size > 20 * 1024 * 1024); // 20MB
    if (invalidSizeFiles.length > 0) {
      setMessage({
        type: "error",
        text: `ファイルサイズが大きすぎます。20MB以下のファイルをアップロードしてください。`
      });
      return;
    }

    // 各ファイルの処理を開始
    setLoading(true);
    const newFiles: UploadFile[] = [];

    // 非同期で各ファイルを処理
    for (const file of validFiles) {
      const fileId = uuidv4();
      const fileType = file.type.includes("pdf") ? "pdf" : "image";

      try {
        if (fileType === "pdf") {
          // PDFを処理
          const thumbnail = await generatePdfThumbnail(file, 0.5);
          const pdfInfo = await processPdf(file, 1.0);

          if (pdfInfo) {
            // 成功した場合、ファイル情報を追加
            newFiles.push({
              id: fileId,
              file,
              previewUrl: thumbnail || '',
              type: "pdf",
              pages: pdfInfo.pages.map(page => ({
                id: `${fileId}-page-${page.pageNumber}`,
                index: page.pageNumber,
                imageData: page.imageData,
                tags: []
              })),
              uploading: false,
              uploaded: false
            });
          }
        } else {
          // 画像ファイルの場合
          const previewUrl = URL.createObjectURL(file);
          newFiles.push({
            id: fileId,
            file,
            previewUrl,
            type: "image",
            pages: [{
              id: `${fileId}-page-1`,
              index: 1,
              tags: []
            }],
            uploading: false,
            uploaded: false
          });
        }
      } catch (error: any) {
        console.error("ファイル処理エラー:", error);
        setMessage({
          type: "error",
          text: `${file.name}の処理中にエラーが発生しました: ${error.message}`
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setLoading(false);

    if (newFiles.length > 0) {
      HotToast.success(`${newFiles.length}件のファイルを追加しました`);
    }
  }, [generatePdfThumbnail, processPdf]);

  // ドロップゾーンの設定
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    }
  });

  // ファイルを削除する関数
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // 全てのファイルを削除する関数
  const removeAllFiles = useCallback(() => {
    if (confirm("アップロードした全てのファイルを削除してもよろしいですか？")) {
      setFiles([]);
      setMessage(null);
    }
  }, []);

  // ファイルをアップロードする関数
  const uploadFiles = useCallback(async () => {
    if (!user) {
      setMessage({
        type: "error",
        text: "ログインが必要です。"
      });
      return;
    }

    setIsUploading(true);
    setLoading(true);
    setMessage(null);

    try {
      let totalUploadedItems = 0;

      // 各ファイルをアップロード
      for (const file of files) {
        if (file.uploaded) continue;

        // ファイルのアップロード状態を更新
        setFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, uploading: true } : f)
        );

        // 各ページを処理
        for (const page of file.pages) {
          // 画像ファイルの場合、ファイル自体をアップロード
          if (file.type === "image" && page.index === 1) {
            const result = await UploadService.uploadImageFile(
              user.id,
              file.file,
              page.tags
            );

            if (!result.success) {
              throw new Error(result.error);
            }

            totalUploadedItems++;
          }
          // PDFの場合、各ページを画像としてアップロード
          else if (file.type === "pdf" && page.imageData) {
            const result = await UploadService.uploadPdfPage(
              user.id,
              page.imageData,
              page.tags
            );

            if (!result.success) {
              throw new Error(result.error);
            }

            totalUploadedItems++;
          }
        }

        // アップロード完了フラグを設定
        setFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, uploading: false, uploaded: true } : f)
        );
      }

      // イベントログを記録
      await UploadService.recordUploadEvent(
        user.id,
        totalUploadedItems
      );

      // 完了メッセージを表示
      setMessage({
        type: "success",
        text: `${totalUploadedItems}件のアイテムのアップロードが完了しました。`
      });

      // 成功トースト
      HotToast.success("アップロードが完了しました");

    } catch (error: any) {
      console.error("アップロードエラー:", error);
      setMessage({
        type: "error",
        text: error.message || "アップロード中にエラーが発生しました。"
      });
      HotToast.error("アップロードに失敗しました");
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  }, [files, user]);

  // タグをページに適用する関数
  const applyTagToPage = useCallback((fileId: string, pageId: string, tag: string) => {
    // 変更: 確認のためのコメントを追加
    console.log(`Applying tag "${tag}" to page ${pageId} of file ${fileId}`);

    setFiles(prev =>
      prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            pages: file.pages.map(page => {
              if (page.id === pageId && !page.tags.includes(tag)) {
                return {
                  ...page,
                  tags: [...page.tags, tag]
                };
              }
              return page;
            })
          };
        }
        return file;
      })
    );
  }, []);

  // タグをページから削除する関数
  const removeTagFromPage = useCallback((fileId: string, pageId: string, tag: string) => {
    setFiles(prev =>
      prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            pages: file.pages.map(page => {
              if (page.id === pageId) {
                return {
                  ...page,
                  tags: page.tags.filter(t => t !== tag)
                };
              }
              return page;
            })
          };
        }
        return file;
      })
    );
  }, []);

  // タグを全てのページに適用する
  const applyTagToAllPages = useCallback((tag: string) => {
    if (!confirm(`「${tag}」タグを全てのファイルの全ページに適用しますか？`)) {
      return;
    }

    setFiles(prev =>
      prev.map(file => ({
        ...file,
        pages: file.pages.map(page => ({
          ...page,
          tags: page.tags.includes(tag) ? page.tags : [...page.tags, tag]
        }))
      }))
    );

    HotToast.success(`「${tag}」タグを全てのページに適用しました`);
  }, []);

  // タグを特定のPDFの全ページに適用する
  const applyTagToPdfAllPages = useCallback((fileId: string, tag: string) => {
    // 変更: 確認のためのコメントを追加
    console.log(`Applying tag "${tag}" to all pages of PDF ${fileId}`);

    setFiles(prev =>
      prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            pages: file.pages.map(page => ({
              ...page,
              tags: page.tags.includes(tag) ? page.tags : [...page.tags, tag]
            }))
          };
        }
        return file;
      })
    );

    HotToast.success(`「${tag}」タグをPDFの全ページに適用しました`);
  }, []);

  // 全てのタグをすべてのページに適用
  const applyAllTagsToAllPages = useCallback(() => {
    if (!confirm("全てのタグを全てのページに適用しますか？この操作は元に戻せません。")) {
      return;
    }

    setFiles(prev =>
      prev.map(file => ({
        ...file,
        pages: file.pages.map(page => ({
          ...page,
          tags: Array.from(new Set([...page.tags, ...DEFAULT_TAGS]))
        }))
      }))
    );

    HotToast.success("全てのタグを全てのページに適用しました");
  }, []);

  // ファイル追加ボタンクリック
  const handleAddFileClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // ドラッグ操作のフィードバック表示
  const handleTagDragStart = useCallback((tag: string) => {
    setDraggedTags([tag]);
    document.body.classList.add('tag-dragging');
  }, []);

  // ドラッグ操作の終了
  const handleTagDragEnd = useCallback(() => {
    setDraggedTags([]);
    document.body.classList.remove('tag-dragging');
  }, []);

  // アップロード直後にリソースを解放
  useEffect(() => {
    return () => {
      // ドラッグ中のクラスを削除
      document.body.classList.remove('tag-dragging');

      // 作成したURL.createObjectURLをクリーンアップ
      files.forEach(file => {
        if (file.previewUrl && file.type === "image") {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">問題アップロード</h1>
      <p className="text-gray-600 mb-8">
        問題ペーパーをアップロードします。JPGまたはPDF形式のファイルに対応しています。
      </p>

      {/* ローディングインジケーター - ファイル処理 または PDF処理 どちらか */}
      {(loading || pdfLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-700">ファイルを処理中...</p>
          </div>
        </div>
      )}

      {/* メッセージ表示 */}
      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.type === "success"
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
          }`}>
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* ドロップゾーン */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors
          ${isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
          }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-indigo-500" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? "ファイルをドロップしてください" : "ファイルをドラッグ＆ドロップ"}
        </h3>
        <p className="text-gray-600 mb-4">
          または <span className="text-indigo-600 cursor-pointer hover:underline" onClick={handleAddFileClick}>クリックして選択</span>
        </p>
        <p className="text-sm text-gray-500">
          JPG・PDF形式が対応しています（最大20MB）
        </p>
      </div>

      {/* タグセクション */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <TagIcon className="w-5 h-5 inline-block mr-2 text-indigo-600" />
            タグを選択（長押しすると、ドラッグ＆ドロップできます）。タグ付けは、必須ではありません。
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {DEFAULT_TAGS.map((tag) => (
              <DraggableTag
                key={tag}
                tag={tag}
                onClick={() => applyTagToAllPages(tag)}
                onDragStart={() => handleTagDragStart(tag)}
                onDragEnd={handleTagDragEnd}
              />
            ))}
          </div>
          <button
            className="text-sm text-indigo-600 hover:text-indigo-800"
            onClick={applyAllTagsToAllPages}
          >
            全てのタグを全てのページに適用
          </button>
        </div>
      )}

      {/* ドラッグ中のフィードバック表示 */}
      {draggedTags.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-indigo-100 border border-indigo-200 rounded-lg p-3 shadow-lg z-50 animate-pulse">
          <div className="flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-indigo-600" />
            <span className="text-indigo-700 font-medium">{draggedTags[0]}をドラッグ中...</span>
          </div>
        </div>
      )}

      {/* アップロードされたファイル一覧 */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex justify-between items-center">
            <span>アップロードするファイル ({files.length})</span>
            <button
              onClick={removeAllFiles}
              className="text-sm text-red-600 hover:text-red-800 flex items-center"
              disabled={isUploading}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              全てクリア
            </button>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div key={file.id} className="relative">
                <FilePreview
                  id={file.id}
                  filename={file.file.name}
                  previewUrl={file.previewUrl}
                  fileType={file.type}
                  pageCount={file.pages.length}
                  fileSize={file.file.size}
                  pages={file.pages}
                  uploading={file.uploading}
                  uploaded={file.uploaded}
                  onRemove={removeFile}
                  onRemoveTag={removeTagFromPage}
                  onApplyTag={applyTagToPage}
                  onApplyTagToAllPages={applyTagToPdfAllPages} // PDFの全ページにタグを適用する関数
                  disableControls={isUploading}
                  applyToAllPagesLabel={file.type === "pdf" ? "※ドラッグ＆ドロップでタグを全ページに適用します" : ""}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      {files.length > 0 && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={removeAllFiles}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded shadow hover:bg-gray-50 transition-colors"
            disabled={isUploading}
          >
            キャンセル
          </button>
          <button
            onClick={uploadFiles}
            className="px-6 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 flex items-center transition-colors"
            disabled={isUploading || files.length === 0 || files.every(f => f.uploaded)}
          >
            {isUploading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                アップロード中...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                アップロードして保存
              </>
            )}
          </button>
        </div>
      )}

      {/* アップロード完了後に表示する次のステップ案内 */}
      {files.length > 0 && files.every(f => f.uploaded) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6 animate-fadeIn">
          <h3 className="text-lg font-medium text-green-800 mb-2 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            アップロード完了
          </h3>
          <p className="text-green-700 mb-4">
            全てのファイルのアップロードが完了しました。次は、ペーパー演習から、好きな枚数のドリルを作成しましょう！。
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/practice")}
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors"
            >
              ペーパー演習へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPapers;