
// features/grade/components/GradeItem.tsx
import { CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
import { Paper } from '../../../types/papers.types';

interface GradeItemProps {
    paper: Paper;
    isCorrect: boolean | null;
    onGradeChange: (isCorrect: boolean) => void;
}

/**
 * 採点アイテムコンポーネント
 */
export const GradeItem: React.FC<GradeItemProps> = ({
    paper,
    isCorrect,
    onGradeChange
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
                {/* 問題画像 */}
                <div className="mb-4">
                    <img
                        src={paper.file_path}
                        alt="問題"
                        className="w-full h-auto rounded"
                    />
                </div>

                {/* 採点ボタン */}
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => onGradeChange(true)}
                        className={`
              flex items-center px-3 py-2 rounded-md
              ${isCorrect === true
                                ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-green-50'}
            `}
                    >
                        <CheckCircle className="w-5 h-5 mr-1.5" />
                        正解
                    </button>

                    <button
                        onClick={() => onGradeChange(false)}
                        className={`
              flex items-center px-3 py-2 rounded-md
              ${isCorrect === false
                                ? 'bg-red-100 text-red-800 border-2 border-red-500'
                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-red-50'}
            `}
                    >
                        <XCircle className="w-5 h-5 mr-1.5" />
                        不正解
                    </button>
                </div>
            </div>
        </div>
    );
};
