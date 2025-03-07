import * as pdfjsLib from 'pdfjs-dist';

// PDFワーカーのパスを設定
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// PDFの読み込みオプション
export const PDF_LOAD_OPTIONS = {
  cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/'
};

// PDFの読み込み関数をエクスポート
export const getDocument = pdfjsLib.getDocument;