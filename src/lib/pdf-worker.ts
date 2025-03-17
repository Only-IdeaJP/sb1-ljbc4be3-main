import * as pdfjsLib from 'pdfjs-dist';

// PDF.js Worker 設定
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).href;

// PDF の読み込みオプション
export const PDF_LOAD_OPTIONS = {
  cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
};

// PDF のドキュメント取得関数をエクスポート
export const getDocument = pdfjsLib.getDocument;
