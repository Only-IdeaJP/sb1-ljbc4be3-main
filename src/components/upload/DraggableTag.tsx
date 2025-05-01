// src/components/upload/DraggableTag.tsx の修正

import { Tag as TagIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { TAG_COLORS, TagStyle } from "../../constant/Constant";

interface DraggableTagProps {
    tag: string;
    onClick?: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    className?: string;
}

/**
 * ドラッグ可能なタグコンポーネント
 * タグのドラッグ＆ドロップ機能を提供、タグごとに色分け
 */
const DraggableTag: React.FC<DraggableTagProps> = ({
    tag,
    onClick,
    onDragStart,
    onDragEnd,
    className = "",
}) => {
    // タグ用の色を直接TAG_COLORSから取得
    const tagStyle: TagStyle = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
    // タッチデバイス検出のための状態
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    // タッチドラッグ中の状態
    const [isTouchDragging, setIsTouchDragging] = useState(false);
    // 最後のタッチ位置
    const [lastTouch, setLastTouch] = useState({ clientX: 0, clientY: 0 });

    // コンポーネントマウント時にタッチデバイスか確認
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    /**
     * ドラッグ開始ハンドラ
     */
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        // ドラッグデータをセット
        e.dataTransfer.setData('tag', tag);
        e.dataTransfer.effectAllowed = "copy";

        // フィードバック画像のカスタマイズ
        if (e.dataTransfer.setDragImage) {
            // タグのクローンを作成
            const tagEl = e.currentTarget.cloneNode(true) as HTMLElement;
            tagEl.style.position = 'absolute';
            tagEl.style.top = '-1000px';
            tagEl.style.opacity = '0.8';
            document.body.appendChild(tagEl);

            // ドラッグ画像を設定
            e.dataTransfer.setDragImage(tagEl, 10, 10);

            // 遅延してクリーンアップ
            setTimeout(() => {
                document.body.removeChild(tagEl);
            }, 0);
        }

        // ドラッグ開始時のクラスを追加
        document.body.classList.add('tag-dragging');

        if (onDragStart) {
            onDragStart();
        }
    };

    /**
     * ドラッグ終了ハンドラ
     */
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        // デバッグ情報
        console.log(`Drag ended for tag: ${tag}`);
        console.log("Drag result:", e.dataTransfer.dropEffect);

        // ドラッグ終了時のクラスを削除
        document.body.classList.remove('tag-dragging');

        if (onDragEnd) {
            onDragEnd();
        }
    };

    // タッチ開始ハンドラ
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice) return;

        // クリックイベントが先に発生しないように
        e.preventDefault();

        // 最初のタッチポイントを保存
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            setLastTouch({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    };

    // タッチ移動ハンドラ
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || isTouchDragging) return;

        if (e.touches.length === 1) {
            const touch = e.touches[0];

            // 移動距離が閾値を超えたらドラッグ開始
            const deltaX = Math.abs(touch.clientX - lastTouch.clientX);
            const deltaY = Math.abs(touch.clientY - lastTouch.clientY);

            if (deltaX > 10 || deltaY > 10) {
                setIsTouchDragging(true);

                // ドラッグ開始時の処理
                document.body.classList.add('tag-dragging');

                // カスタムイベントでドラッグデータを伝える
                const customEvent = new CustomEvent('tagdragstart', {
                    bubbles: true,
                    detail: { tag, element: e.currentTarget }
                });
                e.currentTarget.dispatchEvent(customEvent);

                if (onDragStart) {
                    onDragStart();
                }

                // タグのクローンを作成してドラッグ視覚効果として表示
                const ghostTag = document.createElement('div');
                ghostTag.id = 'touch-drag-ghost';
                ghostTag.innerText = tag;
                ghostTag.className = `fixed z-50 ${tagStyle.bg} ${tagStyle.text} py-1 px-3 rounded-full opacity-80 pointer-events-none`;
                document.body.appendChild(ghostTag);

                // ゴーストタグの位置を更新
                updateGhostPosition(touch.clientX, touch.clientY);
            }
        }
    };

    // タッチ終了ハンドラ
    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || !isTouchDragging) return;

        e.preventDefault();

        // ドラッグ終了時の処理
        document.body.classList.remove('tag-dragging');
        setIsTouchDragging(false);

        // 最後のタッチ位置を取得
        const lastTouchX = lastTouch.clientX;
        const lastTouchY = lastTouch.clientY;

        // ゴーストタグを削除
        const ghostTag = document.getElementById('touch-drag-ghost');
        if (ghostTag) {
            document.body.removeChild(ghostTag);
        }

        // ドロップターゲットを探す
        const dropTarget = findDropTarget(lastTouchX, lastTouchY);
        if (dropTarget) {
            // カスタムドロップイベントを発行
            const dropEvent = new CustomEvent('tagdrop', {
                bubbles: true,
                detail: { tag }
            });
            dropTarget.dispatchEvent(dropEvent);
        }

        if (onDragEnd) {
            onDragEnd();
        }
    };

    // タッチがキャンセルされた場合のハンドラ
    const handleTouchCancel = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || !isTouchDragging) return;

        // クリーンアップ
        document.body.classList.remove('tag-dragging');
        setIsTouchDragging(false);

        // ゴーストタグを削除
        const ghostTag = document.getElementById('touch-drag-ghost');
        if (ghostTag) {
            document.body.removeChild(ghostTag);
        }

        if (onDragEnd) {
            onDragEnd();
        }
    };

    // ゴーストタグの位置を更新する関数
    const updateGhostPosition = (x: number, y: number) => {
        const ghostTag = document.getElementById('touch-drag-ghost');
        if (ghostTag) {
            ghostTag.style.left = `${x - 50}px`; // 中央に調整
            ghostTag.style.top = `${y - 25}px`;  // 中央に調整

            // 最後のタッチ位置を更新
            setLastTouch({ clientX: x, clientY: y });
        }
    };

    // ドロップターゲットを見つける関数
    const findDropTarget = (x: number, y: number) => {
        // ドロップ可能なエリア（DroppableAreaコンポーネント）を探す
        const elements = document.elementsFromPoint(x, y);
        for (const element of elements) {
            // ドロップ対象としてマークされた要素を探す
            if (element.classList.contains('droppable-area') ||
                element.hasAttribute('data-droppable') ||
                element.id.includes('droppable')) {
                return element;
            }
        }
        return null;
    };

    // タッチムーブイベントのグローバルハンドラ（ドラッグ中のみ）
    useEffect(() => {
        const handleGlobalTouchMove = (e: TouchEvent) => {
            if (isTouchDragging && e.touches.length === 1) {
                const touch = e.touches[0];
                updateGhostPosition(touch.clientX, touch.clientY);
            }
        };

        if (isTouchDragging) {
            window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
        }

        return () => {
            window.removeEventListener('touchmove', handleGlobalTouchMove);
        };
    }, [isTouchDragging]);

    // コンポーネントのアンマウント時にクラスを削除
    useEffect(() => {
        return () => {
            document.body.classList.remove('tag-dragging');
            // ゴーストタグがあれば削除
            const ghostTag = document.getElementById('touch-drag-ghost');
            if (ghostTag) {
                document.body.removeChild(ghostTag);
            }
        };
    }, []);

    return (
        <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${tagStyle.bg} ${tagStyle.text} ${tagStyle.hoverBg} border ${tagStyle.border} cursor-pointer transition-colors transform hover:scale-105 ${className}`}
            onClick={onClick}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            data-tag={tag} // タグ情報をdata属性に保存
        >
            <TagIcon className="w-3.5 h-3.5 mr-1.5" />
            {tag}
        </div>
    );
};

export default DraggableTag;