import { SearchPanel } from '@/components/sidebar/SearchPanel';
import { TableOfContents } from '@/components/sidebar/TableOfContents';
import { IconButton } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import type { DocumentPanelType } from '@/types/ui';
import { cn } from '@/utils/cn';
import { List, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DocumentPanelProps {
    content: string;
    activeLine?: number;
    onNavigate?: (line: number, column?: number) => void;
    onReplace?: (search: string, replace: string, all: boolean) => void;
    className?: string;
}

/**
 * Floating document panel for TOC and Search
 * Overlays on top of the preview area
 */
export function DocumentPanel({ content, activeLine, onNavigate, onReplace, className }: DocumentPanelProps) {
    const { t } = useTranslation();
    const activePanel = useUIStore((state) => state.activeDocumentPanel);
    const setDocumentPanel = useUIStore((state) => state.setDocumentPanel);

    if (!activePanel) return null;

    const tabs: { id: 'toc' | 'search'; icon: typeof List; labelKey: string }[] = [
        { id: 'toc', icon: List, labelKey: 'sidebar.toc' },
        { id: 'search', icon: Search, labelKey: 'sidebar.search' }
    ];

    const handleClose = () => {
        setDocumentPanel(null);
    };

    const handleTabClick = (tabId: DocumentPanelType) => {
        setDocumentPanel(tabId);
    };

    return (
        <div
            className={cn(
                'absolute top-2 right-2 z-30',
                'w-72 max-h-[calc(100%-1rem)]',
                'bg-bg-primary',
                'border border-border',
                'rounded-lg shadow-xl',
                'flex flex-col',
                'animate-in fade-in slide-in-from-right-2 duration-200',
                className
            )}
        >
            {/* Header with tabs */}
            <div className="flex items-center border-b border-border">
                {/* Tabs */}
                <div className="flex-1 flex">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activePanel === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabClick(tab.id)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-2',
                                    'text-xs font-medium',
                                    'transition-colors',
                                    isActive
                                        ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 -mb-px bg-bg-tertiary'
                                        : 'text-text-muted hover:text-text-secondary'
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{t(tab.labelKey)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Close button */}
                <IconButton icon={<X className="h-4 w-4" />} label={t('common.close')} onClick={handleClose} size="sm" className="mr-1" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden min-h-0">
                {activePanel === 'toc' && (
                    <TableOfContents
                        content={content}
                        activeLine={activeLine}
                        onNavigate={(line) => onNavigate?.(line)}
                        className="h-full"
                    />
                )}
                {activePanel === 'search' && (
                    <SearchPanel
                        content={content}
                        onNavigate={(line, column) => onNavigate?.(line, column)}
                        onReplace={onReplace}
                        className="h-full"
                    />
                )}
            </div>
        </div>
    );
}
