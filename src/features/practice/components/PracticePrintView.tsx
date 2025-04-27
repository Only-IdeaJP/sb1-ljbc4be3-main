import React from 'react';
import { Paper } from '../../../types/papers.types';

interface PracticePrintViewProps {
    papers: Paper[];
}

export const PracticePrintView: React.FC<PracticePrintViewProps> = ({ papers }) => {
    if (!papers?.length) return null;

    return (
        <div className="hidden print:block">
            {papers.map((paper, idx) => (
                <div key={paper.id} className="print-container">
                    <h2 className="text-center text-xl font-bold mb-4">
                        問題 {idx + 1}
                    </h2>
                    <img
                        src={paper.file_path}
                        alt={`問題 ${idx + 1}`}
                    />
                </div>
            ))}
        </div>
    );
};
