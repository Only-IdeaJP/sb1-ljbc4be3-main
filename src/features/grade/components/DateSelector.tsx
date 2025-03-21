
// features/grade/components/DateSelector.tsx
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface DateSelectorProps {
    selectedDate: string;
    onChange: (date: string) => void;
    onPrevDate: () => void;
    onNextDate: () => void;
}

/**
 * 日付選択コンポーネント
 */
export const DateSelector: React.FC<DateSelectorProps> = ({
    selectedDate,
    onChange,
    onPrevDate,
    onNextDate
}) => {
    return (
        <div className="flex items-center justify-center space-x-4 mb-6">
            <button
                onClick={onPrevDate}
                className="p-2 hover:bg-gray-100 rounded-full"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <button
                onClick={onNextDate}
                className="p-2 hover:bg-gray-100 rounded-full"
            >
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
        </div>
    );
};
