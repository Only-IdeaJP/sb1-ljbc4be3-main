
// features/grade/components/GradeGrid.tsx
import React from 'react';
import { Paper } from '../../../types/papers.types';
import { GradeItem } from './GradeItem';

interface GradeGridProps {
    papers: Paper[];
    grades: Record<string, boolean>;
    onGradeChange: (paperId: string, isCorrect: boolean) => void;
    loading: boolean;
    emptyMessage?: string;
}

/**
 * 採点グリッドコンポーネント
 */
export const GradeGrid: React.FC<GradeGridProps> = ({
    papers,
    grades,
    onGradeChange,
    loading,
    emptyMessage = '問題が見つかりませんでした'
}) => {
    if (loading) {
        return (
            <div className="text-center py-12 text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {papers.map((paper) => (
                <GradeItem
                    key={paper.id}
                    paper={paper}
                    isCorrect={grades[paper.id] ?? null}
                    onGradeChange={(isCorrect) => onGradeChange(paper.id, isCorrect)}
                />
            ))}
        </div>
    );
};
