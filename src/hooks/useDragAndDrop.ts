import { useCallback, useEffect, useState } from 'react';

export interface DragAndDropOptions {
    onDrop: (files: FileList) => void;
    enabled?: boolean;
}

export function useDragAndDrop({ onDrop, enabled = true }: DragAndDropOptions) {
    const [isDragging, setIsDragging] = useState(false);
    const [, setDragCounter] = useState(0);

    const handleDragEnter = useCallback(
        (e: DragEvent) => {
            if (!enabled) return;
            e.preventDefault();
            e.stopPropagation();
            setDragCounter((prev) => prev + 1);
            if (e.dataTransfer?.types.includes('Files')) {
                setIsDragging(true);
            }
        },
        [enabled]
    );

    const handleDragLeave = useCallback(
        (e: DragEvent) => {
            if (!enabled) return;
            e.preventDefault();
            e.stopPropagation();
            setDragCounter((prev) => {
                const newCount = prev - 1;
                if (newCount === 0) {
                    setIsDragging(false);
                }
                return newCount;
            });
        },
        [enabled]
    );

    const handleDragOver = useCallback(
        (e: DragEvent) => {
            if (!enabled) return;
            e.preventDefault();
            e.stopPropagation();
        },
        [enabled]
    );

    const handleDrop = useCallback(
        (e: DragEvent) => {
            if (!enabled) return;
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            setDragCounter(0);

            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                onDrop(files);
            }
        },
        [enabled, onDrop]
    );

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragleave', handleDragLeave);
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
        };
    }, [enabled, handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

    return { isDragging };
}
