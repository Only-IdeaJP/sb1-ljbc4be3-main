// features/practice/components/PaperGrid.tsx
import { Paper } from '../../../types/papers.types';
import { PaperItem } from './PaperItem';

interface PaperGridProps {
    papers: Paper[];
    selectedPapers: Set<string>;
    toggleSelection: (paperId: string) => void;
    loading: boolean;
    emptyMessage?: string;
}

/**
 * ペーパーグリッドコンポーネント（問題のグリッド表示）
 */
export const PaperGrid: React.FC<PaperGridProps> = ({
    papers,
    selectedPapers,
    toggleSelection,
    loading,
    emptyMessage = '問題が見つかりませんでした'
}) => {
    if (loading) {
        return (
            <div className="col-span-full text-center py-12 text-gray-500">
                読み込み中...
            </div>
        );
    }

    if (papers.length === 0) {
        return (
            <div className="col-span-full text-center py-12 text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {papers.map((paper, index) => (
                <PaperItem
                    key={paper.id}
                    paper={paper}
                    index={index}
                    isSelected={selectedPapers.has(paper.id)}
                    onToggleSelection={() => toggleSelection(paper.id)}
                />
            ))}
        </div>
    );
};
