// src/models/paper-grade.ts
/**
 * ペーパー採点結果データモデル
 */
export interface PaperGrade {
    id: string;
    paper_id: string;
    user_id: string;
    is_correct: boolean;
    graded_at: string;
    created_at: string;
}
