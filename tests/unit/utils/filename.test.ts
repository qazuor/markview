import { extractHeading, sanitizeFilename } from '@/utils/filename';
import { describe, expect, it } from 'vitest';

describe('extractHeading', () => {
    it('should extract H1 heading', () => {
        const result = extractHeading('# My Document');

        expect(result).toBe('My Document');
    });

    it('should extract first H1 from multiple headings', () => {
        const result = extractHeading('# First\n## Second\n# Third');

        expect(result).toBe('First');
    });

    it('should return null for no heading', () => {
        const result = extractHeading('No heading here');

        expect(result).toBeNull();
    });

    it('should clean markdown characters from heading', () => {
        const result = extractHeading('# **Bold** and *italic*');

        expect(result).toBe('Bold and italic');
    });
});

describe('sanitizeFilename', () => {
    it('should remove invalid characters', () => {
        const result = sanitizeFilename('file:name?test');

        expect(result).toBe('filenametest');
    });

    it('should normalize whitespace', () => {
        const result = sanitizeFilename('file   name');

        expect(result).toBe('file name');
    });

    it('should trim whitespace', () => {
        const result = sanitizeFilename('  filename  ');

        expect(result).toBe('filename');
    });

    it('should limit length to 100 characters', () => {
        const longName = 'a'.repeat(150);
        const result = sanitizeFilename(longName);

        expect(result.length).toBe(100);
    });
});
