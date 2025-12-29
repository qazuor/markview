import { EditableTabName } from '@/components/tabs/EditableTabName';
import { IconButton, Tooltip } from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import { cn } from '@/utils/cn';
import { File, FolderOpen, Plus, Search, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileContextMenu } from './FileContextMenu';

interface FileExplorerProps {
    className?: string;
}

/**
 * File explorer showing local and GitHub files
 */
export function FileExplorer({ className }: FileExplorerProps) {
    const { t } = useTranslation();
    const { documents, activeDocumentId, openDocument, createDocument, closeDocument } = useDocumentStore();
    const [filter, setFilter] = useState('');

    const filteredDocuments = useMemo(() => {
        const docs = Array.from(documents.values());
        if (!filter) return docs;

        const lowerFilter = filter.toLowerCase();
        return docs.filter((doc) => doc.name.toLowerCase().includes(lowerFilter));
    }, [documents, filter]);

    const handleNewFile = () => {
        createDocument();
    };

    const handleCloseDocument = useCallback(
        (e: React.MouseEvent, docId: string) => {
            e.stopPropagation();
            closeDocument(docId);
        },
        [closeDocument]
    );

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold uppercase text-text-muted">{t('sidebar.explorer')}</span>
                <Tooltip content={t('common.new')}>
                    <IconButton icon={<Plus className="h-4 w-4" />} label={t('common.new')} onClick={handleNewFile} size="sm" />
                </Tooltip>
            </div>

            {/* Search filter */}
            <div className="px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <input
                        type="text"
                        placeholder={t('fileExplorer.filterPlaceholder')}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
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

            {/* Local files section */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-2 py-1">
                    <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-text-muted">
                        <FolderOpen className="h-3.5 w-3.5" />
                        <span>{t('fileExplorer.localFiles')}</span>
                    </div>
                </div>

                {/* File list */}
                <div className="px-2">
                    {filteredDocuments.length === 0 ? (
                        <div className="px-2 py-4 text-center text-xs text-text-muted">
                            {filter ? t('fileExplorer.noMatchingFiles') : t('sidebar.noFiles')}
                        </div>
                    ) : (
                        filteredDocuments.map((doc) => (
                            <FileContextMenu key={doc.id} documentId={doc.id}>
                                {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled by child elements */}
                                <div
                                    onClick={() => openDocument(doc.id)}
                                    className={cn(
                                        'group w-full flex items-center gap-1.5 pl-1 pr-2 py-1.5 rounded-md cursor-pointer',
                                        'text-sm text-left',
                                        'hover:bg-bg-tertiary',
                                        'transition-colors',
                                        doc.id === activeDocumentId && 'bg-bg-tertiary text-primary-500'
                                    )}
                                >
                                    <File className="h-4 w-4 shrink-0" />

                                    {/* Document name - double-click to rename */}
                                    <EditableTabName
                                        documentId={doc.id}
                                        name={doc.name}
                                        isActive={doc.id === activeDocumentId}
                                        className="flex-1 min-w-0"
                                    />

                                    {/* Modified indicator (shows dot) or Close button on hover */}
                                    <div className="w-4 h-4 shrink-0 flex items-center justify-center relative">
                                        {/* Modified dot - hidden on hover */}
                                        {doc.isModified && (
                                            <span className="h-2 w-2 rounded-full bg-primary-500 group-hover:opacity-0 transition-opacity" />
                                        )}
                                        {/* Close button - visible on hover */}
                                        <button
                                            type="button"
                                            onClick={(e) => handleCloseDocument(e, doc.id)}
                                            className={cn(
                                                'absolute inset-0 flex items-center justify-center rounded-sm',
                                                'opacity-0 group-hover:opacity-100',
                                                'hover:bg-bg-secondary',
                                                'transition-opacity duration-150',
                                                'focus:outline-none focus-visible:opacity-100'
                                            )}
                                            aria-label={`Close ${doc.name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </FileContextMenu>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
