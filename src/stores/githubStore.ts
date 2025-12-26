import type { GitHubFile, GitHubState, GitHubUser, Repository } from '@/types/github';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GitHubActions {
    // Auth
    setToken: (token: string) => void;
    setUser: (user: GitHubUser) => void;
    logout: () => void;

    // Loading/Error
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Repos
    setRepos: (repos: Repository[]) => void;
    selectRepo: (repo: Repository | null) => void;

    // Navigation
    setCurrentPath: (path: string[]) => void;
    navigateToFolder: (folder: string) => void;
    navigateUp: () => void;
    navigateToRoot: () => void;

    // Files
    setFiles: (files: GitHubFile[]) => void;
    clearFiles: () => void;
}

type GitHubStore = GitHubState & GitHubActions;

const initialState: GitHubState = {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: null,
    token: null,
    repos: [],
    selectedRepo: null,
    currentPath: [],
    files: []
};

export const useGitHubStore = create<GitHubStore>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                setToken: (token) => {
                    set({ token, isAuthenticated: true });
                },

                setUser: (user) => {
                    set({ user });
                },

                logout: () => {
                    set({
                        isAuthenticated: false,
                        user: null,
                        token: null,
                        repos: [],
                        selectedRepo: null,
                        currentPath: [],
                        files: []
                    });
                },

                setLoading: (loading) => {
                    set({ isLoading: loading });
                },

                setError: (error) => {
                    set({ error, isLoading: false });
                },

                setRepos: (repos) => {
                    set({ repos, isLoading: false });
                },

                selectRepo: (repo) => {
                    set({ selectedRepo: repo, currentPath: [], files: [] });
                },

                setCurrentPath: (path) => {
                    set({ currentPath: path });
                },

                navigateToFolder: (folder) => {
                    set((state) => ({
                        currentPath: [...state.currentPath, folder]
                    }));
                },

                navigateUp: () => {
                    set((state) => ({
                        currentPath: state.currentPath.slice(0, -1)
                    }));
                },

                navigateToRoot: () => {
                    set({ currentPath: [] });
                },

                setFiles: (files) => {
                    set({ files, isLoading: false });
                },

                clearFiles: () => {
                    set({ files: [] });
                }
            }),
            {
                name: 'markview:github',
                partialize: (state) => ({
                    token: state.token,
                    user: state.user,
                    isAuthenticated: state.isAuthenticated
                })
            }
        ),
        { name: 'GitHubStore' }
    )
);
