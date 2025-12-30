/**
 * Google Drive Explorer Component
 * Browse and select files from Google Drive
 */

import { checkConnection, fetchFileContent, fetchFileTree, filterMarkdownOnly, getQuota } from '@/services/gdrive';
import { useDocumentStore } from '@/stores/documentStore';
import { useGoogleDriveStore } from '@/stores/gdriveStore';
import type { DriveFileTreeNode } from '@/types/gdrive';
import { ChevronDown, ChevronRight, File, FileText, Folder, FolderOpen, HardDrive, Loader2, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FileTreeItemProps {
    node: DriveFileTreeNode;
    level: number;
    isExpanded: boolean;
    isLoading: boolean;
    onToggle: (id: string) => void;
    onSelect: (node: DriveFileTreeNode) => void;
}

function FileTreeItem({ node, level, isExpanded, isLoading, onToggle, onSelect }: FileTreeItemProps) {
    const isFolder = node.type === 'folder';
    const paddingLeft = `${level * 12 + 8}px`;

    const handleClick = useCallback(() => {
        if (isLoading) return;
        if (isFolder) {
            onToggle(node.id);
        } else if (node.isMarkdown) {
            onSelect(node);
        }
    }, [isFolder, isLoading, node, onToggle, onSelect]);

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={node.disabled || isLoading}
            className={`
                w-full flex items-center gap-2 py-1.5 px-2 text-left text-sm
                hover:bg-accent/50 rounded-sm transition-colors
                ${node.disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{ paddingLeft }}
        >
            {isFolder ? (
                <>
                    {isExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                    {isExpanded ? (
                        <FolderOpen className="w-4 h-4 shrink-0 text-yellow-500" />
                    ) : (
                        <Folder className="w-4 h-4 shrink-0 text-yellow-500" />
                    )}
                </>
            ) : (
                <>
                    <span className="w-3" />
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 shrink-0 text-blue-500 animate-spin" />
                    ) : node.isMarkdown ? (
                        <FileText className="w-4 h-4 shrink-0 text-blue-500" />
                    ) : (
                        <File className="w-4 h-4 shrink-0 text-muted-foreground" />
                    )}
                </>
            )}
            <span className="truncate">{node.name}</span>
        </button>
    );
}

interface FileTreeNodesProps {
    nodes: DriveFileTreeNode[];
    level: number;
    expandedPaths: Set<string>;
    loadingId: string | null;
    onToggle: (id: string) => void;
    onSelect: (node: DriveFileTreeNode) => void;
}

function FileTreeNodes({ nodes, level, expandedPaths, loadingId, onToggle, onSelect }: FileTreeNodesProps) {
    return (
        <>
            {nodes.map((node) => {
                const isExpanded = expandedPaths.has(node.id);
                const isLoading = loadingId === node.id;
                return (
                    <div key={node.id}>
                        <FileTreeItem
                            node={node}
                            level={level}
                            isExpanded={isExpanded}
                            isLoading={isLoading}
                            onToggle={onToggle}
                            onSelect={onSelect}
                        />
                        {node.type === 'folder' && isExpanded && node.children && (
                            <FileTreeNodes
                                nodes={node.children}
                                level={level + 1}
                                expandedPaths={expandedPaths}
                                loadingId={loadingId}
                                onToggle={onToggle}
                                onSelect={onSelect}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
}

interface GoogleDriveExplorerProps {
    onFileSelect?: (node: DriveFileTreeNode) => void;
    onFileOpened?: () => void;
}

export function GoogleDriveExplorer({ onFileSelect, onFileOpened }: GoogleDriveExplorerProps) {
    const { t } = useTranslation();
    const {
        isConnected,
        isLoading,
        error,
        user,
        fileTree,
        treeLoading,
        expandedPaths,
        quota,
        setConnected,
        setLoading,
        setError,
        setFileTree,
        setTreeLoading,
        toggleExpanded,
        setQuota
    } = useGoogleDriveStore();

    const { createDocument, findDocumentByDrive, openDocument } = useDocumentStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [showMarkdownOnly, setShowMarkdownOnly] = useState(true);
    const [loadingFile, setLoadingFile] = useState<string | null>(null);

    // Check connection on mount
    useEffect(() => {
        async function checkGoogleConnection() {
            setLoading(true);
            try {
                const status = await checkConnection();
                if (status.connected && status.user) {
                    setConnected(true, status.user);
                    // Load quota
                    const quotaData = await getQuota();
                    if (quotaData) {
                        setQuota(quotaData);
                    }
                } else {
                    setConnected(false);
                    if (status.error) {
                        setError(status.error);
                    }
                }
            } catch (err) {
                setConnected(false);
                setError(err instanceof Error ? err.message : 'Connection failed');
            }
        }

        checkGoogleConnection();
    }, [setConnected, setLoading, setError, setQuota]);

    // Fetch file tree when connected
    useEffect(() => {
        async function loadFileTree() {
            if (!isConnected) return;

            setTreeLoading(true);
            try {
                const tree = await fetchFileTree();
                setFileTree(tree);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load files');
            }
        }

        loadFileTree();
    }, [isConnected, setFileTree, setTreeLoading, setError]);

    // Filter file tree
    const displayedTree = useMemo(() => {
        let tree = fileTree;

        // Filter markdown only
        if (showMarkdownOnly) {
            tree = filterMarkdownOnly(tree);
        }

        // Search filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const filterBySearch = (nodes: DriveFileTreeNode[]): DriveFileTreeNode[] => {
                return nodes
                    .map((node) => {
                        if (node.type === 'folder') {
                            const filteredChildren = filterBySearch(node.children || []);
                            if (filteredChildren.length > 0 || node.name.toLowerCase().includes(searchLower)) {
                                return { ...node, children: filteredChildren };
                            }
                            return null;
                        }
                        return node.name.toLowerCase().includes(searchLower) ? node : null;
                    })
                    .filter((node): node is DriveFileTreeNode => node !== null);
            };
            tree = filterBySearch(tree);
        }

        return tree;
    }, [fileTree, showMarkdownOnly, searchQuery]);

    const handleRefresh = useCallback(async () => {
        setTreeLoading(true);
        try {
            const tree = await fetchFileTree(true);
            setFileTree(tree);
            const quotaData = await getQuota();
            if (quotaData) {
                setQuota(quotaData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh');
        }
    }, [setFileTree, setTreeLoading, setError, setQuota]);

    const handleFileSelect = useCallback(
        async (node: DriveFileTreeNode) => {
            // Check if already open
            const existingDoc = findDocumentByDrive(node.id);
            if (existingDoc) {
                openDocument(existingDoc.id);
                onFileOpened?.();
                return;
            }

            // Load file content and create document
            setLoadingFile(node.id);
            try {
                const fileContent = await fetchFileContent(node.id);
                if (fileContent) {
                    createDocument({
                        name: node.name,
                        content: fileContent.content,
                        source: 'gdrive',
                        driveInfo: {
                            fileId: node.id,
                            name: node.name,
                            mimeType: node.mimeType
                        }
                    });
                    onFileOpened?.();
                }
            } catch (err) {
                console.error('Failed to load file:', err);
            } finally {
                setLoadingFile(null);
            }

            // Call external handler if provided
            if (onFileSelect) {
                onFileSelect(node);
            }
        },
        [findDocumentByDrive, openDocument, createDocument, onFileSelect, onFileOpened]
    );

    // Format quota for display
    const quotaDisplay = useMemo(() => {
        if (!quota) return null;
        const usedGB = (quota.used / (1024 * 1024 * 1024)).toFixed(2);
        const limitGB = (quota.limit / (1024 * 1024 * 1024)).toFixed(0);
        const percentage = quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0;
        return { usedGB, limitGB, percentage };
    }, [quota]);

    // Not connected state
    if (!isConnected) {
        if (isLoading) {
            return (
                <div className="p-4 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t('gdrive.connecting', 'Connecting to Google Drive...')}</p>
                </div>
            );
        }

        return (
            <div className="p-4 text-center">
                <HardDrive className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">{error || t('gdrive.notConnected', 'Not connected to Google Drive')}</p>
                <a
                    href="/api/auth/google"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                >
                    {t('gdrive.connect', 'Connect Google Drive')}
                </a>
            </div>
        );
    }

    // Connected - show file browser
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                    {user?.picture && <img src={user.picture} alt={user.name || user.email} className="w-5 h-5 rounded-full" />}
                    <span className="text-sm font-medium truncate">{user?.name || user?.email}</span>
                </div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={treeLoading}
                    className="p-1 hover:bg-accent rounded-sm disabled:opacity-50"
                    title={t('gdrive.refresh', 'Refresh')}
                >
                    <RefreshCw className={`w-4 h-4 ${treeLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Search */}
            <div className="p-2 border-b">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('gdrive.searchFiles', 'Search files...')}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Filter toggle */}
            <div className="flex items-center justify-between p-2 border-b">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showMarkdownOnly}
                        onChange={(e) => setShowMarkdownOnly(e.target.checked)}
                        className="rounded"
                    />
                    {t('gdrive.markdownOnly', 'Markdown only')}
                </label>
            </div>

            {/* File tree */}
            <div className="flex-1 overflow-y-auto py-1">
                {treeLoading && !fileTree.length ? (
                    <div className="text-center py-4">
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : displayedTree.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                        {searchQuery
                            ? t('gdrive.noFilesFound', 'No files found')
                            : showMarkdownOnly
                              ? t('gdrive.noMarkdownFiles', 'No markdown files found')
                              : t('gdrive.noFiles', 'No files')}
                    </p>
                ) : (
                    <FileTreeNodes
                        nodes={displayedTree}
                        level={0}
                        expandedPaths={expandedPaths}
                        loadingId={loadingFile}
                        onToggle={toggleExpanded}
                        onSelect={handleFileSelect}
                    />
                )}
            </div>

            {/* Quota footer */}
            {quotaDisplay && (
                <div className="p-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center justify-between mb-1">
                        <span>
                            {quotaDisplay.usedGB} GB / {quotaDisplay.limitGB} GB
                        </span>
                        <span>{quotaDisplay.percentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${quotaDisplay.percentage > 90 ? 'bg-destructive' : 'bg-primary'}`}
                            style={{ width: `${quotaDisplay.percentage}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default GoogleDriveExplorer;
