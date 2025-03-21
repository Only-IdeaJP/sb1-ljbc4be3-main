// src/features/practice/PracticePapers.tsx
import {
    Filter,
    Hash,
    Printer,
    RefreshCcw,
    Trash2
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Message } from "../../components/ui/Message";
import { DEFAULT_TAGS } from "../../constants";
import { useAuth } from "../../hooks/useAuth";
import { Paper } from "../../models";
import { PapersService } from "../../services/papers.service";
import { shuffleArray } from "../../utils/array";

/**
 * 問題演習ページコンポーネント
 * ユーザーに最適な演習問題を生成して提供する
 */
export const PracticePapers: React.FC = () => {
    const { user } = useAuth();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
    const [selectedForRemoval, setSelectedForRemoval] = useState<Set<string>>(
        new Set()
    );
    const [pageCount, setPageCount] = useState(20);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTags, setSelectedTags] = useState<{ [key: string]: number }>(
        {}
    );
    const [availableTags, setAvailableTags] = useState<
        { tag: string; count: number }[]
    >([]);

    /**
     * 問題データを取得する
     */
    const fetchPapers = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const response = await PapersService.getPapersForReview(user.id);

            if (response.error) {
                throw new Error(response.error.message);
            }

            setPapers(response.data || []);

            // タグの集計
            const tagCounts: { [key: string]: number } = {};
            response.data?.forEach((paper) => {
                paper.tags?.forEach((tag: string) => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });

            // 利用可能なタグのリストを作成
            setAvailableTags(
                DEFAULT_TAGS.map((tag) => ({
                    tag,
                    count: tagCounts[tag] || 0,
                }))
            );
        } catch (err) {
            console.error("問題データ取得エラー:", err);
            setError(err.message || "問題の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 初回レンダリング時にデータを取得
    useEffect(() => {
        fetchPapers();
    }, [fetchPapers]);

    /**
     * 選択した条件で問題を生成する
     */
    const selectPapers = useCallback(() => {
        let selectedPaperPool = [...papers];
        let result: Paper[] = [];

        // タグ指定がある場合はタグごとに問題を選択
        if (Object.keys(selectedTags).length > 0) {
            Object.entries(selectedTags).forEach(([tag, count]) => {
                const tagPapers = selectedPaperPool.filter((p) => p.tags.includes(tag));
                const randomTagPapers = shuffleArray(tagPapers).slice(0, count);
                result = [...result, ...randomTagPapers];

                // 選択済みの問題をプールから除外
                selectedPaperPool = selectedPaperPool.filter(
                    (p) => !randomTagPapers.includes(p)
                );
            });
        } else {
            // タグ指定がない場合はランダムに選択
            result = shuffleArray(selectedPaperPool).slice(0, pageCount);
        }

        setSelectedPapers(result);
        setSelectedForRemoval(new Set());
    }, [papers, selectedTags, pageCount]);

    /**
     * 選択した問題を削除
     */
    const handleRemoveSelected = () => {
        setSelectedPapers((prev) =>
            prev.filter((paper) => !selectedForRemoval.has(paper.id))
        );
        setSelectedForRemoval(new Set());
    };

    /**
     * 印刷用のページを開く
     */
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8 no-print">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">ペーパー演習</h1>
                <p className="text-gray-600">
                    今日の演習問題を作成します。タグを選択して問題を絞り込むことができます。
                </p>
            </div>

            {error && (
                <Message type="error" text={error} className="mb-6 no-print" />
            )}

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 no-print">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ページ数
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={pageCount}
                            onChange={(e) =>
                                setPageCount(Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        フィルター
                    </button>
                </div>

                {showFilters && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                タグ別の出題数
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availableTags.map(({ tag, count }) => (
                                    <div key={tag} className="flex items-center space-x-2">
                                        <label className="flex-1 text-sm text-gray-700">
                                            {tag} ({count}問)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={count}
                                            value={selectedTags[tag] || 0}
                                            onChange={(e) => {
                                                const value = Math.max(
                                                    0,
                                                    Math.min(count, parseInt(e.target.value) || 0)
                                                );
                                                setSelectedTags((prev) => ({
                                                    ...prev,
                                                    [tag]: value,
                                                }));
                                            }}
                                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={selectPapers}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        問題を生成
                    </button>

                    {selectedPapers.length > 0 && (
                        <>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                印刷する
                            </button>

                            {selectedForRemoval.size > 0 && (
                                <button
                                    onClick={handleRemoveSelected}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    選択した問題を削除 ({selectedForRemoval.size})
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 問題リスト - 画面表示用 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 no-print">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        読み込み中...
                    </div>
                ) : selectedPapers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        問題が見つかりませんでした
                    </div>
                ) : (
                    selectedPapers.map((paper, index) => (
                        <PaperCard
                            key={paper.id}
                            paper={paper}
                            index={index}
                            isSelected={selectedForRemoval.has(paper.id)}
                            onToggleSelect={() => {
                                setSelectedForRemoval((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(paper.id)) {
                                        next.delete(paper.id);
                                    } else {
                                        next.add(paper.id);
                                    }
                                    return next;
                                });
                            }}
                        />
                    ))
                )}
            </div>

            {/* 印刷用のコンテンツ */}
            <div className="hidden print:block print-content">
                {selectedPapers.map((paper, index) => (
                    <div key={paper.id} className="print-paper">
                        <div className="mb-4">
                            <div className="text-xl font-bold">問題 {index + 1}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                {paper.tags.join(" / ")}
                            </div>
                        </div>
                        <img
                            src={paper.file_path}
                            alt={`問題 ${index + 1}`}
                            className="w-full h-auto max-h-[80vh]"
                            style={{ pageBreakInside: "avoid" }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * 問題カードコンポーネント
 */
interface PaperCardProps {
    paper: Paper;
    index: number;
    isSelected: boolean;
    onToggleSelect: () => void;
}

const PaperCard: React.FC<PaperCardProps> = ({
    paper,
    index,
    isSelected,
    onToggleSelect,
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
                        onChange={onToggleSelect}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                    />
                </div>

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