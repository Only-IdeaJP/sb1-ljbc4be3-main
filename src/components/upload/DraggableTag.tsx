// src/components/upload/DraggableTag.tsx
import { Tag as TagIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { TAG_COLORS, TagStyle } from "../../constant/Constant";

interface DraggableTagProps {
    tag: string;
    onClick?: () => void;      // Optional callbacks
    onDragStart?: () => void;
    onDragEnd?: () => void;
    className?: string;
}

// Keep track of the currently hovered drop target during a touch drag
let currentDropTargetElement: Element | null = null;

const DraggableTag: React.FC<DraggableTagProps> = ({
    tag,
    onClick,
    onDragStart,
    onDragEnd,
    className = "",
}) => {
    const tagStyle: TagStyle =
        TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isTouchDragging, setIsTouchDragging] = useState(false);
    const lastTouchRef = useRef({ clientX: 0, clientY: 0 });
    const dragStartThreshold = 10; // Pixels to move before drag starts

    useEffect(() => {
        setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
        return () => {
            if (isTouchDragging) cleanupTouchDrag();
            currentDropTargetElement = null;
        };
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (isTouchDevice) return;
        e.dataTransfer.setData("tag", tag);
        e.dataTransfer.effectAllowed = "copy";
        if (e.dataTransfer.setDragImage) {
            const tagEl = e.currentTarget.cloneNode(true) as HTMLElement;
            tagEl.style.position = "absolute";
            tagEl.style.top = "-1000px";
            tagEl.style.opacity = "0.8";
            document.body.appendChild(tagEl);
            e.dataTransfer.setDragImage(tagEl, 10, 10);
            setTimeout(() => document.body.removeChild(tagEl), 0);
        }
        document.body.classList.add("tag-dragging");
        onDragStart?.();
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (isTouchDevice) return;
        document.body.classList.remove("tag-dragging");
        console.log(`Drag ended for tag: ${tag}. Drop effect: ${e.dataTransfer.dropEffect}`);
        onDragEnd?.();
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || e.touches.length !== 1) return;
        const touch = e.touches[0];
        lastTouchRef.current = { clientX: touch.clientX, clientY: touch.clientY };
        setIsTouchDragging(false);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const { clientX: x, clientY: y } = touch;
        if (!isTouchDragging) {
            const dx = Math.abs(x - lastTouchRef.current.clientX);
            const dy = Math.abs(y - lastTouchRef.current.clientY);
            if (dx > dragStartThreshold || dy > dragStartThreshold) {
                setIsTouchDragging(true);
                document.body.classList.add("tag-dragging");
                createGhostElement(tag, tagStyle);
                updateGhostPosition(x, y);
                lastTouchRef.current = { clientX: x, clientY: y };
                onDragStart?.();
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || !isTouchDragging) {
            cleanupTouchDrag();
            return;
        }
        e.preventDefault();
        const touch = e.changedTouches[0];
        const finalTarget = findDropTargetAtPoint(touch.clientX, touch.clientY);
        if (finalTarget) {
            finalTarget.dispatchEvent(new CustomEvent("tagdrop", { bubbles: true, detail: { tag } }));
        } else if (currentDropTargetElement) {
            dispatchTagDragLeave(currentDropTargetElement);
        }
        cleanupTouchDrag();
        onDragEnd?.();
    };

    const handleTouchCancel = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || !isTouchDragging) return;
        e.preventDefault();
        if (currentDropTargetElement) dispatchTagDragLeave(currentDropTargetElement);
        cleanupTouchDrag();
        onDragEnd?.();
    };

    const createGhostElement = (tagText: string, style: TagStyle) => {
        let ghost = document.getElementById("touch-drag-ghost");
        if (!ghost) {
            ghost = document.createElement("div");
            ghost.id = "touch-drag-ghost";
            ghost.style.position = "fixed";
            ghost.style.zIndex = "9999";
            ghost.style.pointerEvents = "none";
            ghost.style.opacity = "0.8";
            ghost.style.borderRadius = "999px";
            ghost.style.padding = "6px 12px";
            ghost.style.fontSize = "14px";
            ghost.style.fontWeight = "500";
            ghost.style.whiteSpace = "nowrap";
            ghost.style.transform = "translate(-50%, -50%)";
            ghost.className = `${style.bg} ${style.text} ${style.border}`;
            document.body.appendChild(ghost);
        }
        ghost.innerText = tagText;
    };

    const updateGhostPosition = (x: number, y: number) => {
        const ghost = document.getElementById("touch-drag-ghost");
        if (ghost) {
            ghost.style.left = `${x}px`;
            ghost.style.top = `${y}px`;
        }
    };

    const cleanupTouchDrag = () => {
        document.body.classList.remove("tag-dragging");
        const ghost = document.getElementById("touch-drag-ghost");
        if (ghost) ghost.remove();
        setIsTouchDragging(false);
        currentDropTargetElement = null;
    };

    useEffect(() => {
        const handleGlobalTouchMove = (e: TouchEvent) => {
            if (!isTouchDragging || e.touches.length !== 1) return;
            e.preventDefault();
            const touch = e.touches[0];
            updateGhostPosition(touch.clientX, touch.clientY);
            lastTouchRef.current = { clientX: touch.clientX, clientY: touch.clientY };
            const target = findDropTargetAtPoint(touch.clientX, touch.clientY);
            if (target !== currentDropTargetElement) {
                if (currentDropTargetElement) dispatchTagDragLeave(currentDropTargetElement);
                if (target) dispatchTagDragEnter(target);
                currentDropTargetElement = target;
            }
        };

        if (isTouchDragging) {
            window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
        }
        return () => {
            window.removeEventListener("touchmove", handleGlobalTouchMove);
            if (currentDropTargetElement && isTouchDragging) {
                dispatchTagDragLeave(currentDropTargetElement);
                currentDropTargetElement = null;
            }
        };
    }, [isTouchDragging]);

    const findDropTargetAtPoint = (x: number, y: number): Element | null => {
        const ghost = document.getElementById("touch-drag-ghost");
        let prevDisplay = "";
        if (ghost) {
            prevDisplay = ghost.style.display;
            ghost.style.display = "none";
        }
        const el = document.elementFromPoint(x, y);
        if (ghost) ghost.style.display = prevDisplay;
        return el?.closest('[data-droppable="true"]') || null;
    };

    const dispatchTagDragEnter = (target: Element) => {
        target.dispatchEvent(new CustomEvent("tagdragenter", { bubbles: true }));
    };

    const dispatchTagDragLeave = (target: Element) => {
        target.dispatchEvent(new CustomEvent("tagdragleave", { bubbles: true }));
    };

    return (
        <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium select-none ${tagStyle.bg} ${tagStyle.text} ${tagStyle.hoverBg} border ${tagStyle.border} cursor-pointer transition-colors transform hover:scale-105 ${className}`}
            onClick={!isTouchDragging ? onClick : undefined}
            draggable={!isTouchDevice}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            data-tag={tag}
            style={{
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
                msUserSelect: "none",
            }}
        >
            <TagIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span className="truncate">{tag}</span>
        </div>
    );
};

export default DraggableTag;
