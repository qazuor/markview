import { createRendererProcessor, renderMarkdown, renderMarkdownWithPositions } from '@/services/markdown/renderer';
import { describe, expect, it } from 'vitest';

describe('renderer', () => {
    describe('renderMarkdown', () => {
        it('should render basic markdown', async () => {
            const markdown = '# Hello World';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<h1');
            expect(html).toContain('Hello World');
            expect(html).toContain('</h1>');
        });

        it('should render paragraphs', async () => {
            const markdown = 'This is a paragraph.\n\nThis is another paragraph.';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<p');
            expect(html).toContain('This is a paragraph.');
            expect(html).toContain('This is another paragraph.');
        });

        it('should render GFM tables', async () => {
            const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<table');
            expect(html).toContain('<th');
            expect(html).toContain('Header 1');
            expect(html).toContain('<td');
            expect(html).toContain('Cell 1');
        });

        it('should render code blocks with syntax highlighting', async () => {
            const markdown = '```javascript\nconst x = 1;\n```';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<pre');
            expect(html).toContain('const');
        });

        it('should render inline code', async () => {
            const markdown = 'Use `console.log()` for debugging.';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<code');
            expect(html).toContain('console.log()');
        });

        it('should render links', async () => {
            const markdown = '[Example](https://example.com)';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<a');
            expect(html).toContain('href="https://example.com"');
            expect(html).toContain('Example');
        });

        it('should render lists', async () => {
            const markdown = '- Item 1\n- Item 2\n- Item 3';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<ul');
            expect(html).toContain('<li');
            expect(html).toContain('Item 1');
        });

        it('should render ordered lists', async () => {
            const markdown = '1. First\n2. Second\n3. Third';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<ol');
            expect(html).toContain('<li');
            expect(html).toContain('First');
        });

        it('should render blockquotes', async () => {
            const markdown = '> This is a quote';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<blockquote');
            expect(html).toContain('This is a quote');
        });

        it('should render horizontal rules', async () => {
            const markdown = 'Before\n\n---\n\nAfter';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<hr');
        });

        it('should render bold and italic', async () => {
            const markdown = '**bold** and *italic* and ***both***';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<strong');
            expect(html).toContain('<em');
        });

        it('should render strikethrough (GFM)', async () => {
            const markdown = '~~strikethrough~~';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<del');
            expect(html).toContain('strikethrough');
        });

        it('should render task lists (GFM)', async () => {
            const markdown = '- [ ] unchecked\n- [x] checked';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('type="checkbox"');
            expect(html).toContain('checked');
        });

        it('should handle frontmatter', async () => {
            const markdown = `---
title: Test
---

# Content`;

            const html = await renderMarkdown(markdown);

            expect(html).toContain('<h1');
            expect(html).toContain('Content');
            // Frontmatter should not appear in output
            expect(html).not.toContain('title: Test');
        });

        it('should render math expressions with KaTeX', async () => {
            const markdown = 'Inline math: $E = mc^2$';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('math');
        });

        it('should add data-line attributes for scroll sync', async () => {
            const markdown = '# Heading\n\nParagraph';

            const html = await renderMarkdown(markdown);

            expect(html).toContain('data-line=');
        });

        it('should use dark theme when specified', async () => {
            const markdown = '```js\nconst x = 1;\n```';

            const htmlLight = await renderMarkdown(markdown, 'light');
            const htmlDark = await renderMarkdown(markdown, 'dark');

            // Different themes should produce different output
            expect(htmlLight).not.toBe(htmlDark);
        });
    });

    describe('renderMarkdownWithPositions', () => {
        it('should return html and lineMap', async () => {
            const markdown = '# Line 1\n\nLine 3';

            const result = await renderMarkdownWithPositions(markdown);

            expect(result.html).toContain('<h1');
            expect(result.lineMap).toBeInstanceOf(Map);
        });

        it('should build correct lineMap', async () => {
            const markdown = 'Line 1\nLine 2\nLine 3';

            const result = await renderMarkdownWithPositions(markdown);

            expect(result.lineMap.get(1)).toBe(0);
            expect(result.lineMap.get(2)).toBe(7); // 'Line 1\n' = 7 chars
            expect(result.lineMap.get(3)).toBe(14); // 'Line 1\nLine 2\n' = 14 chars
        });

        it('should handle empty lines', async () => {
            const markdown = 'Line 1\n\nLine 3';

            const result = await renderMarkdownWithPositions(markdown);

            expect(result.lineMap.size).toBe(3);
            expect(result.lineMap.get(2)).toBe(7); // Position of empty line
        });

        it('should work with dark theme', async () => {
            const markdown = '# Test';

            const result = await renderMarkdownWithPositions(markdown, 'dark');

            expect(result.html).toContain('<h1');
        });
    });

    describe('createRendererProcessor', () => {
        it('should create a processor', async () => {
            const processor = await createRendererProcessor();

            expect(processor).toBeDefined();
            expect(processor.process).toBeDefined();
        });

        it('should create processor with light theme', async () => {
            const processor = await createRendererProcessor('light');

            expect(processor).toBeDefined();
        });

        it('should create processor with dark theme', async () => {
            const processor = await createRendererProcessor('dark');

            expect(processor).toBeDefined();
        });

        it('should process markdown correctly', async () => {
            const processor = await createRendererProcessor();
            const result = await processor.process('# Test');

            expect(String(result)).toContain('<h1');
        });
    });
});
