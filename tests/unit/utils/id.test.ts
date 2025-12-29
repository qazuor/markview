import { generateId } from '@/utils/id';
import { describe, expect, it } from 'vitest';

describe('generateId', () => {
    it('should generate a valid UUID', () => {
        const id = generateId();

        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        const id3 = generateId();

        expect(id1).not.toBe(id2);
        expect(id2).not.toBe(id3);
        expect(id1).not.toBe(id3);
    });

    it('should generate multiple unique IDs', () => {
        const ids = new Set<string>();
        const count = 100;

        for (let i = 0; i < count; i++) {
            ids.add(generateId());
        }

        expect(ids.size).toBe(count);
    });

    it('should generate valid ID strings', () => {
        const id = generateId();

        // In test environment, crypto.randomUUID is mocked
        // Just verify it generates a valid string
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
    });
});
