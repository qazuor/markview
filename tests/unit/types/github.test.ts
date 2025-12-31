import { CACHE_TTL, isCacheValid, isMarkdownFile, parseRepoFullName } from '@/types/github';
import type { CachedData } from '@/types/github';
import { describe, expect, it, vi } from 'vitest';

describe('github types', () => {
    describe('isMarkdownFile', () => {
        it('should return true for .md files', () => {
            expect(isMarkdownFile('README.md')).toBe(true);
            expect(isMarkdownFile('docs/guide.md')).toBe(true);
            expect(isMarkdownFile('file.MD')).toBe(true);
        });

        it('should return true for .mdx files', () => {
            expect(isMarkdownFile('component.mdx')).toBe(true);
            expect(isMarkdownFile('docs/page.MDX')).toBe(true);
        });

        it('should return false for non-markdown files', () => {
            expect(isMarkdownFile('index.ts')).toBe(false);
            expect(isMarkdownFile('style.css')).toBe(false);
            expect(isMarkdownFile('config.json')).toBe(false);
            expect(isMarkdownFile('image.png')).toBe(false);
        });

        it('should return false for files without extension', () => {
            expect(isMarkdownFile('Dockerfile')).toBe(false);
            expect(isMarkdownFile('Makefile')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(isMarkdownFile('.md')).toBe(true);
            expect(isMarkdownFile('file.md.bak')).toBe(false);
        });
    });

    describe('parseRepoFullName', () => {
        it('should parse owner and repo', () => {
            const result = parseRepoFullName('user/repo');

            expect(result.owner).toBe('user');
            expect(result.repo).toBe('repo');
        });

        it('should handle organization names', () => {
            const result = parseRepoFullName('facebook/react');

            expect(result.owner).toBe('facebook');
            expect(result.repo).toBe('react');
        });

        it('should handle hyphenated names', () => {
            const result = parseRepoFullName('my-org/my-repo');

            expect(result.owner).toBe('my-org');
            expect(result.repo).toBe('my-repo');
        });

        it('should handle missing parts', () => {
            const result = parseRepoFullName('onlyowner');

            expect(result.owner).toBe('onlyowner');
            expect(result.repo).toBe('');
        });

        it('should handle empty string', () => {
            const result = parseRepoFullName('');

            expect(result.owner).toBe('');
            expect(result.repo).toBe('');
        });
    });

    describe('isCacheValid', () => {
        it('should return false for null cache', () => {
            expect(isCacheValid(null)).toBe(false);
        });

        it('should return true for valid cache', () => {
            const cached: CachedData<string> = {
                data: 'test',
                timestamp: Date.now(),
                ttl: 60000
            };

            expect(isCacheValid(cached)).toBe(true);
        });

        it('should return false for expired cache', () => {
            const cached: CachedData<string> = {
                data: 'test',
                timestamp: Date.now() - 120000, // 2 minutes ago
                ttl: 60000 // 1 minute TTL
            };

            expect(isCacheValid(cached)).toBe(false);
        });

        it('should handle edge case at exact expiration', () => {
            vi.useFakeTimers();
            const now = Date.now();
            vi.setSystemTime(now);

            const cached: CachedData<string> = {
                data: 'test',
                timestamp: now - 60000,
                ttl: 60000
            };

            // At exact expiration, should be invalid (timestamp - now >= ttl)
            expect(isCacheValid(cached)).toBe(false);

            vi.useRealTimers();
        });

        it('should work with different data types', () => {
            const objectCache: CachedData<{ name: string }> = {
                data: { name: 'test' },
                timestamp: Date.now(),
                ttl: CACHE_TTL.REPOS
            };

            const arrayCache: CachedData<number[]> = {
                data: [1, 2, 3],
                timestamp: Date.now(),
                ttl: CACHE_TTL.TREE
            };

            expect(isCacheValid(objectCache)).toBe(true);
            expect(isCacheValid(arrayCache)).toBe(true);
        });
    });

    describe('CACHE_TTL', () => {
        it('should have expected TTL values', () => {
            expect(CACHE_TTL.REPOS).toBe(5 * 60 * 1000); // 5 minutes
            expect(CACHE_TTL.TREE).toBe(5 * 60 * 1000); // 5 minutes
            expect(CACHE_TTL.FILE).toBe(60 * 60 * 1000); // 1 hour
        });
    });
});
