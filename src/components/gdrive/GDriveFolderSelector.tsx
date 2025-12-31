import { clearAllCaches, fetchFileTree, fileOperation } from '@/services/gdrive';
import type { DriveFileTreeNode } from '@/types/gdrive';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronRight, Folder, FolderOpen, FolderPlus, Home, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GDriveFolderSelectorProps {
    selectedFolderId: string;
    selectedFolderName: string;
    onSelect: (folderId: string, folderName: string) => void;
    className?: string;
}

interface FolderNodeProps {
    node: DriveFileTreeNode;
    level: number;
    selectedId: string;
    onSelect: (id: string, name: string) => void;
    expandedFolders: Set<string>;
    toggleExpand: (id: string) => void;
}

function FolderNode({ node, level, selectedId, onSelect, expandedFolders, toggleExpand }: FolderNodeProps) {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedId === node.id;
    const hasChildren = node.children?.some((child) => child.type === 'folder');
    const folderChildren = node.children?.filter((child) => child.type === 'folder') || [];

    const handleClick = () => {
        onSelect(node.id, node.name);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleExpand(node.id);
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleClick}
                className={cn(
                    'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left',
                    'text-sm transition-colors',
                    isSelected ? 'bg-primary-500/20 text-primary-500' : 'hover:bg-bg-tertiary text-text-primary'
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                {hasChildren ? (
                    <button type="button" onClick={handleToggle} className="p-0.5 hover:bg-bg-secondary rounded">
                        {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                        )}
                    </button>
                ) : (
                    <span className="w-4" />
                )}
                {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                ) : (
                    <Folder className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                )}
                <span className="truncate">{node.name}</span>
            </button>
            {isExpanded && folderChildren.length > 0 && (
                <div>
                    {folderChildren.map((child) => (
                        <FolderNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            expandedFolders={expandedFolders}
                            toggleExpand={toggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Google Drive folder selector with tree view and create folder functionality
 */
export function GDriveFolderSelector({ selectedFolderId, selectedFolderName, onSelect, className }: GDriveFolderSelectorProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [folders, setFolders] = useState<DriveFileTreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [createError, setCreateError] = useState<string | null>(null);

    // Load folder tree
    const loadFolders = useCallback(async () => {
        setIsLoading(true);
        try {
            const tree = await fetchFileTree();
            // Filter to only show folders
            const filterFolders = (nodes: DriveFileTreeNode[]): DriveFileTreeNode[] => {
                return nodes
                    .filter((node) => node.type === 'folder')
                    .map((node) => ({
                        ...node,
                        children: node.children ? filterFolders(node.children) : undefined
                    }));
            };
            setFolders(filterFolders(tree));
        } catch (error) {
            console.error('Failed to load folders:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && folders.length === 0) {
            loadFolders();
        }
    }, [isOpen, folders.length, loadFolders]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleSelect = useCallback(
        (id: string, name: string) => {
            onSelect(id, name);
            setIsOpen(false);
        },
        [onSelect]
    );

    const handleSelectRoot = useCallback(() => {
        onSelect('root', t('gdrive.root'));
        setIsOpen(false);
    }, [onSelect, t]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            setCreateError(t('gdrive.folder.nameRequired'));
            return;
        }

        setCreateError(null);
        setIsCreatingFolder(true);

        try {
            const result = await fileOperation({
                operation: 'create',
                name: newFolderName.trim(),
                mimeType: 'application/vnd.google-apps.folder',
                parentId: selectedFolderId !== 'root' ? selectedFolderId : undefined
            });

            if (result.success && result.file) {
                clearAllCaches();
                // Select the new folder
                onSelect(result.file.id, result.file.name);
                setNewFolderName('');
                setIsOpen(false);
                // Refresh folder list
                loadFolders();
            } else {
                throw new Error(result.error || 'Failed to create folder');
            }
        } catch (error) {
            setCreateError(error instanceof Error ? error.message : t('gdrive.folder.createError'));
        } finally {
            setIsCreatingFolder(false);
        }
    };

    return (
        <div className={cn('relative', className)}>
            {/* Selector button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md',
                    'bg-bg-secondary border border-border',
                    'text-text-primary text-sm text-left',
                    'hover:border-border-hover transition-colors',
                    isOpen && 'border-primary-500 ring-1 ring-primary-500'
                )}
            >
                <Folder className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span className="flex-1 truncate">{selectedFolderName}</span>
                <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', isOpen && 'rotate-180')} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className={cn(
                        'absolute z-50 top-full left-0 right-0 mt-1',
                        'bg-bg-primary border border-border rounded-lg shadow-lg',
                        'max-h-72 overflow-hidden flex flex-col'
                    )}
                >
                    {/* Create new folder section */}
                    <div className="p-2 border-b border-border">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => {
                                    setNewFolderName(e.target.value);
                                    setCreateError(null);
                                }}
                                placeholder={t('gdrive.folder.newFolderPlaceholder')}
                                className={cn(
                                    'flex-1 px-2 py-1.5 text-sm rounded-md',
                                    'bg-bg-secondary border border-border',
                                    'text-text-primary placeholder:text-text-muted',
                                    'focus:outline-none focus:ring-1 focus:ring-primary-500',
                                    createError && 'border-red-500'
                                )}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCreateFolder();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleCreateFolder}
                                disabled={isCreatingFolder || !newFolderName.trim()}
                                className={cn(
                                    'p-1.5 rounded-md',
                                    'bg-primary-500 hover:bg-primary-600 text-white',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'transition-colors'
                                )}
                                title={t('gdrive.folder.createFolder')}
                            >
                                {isCreatingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
                            </button>
                        </div>
                        {createError && <p className="mt-1 text-xs text-red-500">{createError}</p>}
                        <p className="mt-1 text-xs text-text-muted">
                            {t('gdrive.folder.createInLocation', { location: selectedFolderName })}
                        </p>
                    </div>

                    {/* Folder tree */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
                            </div>
                        ) : (
                            <>
                                {/* Root option */}
                                <button
                                    type="button"
                                    onClick={handleSelectRoot}
                                    className={cn(
                                        'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left',
                                        'text-sm transition-colors',
                                        selectedFolderId === 'root'
                                            ? 'bg-primary-500/20 text-primary-500'
                                            : 'hover:bg-bg-tertiary text-text-primary'
                                    )}
                                >
                                    <span className="w-4" />
                                    <Home className="h-4 w-4 text-text-muted flex-shrink-0" />
                                    <span>{t('gdrive.root')}</span>
                                </button>

                                {/* Folder nodes */}
                                {folders.map((folder) => (
                                    <FolderNode
                                        key={folder.id}
                                        node={folder}
                                        level={0}
                                        selectedId={selectedFolderId}
                                        onSelect={handleSelect}
                                        expandedFolders={expandedFolders}
                                        toggleExpand={toggleExpand}
                                    />
                                ))}

                                {folders.length === 0 && !isLoading && (
                                    <p className="text-sm text-text-muted text-center py-2">{t('gdrive.folder.noFolders')}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
