import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));

        expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 500 }
        });

        expect(result.current).toBe('initial');

        rerender({ value: 'updated', delay: 500 });

        // Value should not change immediately
        expect(result.current).toBe('initial');

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('updated');
    });

    it('should reset timer on rapid changes', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 'initial' }
        });

        rerender({ value: 'change1' });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        rerender({ value: 'change2' });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Should still have initial value
        expect(result.current).toBe('initial');

        // Complete the debounce
        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current).toBe('change2');
    });

    it('should handle different delays', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 1000 }
        });

        rerender({ value: 'updated', delay: 1000 });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('updated');
    });

    it('should work with different value types', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 0 }
        });

        rerender({ value: 42 });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe(42);
    });

    it('should cleanup timer on unmount', () => {
        const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 'initial' }
        });

        rerender({ value: 'updated' });
        unmount();

        // Should not throw
        act(() => {
            vi.advanceTimersByTime(500);
        });
    });
});

describe('useDebouncedCallback', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should debounce callback execution', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 500));

        act(() => {
            result.current('arg1');
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('arg1');
    });

    it('should reset timer on rapid calls', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 500));

        act(() => {
            result.current('call1');
            vi.advanceTimersByTime(300);
            result.current('call2');
            vi.advanceTimersByTime(300);
            result.current('call3');
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('call3');
    });

    it('should handle multiple arguments', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 500));

        act(() => {
            result.current('arg1', 'arg2', 42);
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 42);
    });

    it('should use latest callback', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 500), {
            initialProps: { cb: callback1 }
        });

        act(() => {
            result.current('test');
        });

        rerender({ cb: callback2 });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledWith('test');
    });

    it('should cleanup timer on unmount', () => {
        const callback = vi.fn();
        const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 500));

        act(() => {
            result.current('test');
        });

        unmount();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle delay changes', () => {
        const callback = vi.fn();
        const { result, rerender } = renderHook(({ delay }) => useDebouncedCallback(callback, delay), {
            initialProps: { delay: 500 }
        });

        act(() => {
            result.current('test1');
        });

        rerender({ delay: 1000 });

        act(() => {
            result.current('test2');
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledWith('test2');
    });
});
