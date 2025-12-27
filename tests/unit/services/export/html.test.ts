import { generateHtmlDocument } from '@/services/export/html';
import { describe, expect, it } from 'vitest';

describe('generateHtmlDocument', () => {
    it('should generate a valid HTML document', () => {
        const content = '<h1>Hello</h1>';
        const result = generateHtmlDocument(content);

        expect(result).toContain('<!DOCTYPE html>');
        expect(result).toContain('<html');
        expect(result).toContain('</html>');
        expect(result).toContain('<head>');
        expect(result).toContain('<body>');
        expect(result).toContain(content);
    });

    it('should include title in document', () => {
        const result = generateHtmlDocument('<p>Content</p>', { title: 'My Document' });

        expect(result).toContain('<title>My Document</title>');
    });

    it('should include styles by default', () => {
        const result = generateHtmlDocument('<p>Content</p>');

        expect(result).toContain('<style>');
    });

    it('should exclude styles when disabled', () => {
        const result = generateHtmlDocument('<p>Content</p>', { includeStyles: false });

        expect(result).not.toContain('<style>');
    });

    it('should apply light theme by default', () => {
        const result = generateHtmlDocument('<p>Content</p>');

        expect(result).toContain('#111827'); // Light theme text color
    });

    it('should apply dark theme when specified', () => {
        const result = generateHtmlDocument('<p>Content</p>', { theme: 'dark' });

        expect(result).toContain('#e5e7eb'); // Dark theme text color
    });

    it('should escape special characters in title', () => {
        const result = generateHtmlDocument('<p>Content</p>', { title: '<script>alert("xss")</script>' });

        expect(result).not.toContain('<script>alert("xss")</script>');
        expect(result).toContain('&lt;script&gt;');
    });

    it('should include meta viewport for responsive design', () => {
        const result = generateHtmlDocument('<p>Content</p>');

        expect(result).toContain('viewport');
    });

    it('should include generator meta tag', () => {
        const result = generateHtmlDocument('<p>Content</p>');

        expect(result).toContain('MarkView');
    });
});
