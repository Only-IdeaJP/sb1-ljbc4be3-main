
// features/practice/components/PageCounter.tsx

interface PageCounterProps {
    count: number;
    onChange: (count: number) => void;
}

/**
 * ページ数入力コンポーネント
 */
export const PageCounter: React.FC<PageCounterProps> = ({ count, onChange }) => {
    return (
        <div className="flex items-center space-x-3">
            <label className="block text-sm font-medium text-gray-700">
                ページ数
            </label>
            <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
        </div>
    );
};
