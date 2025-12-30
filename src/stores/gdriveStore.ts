/**
 * Google Drive Store
 * State management for Google Drive integration
 */

import type { DriveFileTreeNode, DriveQuota, GoogleDriveUser } from '@/types/gdrive';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GoogleDriveState {
    // Connection
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    user: GoogleDriveUser | null;

    // Files
    fileTree: DriveFileTreeNode[];
    treeLoading: boolean;
    expandedPaths: Set<string>;

    // Current folder navigation
    currentFolderId: string;
    folderHistory: string[];

    // Quota
    quota: DriveQuota | null;
}

interface GoogleDriveActions {
    // Connection
    setConnected: (connected: boolean, user?: GoogleDriveUser | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    disconnect: () => void;

    // Files
    setFileTree: (tree: DriveFileTreeNode[]) => void;
    setTreeLoading: (loading: boolean) => void;
    toggleExpanded: (id: string) => void;
    clearExpanded: () => void;

    // Navigation
    setCurrentFolder: (folderId: string) => void;
    navigateToFolder: (folderId: string) => void;
    navigateBack: () => void;

    // Quota
    setQuota: (quota: DriveQuota | null) => void;

    // Reset
    reset: () => void;
}

type GoogleDriveStore = GoogleDriveState & GoogleDriveActions;

const initialState: GoogleDriveState = {
    isConnected: false,
    isLoading: false,
    error: null,
    user: null,
    fileTree: [],
    treeLoading: false,
    expandedPaths: new Set(),
    currentFolderId: 'root',
    folderHistory: [],
    quota: null
};

export const useGoogleDriveStore = create<GoogleDriveStore>()(
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
                    expandedPaths: new Set()
                });
            },

            // Files
            setFileTree: (tree) => {
                set({ fileTree: tree, treeLoading: false });
            },

            setTreeLoading: (loading) => {
                set({ treeLoading: loading });
            },

            toggleExpanded: (id) => {
                const expanded = new Set(get().expandedPaths);
                if (expanded.has(id)) {
                    expanded.delete(id);
                } else {
                    expanded.add(id);
                }
                set({ expandedPaths: expanded });
            },

            clearExpanded: () => {
                set({ expandedPaths: new Set() });
            },

            // Navigation
            setCurrentFolder: (folderId) => {
                set({ currentFolderId: folderId });
            },

            navigateToFolder: (folderId) => {
                const { currentFolderId, folderHistory } = get();
                set({
                    currentFolderId: folderId,
                    folderHistory: [...folderHistory, currentFolderId]
                });
            },

            navigateBack: () => {
                const { folderHistory } = get();
                if (folderHistory.length === 0) return;

                const newHistory = [...folderHistory];
                const previousFolder = newHistory.pop() || 'root';
                set({
                    currentFolderId: previousFolder,
                    folderHistory: newHistory
                });
            },

            // Quota
            setQuota: (quota) => {
                set({ quota });
            },

            // Reset
            reset: () => {
                set({
                    ...initialState,
                    expandedPaths: new Set()
                });
            }
        }),
        { name: 'GoogleDriveStore' }
    )
);

// Selectors
export const selectIsConnected = (state: GoogleDriveStore) => state.isConnected;
export const selectUser = (state: GoogleDriveStore) => state.user;
export const selectFileTree = (state: GoogleDriveStore) => state.fileTree;
export const selectCurrentFolder = (state: GoogleDriveStore) => state.currentFolderId;
export const selectQuota = (state: GoogleDriveStore) => state.quota;
