import { extractHeading, sanitizeFilename } from '@/utils';
import { describe, expect, it } from 'vitest';

describe('extractHeading', () => {
    it('should extract ATX style H1', () => {
        const content = '# Hello World\n\nSome content';
        expect(extractHeading(content)).toBe('Hello World');
    });

    it('should extract first H1 from multiple headings', () => {
        const content = '# First\n## Second\n# Third';
        expect(extractHeading(content)).toBe('First');
    });

    it('should skip frontmatter', () => {
        const content = '---\ntitle: Meta\n---\n\n# Actual Heading';
        // Note: current implementation doesn't skip frontmatter, it will return null
        // because the first match is actually the frontmatter delimiter
        const result = extractHeading(content);
        // The regex looks for ^#\s+ which won't match ---
        expect(result).toBe('Actual Heading');
    });

    it('should return null for content without H1', () => {
        const content = '## Not H1\n\nSome content';
        expect(extractHeading(content)).toBeNull();
    });

    it('should return null for empty content', () => {
        expect(extractHeading('')).toBeNull();
    });

    it('should handle heading with markdown formatting', () => {
        const content = '# Hello **World**';
        const result = extractHeading(content);
        expect(result).not.toContain('*');
    });
});

describe('sanitizeFilename with heading', () => {
    it('should create valid filename from heading', () => {
        const heading = 'My Document: A Test';
        const result = sanitizeFilename(heading);
        expect(result).not.toContain(':');
        expect(result.length).toBeLessThanOrEqual(50);
    });

    it('should truncate long headings', () => {
        const heading = 'A'.repeat(100);
        const result = sanitizeFilename(heading);
        expect(result.length).toBeLessThanOrEqual(50);
    });

    it('should return Untitled for empty heading', () => {
        expect(sanitizeFilename('')).toBe('Untitled');
    });
});
