/**
 * GitHub Store
 * State management for GitHub integration
 */

import type { FileTreeNode, GitHubUser, RateLimitInfo, Repository } from '@/types/github';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GitHubState {
    // Connection
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    user: GitHubUser | null;

    // Repositories
    repositories: Repository[];
    selectedRepo: Repository | null;
    reposLoading: boolean;

    // File Navigation
    currentPath: string;
    fileTree: Map<string, FileTreeNode[]>; // repo fullName -> tree
    treeLoading: boolean;
    expandedPaths: Set<string>;

    // Rate Limit
    rateLimit: RateLimitInfo | null;
}

interface GitHubActions {
    // Connection
    setConnected: (connected: boolean, user?: GitHubUser | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    disconnect: () => void;

    // Repositories
    setRepositories: (repos: Repository[]) => void;
    setReposLoading: (loading: boolean) => void;
    selectRepo: (repo: Repository | null) => void;

    // File Navigation
    setCurrentPath: (path: string) => void;
    setFileTree: (repoFullName: string, tree: FileTreeNode[]) => void;
    setTreeLoading: (loading: boolean) => void;
    toggleExpanded: (path: string) => void;
    clearExpanded: () => void;

    // Rate Limit
    setRateLimit: (rateLimit: RateLimitInfo | null) => void;

    // Reset
    reset: () => void;
}

type GitHubStore = GitHubState & GitHubActions;

const initialState: GitHubState = {
    isConnected: false,
    isLoading: false,
    error: null,
    user: null,
    repositories: [],
    selectedRepo: null,
    reposLoading: false,
    currentPath: '',
    fileTree: new Map(),
    treeLoading: false,
    expandedPaths: new Set(),
    rateLimit: null
};

export const useGitHubStore = create<GitHubStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Connection
            setConnected: (connected, user = null) => {
                set({ isConnected: connected, user, error: null });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            setError: (error) => {
                set({ error, isLoading: false });
            },

            disconnect: () => {
                set({
                    ...initialState,
                    fileTree: new Map(),
                    expandedPaths: new Set()
                });
            },

            // Repositories
            setRepositories: (repos) => {
                set({ repositories: repos, reposLoading: false });
            },

            setReposLoading: (loading) => {
                set({ reposLoading: loading });
            },

            selectRepo: (repo) => {
                set({
                    selectedRepo: repo,
                    currentPath: '',
                    expandedPaths: new Set()
                });
            },

            // File Navigation
            setCurrentPath: (path) => {
                set({ currentPath: path });
            },

            setFileTree: (repoFullName, tree) => {
                const newMap = new Map(get().fileTree);
                newMap.set(repoFullName, tree);
                set({ fileTree: newMap, treeLoading: false });
            },

            setTreeLoading: (loading) => {
                set({ treeLoading: loading });
            },

            toggleExpanded: (path) => {
                const expanded = new Set(get().expandedPaths);
                if (expanded.has(path)) {
                    expanded.delete(path);
                } else {
                    expanded.add(path);
                }
                set({ expandedPaths: expanded });
            },

            clearExpanded: () => {
                set({ expandedPaths: new Set() });
            },

            // Rate Limit
            setRateLimit: (rateLimit) => {
                set({ rateLimit });
            },

            // Reset
            reset: () => {
                set({
                    ...initialState,
                    fileTree: new Map(),
                    expandedPaths: new Set()
                });
            }
        }),
        { name: 'GitHubStore' }
    )
);

// Selectors
export const selectIsConnected = (state: GitHubStore) => state.isConnected;
export const selectUser = (state: GitHubStore) => state.user;
export const selectRepositories = (state: GitHubStore) => state.repositories;
export const selectSelectedRepo = (state: GitHubStore) => state.selectedRepo;
export const selectCurrentPath = (state: GitHubStore) => state.currentPath;
export const selectFileTree = (state: GitHubStore) => state.fileTree;
export const selectRateLimit = (state: GitHubStore) => state.rateLimit;
