// hooks/usePapers.ts
import { useCallback } from 'react';
import { usePapersStore } from '../store/papers.store';
import {
    PapersSearchParams,
    PaperUpdateBatch
} from '../types/papers.types';
import { useAuth } from './useAuth';

/**
 * ペーパー管理機能を提供するカスタムフック
 */
export const usePapers = () => {
    const { user } = useAuth();
    const userId = user?.id;

    const {
        papers,
        selectedPapers,
        stats,
        loading,
        error,
        fetchPapers,
        searchPapers,
        getPapersByDate,
        savePaperGrades,
        updatePapers,
        deletePapers,
        selectPaper,
        deselectPaper,
        togglePaperSelection,
        selectAllPapers,
        deselectAllPapers,
        fetchStats
    } = usePapersStore();

    /**
     * ユーザーのすべてのペーパーを取得する
     */
    const loadPapers = useCallback(async () => {
        if (!userId) return;
        await fetchPapers(userId);
    }, [userId, fetchPapers]);

    /**
     * 検索条件に基づいてペーパーを検索する
     */
    const searchUserPapers = useCallback(async (params: Omit<PapersSearchParams, 'userId'>) => {
        if (!userId) return;
        await searchPapers({ ...params, userId });
    }, [userId, searchPapers]);

    /**
     * 特定の日付のペーパーを取得する
     */
    const loadPapersByDate = useCallback(async (date: string) => {
        if (!userId) return;
        await getPapersByDate(userId, date);
    }, [userId, getPapersByDate]);

    /**
     * ペーパーに正解/不正解のマークを付ける
     */
    const gradePapers = useCallback(async (paperGrades: { paper_id: string; is_correct: boolean; graded_at: string }[]) => {
        if (!userId) return;
        await savePaperGrades(userId, paperGrades);
    }, [userId, savePaperGrades]);

    /**
     * 複数のペーパーを更新する
     */
    const updateUserPapers = useCallback(async (updates: PaperUpdateBatch[]) => {
        await updatePapers(updates);
    }, [updatePapers]);

    /**
     * 選択されたペーパーを削除する
     */
    const deleteSelectedPapers = useCallback(async () => {
        if (!selectedPapers.size) return;
        const paperIds = Array.from(selectedPapers);
        await deletePapers(paperIds);
    }, [selectedPapers, deletePapers]);

    /**
     * ユーザーの統計情報を取得する
     */
    const loadStats = useCallback(async () => {
        if (!userId) return;
        await fetchStats(userId);
    }, [userId, fetchStats]);

    return {
        // データ
        papers,
        selectedPapers,
        stats,
        loading,
        error,
        isSelected: (paperId: string) => selectedPapers.has(paperId),

        // アクション
        loadPapers,
        searchPapers: searchUserPapers,
        loadPapersByDate,
        gradePapers,
        updatePapers: updateUserPapers,
        deleteSelectedPapers,

        // 選択管理
        selectPaper,
        deselectPaper,
        toggleSelection: togglePaperSelection,
        selectAll: selectAllPapers,
        deselectAll: deselectAllPapers,

        // 統計
        loadStats
    };
};