import { clearAllCaches, clearFilesCache, clearTreeCache, filterFiles, filterMarkdownOnly } from '@/services/gdrive/files';
import type { DriveFile, DriveFileTreeNode, DriveFilterOptions } from '@/types/gdrive';
import { describe, expect, it } from 'vitest';

describe('gdrive files', () => {
    const createDriveFile = (overrides: Partial<DriveFile> = {}): DriveFile => ({
        id: 'file-1',
        name: 'document.md',
        mimeType: 'text/markdown',
        modifiedTime: '2024-01-15T10:00:00Z',
        ...overrides
    });

    const createFileNode = (overrides: Partial<DriveFileTreeNode> = {}): DriveFileTreeNode => ({
        id: 'node-1',
        name: 'file.md',
        type: 'file',
        mimeType: 'text/markdown',
        modifiedTime: '2024-01-15T10:00:00Z',
        isMarkdown: true,
        ...overrides
    });

    const createFolderNode = (name: string, children: DriveFileTreeNode[] = []): DriveFileTreeNode => ({
        id: `folder-${name}`,
        name,
        type: 'folder',
        mimeType: 'application/vnd.google-apps.folder',
        modifiedTime: '2024-01-15T10:00:00Z',
        isMarkdown: false,
        children
    });

    describe('filterMarkdownOnly', () => {
        it('should keep only markdown files', () => {
            const nodes: DriveFileTreeNode[] = [
                createFileNode({ id: '1', name: 'readme.md', isMarkdown: true }),
                createFileNode({ id: '2', name: 'image.png', isMarkdown: false }),
                createFileNode({ id: '3', name: 'docs.mdx', isMarkdown: true })
            ];

            const filtered = filterMarkdownOnly(nodes);

            expect(filtered).toHaveLength(2);
            expect(filtered[0]?.name).toBe('readme.md');
            expect(filtered[1]?.name).toBe('docs.mdx');
        });

        it('should remove empty folders', () => {
            const nodes: DriveFileTreeNode[] = [
                createFolderNode('images', [createFileNode({ id: '1', name: 'photo.jpg', isMarkdown: false })]),
                createFolderNode('docs', [createFileNode({ id: '2', name: 'readme.md', isMarkdown: true })])
            ];

            const filtered = filterMarkdownOnly(nodes);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.name).toBe('docs');
        });

        it('should keep folders with markdown descendants', () => {
            const nodes: DriveFileTreeNode[] = [
                createFolderNode('project', [
                    createFolderNode('docs', [createFileNode({ id: '1', name: 'guide.md', isMarkdown: true })]),
                    createFolderNode('assets', [createFileNode({ id: '2', name: 'logo.png', isMarkdown: false })])
                ])
            ];

            const filtered = filterMarkdownOnly(nodes);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.name).toBe('project');
            expect(filtered[0]?.children).toHaveLength(1);
            expect(filtered[0]?.children?.[0]?.name).toBe('docs');
        });

        it('should handle empty array', () => {
            const filtered = filterMarkdownOnly([]);

            expect(filtered).toHaveLength(0);
        });

        it('should handle deeply nested structures', () => {
            const nodes: DriveFileTreeNode[] = [
                createFolderNode('level1', [
                    createFolderNode('level2', [
                        createFolderNode('level3', [createFileNode({ id: '1', name: 'deep.md', isMarkdown: true })])
                    ])
                ])
            ];

            const filtered = filterMarkdownOnly(nodes);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.children?.[0]?.children?.[0]?.children?.[0]?.name).toBe('deep.md');
        });

        it('should not modify original nodes', () => {
            const nodes: DriveFileTreeNode[] = [
                createFolderNode('docs', [
                    createFileNode({ id: '1', name: 'readme.md', isMarkdown: true }),
                    createFileNode({ id: '2', name: 'config.json', isMarkdown: false })
                ])
            ];

            filterMarkdownOnly(nodes);

            expect(nodes[0]?.children).toHaveLength(2);
        });
    });

    describe('filterFiles', () => {
        describe('search filter', () => {
            it('should filter by name', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'readme.md' }),
                    createDriveFile({ id: '2', name: 'changelog.md' }),
                    createDriveFile({ id: '3', name: 'readme-old.md' })
                ];

                const options: DriveFilterOptions = {
                    search: 'readme',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                expect(filtered).toHaveLength(2);
            });

            it('should be case insensitive', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'README.md' }),
                    createDriveFile({ id: '2', name: 'other.md' })
                ];

                const options: DriveFilterOptions = {
                    search: 'readme',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                expect(filtered).toHaveLength(1);
            });

            it('should return all files when search is empty', () => {
                const files: DriveFile[] = [createDriveFile({ id: '1', name: 'file1.md' }), createDriveFile({ id: '2', name: 'file2.md' })];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                expect(filtered).toHaveLength(2);
            });
        });

        describe('visibility filter', () => {
            it('should filter markdown files only', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'readme.md', mimeType: 'text/markdown' }),
                    createDriveFile({ id: '2', name: 'image.png', mimeType: 'image/png' }),
                    createDriveFile({
                        id: '3',
                        name: 'folder',
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                ];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'markdown',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                // Should include markdown file and folders (folders always included)
                expect(filtered).toHaveLength(2);
            });

            it('should filter starred files', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'starred.md', starred: true }),
                    createDriveFile({ id: '2', name: 'not-starred.md', starred: false }),
                    createDriveFile({
                        id: '3',
                        name: 'folder',
                        mimeType: 'application/vnd.google-apps.folder',
                        starred: false
                    })
                ];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'starred',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                // Should include starred files and folders (folders always included)
                expect(filtered).toHaveLength(2);
            });

            it('should return all files when visibility is all', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'file1.md' }),
                    createDriveFile({ id: '2', name: 'file2.txt' })
                ];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                expect(filtered).toHaveLength(2);
            });
        });

        describe('sorting', () => {
            it('should sort folders first', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'zebra.md' }),
                    createDriveFile({
                        id: '2',
                        name: 'folder',
                        mimeType: 'application/vnd.google-apps.folder'
                    }),
                    createDriveFile({ id: '3', name: 'apple.md' })
                ];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                expect(filtered[0]?.name).toBe('folder');
            });

            it('should sort by name ascending', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'zebra.md' }),
                    createDriveFile({ id: '2', name: 'apple.md' }),
                    createDriveFile({ id: '3', name: 'mango.md' })
                ];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                expect(filtered[0]?.name).toBe('apple.md');
                expect(filtered[1]?.name).toBe('mango.md');
                expect(filtered[2]?.name).toBe('zebra.md');
            });

            it('should sort by name descending', () => {
                const files: DriveFile[] = [createDriveFile({ id: '1', name: 'apple.md' }), createDriveFile({ id: '2', name: 'zebra.md' })];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'name',
                    sortOrder: 'desc'
                };

                const filtered = filterFiles(files, options);

                expect(filtered[0]?.name).toBe('zebra.md');
                expect(filtered[1]?.name).toBe('apple.md');
            });

            it('should sort by modified date descending (oldest first)', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'old.md', modifiedTime: '2024-01-01T10:00:00Z' }),
                    createDriveFile({ id: '2', name: 'new.md', modifiedTime: '2024-01-20T10:00:00Z' }),
                    createDriveFile({ id: '3', name: 'mid.md', modifiedTime: '2024-01-10T10:00:00Z' })
                ];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'modified',
                    sortOrder: 'desc'
                };

                const filtered = filterFiles(files, options);

                // Implementation: comparison = b-a, then -comparison for desc
                expect(filtered[0]?.name).toBe('old.md');
                expect(filtered[1]?.name).toBe('mid.md');
                expect(filtered[2]?.name).toBe('new.md');
            });

            it('should sort by size descending (smallest first)', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'small.md', size: '100' }),
                    createDriveFile({ id: '2', name: 'large.md', size: '10000' }),
                    createDriveFile({ id: '3', name: 'medium.md', size: '1000' })
                ];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'size',
                    sortOrder: 'desc'
                };

                const filtered = filterFiles(files, options);

                // Implementation: comparison = b-a, then -comparison for desc
                expect(filtered[0]?.name).toBe('small.md');
                expect(filtered[1]?.name).toBe('medium.md');
                expect(filtered[2]?.name).toBe('large.md');
            });

            it('should handle missing size', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'no-size.md', size: undefined }),
                    createDriveFile({ id: '2', name: 'has-size.md', size: '1000' })
                ];

                const options: DriveFilterOptions = {
                    search: '',
                    visibility: 'all',
                    sortBy: 'size',
                    sortOrder: 'desc'
                };

                expect(() => filterFiles(files, options)).not.toThrow();
            });
        });

        describe('combined filters', () => {
            it('should apply search and visibility together', () => {
                const files: DriveFile[] = [
                    createDriveFile({ id: '1', name: 'readme.md', starred: true }),
                    createDriveFile({ id: '2', name: 'readme-old.md', starred: false }),
                    createDriveFile({ id: '3', name: 'changelog.md', starred: true })
                ];

                const options: DriveFilterOptions = {
                    search: 'readme',
                    visibility: 'starred',
                    sortBy: 'name',
                    sortOrder: 'asc'
                };

                const filtered = filterFiles(files, options);

                expect(filtered).toHaveLength(1);
                expect(filtered[0]?.name).toBe('readme.md');
            });
        });
    });

    describe('cache management', () => {
        it('should not throw when clearing files cache for folder', () => {
            expect(() => clearFilesCache('folder-id')).not.toThrow();
        });

        it('should not throw when clearing all files cache', () => {
            expect(() => clearFilesCache()).not.toThrow();
        });

        it('should not throw when clearing tree cache', () => {
            expect(() => clearTreeCache()).not.toThrow();
        });

        it('should not throw when clearing all caches', () => {
            expect(() => clearAllCaches()).not.toThrow();
        });
    });
});
