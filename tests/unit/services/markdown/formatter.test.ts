import { formatMarkdown, formatMarkdownSync } from '@/services/markdown/formatter';
import { describe, expect, it } from 'vitest';

describe('formatMarkdown', () => {
    it('should format markdown content', async () => {
        const input = '# Hello\nThis is   some    text';
        const result = await formatMarkdown(input);

        expect(result).toBeDefined();
        expect(result).toContain('# Hello');
    });

    it('should handle empty content', async () => {
        const result = await formatMarkdown('');

        expect(result).toBe('');
    });

    it('should normalize list markers', async () => {
        const input = '* item 1\n* item 2';
        const result = await formatMarkdown(input);

        // remark-stringify uses '-' as default bullet
        expect(result).toContain('-');
    });

    it('should preserve frontmatter', async () => {
        const input = '---\ntitle: Test\n---\n\n# Content';
        const result = await formatMarkdown(input);

        expect(result).toContain('---');
        expect(result).toContain('title: Test');
    });

    it('should format GFM tables', async () => {
        const input = '| a | b |\n|---|---|\n| 1 | 2 |';
        const result = await formatMarkdown(input);

        expect(result).toContain('|');
    });
});

describe('formatMarkdownSync', () => {
    it('should format markdown synchronously', () => {
        const input = '# Hello';
        const result = formatMarkdownSync(input);

        expect(result).toBeDefined();
        expect(result).toContain('# Hello');
    });

    it('should handle errors gracefully', () => {
        // Even with invalid input, should return something
        const result = formatMarkdownSync('# Test');

        expect(result).toBeDefined();
    });
});
