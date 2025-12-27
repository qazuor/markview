import { ensureExtension, sanitizeFilename } from '@/services/export/download';
import { describe, expect, it } from 'vitest';

describe('sanitizeFilename', () => {
    it('should remove invalid characters', () => {
        const result = sanitizeFilename('file<>:"/\\|?*.txt');

        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).not.toContain(':');
        expect(result).not.toContain('"');
        expect(result).not.toContain('/');
        expect(result).not.toContain('\\');
        expect(result).not.toContain('|');
        expect(result).not.toContain('?');
        expect(result).not.toContain('*');
    });

    it('should replace spaces with dashes', () => {
        const result = sanitizeFilename('my file name');

        expect(result).toBe('my-file-name');
    });

    it('should handle multiple spaces', () => {
        const result = sanitizeFilename('my    file    name');

        expect(result).toBe('my-file-name');
    });

    it('should handle leading and trailing spaces', () => {
        // Note: spaces are replaced with dashes, then trimmed
        const result = sanitizeFilename('  filename  ');

        // Leading/trailing dashes are preserved after space replacement
        expect(result).toBe('-filename-');
    });

    it('should truncate long filenames', () => {
        const longName = 'a'.repeat(300);
        const result = sanitizeFilename(longName);

        expect(result.length).toBeLessThanOrEqual(200);
    });

    it('should handle empty string', () => {
        const result = sanitizeFilename('');

        expect(result).toBe('');
    });

    it('should preserve valid characters', () => {
        const result = sanitizeFilename('valid-filename_123.txt');

        expect(result).toBe('valid-filename_123.txt');
    });
});

describe('ensureExtension', () => {
    it('should add extension if missing', () => {
        const result = ensureExtension('filename', '.md');

        expect(result).toBe('filename.md');
    });

    it('should not duplicate extension', () => {
        const result = ensureExtension('filename.md', '.md');

        expect(result).toBe('filename.md');
    });

    it('should handle extension without dot', () => {
        const result = ensureExtension('filename', 'md');

        expect(result).toBe('filename.md');
    });

    it('should be case insensitive', () => {
        const result = ensureExtension('filename.MD', '.md');

        expect(result).toBe('filename.MD');
    });

    it('should handle different extensions', () => {
        const result = ensureExtension('filename.md', '.html');

        expect(result).toBe('filename.md.html');
    });
});
