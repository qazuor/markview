import { calculateStats } from '@/utils/stats';
import { describe, expect, it } from 'vitest';

describe('calculateStats', () => {
    it('should return zeros for empty content', () => {
        const stats = calculateStats('');

        expect(stats.words).toBe(0);
        expect(stats.characters).toBe(0);
        expect(stats.lines).toBe(0);
        expect(stats.readingTime).toBe(0);
    });

    it('should count words correctly', () => {
        const stats = calculateStats('Hello world this is a test');

        expect(stats.words).toBe(6);
    });

    it('should count characters correctly', () => {
        const stats = calculateStats('Hello');

        expect(stats.characters).toBe(5);
        expect(stats.charactersNoSpaces).toBe(5);
    });

    it('should count lines correctly', () => {
        const stats = calculateStats('Line 1\nLine 2\nLine 3');

        expect(stats.lines).toBe(3);
    });

    it('should calculate reading time', () => {
        // 200 words = 1 minute
        const content = Array(200).fill('word').join(' ');
        const stats = calculateStats(content);

        expect(stats.readingTime).toBe(1);
    });

    it('should handle whitespace-only content', () => {
        const stats = calculateStats('   \n\n   ');

        expect(stats.words).toBe(0);
    });
});
