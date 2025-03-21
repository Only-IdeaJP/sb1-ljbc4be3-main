// src/services/papers.service.ts
import { supabase } from '../lib/supabase';
import { ApiResponse, Paper } from '../models';

/**
 * ペーパー（問題）関連のサービス
 */
export const PapersService = {
    /**
     * ユーザーの全ペーパーを取得
     */
    async getAllPapers(userId: string): Promise<ApiResponse<Paper[]>> {
        try {
            const { data, error } = await supabase
                .from('papers')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { data: data || [] };
        } catch (error) {
            console.error('ペーパー取得エラー:', error);
            return {
                error: {
                    message: error.message || 'ペーパーの取得に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * 特定の日付のペーパーを取得
     */
    async getPapersByDate(userId: string, date: string): Promise<ApiResponse<Paper[]>> {
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

            return { data: data || [] };
        } catch (error) {
            console.error('日付別ペーパー取得エラー:', error);
            return {
                error: {
                    message: error.message || 'ペーパーの取得に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * 復習が必要なペーパーを取得
     */
    async getPapersForReview(userId: string): Promise<ApiResponse<Paper[]>> {
        try {
            const now = new Date().toISOString();

            const { data, error } = await supabase
                .from('papers')
                .select('*')
                .eq('user_id', userId)
                .or(`is_correct.eq.false,next_practice_date.lte.${now}`);

            if (error) throw error;

            return { data: data || [] };
        } catch (error) {
            console.error('復習用ペーパー取得エラー:', error);
            return {
                error: {
                    message: error.message || 'ペーパーの取得に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * ペーパーの採点結果を保存
     */
    async gradePapers(
        userId: string,
        paperGrades: { id: string; is_correct: boolean }[]
    ): Promise<ApiResponse<null>> {
        try {
            const now = new Date().toISOString();

            // 採点結果を更新
            const updates = paperGrades.map(({ id, is_correct }) => ({
                id,
                is_correct,
                last_practiced: now,
                next_practice_date: this.calculateNextReviewDate(is_correct, null)
            }));

            const { error: updateError } = await supabase
                .from('papers')
                .upsert(updates, { onConflict: ['id'] });

            if (updateError) throw updateError;

            // 採点履歴を記録
            const grades = paperGrades.map(({ id, is_correct }) => ({
                paper_id: id,
                user_id: userId,
                is_correct,
                graded_at: now
            }));

            const { error: gradeError } = await supabase
                .from('paper_grades')
                .insert(grades);

            if (gradeError) throw gradeError;

            return { data: null };
        } catch (error) {
            console.error('ペーパー採点エラー:', error);
            return {
                error: {
                    message: error.message || 'ペーパーの採点に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * 複数のペーパーを削除
     */
    async deletePapers(userId: string, paperIds: string[]): Promise<ApiResponse<null>> {
        try {
            const { error } = await supabase
                .from('papers')
                .delete()
                .eq('user_id', userId)
                .in('id', paperIds);

            if (error) throw error;

            return { data: null };
        } catch (error) {
            console.error('ペーパー削除エラー:', error);
            return {
                error: {
                    message: error.message || 'ペーパーの削除に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * ペーパーのタグを更新
     */
    async updatePaperTags(
        userId: string,
        paperId: string,
        tags: string[]
    ): Promise<ApiResponse<Paper>> {
        try {
            const { data, error } = await supabase
                .from('papers')
                .update({ tags })
                .eq('id', paperId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;

            return { data };
        } catch (error) {
            console.error('タグ更新エラー:', error);
            return {
                error: {
                    message: error.message || 'タグの更新に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * 次の復習日を計算
     * 不正解の場合、前回の演習からの日数に応じて次の復習日を設定
     */
    calculateNextReviewDate(
        isCorrect: boolean,
        lastPracticed: string | null
    ): string | null {
        if (isCorrect) return null;

        const now = new Date();
        const last = lastPracticed ? new Date(lastPracticed) : now;
        const daysSinceLastPractice = Math.floor(
            (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
        );

        // 忘却曲線に基づいた復習間隔
        const daysToAdd =
            daysSinceLastPractice >= 30
                ? 30 // 30日以上前なら30日後
                : daysSinceLastPractice >= 7
                    ? 7 // 7-29日前なら7日後
                    : 3; // 7日未満前なら3日後

        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        return nextDate.toISOString();
    }
};