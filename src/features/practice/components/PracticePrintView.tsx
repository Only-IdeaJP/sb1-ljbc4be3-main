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

                    <img
                        src={paper.file_path}
                        alt={`問題 ${idx + 1}`}
                    />
                </div>
            ))}
        </div>
    );
};
