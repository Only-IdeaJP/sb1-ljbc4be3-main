// types/papers.types.ts
/**
 * ペーパー（問題）のインターフェース
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

/**
 * ペーパーの採点結果のインターフェース
 */
export interface PaperGrade {
    id?: string;
    paper_id: string;
    user_id: string;
    is_correct: boolean;
    graded_at: string;
}

/**
 * 統計情報のインターフェース
 */
export interface Stats {
    totalPapers: number;
    correctRate: number;
    reviewDue: number;
    totalStorageKB: number;
    tagDistribution: Record<string, number>;
    weeklyProgress: { date: string; count: number }[];
    recentActivity: {
        id: string;
        type: "grade" | "practice" | "upload";
        timestamp: string;
    }[];
}

/**
 * API検索パラメータのインターフェース
 */
export interface PapersSearchParams {
    userId: string;
    tags?: string[];
    isCorrect?: boolean;
    dueForReview?: boolean;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    page?: number;
}

/**
 * バッチ更新のための入力インターフェース
 */
export interface PaperUpdateBatch {
    id: string;
    is_correct?: boolean;
    last_practiced?: string;
    next_practice_date?: string | null;
    tags?: string[];
}
