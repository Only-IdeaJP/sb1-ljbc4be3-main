// features/practice/components/PaperItem.tsx
import { Hash } from 'lucide-react';
import { Paper } from '../../../types/papers.types';

interface PaperItemProps {
    paper: Paper;
    index: number;
    isSelected: boolean;
    onToggleSelection: () => void;
}

/**
 * ペーパーアイテムコンポーネント（1枚の問題）
 */
export const PaperItem: React.FC<PaperItemProps> = ({
    paper,
    index,
    isSelected,
    onToggleSelection
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Hash className="w-3 h-3" />
                        <span>問題 {index + 1}</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggleSelection}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                    />
                </div>

                {paper.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {paper.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="w-full aspect-square rounded-lg overflow-hidden">
                    <img
                        src={paper.file_path}
                        alt={`問題 ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};
