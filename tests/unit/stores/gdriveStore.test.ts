import { selectCurrentFolder, selectFileTree, selectIsConnected, selectQuota, selectUser, useGoogleDriveStore } from '@/stores/gdriveStore';
import type { DriveFileTreeNode, DriveQuota, GoogleDriveUser } from '@/types/gdrive';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('gdriveStore', () => {
    const mockUser: GoogleDriveUser = {
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.png'
    };

    const mockFileNode: DriveFileTreeNode = {
        id: 'file-1',
        name: 'document.md',
        type: 'file',
        mimeType: 'text/markdown',
        modifiedTime: '2024-01-15T10:00:00Z',
        isMarkdown: true
    };

    const mockFolderNode: DriveFileTreeNode = {
        id: 'folder-1',
        name: 'Documents',
        type: 'folder',
        mimeType: 'application/vnd.google-apps.folder',
        modifiedTime: '2024-01-15T10:00:00Z',
        isMarkdown: false
    };

    beforeEach(() => {
        act(() => {
            useGoogleDriveStore.getState().reset();
        });
    });

    afterEach(() => {
        act(() => {
            useGoogleDriveStore.getState().reset();
        });
    });

    describe('initial state', () => {
        it('should have correct initial values', () => {
            const state = useGoogleDriveStore.getState();

            expect(state.isConnected).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.user).toBeNull();
            expect(state.fileTree).toEqual([]);
            expect(state.treeLoading).toBe(false);
            expect(state.expandedPaths.size).toBe(0);
            expect(state.currentFolderId).toBe('root');
            expect(state.folderHistory).toEqual([]);
            expect(state.quota).toBeNull();
        });
    });

    describe('connection actions', () => {
        describe('setConnected', () => {
            it('should set connected state without user', () => {
                act(() => {
                    useGoogleDriveStore.getState().setConnected(true);
                });

                expect(useGoogleDriveStore.getState().isConnected).toBe(true);
                expect(useGoogleDriveStore.getState().user).toBeNull();
                expect(useGoogleDriveStore.getState().error).toBeNull();
            });

            it('should set connected state with user', () => {
                act(() => {
                    useGoogleDriveStore.getState().setConnected(true, mockUser);
                });

                expect(useGoogleDriveStore.getState().isConnected).toBe(true);
                expect(useGoogleDriveStore.getState().user).toEqual(mockUser);
            });

            it('should clear error when connecting', () => {
                act(() => {
                    useGoogleDriveStore.getState().setError('Some error');
                    useGoogleDriveStore.getState().setConnected(true, mockUser);
                });

                expect(useGoogleDriveStore.getState().error).toBeNull();
            });
        });

        describe('setLoading', () => {
            it('should set loading state', () => {
                act(() => {
                    useGoogleDriveStore.getState().setLoading(true);
                });

                expect(useGoogleDriveStore.getState().isLoading).toBe(true);
            });
        });

        describe('setError', () => {
            it('should set error and clear loading', () => {
                act(() => {
                    useGoogleDriveStore.getState().setLoading(true);
                    useGoogleDriveStore.getState().setError('Connection failed');
                });

                expect(useGoogleDriveStore.getState().error).toBe('Connection failed');
                expect(useGoogleDriveStore.getState().isLoading).toBe(false);
            });

            it('should clear error when set to null', () => {
                act(() => {
                    useGoogleDriveStore.getState().setError('Some error');
                    useGoogleDriveStore.getState().setError(null);
                });

                expect(useGoogleDriveStore.getState().error).toBeNull();
            });
        });

        describe('disconnect', () => {
            it('should reset all state', () => {
                act(() => {
                    useGoogleDriveStore.getState().setConnected(true, mockUser);
                    useGoogleDriveStore.getState().setFileTree([mockFileNode, mockFolderNode]);
                    useGoogleDriveStore.getState().toggleExpanded('folder-1');
                    useGoogleDriveStore.getState().navigateToFolder('folder-1');
                    useGoogleDriveStore.getState().disconnect();
                });

                const state = useGoogleDriveStore.getState();
                expect(state.isConnected).toBe(false);
                expect(state.user).toBeNull();
                expect(state.fileTree).toEqual([]);
                expect(state.expandedPaths.size).toBe(0);
                expect(state.currentFolderId).toBe('root');
                expect(state.folderHistory).toEqual([]);
            });
        });
    });

    describe('file actions', () => {
        describe('setFileTree', () => {
            it('should set file tree and clear loading', () => {
                const tree = [mockFileNode, mockFolderNode];

                act(() => {
                    useGoogleDriveStore.getState().setTreeLoading(true);
                    useGoogleDriveStore.getState().setFileTree(tree);
                });

                expect(useGoogleDriveStore.getState().fileTree).toEqual(tree);
                expect(useGoogleDriveStore.getState().treeLoading).toBe(false);
            });
        });

        describe('setTreeLoading', () => {
            it('should set tree loading state', () => {
                act(() => {
                    useGoogleDriveStore.getState().setTreeLoading(true);
                });

                expect(useGoogleDriveStore.getState().treeLoading).toBe(true);
            });
        });

        describe('toggleExpanded', () => {
            it('should add id to expanded set', () => {
                act(() => {
                    useGoogleDriveStore.getState().toggleExpanded('folder-1');
                });

                expect(useGoogleDriveStore.getState().expandedPaths.has('folder-1')).toBe(true);
            });

            it('should remove id from expanded set if already exists', () => {
                act(() => {
                    useGoogleDriveStore.getState().toggleExpanded('folder-1');
                    useGoogleDriveStore.getState().toggleExpanded('folder-1');
                });

                expect(useGoogleDriveStore.getState().expandedPaths.has('folder-1')).toBe(false);
            });

            it('should handle multiple ids', () => {
                act(() => {
                    useGoogleDriveStore.getState().toggleExpanded('folder-1');
                    useGoogleDriveStore.getState().toggleExpanded('folder-2');
                    useGoogleDriveStore.getState().toggleExpanded('folder-3');
                });

                const expanded = useGoogleDriveStore.getState().expandedPaths;
                expect(expanded.size).toBe(3);
                expect(expanded.has('folder-1')).toBe(true);
                expect(expanded.has('folder-2')).toBe(true);
                expect(expanded.has('folder-3')).toBe(true);
            });
        });

        describe('clearExpanded', () => {
            it('should clear all expanded paths', () => {
                act(() => {
                    useGoogleDriveStore.getState().toggleExpanded('folder-1');
                    useGoogleDriveStore.getState().toggleExpanded('folder-2');
                    useGoogleDriveStore.getState().clearExpanded();
                });

                expect(useGoogleDriveStore.getState().expandedPaths.size).toBe(0);
            });
        });
    });

    describe('navigation actions', () => {
        describe('setCurrentFolder', () => {
            it('should set current folder id', () => {
                act(() => {
                    useGoogleDriveStore.getState().setCurrentFolder('folder-1');
                });

                expect(useGoogleDriveStore.getState().currentFolderId).toBe('folder-1');
            });
        });

        describe('navigateToFolder', () => {
            it('should navigate to folder and add to history', () => {
                act(() => {
                    useGoogleDriveStore.getState().navigateToFolder('folder-1');
                });

                expect(useGoogleDriveStore.getState().currentFolderId).toBe('folder-1');
                expect(useGoogleDriveStore.getState().folderHistory).toEqual(['root']);
            });

            it('should maintain history stack', () => {
                act(() => {
                    useGoogleDriveStore.getState().navigateToFolder('folder-1');
                    useGoogleDriveStore.getState().navigateToFolder('folder-2');
                    useGoogleDriveStore.getState().navigateToFolder('folder-3');
                });

                expect(useGoogleDriveStore.getState().currentFolderId).toBe('folder-3');
                expect(useGoogleDriveStore.getState().folderHistory).toEqual(['root', 'folder-1', 'folder-2']);
            });
        });

        describe('navigateBack', () => {
            it('should navigate back to previous folder', () => {
                act(() => {
                    useGoogleDriveStore.getState().navigateToFolder('folder-1');
                    useGoogleDriveStore.getState().navigateToFolder('folder-2');
                    useGoogleDriveStore.getState().navigateBack();
                });

                expect(useGoogleDriveStore.getState().currentFolderId).toBe('folder-1');
                expect(useGoogleDriveStore.getState().folderHistory).toEqual(['root']);
            });

            it('should navigate to root when history is empty after going back', () => {
                act(() => {
                    useGoogleDriveStore.getState().navigateToFolder('folder-1');
                    useGoogleDriveStore.getState().navigateBack();
                });

                expect(useGoogleDriveStore.getState().currentFolderId).toBe('root');
                expect(useGoogleDriveStore.getState().folderHistory).toEqual([]);
            });

            it('should do nothing when history is empty', () => {
                act(() => {
                    useGoogleDriveStore.getState().navigateBack();
                });

                expect(useGoogleDriveStore.getState().currentFolderId).toBe('root');
                expect(useGoogleDriveStore.getState().folderHistory).toEqual([]);
            });
        });
    });

    describe('quota actions', () => {
        describe('setQuota', () => {
            it('should set quota info', () => {
                const quota: DriveQuota = {
                    used: 1000000,
                    limit: 15000000000,
                    usedInDrive: 500000,
                    usedInTrash: 100000
                };

                act(() => {
                    useGoogleDriveStore.getState().setQuota(quota);
                });

                expect(useGoogleDriveStore.getState().quota).toEqual(quota);
            });

            it('should clear quota', () => {
                act(() => {
                    useGoogleDriveStore.getState().setQuota({ used: 1000, limit: 15000000000, usedInDrive: 500, usedInTrash: 100 });
                    useGoogleDriveStore.getState().setQuota(null);
                });

                expect(useGoogleDriveStore.getState().quota).toBeNull();
            });
        });
    });

    describe('reset action', () => {
        it('should reset all state to initial values', () => {
            act(() => {
                useGoogleDriveStore.getState().setConnected(true, mockUser);
                useGoogleDriveStore.getState().setFileTree([mockFileNode, mockFolderNode]);
                useGoogleDriveStore.getState().toggleExpanded('folder-1');
                useGoogleDriveStore.getState().navigateToFolder('folder-1');
                useGoogleDriveStore.getState().setQuota({ used: 1000, limit: 15000000000, usedInDrive: 500, usedInTrash: 100 });
                useGoogleDriveStore.getState().reset();
            });

            const state = useGoogleDriveStore.getState();
            expect(state.isConnected).toBe(false);
            expect(state.user).toBeNull();
            expect(state.fileTree).toEqual([]);
            expect(state.expandedPaths.size).toBe(0);
            expect(state.currentFolderId).toBe('root');
            expect(state.folderHistory).toEqual([]);
            expect(state.quota).toBeNull();
        });
    });

    describe('selectors', () => {
        beforeEach(() => {
            act(() => {
                useGoogleDriveStore.getState().setConnected(true, mockUser);
                useGoogleDriveStore.getState().setFileTree([mockFileNode, mockFolderNode]);
                useGoogleDriveStore.getState().navigateToFolder('folder-1');
                useGoogleDriveStore.getState().setQuota({ used: 1000, limit: 15000000000, usedInDrive: 500, usedInTrash: 100 });
            });
        });

        it('selectIsConnected should return connected state', () => {
            expect(selectIsConnected(useGoogleDriveStore.getState())).toBe(true);
        });

        it('selectUser should return user', () => {
            expect(selectUser(useGoogleDriveStore.getState())).toEqual(mockUser);
        });

        it('selectFileTree should return file tree', () => {
            expect(selectFileTree(useGoogleDriveStore.getState())).toEqual([mockFileNode, mockFolderNode]);
        });

        it('selectCurrentFolder should return current folder id', () => {
            expect(selectCurrentFolder(useGoogleDriveStore.getState())).toBe('folder-1');
        });

        it('selectQuota should return quota', () => {
            expect(selectQuota(useGoogleDriveStore.getState())).toEqual({
                used: 1000,
                limit: 15000000000,
                usedInDrive: 500,
                usedInTrash: 100
            });
        });
    });
});
