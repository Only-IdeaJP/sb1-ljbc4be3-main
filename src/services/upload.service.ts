// src/services/upload.service.ts

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';


interface UploadResult {
    success: boolean;
    publicUrl?: string;
    error?: string;
}

/**
 * アップロードサービス
 * ファイルのアップロードとデータベース登録を処理する
 */
export const UploadService = {
    /**
     * 画像ファイルをアップロードする
     * @param userId ユーザーID
     * @param file 画像ファイル
     * @param tags タグ配列
     */
    uploadImageFile: async (
        userId: string,
        file: File,
        tags: string[] = []
    ): Promise<UploadResult> => {
        try {
            // ファイル拡張子を取得
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/${uuidv4()}.${fileExt}`;

            // Storageにアップロード
            const { error: uploadError } = await supabase.storage
                .from('papers')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('画像アップロードエラー:', uploadError);
                return {
                    success: false,
                    error: `ファイルのアップロードに失敗しました: ${uploadError.message}`
                };
            }

            // 公開URLを取得
            const { data: urlData } = supabase.storage
                .from('papers')
                .getPublicUrl(filePath);

            // データベースに保存
            const { error: dbError } = await supabase
                .from('papers')
                .insert({
                    user_id: userId,
                    file_path: urlData.publicUrl,
                    tags: tags,
                    is_correct: false,
                    next_practice_date: null
                });

            if (dbError) {
                console.error('データベース登録エラー:', dbError);
                return {
                    success: false,
                    error: `データベース保存に失敗しました: ${dbError.message}`
                };
            }

            return {
                success: true,
                publicUrl: urlData.publicUrl
            };
        } catch (error: any) {
            console.error('画像アップロード処理エラー:', error);
            return {
                success: false,
                error: error.message || 'ファイルのアップロード中にエラーが発生しました'
            };
        }
    },

    /**
     * PDFページ画像をアップロードする
     * @param userId ユーザーID
     * @param imageData ページの画像データ (Base64文字列)
     * @param tags タグ配列
     */
    uploadPdfPage: async (
        userId: string,
        imageData: string,
        tags: string[] = []
    ): Promise<UploadResult> => {
        try {
            // Base64データをBlobに変換
            const res = await fetch(imageData);
            const blob = await res.blob();

            // Storageにアップロード
            const filePath = `${userId}/${uuidv4()}.png`;

            const { error: uploadError } = await supabase.storage
                .from('papers')
                .upload(filePath, blob, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: 'image/png'
                });

            if (uploadError) {
                console.error('PDF画像アップロードエラー:', uploadError);
                return {
                    success: false,
                    error: `ページのアップロードに失敗しました: ${uploadError.message}`
                };
            }

            // 公開URLを取得
            const { data: urlData } = supabase.storage
                .from('papers')
                .getPublicUrl(filePath);

            // データベースに保存
            const { error: dbError } = await supabase
                .from('papers')
                .insert({
                    user_id: userId,
                    file_path: urlData.publicUrl,
                    tags: tags,
                    is_correct: false,
                    next_practice_date: null
                });

            if (dbError) {
                console.error('PDF画像データベース登録エラー:', dbError);
                return {
                    success: false,
                    error: `データベース保存に失敗しました: ${dbError.message}`
                };
            }

            return {
                success: true,
                publicUrl: urlData.publicUrl
            };
        } catch (error: any) {
            console.error('PDF画像アップロード処理エラー:', error);
            return {
                success: false,
                error: error.message || 'ページのアップロード中にエラーが発生しました'
            };
        }
    },

    /**
     * ユーザーのアップロードイベントを記録する
     * @param userId ユーザーID
     * @param count アップロードしたアイテム数
     */
    recordUploadEvent: async (userId: string, count: number): Promise<void> => {
        try {
            await supabase
                .from('events')
                .insert({
                    user_id: userId,
                    type: 'upload',
                    data: { count }
                });
        } catch (error) {
            console.error('アップロードイベント記録エラー:', error);
        }
    },

    /**
     * ストレージ使用量を取得する（概算）
     * @param userId ユーザーID
     */
    getStorageUsage: async (userId: string): Promise<number> => {
        try {
            const { data, error } = await supabase
                .from('papers')
                .select('id')
                .eq('user_id', userId);

            if (error) {
                throw error;
            }

            // 概算: 1ファイルあたり平均 200KB と仮定
            return (data?.length || 0) * 200;
        } catch (error) {
            console.error('ストレージ使用量取得エラー:', error);
            return 0;
        }
    }
};