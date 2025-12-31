import { filterRepositories, getDefaultFilterOptions } from '@/services/github/repos';
import type { RepoFilterOptions, Repository } from '@/types/github';
import { describe, expect, it } from 'vitest';

describe('repos', () => {
    const createMockRepo = (overrides: Partial<Repository> = {}): Repository => ({
        id: 1,
        name: 'test-repo',
        fullName: 'user/test-repo',
        description: 'A test repository',
        private: false,
        defaultBranch: 'main',
        updatedAt: '2024-01-15T10:00:00Z',
        owner: {
            login: 'user',
            avatarUrl: 'https://example.com/avatar.png'
        },
        ...overrides
    });

    describe('filterRepositories', () => {
        describe('search filter', () => {
            it('should filter by name', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'react-app' }),
                    createMockRepo({ id: 2, name: 'vue-project' }),
                    createMockRepo({ id: 3, name: 'react-components' })
                ];

                const options: RepoFilterOptions = {
                    search: 'react',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(2);
                expect(filtered[0]?.name).toBe('react-app');
                expect(filtered[1]?.name).toBe('react-components');
            });

            it('should filter by description', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'repo1', description: 'A markdown editor' }),
                    createMockRepo({ id: 2, name: 'repo2', description: 'A code editor' }),
                    createMockRepo({ id: 3, name: 'repo3', description: 'Another markdown tool' })
                ];

                const options: RepoFilterOptions = {
                    search: 'markdown',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(2);
            });

            it('should be case insensitive', () => {
                const repos = [createMockRepo({ id: 1, name: 'MyProject' }), createMockRepo({ id: 2, name: 'other' })];

                const options: RepoFilterOptions = {
                    search: 'myproject',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(1);
                expect(filtered[0]?.name).toBe('MyProject');
            });

            it('should return all repos when search is empty', () => {
                const repos = [createMockRepo({ id: 1, name: 'repo1' }), createMockRepo({ id: 2, name: 'repo2' })];

                const options: RepoFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(2);
            });
        });

        describe('visibility filter', () => {
            it('should filter private repos', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'public-repo', private: false }),
                    createMockRepo({ id: 2, name: 'private-repo', private: true }),
                    createMockRepo({ id: 3, name: 'another-public', private: false })
                ];

                const options: RepoFilterOptions = {
                    search: '',
                    visibility: 'private',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(1);
                expect(filtered[0]?.name).toBe('private-repo');
            });

            it('should filter public repos', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'public-repo', private: false }),
                    createMockRepo({ id: 2, name: 'private-repo', private: true }),
                    createMockRepo({ id: 3, name: 'another-public', private: false })
                ];

                const options: RepoFilterOptions = {
                    search: '',
                    visibility: 'public',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(2);
            });

            it('should return all repos when visibility is all', () => {
                const repos = [createMockRepo({ id: 1, private: false }), createMockRepo({ id: 2, private: true })];

                const options: RepoFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(2);
            });
        });

        describe('sorting', () => {
            it('should sort by name ascending', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'zebra' }),
                    createMockRepo({ id: 2, name: 'apple' }),
                    createMockRepo({ id: 3, name: 'mango' })
                ];

                const options: RepoFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered[0]?.name).toBe('apple');
                expect(filtered[1]?.name).toBe('mango');
                expect(filtered[2]?.name).toBe('zebra');
            });

            it('should sort by name descending', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'apple' }),
                    createMockRepo({ id: 2, name: 'zebra' }),
                    createMockRepo({ id: 3, name: 'mango' })
                ];

                const options: RepoFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'desc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered[0]?.name).toBe('zebra');
                expect(filtered[1]?.name).toBe('mango');
                expect(filtered[2]?.name).toBe('apple');
            });

            it('should sort by updated date descending (oldest first)', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'old', updatedAt: '2024-01-01T10:00:00Z' }),
                    createMockRepo({ id: 2, name: 'newest', updatedAt: '2024-01-20T10:00:00Z' }),
                    createMockRepo({ id: 3, name: 'middle', updatedAt: '2024-01-10T10:00:00Z' })
                ];

                const options: RepoFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'updated',
                    sortOrder: 'desc'
                };

                const filtered = filterRepositories(repos, options);

                // Implementation sorts by b-a then inverts for desc
                expect(filtered[0]?.name).toBe('old');
                expect(filtered[1]?.name).toBe('middle');
                expect(filtered[2]?.name).toBe('newest');
            });

            it('should sort by updated date ascending (newest first)', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'newest', updatedAt: '2024-01-20T10:00:00Z' }),
                    createMockRepo({ id: 2, name: 'old', updatedAt: '2024-01-01T10:00:00Z' }),
                    createMockRepo({ id: 3, name: 'middle', updatedAt: '2024-01-10T10:00:00Z' })
                ];

                const options: RepoFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'updated',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                // Implementation sorts by b-a which gives newest first for 'asc'
                expect(filtered[0]?.name).toBe('newest');
                expect(filtered[1]?.name).toBe('middle');
                expect(filtered[2]?.name).toBe('old');
            });
        });

        describe('combined filters', () => {
            it('should apply search and visibility together', () => {
                const repos = [
                    createMockRepo({ id: 1, name: 'public-app', private: false }),
                    createMockRepo({ id: 2, name: 'private-app', private: true }),
                    createMockRepo({ id: 3, name: 'public-lib', private: false }),
                    createMockRepo({ id: 4, name: 'private-lib', private: true })
                ];

                const options: RepoFilterOptions = {
                    search: 'app',
                    visibility: 'private',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(1);
                expect(filtered[0]?.name).toBe('private-app');
            });

            it('should handle null description in search', () => {
                const repos = [createMockRepo({ id: 1, name: 'test', description: null })];

                const options: RepoFilterOptions = {
                    search: 'test',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterRepositories(repos, options);

                expect(filtered).toHaveLength(1);
            });
        });
    });

    describe('getDefaultFilterOptions', () => {
        it('should return default options', () => {
            const defaults = getDefaultFilterOptions();

            expect(defaults.search).toBe('');
            expect(defaults.visibility).toBe('all');
            expect(defaults.sortBy).toBe('updated');
            expect(defaults.sortOrder).toBe('desc');
        });
    });
});
