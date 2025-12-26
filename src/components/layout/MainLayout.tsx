import { Editor } from '@/components/editor';
import { Preview } from '@/components/preview';
import { SplitPane } from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import { cn } from '@/utils/cn';
import { useCallback, useEffect, useState } from 'react';

interface MainLayoutProps {
    className?: string;
}

// Breakpoint for responsive behavior
const MOBILE_BREAKPOINT = 768;

type ViewMode = 'split' | 'editor' | 'preview';

/**
 * Main content layout with editor and preview
 */
export function MainLayout({ className }: MainLayoutProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [isMobile, setIsMobile] = useState(false);
    const [splitSize, setSplitSize] = useState(50);

    const activeDocument = useDocumentStore((state) => state.getActiveDocument());
    const content = activeDocument?.content ?? '';

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Force tabs on mobile
    useEffect(() => {
        if (isMobile && viewMode === 'split') {
            setViewMode('editor');
        }
    }, [isMobile, viewMode]);

    const handleSplitResize = useCallback((size: number) => {
        setSplitSize(size);
        // Could save to localStorage here
    }, []);

    // Mobile tab view
    if (isMobile) {
        return (
            <div className={cn('flex h-full flex-col', className)}>
                {/* Tab buttons */}
                <div className="flex border-b border-secondary-200 dark:border-secondary-700">
                    <button
                        type="button"
                        onClick={() => setViewMode('editor')}
                        className={cn(
                            'flex-1 px-4 py-2 text-sm font-medium',
                            viewMode === 'editor'
                                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400'
                        )}
                    >
                        Editor
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className={cn(
                            'flex-1 px-4 py-2 text-sm font-medium',
                            viewMode === 'preview'
                                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400'
                        )}
                    >
                        Preview
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {viewMode === 'editor' ? <Editor className="h-full" /> : <Preview content={content} className="h-full" />}
                </div>
            </div>
        );
    }

    // Desktop split view
    return (
        <div className={cn('h-full', className)}>
            <SplitPane
                left={<Editor className="h-full" />}
                right={<Preview content={content} className="h-full" />}
                defaultSize={splitSize}
                minSize={20}
                maxSize={80}
                onResize={handleSplitResize}
            />
        </div>
    );
}
