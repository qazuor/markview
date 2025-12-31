import { clearAllCaches, clearContentCache, clearTreeCache, filterMarkdownOnly, updateContentCache } from '@/services/github/files';
import type { FileTreeNode } from '@/types/github';
import { describe, expect, it } from 'vitest';

describe('github files', () => {
    const createFileNode = (overrides: Partial<FileTreeNode> = {}): FileTreeNode => ({
        name: 'file.md',
        path: 'file.md',
        type: 'file',
        sha: 'abc123',
        isMarkdown: true,
        ...overrides
    });

    const createDirNode = (name: string, children: FileTreeNode[] = []): FileTreeNode => ({
        name,
        path: name,
        type: 'directory',
        sha: 'dir123',
        isMarkdown: false,
        children
    });

    describe('filterMarkdownOnly', () => {
        it('should keep only markdown files', () => {
            const nodes: FileTreeNode[] = [
                createFileNode({ name: 'readme.md', path: 'readme.md', isMarkdown: true }),
                createFileNode({ name: 'index.ts', path: 'index.ts', isMarkdown: false }),
                createFileNode({ name: 'docs.mdx', path: 'docs.mdx', isMarkdown: true })
            ];

            const filtered = filterMarkdownOnly(nodes);

            expect(filtered).toHaveLength(2);
            expect(filtered[0]?.name).toBe('readme.md');
            expect(filtered[1]?.name).toBe('docs.mdx');
        });

        it('should remove empty directories', () => {
            const nodes: FileTreeNode[] = [
                createDirNode('src', [createFileNode({ name: 'index.ts', path: 'src/index.ts', isMarkdown: false })]),
                createDirNode('docs', [createFileNode({ name: 'readme.md', path: 'docs/readme.md', isMarkdown: true })])
            ];

            const filtered = filterMarkdownOnly(nodes);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.name).toBe('docs');
        });

        it('should keep directories with markdown descendants', () => {
            const nodes: FileTreeNode[] = [
                createDirNode('project', [
                    createDirNode('docs', [createFileNode({ name: 'guide.md', path: 'project/docs/guide.md', isMarkdown: true })]),
                    createDirNode('src', [createFileNode({ name: 'app.ts', path: 'project/src/app.ts', isMarkdown: false })])
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
            const nodes: FileTreeNode[] = [
                createDirNode('a', [
                    createDirNode('b', [createDirNode('c', [createFileNode({ name: 'deep.md', path: 'a/b/c/deep.md', isMarkdown: true })])])
                ])
            ];

            const filtered = filterMarkdownOnly(nodes);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.name).toBe('a');
            expect(filtered[0]?.children?.[0]?.name).toBe('b');
            expect(filtered[0]?.children?.[0]?.children?.[0]?.name).toBe('c');
            expect(filtered[0]?.children?.[0]?.children?.[0]?.children?.[0]?.name).toBe('deep.md');
        });

        it('should filter out non-markdown files from mixed directories', () => {
            const nodes: FileTreeNode[] = [
                createDirNode('project', [
                    createFileNode({ name: 'README.md', path: 'project/README.md', isMarkdown: true }),
                    createFileNode({ name: 'package.json', path: 'project/package.json', isMarkdown: false }),
                    createFileNode({ name: 'CHANGELOG.md', path: 'project/CHANGELOG.md', isMarkdown: true })
                ])
            ];

            const filtered = filterMarkdownOnly(nodes);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.children).toHaveLength(2);
            expect(filtered[0]?.children?.[0]?.name).toBe('README.md');
            expect(filtered[0]?.children?.[1]?.name).toBe('CHANGELOG.md');
        });

        it('should not modify original nodes', () => {
            const nodes: FileTreeNode[] = [
                createDirNode('docs', [
                    createFileNode({ name: 'readme.md', path: 'docs/readme.md', isMarkdown: true }),
                    createFileNode({ name: 'config.json', path: 'docs/config.json', isMarkdown: false })
                ])
            ];

            filterMarkdownOnly(nodes);

            // Original should still have both children
            expect(nodes[0]?.children).toHaveLength(2);
        });
    });

    describe('updateContentCache', () => {
        it('should not throw when updating cache', () => {
            expect(() => {
                updateContentCache('owner/repo', 'path/to/file.md', 'content', 'sha123', 'main');
            }).not.toThrow();
        });

        it('should handle various content types', () => {
            expect(() => {
                updateContentCache('user/repo', 'README.md', '# Hello World', 'abc', 'main');
                updateContentCache('user/repo', 'empty.md', '', 'def', 'develop');
                updateContentCache('user/repo', 'unicode.md', 'Unicode: 你好 🌍', 'ghi', 'feature');
            }).not.toThrow();
        });
    });

    describe('clearTreeCache', () => {
        it('should not throw when clearing specific repo cache', () => {
            expect(() => clearTreeCache('owner/repo')).not.toThrow();
        });

        it('should not throw when clearing all tree cache', () => {
            expect(() => clearTreeCache()).not.toThrow();
        });
    });

    describe('clearContentCache', () => {
        it('should not throw when clearing specific content cache', () => {
            expect(() => clearContentCache('owner/repo/path/file.md')).not.toThrow();
        });

        it('should not throw when clearing all content cache', () => {
            expect(() => clearContentCache()).not.toThrow();
        });
    });

    describe('clearAllCaches', () => {
        it('should not throw when clearing all caches', () => {
            expect(() => clearAllCaches()).not.toThrow();
        });
    });
});
