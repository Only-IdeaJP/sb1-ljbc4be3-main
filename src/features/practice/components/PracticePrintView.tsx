// features/practice/components/PracticePrintView.tsx
import React from 'react';
import { Paper } from '../../../types/papers.types';

interface PracticePrintViewProps {
    papers: Paper[];
}

/**
 * 印刷用ビューコンポーネント
 * 各問題が別ページに印刷されるように調整
 */
export const PracticePrintView: React.FC<PracticePrintViewProps> = ({ papers }) => {
    // 問題がなければ何もレンダーしない
    if (!papers || papers.length === 0) return null;

    return (
        <div className="hidden print:block print:w-full print:h-screen print:m-0 print:p-0">
            {papers.map((paper, index) => (
                <div
                    key={paper.id}
                    className="print-page flex flex-col justify-center items-center"
                    style={{
                        // 各ページごとに改ページ。最後のページは auto
                        pageBreakAfter: index < papers.length - 1 ? 'always' : 'auto',
                        // ページ内で分割しない
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid',
                    }}
                >
                    <h2 className="text-center text-xl font-bold mb-4">問題 {index + 1}</h2>
                    <img
                        src={paper.file_path}
                        alt={`問題 ${index + 1}`}
                        className="max-w-full max-h-[80vh]"
                    />
                </div>
            ))}
        </div>
    );
};
