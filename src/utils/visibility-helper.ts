// src/utils/visibility-helper.ts

/**
 * タブのvisibility状態を追跡・検知するユーティリティ
 */

// 最後に確認されたvisibility状態
let lastVisibilityState = document.visibilityState;
// visibilityの変更を通知するコールバック関数のリスト
const visibilityChangeCallbacks: ((visible: boolean) => void)[] = [];

/**
 * タブのvisibility状態が変更されたときに実行されるコールバックを登録
 * @param callback 可視性変更時に呼び出されるコールバック関数
 * @returns 登録解除用の関数
 */
export const onVisibilityChange = (callback: (visible: boolean) => void): (() => void) => {
    // コールバックを配列に追加
    visibilityChangeCallbacks.push(callback);

    // 登録解除用の関数を返す
    return () => {
        const index = visibilityChangeCallbacks.indexOf(callback);
        if (index !== -1) {
            visibilityChangeCallbacks.splice(index, 1);
        }
    };
};

/**
 * タブの現在のvisibility状態を返す
 * @returns タブが可視状態かどうか
 */
export const isTabVisible = (): boolean => {
    return document.visibilityState === 'visible';
};

/**
 * 前回のvisibility状態から変化があったかどうかを確認
 * @returns タブのvisibility状態が変化したかどうか
 */
export const hasVisibilityChanged = (): boolean => {
    const currentState = document.visibilityState;
    const changed = lastVisibilityState !== currentState;
    lastVisibilityState = currentState;
    return changed;
};

// visibilitychange イベントのリスナーを設定
document.addEventListener('visibilitychange', () => {
    const isVisible = document.visibilityState === 'visible';

    // すべてのコールバックを実行
    visibilityChangeCallbacks.forEach(callback => {
        try {
            callback(isVisible);
        } catch (error) {
            console.error('Error in visibility change callback:', error);
        }
    });

    // 最後の状態を更新
    lastVisibilityState = document.visibilityState;
});

/**
 * タブが表示状態になったときに1回だけ実行される関数を登録
 * @param callback タブが表示状態になったときに実行される関数
 */
export const runOnceWhenVisible = (callback: () => void): void => {
    if (document.visibilityState === 'visible') {
        // すでに表示状態なら即時実行
        callback();
        return;
    }

    // タブが表示状態になったときに実行するリスナーを設定
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            // コールバックを実行
            callback();
            // リスナーを削除（1回だけ実行）
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
};