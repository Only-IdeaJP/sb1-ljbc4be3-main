// pages/GradePapers.tsx
import { Save } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { HotToast } from "../components/Toaster";
import { Button } from "../components/ui/Button";
import { Message } from "../components/ui/Message";
import { DateSelector } from "../features/grade/components/DateSelector";
import { GradeGrid } from "../features/grade/components/GradeGrid";
import { useAuth } from "../hooks/useAuth";
import { usePapers } from "../hooks/usePapers";

/**
 * ペーパー採点ページ
 */
export const GradePapers: React.FC = () => {
  const { user } = useAuth();
  const {
    papers,
    loading,
    loadPapersByDate,
    gradePapers
  } = usePapers();

  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [grades, setGrades] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 選択された日付のペーパーを読み込む
  useEffect(() => {
    if (user) {
      loadPapersByDate(selectedDate);
      setGrades({}); // 日付が変わったら採点状態をリセット
    }
  }, [user, selectedDate, loadPapersByDate]);

  /**
   * 前の日に移動
   */
  const goToPrevDate = useCallback(() => {
    setSelectedDate(prevDate => {
      const date = new Date(prevDate);
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0];
    });
  }, []);

  /**
   * 次の日に移動
   */
  const goToNextDate = useCallback(() => {
    setSelectedDate(prevDate => {
      const date = new Date(prevDate);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    });
  }, []);

  /**
   * 採点状態の変更
   */
  const handleGradeChange = useCallback((paperId: string, isCorrect: boolean) => {
    setGrades(prev => ({
      ...prev,
      [paperId]: isCorrect
    }));
  }, []);

  /**
   * 採点結果の保存
   */
  const handleSave = async () => {
    // 採点されたペーパーがない場合
    const gradedPaperIds = Object.keys(grades);
    if (gradedPaperIds.length === 0) {
      HotToast.error('採点されたペーパーがありません');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // 採点データを準備
      const paperGrades = gradedPaperIds.map(paperId => ({
        paper_id: paperId,
        is_correct: grades[paperId],
        graded_at: new Date().toISOString() // Add the current timestamp
      }));

      // 採点結果を保存
      await gradePapers(paperGrades);

      // 成功メッセージ
      setMessage({
        type: "success",
        text: `${paperGrades.length}件の採点結果を保存しました`
      });

      // 採点状態をリセット
      setGrades({});

      HotToast.success('採点結果を保存しました');
    } catch (error) {
      console.error('Error saving grades:', error);
      setMessage({
        type: "error",
        text: '採点結果の保存中にエラーが発生しました'
      });

      HotToast.error('採点結果の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ペーパー丸付け
        </h1>
        <p className="text-gray-600">
          チェックを入れた問題は正解として記録され、不正解の問題は、正解するまで問題演習に自動で組み込まれます。
        </p>
      </div>

      {message && (
        <div className="mb-6">
          <Message type={message.type}>
            {message.text}
          </Message>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* 日付選択 */}
        <DateSelector
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          onPrevDate={goToPrevDate}
          onNextDate={goToNextDate}
        />

        <Button
          variant="primary"
          icon={Save}
          onClick={handleSave}
          disabled={saving || Object.keys(grades).length === 0}
          isLoading={saving}
        >
          丸付け結果を保存
        </Button>
      </div>

      <GradeGrid
        papers={papers}
        grades={grades}
        onGradeChange={handleGradeChange}
        loading={loading}
        emptyMessage="この日の問題は見つかりませんでした"
      />
    </div>
  );
};