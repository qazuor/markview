import { cn } from '@/utils/cn';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SplitPaneProps {
    left: React.ReactNode;
    right: React.ReactNode;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    className?: string;
    onResize?: (size: number) => void;
}

/**
 * Resizable split pane component
 */
export function SplitPane({ left, right, defaultSize = 50, minSize = 20, maxSize = 80, className, onResize }: SplitPaneProps) {
    const [leftSize, setLeftSize] = useState(defaultSize);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newSize = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            const clampedSize = Math.min(Math.max(newSize, minSize), maxSize);

            setLeftSize(clampedSize);
            onResize?.(clampedSize);
        },
        [isDragging, minSize, maxSize, onResize]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Handle touch events for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isDragging || !containerRef.current) return;

            const touch = e.touches[0];
            if (!touch) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newSize = ((touch.clientX - containerRect.left) / containerRect.width) * 100;
            const clampedSize = Math.min(Math.max(newSize, minSize), maxSize);

            setLeftSize(clampedSize);
            onResize?.(clampedSize);
        },
        [isDragging, minSize, maxSize, onResize]
    );

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);

            return () => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, handleTouchMove, handleTouchEnd]);

    return (
        <div ref={containerRef} className={cn('flex h-full w-full min-w-0', isDragging && 'cursor-col-resize select-none', className)}>
            {/* Left pane */}
            <div style={{ width: `${leftSize}%` }} className="h-full min-w-0 overflow-hidden">
                {left}
            </div>

            {/* Divider */}
            <div
                role="separator"
                aria-orientation="vertical"
                tabIndex={0}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                        setLeftSize((prev) => Math.max(prev - 1, minSize));
                    } else if (e.key === 'ArrowRight') {
                        setLeftSize((prev) => Math.min(prev + 1, maxSize));
                    }
                }}
                className={cn(
                    'w-1 cursor-col-resize bg-secondary-200 transition-colors dark:bg-secondary-700',
                    'hover:bg-primary-400 focus:bg-primary-400',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    isDragging && 'bg-primary-500'
                )}
            />

            {/* Right pane */}
            <div style={{ width: `${100 - leftSize}%` }} className="h-full min-w-0 overflow-hidden">
                {right}
            </div>
        </div>
    );
}
