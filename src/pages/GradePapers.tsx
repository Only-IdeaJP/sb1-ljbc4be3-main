/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  Save,
  Calendar,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Paper {
  id: string;
  file_path: string;
  tags: string[];
  is_correct: boolean;
  last_practiced: string | null;
  next_practice_date: string | null;
  created_at: string;
  user_id: string;
}

export const GradePapers: React.FC = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState(new Set<string>());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPapers = async () => {
      setLoading(true);
      try {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from("papers")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .order("created_at", { ascending: true });

        if (error) throw error;

        setPapers(data || []);
        setSelectedPapers(new Set()); // Reset selection when date changes
      } catch (err: any) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [user, selectedDate]);

  const calculateNextReviewDate = (
    isCorrect: boolean,
    lastPracticed: string | null
  ): string | null => {
    if (isCorrect) return null;

    const now = new Date();
    const last = lastPracticed ? new Date(lastPracticed) : now;
    const daysSinceLastPractice = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysToAdd =
      daysSinceLastPractice >= 30 ? 30 : daysSinceLastPractice >= 7 ? 7 : 3;
    now.setDate(now.getDate() + daysToAdd);

    return now.toISOString();
  };

  const handleSave = async () => {
    if (!user) {
      setMessage({ type: "error", text: "ログインが必要です" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const now = new Date().toISOString();
      const updates = papers.map((paper) => ({
        id: paper.id,
        is_correct: selectedPapers.has(paper.id),
        last_practiced: now,
        next_practice_date: calculateNextReviewDate(
          selectedPapers.has(paper.id),
          paper.last_practiced
        ),
      }));

      // Batch update papers
      const { error: updateError } = await supabase
        .from("papers")
        // @ts-ignore
        .upsert(updates, { onConflict: ["id"] });

      if (updateError) throw updateError;

      // Batch insert grades
      const grades = updates.map(({ id, is_correct }) => ({
        paper_id: id,
        user_id: user.id,
        is_correct,
        graded_at: now,
      }));

      const { error: gradeError } = await supabase
        .from("paper_grades")
        .insert(grades);

      if (gradeError) throw gradeError;

      setMessage({ type: "success", text: "採点結果を保存しました" });
      setSelectedPapers(new Set());

      // Refresh paper list
      const { data: updatedPapers, error: fetchError } = await supabase
        .from("papers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPapers(updatedPapers || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (days: number) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate.toISOString().split("T")[0];
    });
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
        <div
          className={`p-4 rounded-md mb-6 ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* 日付選択 */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || papers.length === 0}
          className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "保存中..." : "丸付け結果を保存"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            読み込み中...
          </div>
        ) : papers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            この日の問題は見つかりませんでした
          </div>
        ) : (
          papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <img
                src={paper.file_path}
                alt="問題"
                className="w-full h-auto rounded"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
