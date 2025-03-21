// src/services/events.service.ts
import { supabase } from '../lib/supabase';
import { ApiResponse, Event } from '../models';

/**
 * イベント関連のサービス
 * ユーザーアクションのログや分析のための機能を提供
 */
export const EventsService = {
    /**
     * 新しいイベントを作成
     */
    async createEvent(userId: string, type: string, data: any = {}): Promise<ApiResponse<Event>> {
        try {
            const { data: event, error } = await supabase
                .from('events')
                .insert([{
                    user_id: userId,
                    type,
                    data
                }])
                .select()
                .single();

            if (error) throw error;

            return { data: event };
        } catch (error) {
            console.error('イベント作成エラー:', error);
            return {
                error: {
                    message: error.message || 'イベントの作成に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * ユーザーの全イベントを取得
     */
    async getEvents(userId: string): Promise<ApiResponse<Event[]>> {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { data: data || [] };
        } catch (error) {
            console.error('イベント取得エラー:', error);
            return {
                error: {
                    message: error.message || 'イベントの取得に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * 特定タイプのイベントを取得
     */
    async getEventsByType(userId: string, type: string): Promise<ApiResponse<Event[]>> {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', userId)
                .eq('type', type)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { data: data || [] };
        } catch (error) {
            console.error('イベント取得エラー:', error);
            return {
                error: {
                    message: error.message || 'イベントの取得に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * 日付範囲でイベントを取得
     */
    async getEventsByDateRange(
        userId: string,
        startDate: string,
        endDate: string
    ): Promise<ApiResponse<Event[]>> {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { data: data || [] };
        } catch (error) {
            console.error('日付範囲イベント取得エラー:', error);
            return {
                error: {
                    message: error.message || 'イベントの取得に失敗しました',
                    code: error.code
                }
            };
        }
    },

    /**
     * イベントの集計データを取得
     */
    async getEventStats(userId: string): Promise<ApiResponse<any>> {
        try {
            // 過去7日間の日付を生成
            const dates = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            }).reverse();

            // イベントデータを取得
            const startDate = dates[0] + 'T00:00:00Z';
            const endDate = dates[dates.length - 1] + 'T23:59:59Z';

            const { data: events, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            if (error) throw error;

            // 日付ごとのイベント数を集計
            const dailyCounts = dates.map(date => {
                const count = events.filter(event =>
                    event.created_at.startsWith(date)
                ).length;

                return { date, count };
            });

            // イベントタイプごとの集計
            const typeStats = {};
            events.forEach(event => {
                typeStats[event.type] = (typeStats[event.type] || 0) + 1;
            });

            return {
                data: {
                    dailyCounts,
                    typeStats,
                    totalEvents: events.length
                }
            };
        } catch (error) {
            console.error('イベント統計取得エラー:', error);
            return {
                error: {
                    message: error.message || 'イベント統計の取得に失敗しました',
                    code: error.code
                }
            };
        }
    }
};