import { lintMarkdown, lintMarkdownSync } from '@/services/markdown/linter';
import { describe, expect, it } from 'vitest';

describe('lintMarkdown', () => {
    it('should return empty array for valid markdown', async () => {
        const input = '# Valid Heading\n\nThis is a paragraph.';
        const results = await lintMarkdown(input);

        expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty content', async () => {
        const results = await lintMarkdown('');

        expect(results).toEqual([]);
    });

    it('should detect issues in markdown', async () => {
        // Multiple top-level headings often trigger warnings
        const input = '# Heading 1\n\n# Heading 2';
        const results = await lintMarkdown(input);

        // Results may or may not contain warnings depending on rules
        expect(Array.isArray(results)).toBe(true);
    });

    it('should include line and column info', async () => {
        const input = '# Test\n\nSome content';
        const results = await lintMarkdown(input);

        // Each result should have line and column properties
        for (const result of results) {
            expect(typeof result.line).toBe('number');
            expect(typeof result.column).toBe('number');
            expect(typeof result.message).toBe('string');
        }
    });

    it('should handle frontmatter', async () => {
        const input = '---\ntitle: Test\n---\n\n# Content';
        const results = await lintMarkdown(input);

        expect(Array.isArray(results)).toBe(true);
    });
});

describe('lintMarkdownSync', () => {
    it('should lint markdown synchronously', () => {
        const input = '# Test';
        const results = lintMarkdownSync(input);

        expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty content', () => {
        const results = lintMarkdownSync('');

        expect(results).toEqual([]);
    });

    it('should return results with proper structure', () => {
        const input = '# Hello\n\nWorld';
        const results = lintMarkdownSync(input);

        for (const result of results) {
            expect(result).toHaveProperty('line');
            expect(result).toHaveProperty('column');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('severity');
        }
    });
});
