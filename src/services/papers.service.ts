
// services/papers.service.ts
import { supabase } from '../lib/supabase';
import {
    Paper,
    PaperGrade,
    PapersSearchParams,
    PaperUpdateBatch,
    Stats
} from '../types/papers.types';

/**
 * ペーパー管理に関連する操作を提供するサービス
 */
export const PapersService = {
    /**
     * ユーザーのすべてのペーパーを取得する
     * @param userId ユーザーID
     * @returns ペーパーの配列
     */
    getAllPapers: async (userId: string): Promise<Paper[]> => {
        try {
            const { data, error } = await supabase
                .from('papers')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching papers:', error);
            throw error instanceof Error
                ? error
                : new Error('ペーパーの取得中にエラーが発生しました');
        }
    },

    /**
     * 検索条件に基づいてペーパーを検索する
     * @param params 検索パラメータ
     * @returns ペーパーの配列
     */
    searchPapers: async (params: PapersSearchParams): Promise<Paper[]> => {
        try {
            let query = supabase
                .from('papers')
                .select('*')
                .eq('user_id', params.userId);

            // タグによるフィルタリング
            if (params.tags && params.tags.length > 0) {
                // Supabaseの配列の重複チェック
                query = query.contains('tags', params.tags);
            }

            // 正解/不正解によるフィルタリング
            if (params.isCorrect !== undefined) {
                query = query.eq('is_correct', params.isCorrect);
            }

            // 復習期限によるフィルタリング
            if (params.dueForReview) {
                const now = new Date().toISOString();
                query = query.or(`is_correct.eq.false,next_practice_date.lte.${now}`);
            }

            // 日付範囲によるフィルタリング
            if (params.dateFrom) {
                query = query.gte('created_at', params.dateFrom);
            }

            if (params.dateTo) {
                query = query.lte('created_at', params.dateTo);
            }

            // ページネーション
            if (params.limit) {
                query = query.limit(params.limit);
            }

            if (params.page && params.limit) {
                const offset = (params.page - 1) * params.limit;
                query = query.range(offset, offset + params.limit - 1);
            }

            // 結果の取得
            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching papers:', error);
            throw error instanceof Error
                ? error
                : new Error('ペーパーの検索中にエラーが発生しました');
        }
    },

    /**
     * 特定の日付のペーパーを取得する
     * @param userId ユーザーID
     * @param date 日付（YYYY-MM-DD形式）
     * @returns ペーパーの配列
     */
    getPapersByDate: async (userId: string, date: string): Promise<Paper[]> => {
        try {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            const { data, error } = await supabase
                .from('papers')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching papers by date:', error);
            throw error instanceof Error
                ? error
                : new Error('指定日付のペーパー取得中にエラーが発生しました');
        }
    },

    /**
     * 指定されたIDのペーパーを取得する
     * @param paperId ペーパーID
     * @returns ペーパーオブジェクト
     */
    getPaperById: async (paperId: string): Promise<Paper> => {
        try {
            const { data, error } = await supabase
                .from('papers')
                .select('*')
                .eq('id', paperId)
                .single();

            if (error) throw error;
            return data as Paper;
        } catch (error) {
            console.error('Error fetching paper by ID:', error);
            throw error instanceof Error
                ? error
                : new Error('ペーパー情報の取得中にエラーが発生しました');
        }
    },

    /**
     * 新しいペーパーを作成する
     * @param paper ペーパーデータ
     * @returns 作成したペーパー
     */
    createPaper: async (paper: Omit<Paper, 'id' | 'created_at' | 'updated_at'>): Promise<Paper> => {
        try {
            const now = new Date().toISOString();
            const newPaper = {
                ...paper,
                created_at: now,
                updated_at: now
            };

            const { data, error } = await supabase
                .from('papers')
                .insert([newPaper])
                .select()
                .single();

            if (error) throw error;
            return data as Paper;
        } catch (error) {
            console.error('Error creating paper:', error);
            throw error instanceof Error
                ? error
                : new Error('ペーパーの作成中にエラーが発生しました');
        }
    },

    /**
     * 複数のペーパーを更新する
     * @param updates 更新データの配列
     * @returns 更新されたペーパーの数
     */
    updatePapers: async (updates: PaperUpdateBatch[]): Promise<number> => {
        try {
            const now = new Date().toISOString();
            const updateData = updates.map(update => ({
                id: update.id,
                ...(update.is_correct !== undefined && { is_correct: update.is_correct }),
                ...(update.last_practiced !== undefined && { last_practiced: update.last_practiced }),
                ...(update.next_practice_date !== undefined && { next_practice_date: update.next_practice_date }),
                ...(update.tags !== undefined && { tags: update.tags }),
                updated_at: now
            }));

            const { error } = await supabase
                .from('papers')
                .upsert(updateData, { onConflict: 'id' });

            if (error) throw error;
            return updateData.length;
        } catch (error) {
            console.error('Error updating papers:', error);
            throw error instanceof Error
                ? error
                : new Error('ペーパーの更新中にエラーが発生しました');
        }
    },

    /**
     * ペーパーを削除する
     * @param paperIds 削除するペーパーのID配列
     * @returns 削除に成功したかどうか
     */
    deletePapers: async (paperIds: string[]): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('papers')
                .delete()
                .in('id', paperIds);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting papers:', error);
            throw error instanceof Error
                ? error
                : new Error('ペーパーの削除中にエラーが発生しました');
        }
    },

    /**
     * ペーパーの採点結果を保存する
     * @param grades 採点結果の配列
     * @returns 保存に成功したかどうか
     */
    saveGrades: async (grades: PaperGrade[]): Promise<boolean> => {
        try {
            // 採点結果の登録
            const { error: gradeError } = await supabase
                .from('paper_grades')
                .insert(grades);

            if (gradeError) throw gradeError;

            // ペーパーの状態更新
            const updates = grades.map(grade => ({
                id: grade.paper_id,
                is_correct: grade.is_correct,
                last_practiced: grade.graded_at,
                next_practice_date: calculateNextReviewDate(grade.is_correct, grade.graded_at)
            }));

            await PapersService.updatePapers(updates);

            return true;
        } catch (error) {
            console.error('Error saving grades:', error);
            throw error instanceof Error
                ? error
                : new Error('採点結果の保存中にエラーが発生しました');
        }
    },

    /**
     * ユーザーの統計情報を取得する
     * @param userId ユーザーID
     * @returns 統計情報
     */
    getUserStats: async (userId: string): Promise<Stats> => {
        try {
            // すべてのペーパーを取得
            const papers = await PapersService.getAllPapers(userId);

            if (!papers || papers.length === 0) {
                return {
                    totalPapers: 0,
                    correctRate: 0,
                    reviewDue: 0,
                    totalStorageKB: 0,
                    tagDistribution: {},
                    weeklyProgress: [],
                    recentActivity: []
                };
            }

            // 復習が必要なペーパーの数
            const reviewDue = papers.filter(
                p => p.next_practice_date && new Date(p.next_practice_date) <= new Date()
            ).length;

            // ストレージ使用量（概算）
            const totalStorageKB = papers.length * 200; // 1ペーパーあたり約200KBと仮定

            // タグの分布
            const tagDistribution: Record<string, number> = {};
            papers.forEach(paper => {
                paper.tags?.forEach(tag => {
                    tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
                });
            });

            // 週間進捗
            const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                const nextDate = new Date(date);
                nextDate.setDate(date.getDate() + 1);

                return {
                    date: date.toISOString().split('T')[0],
                    count: papers.filter(
                        p => p.last_practiced &&
                            new Date(p.last_practiced) >= date &&
                            new Date(p.last_practiced) < nextDate
                    ).length
                };
            }).reverse();

            // 最近のアクティビティ
            const recentActivity = papers
                .filter(p => p.last_practiced)
                .map(p => ({
                    id: p.id,
                    type: p.is_correct ? "grade" as const : "practice" as const,
                    timestamp: p.last_practiced!
                }))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5);

            // 正解率
            const correctPapers = papers.filter(p => p.is_correct).length;
            const correctRate = (correctPapers / papers.length) * 100;

            return {
                totalPapers: papers.length,
                correctRate,
                reviewDue,
                totalStorageKB,
                tagDistribution,
                weeklyProgress,
                recentActivity
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error instanceof Error
                ? error
                : new Error('統計情報の取得中にエラーが発生しました');
        }
    }
};

/**
 * 次回の復習日を計算する
 * @param isCorrect 正解かどうか
 * @param lastPracticed 最後に練習した日時
 * @returns 次回の復習日（null=復習不要）
 */
function calculateNextReviewDate(isCorrect: boolean, lastPracticed: string): string | null {
    if (isCorrect) return null; // 正解の場合は復習不要

    const now = new Date();
    const last = lastPracticed ? new Date(lastPracticed) : now;
    const daysSinceLastPractice = Math.floor(
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 以前の練習からの経過日数に基づいて次の復習日を設定
    let daysToAdd: number;

    if (daysSinceLastPractice >= 30) {
        daysToAdd = 30;
    } else if (daysSinceLastPractice >= 7) {
        daysToAdd = 7;
    } else if (daysSinceLastPractice >= 3) {
        daysToAdd = 3;
    } else {
        daysToAdd = 1;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    return nextDate.toISOString();
}