import { useLocalStorage } from '@/hooks/useLocalStorage';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should initialize with initial value when storage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        expect(result.current[0]).toBe('initial');
    });

    it('should initialize with stored value when available', () => {
        localStorage.setItem('test-key', JSON.stringify('stored'));

        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        expect(result.current[0]).toBe('stored');
    });

    it('should update localStorage when value changes', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('updated');
        });

        expect(result.current[0]).toBe('updated');
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
    });

    it('should handle function updater', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 0));

        act(() => {
            result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(1);

        act(() => {
            result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(2);
    });

    it('should work with object values', () => {
        const initialObject = { count: 0, name: 'test' };
        const { result } = renderHook(() => useLocalStorage('test-key', initialObject));

        expect(result.current[0]).toEqual(initialObject);

        act(() => {
            result.current[1]({ count: 1, name: 'updated' });
        });

        expect(result.current[0]).toEqual({ count: 1, name: 'updated' });
        expect(JSON.parse(localStorage.getItem('test-key') ?? '{}')).toEqual({ count: 1, name: 'updated' });
    });

    it('should work with array values', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]));

        expect(result.current[0]).toEqual([1, 2, 3]);

        act(() => {
            result.current[1]([4, 5, 6]);
        });

        expect(result.current[0]).toEqual([4, 5, 6]);
    });

    it('should handle invalid JSON gracefully', () => {
        localStorage.setItem('test-key', 'invalid json{');

        const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

        expect(result.current[0]).toBe('fallback');
    });

    it('should handle storage errors gracefully', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('Storage error');
        });

        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('updated');
        });

        expect(consoleErrorSpy).toHaveBeenCalled();

        setItemSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should sync across storage events', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        // Simulate storage event from another tab
        act(() => {
            const event = new StorageEvent('storage', {
                key: 'test-key',
                newValue: JSON.stringify('from-another-tab')
            });
            window.dispatchEvent(event);
        });

        expect(result.current[0]).toBe('from-another-tab');
    });

    it('should ignore storage events for different keys', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('updated');
        });

        act(() => {
            const event = new StorageEvent('storage', {
                key: 'different-key',
                newValue: JSON.stringify('other-value')
            });
            window.dispatchEvent(event);
        });

        expect(result.current[0]).toBe('updated');
    });

    it('should handle storage event with null newValue', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('updated');
        });

        act(() => {
            const event = new StorageEvent('storage', {
                key: 'test-key',
                newValue: null
            });
            window.dispatchEvent(event);
        });

        // Should keep current value when newValue is null
        expect(result.current[0]).toBe('updated');
    });

    it('should cleanup event listener on unmount', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

        const { unmount } = renderHook(() => useLocalStorage('test-key', 'initial'));

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

        removeEventListenerSpy.mockRestore();
    });

    it('should work with boolean values', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', true));

        expect(result.current[0]).toBe(true);

        act(() => {
            result.current[1](false);
        });

        expect(result.current[0]).toBe(false);
    });

    it('should work with number values', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 42));

        expect(result.current[0]).toBe(42);

        act(() => {
            result.current[1](100);
        });

        expect(result.current[0]).toBe(100);
    });

    it('should work with null values', () => {
        const { result } = renderHook(() => useLocalStorage<string | null>('test-key', null));

        expect(result.current[0]).toBeNull();

        act(() => {
            result.current[1]('not-null');
        });

        expect(result.current[0]).toBe('not-null');
    });
});
