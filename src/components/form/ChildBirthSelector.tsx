// components/form/ChildBirthSelector.tsx
import React from "react";

interface ChildBirthSelectorProps {
    birthYear: number | null;
    birthMonth: number | null;
    onYearChange: (year: number | null) => void;
    onMonthChange: (month: number | null) => void;
    disabled?: boolean;
}

/**
 * お子様の生年月を選択するためのコンポーネント
 * 年と月のセレクトボックスを提供します
 */
export const ChildBirthSelector: React.FC<ChildBirthSelectorProps> = ({
    birthYear,
    birthMonth,
    onYearChange,
    onMonthChange,
    disabled = false,
}) => {
    // 現在の年から過去20年分の選択肢を生成
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    // 月の選択肢（1〜12月）
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onYearChange(value ? parseInt(value) : null);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onMonthChange(value ? parseInt(value) : null);
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    お子様の生年
                </label>
                <select
                    value={birthYear?.toString() || ""}
                    onChange={handleYearChange}
                    disabled={disabled}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">年を選択</option>
                    {years.map((year) => (
                        <option key={year} value={year.toString()}>
                            {year}年
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    お子様の生月
                </label>
                <select
                    value={birthMonth?.toString() || ""}
                    onChange={handleMonthChange}
                    disabled={disabled}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">月を選択</option>
                    {months.map((month) => (
                        <option key={month} value={month.toString()}>
                            {month}月
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};