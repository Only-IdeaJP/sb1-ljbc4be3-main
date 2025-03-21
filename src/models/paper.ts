// src/models/paper.ts
/**
 * ペーパー（問題）データモデル
 */
export interface Paper {
    id: string;
    user_id: string;
    file_path: string;
    tags: string[];
    is_correct: boolean;
    last_practiced: string | null;
    next_practice_date: string | null;
    created_at: string;
    updated_at: string;
}
