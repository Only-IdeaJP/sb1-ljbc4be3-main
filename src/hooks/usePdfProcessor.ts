// src/hooks/usePdfProcessor.ts
import * as pdfjs from 'pdfjs-dist';
import { useCallback, useState } from 'react';
import { PDF_LOAD_OPTIONS } from '../lib/pdf-worker';

interface PdfPage {
    pageNumber: number;
    imageData: string;
    width: number;
    height: number;
}

interface PdfInfo {
    pageCount: number;
    pages: PdfPage[];
}

/**
 * PDF処理用のカスタムフック
 * PDFファイルから画像を抽出し、プレビューを生成する
 */
export const usePdfProcessor = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * PDFファイルからページ情報を抽出する
     * @param file PDFファイル
     * @param scale 画像のスケール（デフォルト: 1.0）
     */
    const processPdf = useCallback(async (
        file: File,
        scale: number = 1.0
    ): Promise<PdfInfo | null> => {
        setLoading(true);
        setError(null);

        try {
            // ファイルをArrayBufferに変換
            const arrayBuffer = await file.arrayBuffer();

            // PDFを読み込み
            const pdf = await pdfjs.getDocument({
                ...PDF_LOAD_OPTIONS,
                data: arrayBuffer
            }).promise;

            const pageCount = pdf.numPages;
            const pages: PdfPage[] = [];

            // 各ページを処理
            for (let i = 1; i <= pageCount; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });

                // ページを描画するためのcanvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) {
                    console.error('Canvas context is null');
                    continue;
                }

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // ページをレンダリング
                await page.render({
                    canvasContext: context,
                    viewport
                }).promise;

                // 画像データを取得
                const imageData = canvas.toDataURL('image/png');

                pages.push({
                    pageNumber: i,
                    imageData,
                    width: viewport.width,
                    height: viewport.height
                });
            }

            return {
                pageCount,
                pages
            };
        } catch (err: any) {
            console.error('PDF処理エラー:', err);
            setError(err.message || 'PDFの処理中にエラーが発生しました');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * PDFの最初のページだけをプレビュー用に処理する
     * @param file PDFファイル
     * @param previewScale プレビューのスケール（デフォルト: 0.5）
     */
    const generatePdfThumbnail = useCallback(async (
        file: File,
        previewScale: number = 0.5
    ): Promise<string | null> => {
        setLoading(true);
        setError(null);

        try {
            // ファイルをArrayBufferに変換
            const arrayBuffer = await file.arrayBuffer();

            // PDFを読み込み
            const pdf = await pdfjs.getDocument({
                ...PDF_LOAD_OPTIONS,
                data: arrayBuffer
            }).promise;

            // 最初のページを取得
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: previewScale });

            // ページを描画するためのcanvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                throw new Error('Canvas context is null');
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // ページをレンダリング
            await page.render({
                canvasContext: context,
                viewport
            }).promise;

            // サムネイル画像データを取得
            return canvas.toDataURL('image/png');
        } catch (err: any) {
            console.error('PDFサムネイル生成エラー:', err);
            setError(err.message || 'PDFのサムネイル生成中にエラーが発生しました');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        processPdf,
        generatePdfThumbnail,
        loading,
        error
    };
};