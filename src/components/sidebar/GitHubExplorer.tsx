/**
 * GitHub Explorer Component
 * Browse and select files from GitHub repositories
 */

import {
    checkConnection,
    fetchFileContent,
    fetchFileTree,
    fetchRepositories,
    filterMarkdownOnly,
    filterRepositories
} from '@/services/github';
import { useDocumentStore } from '@/stores/documentStore';
import { useGitHubStore } from '@/stores/githubStore';
import type { FileTreeNode, Repository } from '@/types/github';
import type { RepoFilterOptions } from '@/types/github';
import { parseRepoFullName } from '@/types/github';
import { ChevronDown, ChevronRight, File, FileText, Folder, FolderOpen, GitBranch, Loader2, Lock, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FileTreeItemProps {
    node: FileTreeNode;
    level: number;
    isExpanded: boolean;
    isLoading: boolean;
    onToggle: (path: string) => void;
    onSelect: (node: FileTreeNode) => void;
}

function FileTreeItem({ node, level, isExpanded, isLoading, onToggle, onSelect }: FileTreeItemProps) {
    const isDirectory = node.type === 'directory';
    const paddingLeft = `${level * 12 + 8}px`;

    const handleClick = useCallback(() => {
        if (isLoading) return;
        if (isDirectory) {
            onToggle(node.path);
        } else if (node.isMarkdown) {
            onSelect(node);
        }
    }, [isDirectory, isLoading, node, onToggle, onSelect]);

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
            {isDirectory ? (
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
    nodes: FileTreeNode[];
    level: number;
    expandedPaths: Set<string>;
    loadingPath: string | null;
    onToggle: (path: string) => void;
    onSelect: (node: FileTreeNode) => void;
}

function FileTreeNodes({ nodes, level, expandedPaths, loadingPath, onToggle, onSelect }: FileTreeNodesProps) {
    return (
        <>
            {nodes.map((node) => {
                const isExpanded = expandedPaths.has(node.path);
                const isLoading = loadingPath === node.path;
                return (
                    <div key={node.path}>
                        <FileTreeItem
                            node={node}
                            level={level}
                            isExpanded={isExpanded}
                            isLoading={isLoading}
                            onToggle={onToggle}
                            onSelect={onSelect}
                        />
                        {node.type === 'directory' && isExpanded && node.children && (
                            <FileTreeNodes
                                nodes={node.children}
                                level={level + 1}
                                expandedPaths={expandedPaths}
                                loadingPath={loadingPath}
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

interface RepoFileTreeProps {
    repo: Repository;
    loadingPath: string | null;
    onFileSelect: (node: FileTreeNode) => void;
}

function RepoFileTree({ repo, loadingPath, onFileSelect }: RepoFileTreeProps) {
    const { t } = useTranslation();
    const { fileTree, treeLoading, expandedPaths, setFileTree, setTreeLoading, toggleExpanded } = useGitHubStore();

    const [showMarkdownOnly, setShowMarkdownOnly] = useState(true);

    const tree = fileTree.get(repo.fullName) || [];

    useEffect(() => {
        async function loadTree() {
            setTreeLoading(true);
            try {
                const nodes = await fetchFileTree(repo);
                setFileTree(repo.fullName, nodes);
            } catch (error) {
                console.error('Failed to fetch file tree:', error);
            }
        }

        if (!tree.length) {
            loadTree();
        }
    }, [repo, tree.length, setFileTree, setTreeLoading]);

    const displayedTree = useMemo(() => {
        return showMarkdownOnly ? filterMarkdownOnly(tree) : tree;
    }, [tree, showMarkdownOnly]);

    if (treeLoading) {
        return <div className="p-4 text-center text-sm text-muted-foreground">{t('github.loading.tree', 'Loading files...')}</div>;
    }

    if (!displayedTree.length) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                {showMarkdownOnly ? t('github.noMarkdownFiles', 'No markdown files found') : t('github.noFiles', 'No files found')}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-2 border-b">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showMarkdownOnly}
                        onChange={(e) => setShowMarkdownOnly(e.target.checked)}
                        className="rounded"
                    />
                    {t('github.markdownOnly', 'Markdown only')}
                </label>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
                <FileTreeNodes
                    nodes={displayedTree}
                    level={0}
                    expandedPaths={expandedPaths}
                    loadingPath={loadingPath}
                    onToggle={toggleExpanded}
                    onSelect={onFileSelect}
                />
            </div>
        </div>
    );
}

interface RepoItemProps {
    repo: Repository;
    isSelected: boolean;
    onSelect: (repo: Repository) => void;
}

function RepoItem({ repo, isSelected, onSelect }: RepoItemProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(repo)}
            className={`
                w-full flex items-center gap-2 p-2 text-left text-sm rounded-md
                transition-colors
                ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}
            `}
        >
            <GitBranch className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1">{repo.name}</span>
            {repo.private && <Lock className="w-3 h-3 shrink-0 text-muted-foreground" />}
        </button>
    );
}

interface GitHubExplorerProps {
    onFileSelect?: (repo: Repository, node: FileTreeNode) => void;
    onFileOpened?: () => void;
}

export function GitHubExplorer({ onFileSelect, onFileOpened }: GitHubExplorerProps) {
    const { t } = useTranslation();
    const {
        isConnected,
        isLoading,
        error,
        user,
        repositories,
        selectedRepo,
        reposLoading,
        setConnected,
        setLoading,
        setError,
        setRepositories,
        setReposLoading,
        selectRepo
    } = useGitHubStore();

    const { createDocument, findDocumentByGitHub, openDocument } = useDocumentStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [loadingFile, setLoadingFile] = useState<string | null>(null);
    const [filterOptions] = useState<RepoFilterOptions>({
        search: '',
        visibility: 'all',
        sortBy: 'updated',
        sortOrder: 'desc'
    });

    // Check connection on mount
    useEffect(() => {
        async function checkGitHubConnection() {
            setLoading(true);
            try {
                const status = await checkConnection();
                if (status.connected && status.user) {
                    setConnected(true, {
                        id: 0,
                        login: status.user.login,
                        name: status.user.name,
                        avatarUrl: status.user.avatar,
                        email: null
                    });
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

        checkGitHubConnection();
    }, [setConnected, setLoading, setError]);

    // Fetch repositories when connected
    useEffect(() => {
        async function loadRepos() {
            if (!isConnected) return;

            setReposLoading(true);
            try {
                const repos = await fetchRepositories();
                setRepositories(repos);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
            }
        }

        loadRepos();
    }, [isConnected, setRepositories, setReposLoading, setError]);

    // Filter repositories based on search
    const filteredRepos = useMemo(() => {
        const options = { ...filterOptions, search: searchQuery };
        return filterRepositories(repositories, options);
    }, [repositories, searchQuery, filterOptions]);

    const handleRefresh = useCallback(async () => {
        setReposLoading(true);
        try {
            const repos = await fetchRepositories(true);
            setRepositories(repos);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh');
        }
    }, [setRepositories, setReposLoading, setError]);

    const handleFileSelect = useCallback(
        async (node: FileTreeNode) => {
            if (!selectedRepo) return;

            // Check if already open
            const existingDoc = findDocumentByGitHub(selectedRepo.fullName, node.path);
            if (existingDoc) {
                openDocument(existingDoc.id);
                onFileOpened?.();
                return;
            }

            // Load file content and create document
            setLoadingFile(node.path);
            try {
                const fileContent = await fetchFileContent(selectedRepo.fullName, node.path, selectedRepo.defaultBranch);
                const { owner, repo } = parseRepoFullName(selectedRepo.fullName);

                createDocument({
                    name: node.name,
                    content: fileContent.content,
                    source: 'github',
                    githubInfo: {
                        owner,
                        repo,
                        path: node.path,
                        sha: fileContent.sha,
                        branch: selectedRepo.defaultBranch
                    }
                });
                onFileOpened?.();
            } catch (err) {
                console.error('Failed to load file:', err);
            } finally {
                setLoadingFile(null);
            }

            // Call external handler if provided
            if (onFileSelect) {
                onFileSelect(selectedRepo, node);
            }
        },
        [selectedRepo, findDocumentByGitHub, openDocument, createDocument, onFileSelect, onFileOpened]
    );

    // Not connected state
    if (!isConnected) {
        if (isLoading) {
            return (
                <div className="p-4 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t('github.connecting', 'Connecting to GitHub...')}</p>
                </div>
            );
        }

        return (
            <div className="p-4 text-center">
                <GitBranch className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">{error || t('github.notConnected', 'Not connected to GitHub')}</p>
                <a
                    href="/api/auth/github"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                >
                    {t('github.connect', 'Connect GitHub')}
                </a>
            </div>
        );
    }

    // Show file tree if repo is selected
    if (selectedRepo) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-2 border-b">
                    <button
                        type="button"
                        onClick={() => selectRepo(null)}
                        className="p-1 hover:bg-accent rounded-sm"
                        title={t('github.backToRepos', 'Back to repositories')}
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <GitBranch className="w-4 h-4" />
                    <span className="text-sm font-medium truncate">{selectedRepo.name}</span>
                </div>
                <RepoFileTree repo={selectedRepo} loadingPath={loadingFile} onFileSelect={handleFileSelect} />
            </div>
        );
    }

    // Show repository list
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                    {user?.avatarUrl && <img src={user.avatarUrl} alt={user.login} className="w-5 h-5 rounded-full" />}
                    <span className="text-sm font-medium">{user?.login}</span>
                </div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={reposLoading}
                    className="p-1 hover:bg-accent rounded-sm disabled:opacity-50"
                    title={t('github.refresh', 'Refresh')}
                >
                    <RefreshCw className={`w-4 h-4 ${reposLoading ? 'animate-spin' : ''}`} />
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
                        placeholder={t('github.searchRepos', 'Search repositories...')}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Repository list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {reposLoading && !repositories.length ? (
                    <div className="text-center py-4">
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : filteredRepos.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                        {searchQuery ? t('github.noReposFound', 'No repositories found') : t('github.noRepos', 'No repositories')}
                    </p>
                ) : (
                    filteredRepos.map((repo) => <RepoItem key={repo.id} repo={repo} isSelected={false} onSelect={selectRepo} />)
                )}
            </div>
        </div>
    );
}

export default GitHubExplorer;
