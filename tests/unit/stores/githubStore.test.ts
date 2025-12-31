import {
    selectCurrentPath,
    selectFileTree,
    selectIsConnected,
    selectRateLimit,
    selectRepositories,
    selectSelectedRepo,
    selectUser,
    useGitHubStore
} from '@/stores/githubStore';
import type { FileTreeNode, GitHubUser, RateLimitInfo, Repository } from '@/types/github';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('githubStore', () => {
    const mockUser: GitHubUser = {
        id: 123,
        login: 'testuser',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        email: 'testuser@example.com'
    };

    const mockRepo: Repository = {
        id: 1,
        name: 'test-repo',
        fullName: 'testuser/test-repo',
        private: false,
        description: 'A test repository',
        defaultBranch: 'main',
        owner: {
            login: 'testuser',
            avatarUrl: 'https://example.com/avatar.png'
        },
        updatedAt: '2024-01-15T10:00:00Z'
    };

    const mockFileNode: FileTreeNode = {
        path: 'src/index.ts',
        name: 'index.ts',
        type: 'file',
        sha: 'abc123',
        size: 1000,
        isMarkdown: false
    };

    beforeEach(() => {
        act(() => {
            useGitHubStore.getState().reset();
        });
    });

    afterEach(() => {
        act(() => {
            useGitHubStore.getState().reset();
        });
    });

    describe('initial state', () => {
        it('should have correct initial values', () => {
            const state = useGitHubStore.getState();

            expect(state.isConnected).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.user).toBeNull();
            expect(state.repositories).toEqual([]);
            expect(state.selectedRepo).toBeNull();
            expect(state.reposLoading).toBe(false);
            expect(state.currentPath).toBe('');
            expect(state.fileTree.size).toBe(0);
            expect(state.treeLoading).toBe(false);
            expect(state.expandedPaths.size).toBe(0);
            expect(state.rateLimit).toBeNull();
        });
    });

    describe('connection actions', () => {
        describe('setConnected', () => {
            it('should set connected state without user', () => {
                act(() => {
                    useGitHubStore.getState().setConnected(true);
                });

                expect(useGitHubStore.getState().isConnected).toBe(true);
                expect(useGitHubStore.getState().user).toBeNull();
                expect(useGitHubStore.getState().error).toBeNull();
            });

            it('should set connected state with user', () => {
                act(() => {
                    useGitHubStore.getState().setConnected(true, mockUser);
                });

                expect(useGitHubStore.getState().isConnected).toBe(true);
                expect(useGitHubStore.getState().user).toEqual(mockUser);
            });

            it('should clear error when connecting', () => {
                act(() => {
                    useGitHubStore.getState().setError('Some error');
                    useGitHubStore.getState().setConnected(true, mockUser);
                });

                expect(useGitHubStore.getState().error).toBeNull();
            });
        });

        describe('setLoading', () => {
            it('should set loading state', () => {
                act(() => {
                    useGitHubStore.getState().setLoading(true);
                });

                expect(useGitHubStore.getState().isLoading).toBe(true);
            });
        });

        describe('setError', () => {
            it('should set error and clear loading', () => {
                act(() => {
                    useGitHubStore.getState().setLoading(true);
                    useGitHubStore.getState().setError('Connection failed');
                });

                expect(useGitHubStore.getState().error).toBe('Connection failed');
                expect(useGitHubStore.getState().isLoading).toBe(false);
            });

            it('should clear error when set to null', () => {
                act(() => {
                    useGitHubStore.getState().setError('Some error');
                    useGitHubStore.getState().setError(null);
                });

                expect(useGitHubStore.getState().error).toBeNull();
            });
        });

        describe('disconnect', () => {
            it('should reset all state', () => {
                act(() => {
                    useGitHubStore.getState().setConnected(true, mockUser);
                    useGitHubStore.getState().setRepositories([mockRepo]);
                    useGitHubStore.getState().selectRepo(mockRepo);
                    useGitHubStore.getState().setFileTree('testuser/test-repo', [mockFileNode]);
                    useGitHubStore.getState().toggleExpanded('src');
                    useGitHubStore.getState().disconnect();
                });

                const state = useGitHubStore.getState();
                expect(state.isConnected).toBe(false);
                expect(state.user).toBeNull();
                expect(state.repositories).toEqual([]);
                expect(state.selectedRepo).toBeNull();
                expect(state.fileTree.size).toBe(0);
                expect(state.expandedPaths.size).toBe(0);
            });
        });
    });

    describe('repository actions', () => {
        describe('setRepositories', () => {
            it('should set repositories and clear loading', () => {
                const repos = [mockRepo, { ...mockRepo, id: 2, name: 'repo-2' }];

                act(() => {
                    useGitHubStore.getState().setReposLoading(true);
                    useGitHubStore.getState().setRepositories(repos);
                });

                expect(useGitHubStore.getState().repositories).toEqual(repos);
                expect(useGitHubStore.getState().reposLoading).toBe(false);
            });
        });

        describe('setReposLoading', () => {
            it('should set repos loading state', () => {
                act(() => {
                    useGitHubStore.getState().setReposLoading(true);
                });

                expect(useGitHubStore.getState().reposLoading).toBe(true);
            });
        });

        describe('selectRepo', () => {
            it('should select repository and reset path/expanded', () => {
                act(() => {
                    useGitHubStore.getState().setCurrentPath('src/utils');
                    useGitHubStore.getState().toggleExpanded('src');
                    useGitHubStore.getState().selectRepo(mockRepo);
                });

                expect(useGitHubStore.getState().selectedRepo).toEqual(mockRepo);
                expect(useGitHubStore.getState().currentPath).toBe('');
                expect(useGitHubStore.getState().expandedPaths.size).toBe(0);
            });

            it('should clear selected repo', () => {
                act(() => {
                    useGitHubStore.getState().selectRepo(mockRepo);
                    useGitHubStore.getState().selectRepo(null);
                });

                expect(useGitHubStore.getState().selectedRepo).toBeNull();
            });
        });
    });

    describe('file navigation actions', () => {
        describe('setCurrentPath', () => {
            it('should set current path', () => {
                act(() => {
                    useGitHubStore.getState().setCurrentPath('src/components');
                });

                expect(useGitHubStore.getState().currentPath).toBe('src/components');
            });
        });

        describe('setFileTree', () => {
            it('should set file tree for repository', () => {
                const tree = [mockFileNode, { ...mockFileNode, path: 'src/utils.ts', name: 'utils.ts' }];

                act(() => {
                    useGitHubStore.getState().setTreeLoading(true);
                    useGitHubStore.getState().setFileTree('testuser/test-repo', tree);
                });

                const fileTree = useGitHubStore.getState().fileTree;
                expect(fileTree.get('testuser/test-repo')).toEqual(tree);
                expect(useGitHubStore.getState().treeLoading).toBe(false);
            });

            it('should update existing file tree', () => {
                const tree1 = [mockFileNode];
                const tree2 = [{ ...mockFileNode, path: 'src/new.ts' }];

                act(() => {
                    useGitHubStore.getState().setFileTree('testuser/test-repo', tree1);
                    useGitHubStore.getState().setFileTree('testuser/test-repo', tree2);
                });

                const fileTree = useGitHubStore.getState().fileTree;
                expect(fileTree.get('testuser/test-repo')).toEqual(tree2);
            });

            it('should maintain trees for multiple repos', () => {
                const tree1 = [mockFileNode];
                const tree2 = [{ ...mockFileNode, path: 'other/file.ts' }];

                act(() => {
                    useGitHubStore.getState().setFileTree('testuser/repo1', tree1);
                    useGitHubStore.getState().setFileTree('testuser/repo2', tree2);
                });

                const fileTree = useGitHubStore.getState().fileTree;
                expect(fileTree.size).toBe(2);
                expect(fileTree.get('testuser/repo1')).toEqual(tree1);
                expect(fileTree.get('testuser/repo2')).toEqual(tree2);
            });
        });

        describe('setTreeLoading', () => {
            it('should set tree loading state', () => {
                act(() => {
                    useGitHubStore.getState().setTreeLoading(true);
                });

                expect(useGitHubStore.getState().treeLoading).toBe(true);
            });
        });

        describe('toggleExpanded', () => {
            it('should add path to expanded set', () => {
                act(() => {
                    useGitHubStore.getState().toggleExpanded('src');
                });

                expect(useGitHubStore.getState().expandedPaths.has('src')).toBe(true);
            });

            it('should remove path from expanded set if already exists', () => {
                act(() => {
                    useGitHubStore.getState().toggleExpanded('src');
                    useGitHubStore.getState().toggleExpanded('src');
                });

                expect(useGitHubStore.getState().expandedPaths.has('src')).toBe(false);
            });

            it('should handle multiple paths', () => {
                act(() => {
                    useGitHubStore.getState().toggleExpanded('src');
                    useGitHubStore.getState().toggleExpanded('src/components');
                    useGitHubStore.getState().toggleExpanded('tests');
                });

                const expanded = useGitHubStore.getState().expandedPaths;
                expect(expanded.size).toBe(3);
                expect(expanded.has('src')).toBe(true);
                expect(expanded.has('src/components')).toBe(true);
                expect(expanded.has('tests')).toBe(true);
            });
        });

        describe('clearExpanded', () => {
            it('should clear all expanded paths', () => {
                act(() => {
                    useGitHubStore.getState().toggleExpanded('src');
                    useGitHubStore.getState().toggleExpanded('tests');
                    useGitHubStore.getState().clearExpanded();
                });

                expect(useGitHubStore.getState().expandedPaths.size).toBe(0);
            });
        });
    });

    describe('rate limit actions', () => {
        describe('setRateLimit', () => {
            it('should set rate limit info', () => {
                const rateLimit: RateLimitInfo = {
                    limit: '5000',
                    remaining: '4500',
                    reset: String(Math.floor(Date.now() / 1000 + 3600))
                };

                act(() => {
                    useGitHubStore.getState().setRateLimit(rateLimit);
                });

                expect(useGitHubStore.getState().rateLimit).toEqual(rateLimit);
            });

            it('should clear rate limit', () => {
                act(() => {
                    useGitHubStore.getState().setRateLimit({ limit: '5000', remaining: '4500', reset: '0' });
                    useGitHubStore.getState().setRateLimit(null);
                });

                expect(useGitHubStore.getState().rateLimit).toBeNull();
            });
        });
    });

    describe('reset action', () => {
        it('should reset all state to initial values', () => {
            act(() => {
                useGitHubStore.getState().setConnected(true, mockUser);
                useGitHubStore.getState().setRepositories([mockRepo]);
                useGitHubStore.getState().selectRepo(mockRepo);
                useGitHubStore.getState().setFileTree('testuser/test-repo', [mockFileNode]);
                useGitHubStore.getState().toggleExpanded('src');
                useGitHubStore.getState().setRateLimit({ limit: '5000', remaining: '4500', reset: '0' });
                useGitHubStore.getState().reset();
            });

            const state = useGitHubStore.getState();
            expect(state.isConnected).toBe(false);
            expect(state.user).toBeNull();
            expect(state.repositories).toEqual([]);
            expect(state.selectedRepo).toBeNull();
            expect(state.fileTree.size).toBe(0);
            expect(state.expandedPaths.size).toBe(0);
            expect(state.rateLimit).toBeNull();
        });
    });

    describe('selectors', () => {
        beforeEach(() => {
            act(() => {
                useGitHubStore.getState().setConnected(true, mockUser);
                useGitHubStore.getState().setRepositories([mockRepo]);
                useGitHubStore.getState().selectRepo(mockRepo);
                useGitHubStore.getState().setCurrentPath('src');
                useGitHubStore.getState().setFileTree('testuser/test-repo', [mockFileNode]);
                useGitHubStore.getState().setRateLimit({ limit: '5000', remaining: '4500', reset: '0' });
            });
        });

        it('selectIsConnected should return connected state', () => {
            expect(selectIsConnected(useGitHubStore.getState())).toBe(true);
        });

        it('selectUser should return user', () => {
            expect(selectUser(useGitHubStore.getState())).toEqual(mockUser);
        });

        it('selectRepositories should return repositories', () => {
            expect(selectRepositories(useGitHubStore.getState())).toEqual([mockRepo]);
        });

        it('selectSelectedRepo should return selected repo', () => {
            expect(selectSelectedRepo(useGitHubStore.getState())).toEqual(mockRepo);
        });

        it('selectCurrentPath should return current path', () => {
            expect(selectCurrentPath(useGitHubStore.getState())).toBe('src');
        });

        it('selectFileTree should return file tree', () => {
            const tree = selectFileTree(useGitHubStore.getState());
            expect(tree.get('testuser/test-repo')).toEqual([mockFileNode]);
        });

        it('selectRateLimit should return rate limit', () => {
            expect(selectRateLimit(useGitHubStore.getState())).toEqual({
                limit: '5000',
                remaining: '4500',
                reset: '0'
            });
        });
    });
});
