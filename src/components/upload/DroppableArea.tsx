import React, { useCallback, useEffect, useRef, useState } from "react";

interface DroppableAreaProps {
    id: string; // Unique ID for the droppable area
    onDrop: (id: string, tag: string) => void; // Callback when a tag is dropped
    children: React.ReactNode;
    className?: string;
    disabled?: boolean; // Optional: Disable dropping
}

/**
 * ドロップ可能エリアコンポーネント
 * Handles both native HTML5 drag-and-drop (desktop) and custom touch events.
 */
const DroppableArea: React.FC<DroppableAreaProps> = ({
    id,
    onDrop,
    children,
    className = "",
    disabled = false,
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const droppableRef = useRef<HTMLDivElement>(null); // Ref for the droppable element

    // --- Native HTML5 Drag Handlers ---
    const handleNativeDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault(); // Necessary to allow dropping
        e.stopPropagation();

        // Check if the item being dragged is a tag (using dataTransfer types)
        if (e.dataTransfer.types.includes('tag')) {
            e.dataTransfer.dropEffect = "copy"; // Indicate copying is allowed
            if (!isDragOver) setIsDragOver(true); // Set highlight only if not already set
        } else {
            e.dataTransfer.dropEffect = "none"; // Indicate dropping is not allowed
        }
    }, [disabled, isDragOver]);

    const handleNativeDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();

        // Check if the leave event is transitioning outside the component bounds
        // Basic check: Use relatedTarget
        if (droppableRef.current && !droppableRef.current.contains(e.relatedTarget as Node)) {
            setIsDragOver(false); // Remove highlight
        } else if (!e.relatedTarget) {
            // Sometimes relatedTarget is null when leaving the window, etc.
            setIsDragOver(false);
        }
    }, [disabled]);

    const handleNativeDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false); // Remove highlight on drop

        const tag = e.dataTransfer.getData('tag');
        console.log(`Native drop detected on ${id}. Dropped tag: ${tag}`);

        if (tag) {
            onDrop(id, tag);
        }
    }, [disabled, id, onDrop]);


    // --- Custom Touch Event Handlers ---

    // Handler for 'tagdragenter' custom event (dispatched by DraggableTag)
    const handleTagDragEnter = useCallback((e: Event) => {
        if (disabled) return;
        e.stopPropagation(); // Prevent potential bubbling issues
        console.log(`Custom event 'tagdragenter' received on ${id}`);
        if (!isDragOver) setIsDragOver(true);
    }, [disabled, id, isDragOver]); // Added id for logging

    // Handler for 'tagdragleave' custom event (dispatched by DraggableTag)
    const handleTagDragLeave = useCallback((e: Event) => {
        if (disabled) return;
        e.stopPropagation();
        console.log(`Custom event 'tagdragleave' received on ${id}`);
        // Check if the related target of the custom event simulation is outside
        // This might be complex to simulate perfectly, safer to just remove highlight.
        setIsDragOver(false);
    }, [disabled, id]); // Added id for logging

    // Handler for 'tagdrop' custom event (dispatched by DraggableTag)
    const handleTagDrop = useCallback((e: Event) => {
        if (disabled) return;
        e.stopPropagation();
        const customEvent = e as CustomEvent;
        const tag = customEvent.detail?.tag;
        console.log(`Custom event 'tagdrop' received on ${id}. Tag: ${tag}`);

        setIsDragOver(false); // Remove highlight on drop

        if (tag) {
            onDrop(id, tag);
        }
    }, [disabled, id, onDrop]);


    // Effect to add/remove custom touch event listeners
    useEffect(() => {
        const element = droppableRef.current;
        if (!element) return;

        // Add custom event listeners
        element.addEventListener('tagdragenter', handleTagDragEnter);
        element.addEventListener('tagdragleave', handleTagDragLeave);
        element.addEventListener('tagdrop', handleTagDrop);

        // Cleanup function
        return () => {
            element.removeEventListener('tagdragenter', handleTagDragEnter);
            element.removeEventListener('tagdragleave', handleTagDragLeave);
            element.removeEventListener('tagdrop', handleTagDrop);
        };
    }, [id, handleTagDragEnter, handleTagDragLeave, handleTagDrop]); // Re-attach if handlers change

    return (
        <div
            ref={droppableRef}
            id={`droppable-${id}`} // Keep ID for potential targeting if needed
            className={`droppable-area relative transition-all duration-150 ${className} ${isDragOver ? 'ring-2 ring-indigo-500 ring-opacity-75 bg-indigo-50' : '' // Highlight style
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} // Style for disabled state
            onDragOver={handleNativeDragOver}
            onDragLeave={handleNativeDragLeave}
            onDrop={handleNativeDrop}
            data-droppable="true" // Crucial marker for the DraggableTag's detection logic
        >
            {children}

            {/* Optional: Visual indicator during drag over (can be part of the ring style) */}
            {/* This specific overlay might be redundant if the ring style is sufficient */}
            {/* {isDragOver && !disabled && (
                <div className="absolute inset-0 bg-indigo-100 bg-opacity-40 flex items-center justify-center pointer-events-none z-10 rounded-md">
                    <div className="bg-white rounded-lg shadow-lg p-3 animate-pulse flex items-center">
                        <TagIcon className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-indigo-700 font-medium">Drop tag here</span>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default DroppableArea;