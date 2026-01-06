import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

export type DragItemType = 'document' | 'folder';

export interface DragItem {
    type: DragItemType;
    id: string;
    name: string;
    currentFolderId: string | null;
}

interface DragDropContextValue {
    dragItem: DragItem | null;
    dropTargetId: string | null;
    isDragging: boolean;
    startDrag: (item: DragItem) => void;
    endDrag: () => void;
    setDropTarget: (id: string | null) => void;
}

const DragDropCtx = createContext<DragDropContextValue | null>(null);

export function DragDropProvider({ children }: { children: React.ReactNode }) {
    const [dragItem, setDragItem] = useState<DragItem | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);

    const startDrag = useCallback((item: DragItem) => {
        setDragItem(item);
    }, []);

    const endDrag = useCallback(() => {
        setDragItem(null);
        setDropTargetId(null);
    }, []);

    const setDropTarget = useCallback((id: string | null) => {
        setDropTargetId(id);
    }, []);

    return (
        <DragDropCtx.Provider
            value={{
                dragItem,
                dropTargetId,
                isDragging: dragItem !== null,
                startDrag,
                endDrag,
                setDropTarget
            }}
        >
            {children}
        </DragDropCtx.Provider>
    );
}

export function useDragDrop() {
    const context = useContext(DragDropCtx);
    if (!context) {
        throw new Error('useDragDrop must be used within a DragDropProvider');
    }
    return context;
}

/**
 * Hook for making an item draggable
 */
export function useDraggable(item: DragItem) {
    const { startDrag, endDrag } = useDragDrop();

    const handleDragStart = useCallback(
        (e: React.DragEvent) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', JSON.stringify(item));
            startDrag(item);
        },
        [item, startDrag]
    );

    const handleDragEnd = useCallback(() => {
        endDrag();
    }, [endDrag]);

    return {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd
    };
}

/**
 * Hook for making an element a drop target
 */
export function useDroppable(
    targetId: string | null,
    onDrop: (item: DragItem, targetId: string | null) => void,
    canDrop?: (item: DragItem) => boolean
) {
    const { dragItem, setDropTarget, dropTargetId, endDrag } = useDragDrop();

    const isOver = dropTargetId === targetId;
    const canDropItem = dragItem && (!canDrop || canDrop(dragItem));

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            if (!dragItem) return;
            if (canDrop && !canDrop(dragItem)) return;

            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDropTarget(targetId);
        },
        [dragItem, canDrop, setDropTarget, targetId]
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent) => {
            // Only clear if leaving to outside (not to a child element)
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setDropTarget(null);
        },
        [setDropTarget]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!dragItem) return;
            if (canDrop && !canDrop(dragItem)) return;

            onDrop(dragItem, targetId);
            endDrag();
        },
        [dragItem, canDrop, onDrop, targetId, endDrag]
    );

    return {
        isOver: isOver && canDropItem,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop
    };
}
