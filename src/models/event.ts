// src/models/event.ts
/**
 * イベントデータモデル
 */
export interface Event {
    id: string;
    user_id: string;
    type: string;
    data: any; // TODO: 具体的なイベントタイプに基づいて型付けする
    created_at: string;
    updated_at: string;
}