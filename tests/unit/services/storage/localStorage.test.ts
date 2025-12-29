import {
    clearAppStorage,
    getItem,
    getKeysByPrefix,
    isStorageAvailable,
    removeByPrefix,
    removeItem,
    setItem
} from '@/services/storage/localStorage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('localStorage service', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('isStorageAvailable', () => {
        it('should return true when localStorage is available', () => {
            expect(isStorageAvailable()).toBe(true);
        });

        it('should return false when localStorage throws', () => {
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Storage error');
            });

            expect(isStorageAvailable()).toBe(false);

            setItemSpy.mockRestore();
        });
    });

    describe('getItem', () => {
        it('should get existing item', () => {
            localStorage.setItem('test-key', JSON.stringify({ value: 42 }));

            const result = getItem<{ value: number }>('test-key');

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ value: 42 });
        });

        it('should return undefined for non-existent item', () => {
            const result = getItem<string>('non-existent');

            expect(result.success).toBe(true);
            expect(result.data).toBeUndefined();
        });

        it('should handle parse errors gracefully', () => {
            localStorage.setItem('bad-json', 'invalid json{');

            const result = getItem<unknown>('bad-json');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should work with string values', () => {
            localStorage.setItem('string-key', JSON.stringify('hello'));

            const result = getItem<string>('string-key');

            expect(result.success).toBe(true);
            expect(result.data).toBe('hello');
        });

        it('should work with number values', () => {
            localStorage.setItem('number-key', JSON.stringify(123));

            const result = getItem<number>('number-key');

            expect(result.success).toBe(true);
            expect(result.data).toBe(123);
        });

        it('should work with boolean values', () => {
            localStorage.setItem('bool-key', JSON.stringify(true));

            const result = getItem<boolean>('bool-key');

            expect(result.success).toBe(true);
            expect(result.data).toBe(true);
        });

        it('should work with array values', () => {
            const arr = [1, 2, 3];
            localStorage.setItem('array-key', JSON.stringify(arr));

            const result = getItem<number[]>('array-key');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(arr);
        });

        it('should work with object values', () => {
            const obj = { name: 'test', count: 42 };
            localStorage.setItem('object-key', JSON.stringify(obj));

            const result = getItem<typeof obj>('object-key');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(obj);
        });
    });

    describe('setItem', () => {
        it('should set string value', () => {
            const result = setItem('test-key', 'test-value');

            expect(result.success).toBe(true);
            expect(localStorage.getItem('test-key')).toBe(JSON.stringify('test-value'));
        });

        it('should set number value', () => {
            const result = setItem('num-key', 42);

            expect(result.success).toBe(true);
            expect(localStorage.getItem('num-key')).toBe('42');
        });

        it('should set object value', () => {
            const obj = { name: 'test', value: 123 };
            const result = setItem('obj-key', obj);

            expect(result.success).toBe(true);
            expect(JSON.parse(localStorage.getItem('obj-key') ?? '{}')).toEqual(obj);
        });

        it('should set array value', () => {
            const arr = [1, 2, 3];
            const result = setItem('arr-key', arr);

            expect(result.success).toBe(true);
            expect(JSON.parse(localStorage.getItem('arr-key') ?? '[]')).toEqual(arr);
        });

        it('should overwrite existing value', () => {
            setItem('key', 'old-value');
            const result = setItem('key', 'new-value');

            expect(result.success).toBe(true);
            expect(localStorage.getItem('key')).toBe(JSON.stringify('new-value'));
        });

        it('should handle quota exceeded error', () => {
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                const error = new DOMException('Quota exceeded', 'QuotaExceededError');
                throw error;
            });

            const result = setItem('key', 'value');

            expect(result.success).toBe(false);
            expect(result.error).toContain('quota');

            setItemSpy.mockRestore();
        });

        it('should handle other storage errors', () => {
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Generic storage error');
            });

            const result = setItem('key', 'value');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            setItemSpy.mockRestore();
        });
    });

    describe('removeItem', () => {
        it('should remove existing item', () => {
            localStorage.setItem('test-key', 'value');

            const result = removeItem('test-key');

            expect(result.success).toBe(true);
            expect(localStorage.getItem('test-key')).toBeNull();
        });

        it('should handle removing non-existent item', () => {
            const result = removeItem('non-existent');

            expect(result.success).toBe(true);
        });

        it('should handle remove errors', () => {
            const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('Remove error');
            });

            const result = removeItem('key');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            removeItemSpy.mockRestore();
        });
    });

    describe('getKeysByPrefix', () => {
        beforeEach(() => {
            localStorage.setItem('app:doc1', 'value1');
            localStorage.setItem('app:doc2', 'value2');
            localStorage.setItem('app:setting', 'value3');
            localStorage.setItem('other:item', 'value4');
        });

        it('should get all keys with prefix', () => {
            const keys = getKeysByPrefix('app:');

            expect(keys).toHaveLength(3);
            expect(keys).toContain('app:doc1');
            expect(keys).toContain('app:doc2');
            expect(keys).toContain('app:setting');
        });

        it('should return empty array for non-matching prefix', () => {
            const keys = getKeysByPrefix('nonexistent:');

            expect(keys).toEqual([]);
        });

        it('should handle empty prefix', () => {
            const keys = getKeysByPrefix('');

            expect(keys.length).toBeGreaterThanOrEqual(4);
        });

        it('should get keys with specific prefix pattern', () => {
            const keys = getKeysByPrefix('app:doc');

            expect(keys).toHaveLength(2);
            expect(keys).toContain('app:doc1');
            expect(keys).toContain('app:doc2');
        });
    });

    describe('removeByPrefix', () => {
        beforeEach(() => {
            localStorage.setItem('app:doc1', 'value1');
            localStorage.setItem('app:doc2', 'value2');
            localStorage.setItem('app:setting', 'value3');
            localStorage.setItem('other:item', 'value4');
        });

        it('should remove all items with prefix', () => {
            const result = removeByPrefix('app:');

            expect(result.success).toBe(true);
            expect(result.data).toBe(3);
            expect(localStorage.getItem('app:doc1')).toBeNull();
            expect(localStorage.getItem('app:doc2')).toBeNull();
            expect(localStorage.getItem('app:setting')).toBeNull();
            expect(localStorage.getItem('other:item')).toBe('value4');
        });

        it('should return 0 for non-matching prefix', () => {
            const result = removeByPrefix('nonexistent:');

            expect(result.success).toBe(true);
            expect(result.data).toBe(0);
        });

        it('should handle remove errors', () => {
            const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('Remove error');
            });

            const result = removeByPrefix('app:');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            removeItemSpy.mockRestore();
        });
    });

    describe('clearAppStorage', () => {
        beforeEach(() => {
            localStorage.setItem('markview:doc1', 'value1');
            localStorage.setItem('markview:doc2', 'value2');
            localStorage.setItem('markview:settings', 'value3');
            localStorage.setItem('other-app:data', 'value4');
        });

        it('should clear all app-related storage', () => {
            const result = clearAppStorage('markview:');

            expect(result.success).toBe(true);
            expect(localStorage.getItem('markview:doc1')).toBeNull();
            expect(localStorage.getItem('markview:doc2')).toBeNull();
            expect(localStorage.getItem('markview:settings')).toBeNull();
            expect(localStorage.getItem('other-app:data')).toBe('value4');
        });

        it('should handle empty storage', () => {
            localStorage.clear();

            const result = clearAppStorage('markview:');

            expect(result.success).toBe(true);
        });

        it('should handle clear errors', () => {
            const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('Clear error');
            });

            const result = clearAppStorage('markview:');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            removeItemSpy.mockRestore();
        });
    });
});
