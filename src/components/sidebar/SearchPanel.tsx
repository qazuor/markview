import { IconButton, Tooltip } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronRight, RefreshCw, Replace, Search, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchResult {
    line: number;
    column: number;
    text: string;
    match: string;
}

interface SearchPanelProps {
    content: string;
    onNavigate?: (line: number, column: number) => void;
    onReplace?: (search: string, replace: string, all: boolean) => void;
    className?: string;
}

/**
 * Search and replace panel
 */
export function SearchPanel({ content, onNavigate, onReplace, className }: SearchPanelProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [replaceQuery, setReplaceQuery] = useState('');
    const [showReplace, setShowReplace] = useState(false);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Find all matches
    const results = useMemo((): SearchResult[] => {
        if (!searchQuery.trim()) return [];

        const searchResults: SearchResult[] = [];
        const lines = content.split('\n');

        try {
            const flags = caseSensitive ? 'g' : 'gi';
            const pattern = useRegex ? new RegExp(searchQuery, flags) : new RegExp(escapeRegex(searchQuery), flags);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i] ?? '';
                const localPattern = new RegExp(pattern.source, flags);

                let match = localPattern.exec(line);
                while (match !== null) {
                    searchResults.push({
                        line: i + 1,
                        column: match.index + 1,
                        text: line,
                        match: match[0]
                    });
                    match = localPattern.exec(line);
                }
            }
        } catch {
            // Invalid regex
        }

        return searchResults;
    }, [content, searchQuery, caseSensitive, useRegex]);

    const goToNext = useCallback(() => {
        if (results.length === 0) return;
        const next = (currentIndex + 1) % results.length;
        setCurrentIndex(next);
        const result = results[next];
        if (result) {
            onNavigate?.(result.line, result.column);
        }
    }, [results, currentIndex, onNavigate]);

    const goToPrevious = useCallback(() => {
        if (results.length === 0) return;
        const prev = currentIndex === 0 ? results.length - 1 : currentIndex - 1;
        setCurrentIndex(prev);
        const result = results[prev];
        if (result) {
            onNavigate?.(result.line, result.column);
        }
    }, [results, currentIndex, onNavigate]);

    const handleReplace = () => {
        if (searchQuery && onReplace) {
            onReplace(searchQuery, replaceQuery, false);
        }
    };

    const handleReplaceAll = () => {
        if (searchQuery && onReplace) {
            onReplace(searchQuery, replaceQuery, true);
        }
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold uppercase text-text-muted">{t('searchPanel.title')}</span>
            </div>

            {/* Search inputs */}
            <div className="p-3 space-y-2">
                {/* Search row */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setShowReplace(!showReplace)}
                        aria-expanded={showReplace}
                        aria-controls="replace-section"
                        aria-label={showReplace ? t('searchPanel.hideReplace') : t('searchPanel.showReplace')}
                        className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                    >
                        {showReplace ? (
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                    </button>

                    <div className="relative flex-1">
                        <label htmlFor="search-input" className="sr-only">
                            {t('searchPanel.searchInDocument')}
                        </label>
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                        <input
                            id="search-input"
                            type="text"
                            placeholder={t('searchPanel.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentIndex(0);
                            }}
                            aria-describedby={searchQuery ? 'search-results-count' : undefined}
                            className={cn(
                                'w-full pl-7 pr-8 py-1.5',
                                'text-sm bg-bg-tertiary rounded-md',
                                'border border-transparent',
                                'focus:outline-none focus:border-primary-500',
                                'placeholder:text-text-muted'
                            )}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label={t('searchPanel.clearSearch')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Replace row */}
                {showReplace && (
                    <div id="replace-section" className="flex items-center gap-1 pl-6">
                        <div className="relative flex-1">
                            <label htmlFor="replace-input" className="sr-only">
                                {t('searchPanel.replaceWith')}
                            </label>
                            <Replace className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                            <input
                                id="replace-input"
                                type="text"
                                placeholder={t('searchPanel.replacePlaceholder')}
                                value={replaceQuery}
                                onChange={(e) => setReplaceQuery(e.target.value)}
                                className={cn(
                                    'w-full pl-7 pr-3 py-1.5',
                                    'text-sm bg-bg-tertiary rounded-md',
                                    'border border-transparent',
                                    'focus:outline-none focus:border-primary-500',
                                    'placeholder:text-text-muted'
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Options */}
                <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={caseSensitive}
                            onChange={(e) => setCaseSensitive(e.target.checked)}
                            className="rounded border-border"
                        />
                        <span>{t('searchPanel.caseSensitive')}</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useRegex}
                            onChange={(e) => setUseRegex(e.target.checked)}
                            className="rounded border-border"
                        />
                        <span>{t('searchPanel.useRegex')}</span>
                    </label>
                </div>

                {/* Result count and navigation */}
                {searchQuery && (
                    <div className="flex items-center justify-between">
                        <span id="search-results-count" className="text-xs text-text-muted" aria-live="polite">
                            {results.length === 0
                                ? t('common.noResults')
                                : t('searchPanel.matchCount', { current: currentIndex + 1, total: results.length })}
                        </span>
                        <div className="flex items-center gap-1">
                            <Tooltip content={t('searchPanel.previousMatch')}>
                                <IconButton
                                    icon={<ChevronDown className="h-4 w-4 rotate-180" />}
                                    label={t('searchPanel.previousMatch')}
                                    onClick={goToPrevious}
                                    size="sm"
                                    disabled={results.length === 0}
                                />
                            </Tooltip>
                            <Tooltip content={t('searchPanel.nextMatch')}>
                                <IconButton
                                    icon={<ChevronDown className="h-4 w-4" />}
                                    label={t('searchPanel.nextMatch')}
                                    onClick={goToNext}
                                    size="sm"
                                    disabled={results.length === 0}
                                />
                            </Tooltip>
                        </div>
                    </div>
                )}

                {/* Replace actions */}
                {showReplace && searchQuery && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleReplace}
                            disabled={results.length === 0}
                            className={cn(
                                'px-2 py-1 text-xs rounded',
                                'bg-bg-tertiary hover:bg-bg-secondary',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'transition-colors'
                            )}
                        >
                            {t('common.replace')}
                        </button>
                        <button
                            type="button"
                            onClick={handleReplaceAll}
                            disabled={results.length === 0}
                            className={cn(
                                'px-2 py-1 text-xs rounded',
                                'bg-bg-tertiary hover:bg-bg-secondary',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'transition-colors'
                            )}
                        >
                            <RefreshCw className="h-3 w-3 inline mr-1" />
                            {t('common.replaceAll')}
                        </button>
                    </div>
                )}
            </div>

            {/* Results list */}
            {searchQuery && results.length > 0 && (
                <div className="flex-1 overflow-y-auto border-t border-border">
                    <ul className="p-2 space-y-1">
                        {results.slice(0, 100).map((result, index) => (
                            <li key={`${result.line}-${result.column}`}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        onNavigate?.(result.line, result.column);
                                    }}
                                    className={cn(
                                        'w-full text-left px-2 py-1 rounded-md',
                                        'text-xs',
                                        'hover:bg-bg-tertiary',
                                        'transition-colors',
                                        index === currentIndex && 'bg-bg-tertiary'
                                    )}
                                >
                                    <span className="text-text-muted">Ln {result.line}: </span>
                                    <span className="text-text-secondary">
                                        {highlightMatch(result.text, result.match, result.column - 1)}
                                    </span>
                                </button>
                            </li>
                        ))}
                        {results.length > 100 && (
                            <li className="px-2 py-1 text-xs text-text-muted">... and {results.length - 100} more results</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text: string, match: string, startIndex: number): React.ReactNode {
    const before = text.slice(Math.max(0, startIndex - 20), startIndex);
    const after = text.slice(startIndex + match.length, startIndex + match.length + 20);

    return (
        <>
            {startIndex > 20 && '...'}
            {before}
            <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{match}</mark>
            {after}
            {startIndex + match.length + 20 < text.length && '...'}
        </>
    );
}
