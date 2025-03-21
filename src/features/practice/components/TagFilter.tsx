
// features/practice/components/TagFilter.tsx
import { Tag as TagIcon } from 'lucide-react';

export interface TagCount {
    tag: string;
    count: number;
}

interface TagFilterProps {
    tags: TagCount[];
    selectedTags: Record<string, number>;
    onChange: (tags: Record<string, number>) => void;
}

/**
 * タグフィルターコンポーネント
 */
export const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, onChange }) => {
    const handleTagCountChange = (tag: string, count: number, maxCount: number) => {
        const newCount = Math.max(0, Math.min(maxCount, count));

        onChange({
            ...selectedTags,
            [tag]: newCount
        });
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
                タグ別の出題数
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map(({ tag, count: maxCount }) => (
                    <div key={tag} className="flex items-center space-x-2">
                        <div className="flex-1 flex items-center">
                            <TagIcon className="w-4 h-4 mr-1.5 text-indigo-500" />
                            <label className="text-sm text-gray-700">
                                {tag} ({maxCount}問)
                            </label>
                        </div>
                        <input
                            type="number"
                            min="0"
                            max={maxCount}
                            value={selectedTags[tag] || 0}
                            onChange={(e) => handleTagCountChange(
                                tag,
                                parseInt(e.target.value) || 0,
                                maxCount
                            )}
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};