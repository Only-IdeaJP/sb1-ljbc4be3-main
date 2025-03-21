// store/papers.store.ts
import { create } from 'zustand';
import { PapersService } from '../services/papers.service';
import {
    Paper,
    PaperGrade,
    PaperUpdateBatch,
    PapersSearchParams,
    Stats
} from '../types/papers.types';

interface PapersState {
    // データ状態
    papers: Paper[];
    selectedPapers: Set<string>;
    stats: Stats | null;

    // UI状態
    loading: boolean;
    error: string | null;

    // アクション
    fetchPapers: (userId: string) => Promise<void>;
    searchPapers: (params: PapersSearchParams) => Promise<void>;
    getPapersByDate: (userId: string, date: string) => Promise<void>;
    savePaperGrades: (userId: string, grades: Omit<PaperGrade, 'id' | 'user_id'>[]) => Promise<void>;
    updatePapers: (updates: PaperUpdateBatch[]) => Promise<void>;
    deletePapers: (paperIds: string[]) => Promise<void>;

    // セレクション
    selectPaper: (paperId: string) => void;
    deselectPaper: (paperId: string) => void;
    togglePaperSelection: (paperId: string) => void;
    selectAllPapers: () => void;
    deselectAllPapers: () => void;

    // 統計情報
    fetchStats: (userId: string) => Promise<void>;
}

/**
 * ペーパー管理のZustandストア
 */
export const usePapersStore = create<PapersState>((set, get) => ({
    // 初期状態
    papers: [],
    selectedPapers: new Set<string>(),
    stats: null,
    loading: false,
    error: null,

    /**
     * ユーザーのすべてのペーパーを取得する
     */
    fetchPapers: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const papers = await PapersService.getAllPapers(userId);
            set({ papers, loading: false });
        } catch (error) {
            console.error('Error fetching papers:', error);
            set({
                error: error instanceof Error ? error.message : 'ペーパーの取得中にエラーが発生しました',
                loading: false
            });
        }
    },

    /**
     * 検索条件に基づいてペーパーを検索する
     */
    searchPapers: async (params: PapersSearchParams) => {
        set({ loading: true, error: null });
        try {
            const papers = await PapersService.searchPapers(params);
            set({ papers, loading: false });
        } catch (error) {
            console.error('Error searching papers:', error);
            set({
                error: error instanceof Error ? error.message : 'ペーパーの検索中にエラーが発生しました',
                loading: false
            });
        }
    },

    /**
     * 特定の日付のペーパーを取得する
     */
    getPapersByDate: async (userId: string, date: string) => {
        set({ loading: true, error: null });
        try {
            const papers = await PapersService.getPapersByDate(userId, date);
            set({ papers, loading: false });
        } catch (error) {
            console.error('Error fetching papers by date:', error);
            set({
                error: error instanceof Error ? error.message : '指定日付のペーパー取得中にエラーが発生しました',
                loading: false
            });
        }
    },

    /**
     * ペーパーの採点結果を保存する
     */
    savePaperGrades: async (userId: string, grades: Omit<PaperGrade, 'id' | 'user_id'>[]) => {
        set({ loading: true, error: null });
        try {
            const now = new Date().toISOString();
            const gradesWithUser = grades.map(grade => ({
                ...grade,
                user_id: userId,
                graded_at: now
            }));

            await PapersService.saveGrades(gradesWithUser as PaperGrade[]);

            // 更新後のペーパーを再取得
            const papers = await PapersService.getAllPapers(userId);
            set({ papers, loading: false, selectedPapers: new Set<string>() });
        } catch (error) {
            console.error('Error saving grades:', error);
            set({
                error: error instanceof Error ? error.message : '採点結果の保存中にエラーが発生しました',
                loading: false
            });
        }
    },

    /**
     * ペーパーを更新する
     */
    updatePapers: async (updates: PaperUpdateBatch[]) => {
        set({ loading: true, error: null });
        try {
            await PapersService.updatePapers(updates);

            // 現在のペーパーリストを更新
            const { papers } = get();
            const updatedPapers = papers.map(paper => {
                const update = updates.find(u => u.id === paper.id);
                if (!update) return paper;

                return {
                    ...paper,
                    ...(update.is_correct !== undefined && { is_correct: update.is_correct }),
                    ...(update.last_practiced !== undefined && { last_practiced: update.last_practiced }),
                    ...(update.next_practice_date !== undefined && { next_practice_date: update.next_practice_date }),
                    ...(update.tags !== undefined && { tags: update.tags }),
                    updated_at: new Date().toISOString()
                };
            });

            set({ papers: updatedPapers, loading: false });
        } catch (error) {
            console.error('Error updating papers:', error);
            set({
                error: error instanceof Error ? error.message : 'ペーパーの更新中にエラーが発生しました',
                loading: false
            });
        }
    },

    /**
     * ペーパーを削除する
     */
    deletePapers: async (paperIds: string[]) => {
        set({ loading: true, error: null });
        try {
            await PapersService.deletePapers(paperIds);

            // 削除したペーパーをリストから除外
            const { papers, selectedPapers } = get();
            const updatedPapers = papers.filter(p => !paperIds.includes(p.id));

            // 選択リストからも削除
            const newSelectedPapers = new Set(selectedPapers);
            paperIds.forEach(id => newSelectedPapers.delete(id));

            set({
                papers: updatedPapers,
                selectedPapers: newSelectedPapers,
                loading: false
            });
        } catch (error) {
            console.error('Error deleting papers:', error);
            set({
                error: error instanceof Error ? error.message : 'ペーパーの削除中にエラーが発生しました',
                loading: false
            });
        }
    },

    /**
     * ペーパーを選択する
     */
    selectPaper: (paperId: string) => {
        const { selectedPapers } = get();
        const newSelection = new Set(selectedPapers);
        newSelection.add(paperId);
        set({ selectedPapers: newSelection });
    },

    /**
     * ペーパーの選択を解除する
     */
    deselectPaper: (paperId: string) => {
        const { selectedPapers } = get();
        const newSelection = new Set(selectedPapers);
        newSelection.delete(paperId);
        set({ selectedPapers: newSelection });
    },

    /**
     * ペーパーの選択状態を切り替える
     */
    togglePaperSelection: (paperId: string) => {
        const { selectedPapers } = get();
        const newSelection = new Set(selectedPapers);

        if (newSelection.has(paperId)) {
            newSelection.delete(paperId);
        } else {
            newSelection.add(paperId);
        }

        set({ selectedPapers: newSelection });
    },

    /**
     * すべてのペーパーを選択する
     */
    selectAllPapers: () => {
        const { papers } = get();
        const allIds = new Set(papers.map(p => p.id));
        set({ selectedPapers: allIds });
    },

    /**
     * すべてのペーパーの選択を解除する
     */
    deselectAllPapers: () => {
        set({ selectedPapers: new Set<string>() });
    },

    /**
     * 統計情報を取得する
     */
    fetchStats: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const stats = await PapersService.getUserStats(userId);
            set({ stats, loading: false });
        } catch (error) {
            console.error('Error fetching stats:', error);
            set({
                error: error instanceof Error ? error.message : '統計情報の取得中にエラーが発生しました',
                loading: false
            });
        }
    }
}));

