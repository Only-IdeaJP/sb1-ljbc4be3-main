
// pages/PracticePapers.tsx
import { Filter, Printer, RefreshCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HotToast } from "../components/Toaster";
import { Button } from "../components/ui/Button";
import { PageCounter } from "../features/practice/components/PageCounter";
import { PaperGrid } from "../features/practice/components/PaperGrid";
import { PracticePrintView } from "../features/practice/components/PracticePrintView";
import { TagCount, TagFilter } from "../features/practice/components/TagFilter";
import { useAuth } from "../hooks/useAuth";
import { usePapers } from "../hooks/usePapers";

/**
 * ペーパー演習ページ
 */
export const PracticePapers: React.FC = () => {
  const { user } = useAuth();
  const {
    papers,
    selectedPapers,
    loading,
    loadPapers,
    searchPapers,
    toggleSelection,
    deselectAll,
    deleteSelectedPapers
  } = usePapers();

  const [pageCount, setPageCount] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Record<string, number>>({});
  const [availableTags, setAvailableTags] = useState<TagCount[]>([]);
  const [generatedPapers, setGeneratedPapers] = useState(papers);

  // 初期データの読み込み
  useEffect(() => {
    if (user) {
      loadPapers();
    }
  }, [user, loadPapers]);

  // 利用可能なタグの集計
  useEffect(() => {
    if (papers.length > 0) {
      const tagCounts: Record<string, number> = {};

      papers.forEach(paper => {
        paper.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const tags = Object.entries(tagCounts).map(([tag, count]) => ({
        tag,
        count
      }));

      setAvailableTags(tags);
    }
  }, [papers]);

  /**
   * 問題のシャッフル
   */
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  /**
   * 問題生成処理
   */
  const generatePapers = useCallback(() => {
    let selectedPaperPool = [...papers];
    let result: typeof papers = [];

    if (Object.keys(selectedTags).length > 0) {
      // タグ選択がある場合は、選択されたタグに基づいて問題を選択
      Object.entries(selectedTags).forEach(([tag, count]) => {
        if (count > 0) {
          const tagPapers = selectedPaperPool.filter(p => p.tags.includes(tag));
          const randomTagPapers = shuffleArray(tagPapers).slice(0, count);
          result = [...result, ...randomTagPapers];

          // すでに選択した問題を除外
          selectedPaperPool = selectedPaperPool.filter(
            p => !randomTagPapers.includes(p)
          );
        }
      });
    } else {
      // タグ選択がない場合は、ページ数に基づいてランダムに選択
      result = shuffleArray(selectedPaperPool).slice(0, pageCount);
    }

    setGeneratedPapers(result);
    deselectAll(); // 選択をクリア

    HotToast.success(`${result.length}件の問題を生成しました`);
  }, [papers, selectedTags, pageCount, shuffleArray, deselectAll]);

  /**
   * 選択された問題の削除処理
   */
  const handleRemoveSelected = async () => {
    if (selectedPapers.size === 0) return;

    const count = selectedPapers.size;
    if (!window.confirm(`選択した${count}件の問題を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await deleteSelectedPapers();

      // 生成済みの問題リストからも削除
      setGeneratedPapers(prev =>
        prev.filter(p => !selectedPapers.has(p.id))
      );

      HotToast.success(`${count}件の問題を削除しました`);
    } catch (error) {
      console.error('Error removing selected papers:', error);
      HotToast.error('問題の削除中にエラーが発生しました');
    }
  };

  /**
   * 印刷処理
   */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 no-print">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ペーパー演習</h1>
        <p className="text-gray-600">
          今日の演習問題を作成します。タグを選択して問題を絞り込むことができます。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 no-print">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1">
            <PageCounter
              count={pageCount}
              onChange={setPageCount}
            />
          </div>

          <Button
            variant="outline"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            フィルター
          </Button>
        </div>

        {showFilters && (
          <div className="mb-6">
            <TagFilter
              tags={availableTags}
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            icon={RefreshCcw}
            onClick={generatePapers}
            disabled={loading || papers.length === 0}
          >
            問題を生成
          </Button>

          {generatedPapers.length > 0 && (
            <>
              <Button
                variant="success"
                icon={Printer}
                onClick={handlePrint}
              >
                印刷する
              </Button>

              {selectedPapers.size > 0 && (
                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={handleRemoveSelected}
                >
                  選択した問題を削除
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="no-print">
        <PaperGrid
          papers={generatedPapers}
          selectedPapers={selectedPapers}
          toggleSelection={toggleSelection}
          loading={loading}
          emptyMessage="問題が見つかりませんでした。「問題を生成」をクリックして問題を作成してください。"
        />
      </div>

      <PracticePrintView papers={generatedPapers} />
    </div>
  );
};