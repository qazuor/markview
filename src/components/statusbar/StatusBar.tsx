import { useMobile } from '@/hooks';
import { cn } from '@/utils/cn';
import { CursorPosition } from './CursorPosition';
import { Encoding } from './Encoding';
import { LineEnding } from './LineEnding';
import { SaveStatus } from './SaveStatus';
import { WordCount } from './WordCount';
import { ZoomControls } from './ZoomControls';

interface StatusBarProps {
    line?: number;
    column?: number;
    content?: string;
    isModified?: boolean;
    isSaving?: boolean;
    className?: string;
}

/**
 * Status bar with document information
 */
export function StatusBar({ line = 1, column = 1, content = '', isModified = false, isSaving = false, className }: StatusBarProps) {
    const { isMobile } = useMobile();

    // Mobile: show only essential info
    if (isMobile) {
        return (
            <footer
                data-tour="statusbar"
                className={cn(
                    'flex items-center justify-between px-2 py-0.5',
                    'bg-bg-secondary border-t border-border',
                    'text-xs text-text-muted',
                    className
                )}
                aria-label="Editor status"
            >
                {/* Left section - minimal info */}
                <div className="flex items-center gap-3">
                    <CursorPosition line={line} column={column} />
                    <WordCount content={content} />
                </div>

                {/* Right section - only save status */}
                <SaveStatus isModified={isModified} isSaving={isSaving} />
            </footer>
        );
    }

    // Desktop: full status bar
    return (
        <footer
            data-tour="statusbar"
            className={cn(
                'flex items-center justify-between px-3 py-1',
                'bg-bg-secondary border-t border-border',
                'text-xs text-text-muted',
                className
            )}
            aria-label="Editor status"
        >
            {/* Left section */}
            <div className="flex items-center gap-4">
                <CursorPosition line={line} column={column} />
                <WordCount content={content} />
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
                <ZoomControls />
                <SaveStatus isModified={isModified} isSaving={isSaving} />
                <LineEnding />
                <Encoding />
            </div>
        </footer>
    );
}
