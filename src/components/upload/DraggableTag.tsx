import { Tag as TagIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { TAG_COLORS, TagStyle } from "../../constant/Constant";

interface DraggableTagProps {
    tag: string;
    onClick?: () => void;
    onDragStart?: () => void; // Optional callbacks
    onDragEnd?: () => void;   // Optional callbacks
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
    const tagStyle: TagStyle = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isTouchDragging, setIsTouchDragging] = useState(false);
    const lastTouchRef = useRef({ clientX: 0, clientY: 0 });
    const dragStartThreshold = 10; // Pixels to move before drag starts

    useEffect(() => {
        // Check for touch support only once
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

        // Cleanup function to reset state if component unmounts mid-drag
        return () => {
            if (isTouchDragging) { // Use the state directly here
                cleanupTouchDrag();
            }
            currentDropTargetElement = null; // Reset global tracker on unmount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on mount

    // Native HTML5 Drag Handlers (for desktop)
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (isTouchDevice) return; // Prevent conflict with touch

        e.dataTransfer.setData('tag', tag);
        e.dataTransfer.effectAllowed = "copy";

        // Optional: Custom drag image (already implemented)
        if (e.dataTransfer.setDragImage) {
            const tagEl = e.currentTarget.cloneNode(true) as HTMLElement;
            tagEl.style.position = 'absolute';
            tagEl.style.top = '-1000px'; // Position off-screen
            tagEl.style.opacity = '0.8';
            document.body.appendChild(tagEl);
            e.dataTransfer.setDragImage(tagEl, 10, 10); // Adjust offset as needed
            setTimeout(() => document.body.removeChild(tagEl), 0);
        }

        document.body.classList.add('tag-dragging');
        onDragStart?.();
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (isTouchDevice) return;

        document.body.classList.remove('tag-dragging');
        console.log(`Drag ended for tag: ${tag}. Drop effect: ${e.dataTransfer.dropEffect}`);
        onDragEnd?.();
    };

    // Touch Event Handlers (for mobile/touch devices)
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice) return;
        // Only respond to single touch
        if (e.touches.length !== 1) return;

        // Prevent potential conflicts (like triggering click after drag)
        // e.preventDefault(); // Be cautious: might prevent scrolling if needed nearby

        const touch = e.touches[0];
        lastTouchRef.current = { clientX: touch.clientX, clientY: touch.clientY };
        // Reset dragging state at the start of a new touch
        setIsTouchDragging(false);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice) return;
        if (e.touches.length !== 1) return; // Only track single finger drag

        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        if (!isTouchDragging) {
            // Check if movement exceeds threshold to start drag
            const deltaX = Math.abs(currentX - lastTouchRef.current.clientX);
            const deltaY = Math.abs(currentY - lastTouchRef.current.clientY);

            if (deltaX > dragStartThreshold || deltaY > dragStartThreshold) {
                setIsTouchDragging(true);
                document.body.classList.add('tag-dragging');
                createGhostElement(tag, tagStyle);
                updateGhostPosition(currentX, currentY); // Initial position
                lastTouchRef.current = { clientX: currentX, clientY: currentY }; // Update ref after starting drag
                onDragStart?.();
            }
        }
        // Note: Actual drag move handling (highlighting targets) is done globally
        // because the touchmove event might fire on the tag element initially,
        // but then needs to track movement over the whole window.
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || !isTouchDragging) {
            // If not dragging, potentially handle as a click if needed,
            // otherwise just return. Reset maybe?
            if (!isTouchDragging && onClick) {
                // Check if it was a very short touch (tap)
                // Requires timing or checking if position changed much
                // onClick(); // Simplistic: call onClick if not dragged
            }
            cleanupTouchDrag(); // Ensure cleanup even if not dragging? Maybe not.
            return;
        }

        // Prevent default actions like click events firing after touch ends
        e.preventDefault();

        const touch = e.changedTouches[0]; // Use changedTouches for end event
        const endX = touch.clientX;
        const endY = touch.clientY;

        // Find target at the final position
        const finalTarget = findDropTargetAtPoint(endX, endY);

        if (finalTarget) {
            console.log(`Dispatching tagdrop to:`, finalTarget);
            const dropEvent = new CustomEvent('tagdrop', {
                bubbles: true, // Allow event to bubble up
                detail: { tag }
            });
            finalTarget.dispatchEvent(dropEvent);
        } else {
            console.log("No drop target found at", endX, endY);
            // Dispatch leave event to the last known target if no new target is found at the end
            if (currentDropTargetElement) {
                dispatchTagDragLeave(currentDropTargetElement);
            }
        }

        // Clean up drag state, ghost element, and body class
        cleanupTouchDrag();
        onDragEnd?.(); // Call provided callback
    };

    const handleTouchCancel = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouchDevice || !isTouchDragging) return;

        console.log("Touch cancelled");
        e.preventDefault();

        // Dispatch leave event to the last known target
        if (currentDropTargetElement) {
            dispatchTagDragLeave(currentDropTargetElement);
        }

        cleanupTouchDrag();
        onDragEnd?.(); // Consider if onDragEnd should be called on cancel
    };

    // Helper Functions for Touch Drag
    const createGhostElement = (tagText: string, style: TagStyle) => {
        let ghost = document.getElementById('touch-drag-ghost');
        if (!ghost) {
            ghost = document.createElement('div');
            ghost.id = 'touch-drag-ghost';
            // Apply necessary styles (use Tailwind classes if preferred and available globally)
            ghost.style.position = 'fixed';
            ghost.style.zIndex = '9999';
            ghost.style.pointerEvents = 'none'; // Crucial!
            ghost.style.opacity = '0.8';
            ghost.style.borderRadius = '999px';
            ghost.style.padding = '6px 12px';
            ghost.style.fontSize = '14px';
            ghost.style.fontWeight = '500';
            ghost.style.whiteSpace = 'nowrap';
            ghost.style.transform = 'translate(-50%, -50%)'; // Center on touch point
            // Apply tag-specific colors - ensure these classes are globally available or use inline styles
            ghost.className = `${style.bg} ${style.text} ${style.border}`; // Example using style object
            document.body.appendChild(ghost);
        }
        ghost.innerText = tagText;
    };

    const updateGhostPosition = (x: number, y: number) => {
        const ghost = document.getElementById('touch-drag-ghost');
        if (ghost) {
            ghost.style.left = `${x}px`;
            ghost.style.top = `${y}px`;
        }
    };

    const cleanupTouchDrag = () => {
        document.body.classList.remove('tag-dragging');
        const ghost = document.getElementById('touch-drag-ghost');
        if (ghost) {
            ghost.remove();
        }
        setIsTouchDragging(false);
        // Reset the global drop target tracker
        currentDropTargetElement = null;
    };

    // --- Global Touch Move Handling ---
    useEffect(() => {
        const handleGlobalTouchMove = (e: TouchEvent) => {
            // Only proceed if a touch drag is active *from this component*
            // and there's exactly one touch point
            if (!isTouchDragging || e.touches.length !== 1) {
                // If drag stops unexpectedly (e.g., browser interruption), clean up.
                // Might need more robust state check if multiple DraggableTags exist.
                // if (isTouchDragging) cleanupTouchDrag();
                return;
            }

            // Prevent scrolling while dragging
            e.preventDefault();

            const touch = e.touches[0];
            const currentX = touch.clientX;
            const currentY = touch.clientY;

            // Update ghost position
            updateGhostPosition(currentX, currentY);
            lastTouchRef.current = { clientX: currentX, clientY: currentY }; // Keep track of position

            // --- Drop Target Detection & Event Dispatching ---
            const targetElement = findDropTargetAtPoint(currentX, currentY);

            // Check if the target has changed
            if (targetElement !== currentDropTargetElement) {
                // Dispatch leave event to the previous target
                if (currentDropTargetElement) {
                    dispatchTagDragLeave(currentDropTargetElement);
                }
                // Dispatch enter event to the new target
                if (targetElement) {
                    dispatchTagDragEnter(targetElement);
                }
                // Update the current target
                currentDropTargetElement = targetElement;
            }
        };

        // Add listener only when dragging starts
        if (isTouchDragging) {
            window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
            // console.log("Global touchmove listener ADDED");
        }

        // Cleanup: Remove listener when dragging stops or component unmounts
        return () => {
            window.removeEventListener('touchmove', handleGlobalTouchMove);
            // console.log("Global touchmove listener REMOVED");
            // Ensure leave event is dispatched if component unmounts mid-drag
            if (currentDropTargetElement && isTouchDragging) {
                dispatchTagDragLeave(currentDropTargetElement);
                currentDropTargetElement = null; // Reset tracker
            }
        };
    }, [isTouchDragging]); // Re-run useEffect when isTouchDragging changes


    // --- Functions to find targets and dispatch custom events ---
    const findDropTargetAtPoint = (x: number, y: number): Element | null => {
        const ghost = document.getElementById('touch-drag-ghost');
        let originalDisplay = '';
        if (ghost) {
            originalDisplay = ghost.style.display;
            ghost.style.display = 'none'; // Hide ghost temporarily
        }

        const elementUnderPointer = document.elementFromPoint(x, y);

        if (ghost) {
            ghost.style.display = originalDisplay; // Restore ghost visibility
        }

        if (!elementUnderPointer) return null;

        // Check if the element itself or an ancestor is droppable
        return elementUnderPointer.closest('[data-droppable="true"]');
    };

    const dispatchTagDragEnter = (target: Element) => {
        console.log("Dispatching tagdragenter to:", target);
        const enterEvent = new CustomEvent('tagdragenter', { bubbles: true });
        target.dispatchEvent(enterEvent);
    };

    const dispatchTagDragLeave = (target: Element) => {
        console.log("Dispatching tagdragleave to:", target);
        const leaveEvent = new CustomEvent('tagdragleave', { bubbles: true });
        target.dispatchEvent(leaveEvent);
    };

    // Render the tag
    return (
        <div
            className={`tag inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${tagStyle.bg} ${tagStyle.text} ${tagStyle.hoverBg} border ${tagStyle.border} cursor-grab transition-colors transform hover:scale-105 ${className}`}
            onClick={!isTouchDragging ? onClick : undefined} // Only allow click if not dragging
            draggable={!isTouchDevice} // Enable native drag only on non-touch devices
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            data-tag={tag}
            style={{ touchAction: 'none' }} // Prevent browser gestures like scroll during touch on the tag itself
        >
            <TagIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span className="truncate">{tag}</span> {/* Added truncate for potentially long tags */}
        </div>
    );
};

export default DraggableTag;