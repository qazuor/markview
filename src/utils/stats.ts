import type { DocumentStats } from '@/types';

/**
 * Calculate document statistics
 */
export function calculateStats(content: string): DocumentStats {
    const text = content.trim();

    if (text.length === 0) {
        return {
            words: 0,
            characters: 0,
            charactersNoSpaces: 0,
            lines: 0,
            readingTime: 0
        };
    }

    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    const readingTime = Math.ceil(words / 200); // ~200 words per minute

    return {
        words,
        characters,
        charactersNoSpaces,
        lines,
        readingTime
    };
}
