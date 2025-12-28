import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import type React from 'react';
import { EditableTabName } from './EditableTabName';

interface TabProps {
    id: string;
    name: string;
    isActive: boolean;
    isModified: boolean;
    onClick: () => void;
    onClose: (e: React.MouseEvent) => void;
    onMiddleClick: (e: React.MouseEvent) => void;
}

/**
 * Individual tab component
 */
export function Tab({ id, name, isActive, isModified, onClick, onClose, onMiddleClick }: TabProps) {
    const handleAuxClick = (e: React.MouseEvent) => {
        // Middle mouse button
        if (e.button === 1) {
            onMiddleClick(e);
        }
    };

    return (
        <div
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            data-tab-id={id}
            onClick={onClick}
            onAuxClick={handleAuxClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                }
            }}
            className={cn(
                'group relative flex items-center gap-2 px-3 py-1.5',
                'min-w-[100px] max-w-[180px]',
                'cursor-pointer select-none',
                'border-r border-border',
                'transition-colors duration-150',
                isActive ? 'bg-bg-primary text-text-primary' : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            )}
        >
            {/* Modified indicator */}
            {isModified && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary-500" />}

            {/* Tab name - double-click to rename */}
            <EditableTabName documentId={id} name={name} isActive={isActive} className={cn('flex-1 text-sm', isModified && 'ml-2')} />

            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                className={cn(
                    'p-0.5 rounded-sm',
                    'opacity-0 group-hover:opacity-100',
                    'hover:bg-bg-tertiary',
                    'transition-opacity duration-150',
                    'focus:outline-none focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-primary-500',
                    isActive && 'opacity-100'
                )}
                aria-label={`Close ${name}`}
            >
                <X className="h-3.5 w-3.5" />
            </button>

            {/* Active indicator */}
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
        </div>
    );
}
