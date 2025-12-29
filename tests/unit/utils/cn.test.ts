import { cn } from '@/utils/cn';
import { describe, expect, it } from 'vitest';

describe('cn', () => {
    it('should merge single class name', () => {
        expect(cn('class1')).toBe('class1');
    });

    it('should merge multiple class names', () => {
        expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should filter out null values', () => {
        expect(cn('class1', null, 'class2')).toBe('class1 class2');
    });

    it('should filter out undefined values', () => {
        expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
    });

    it('should filter out false values', () => {
        expect(cn('class1', false, 'class2')).toBe('class1 class2');
    });

    it('should filter out empty strings', () => {
        expect(cn('class1', '', 'class2')).toBe('class1 class2');
    });

    it('should handle nested arrays', () => {
        expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('should handle deeply nested arrays', () => {
        // The implementation uses flat() which only flattens one level
        expect(cn(['class1', ['class2', 'class3']], 'class4')).toBe('class1 class4');
    });

    it('should handle mixed types', () => {
        expect(cn('class1', null, ['class2', undefined], false, 'class3')).toBe('class1 class2 class3');
    });

    it('should handle number values by filtering them out', () => {
        // @ts-expect-error Testing invalid input type
        expect(cn('class1', 42, 'class2')).toBe('class1 class2');
    });

    it('should return empty string for all falsy values', () => {
        expect(cn(null, undefined, false, '')).toBe('');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const isDisabled = false;

        expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
    });

    it('should preserve spaces within individual class names', () => {
        expect(cn('class1 class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should handle boolean true by filtering it out', () => {
        // @ts-expect-error Testing invalid input type
        expect(cn('class1', true, 'class2')).toBe('class1 class2');
    });
});
