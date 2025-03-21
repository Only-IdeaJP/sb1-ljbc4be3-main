// src/models/stats.ts
/**
 * 統計データモデル
 */
export interface Stats {
    totalPapers: number;
    totalStorageKB: number;
    reviewDue: number;
    weeklyProgress: { date: string; count: number }[];
    recentActivity: { id: string; type: string; timestamp: string }[];
}