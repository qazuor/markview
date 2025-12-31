import { BREAKPOINTS, useMobile, useTouch } from '@/hooks/useMobile';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useMobile', () => {
    let originalInnerWidth: number;
    let resizeObserverCallback: () => void;

    beforeEach(() => {
        originalInnerWidth = window.innerWidth;

        // Mock ResizeObserver
        global.ResizeObserver = vi.fn().mockImplementation((callback) => {
            resizeObserverCallback = callback;
            return {
                observe: vi.fn(),
                disconnect: vi.fn(),
                unobserve: vi.fn()
            };
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth
        });
    });

    describe('BREAKPOINTS', () => {
        it('should have correct breakpoint values', () => {
            expect(BREAKPOINTS.sm).toBe(640);
            expect(BREAKPOINTS.md).toBe(768);
            expect(BREAKPOINTS.lg).toBe(1024);
            expect(BREAKPOINTS.xl).toBe(1280);
            expect(BREAKPOINTS['2xl']).toBe(1536);
        });
    });

    describe('useMobile hook', () => {
        it('should return isMobile true when below breakpoint', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 500
            });

            const { result } = renderHook(() => useMobile());

            expect(result.current.isMobile).toBe(true);
        });

        it('should return isMobile false when above breakpoint', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1024
            });

            const { result } = renderHook(() => useMobile());

            expect(result.current.isMobile).toBe(false);
        });

        it('should return current viewport width', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 800
            });

            const { result } = renderHook(() => useMobile());

            expect(result.current.viewportWidth).toBe(800);
        });

        it('should use custom breakpoint', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 700
            });

            const { result } = renderHook(() => useMobile('lg'));

            expect(result.current.isMobile).toBe(true);
        });

        it('should update on resize', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1024
            });

            const { result } = renderHook(() => useMobile());

            expect(result.current.isMobile).toBe(false);

            // Simulate resize
            act(() => {
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: 500
                });
                resizeObserverCallback();
            });

            expect(result.current.isMobile).toBe(true);
            expect(result.current.viewportWidth).toBe(500);
        });

        it('should update on resize event', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1024
            });

            const { result } = renderHook(() => useMobile());

            expect(result.current.isMobile).toBe(false);

            act(() => {
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: 500
                });
                window.dispatchEvent(new Event('resize'));
            });

            expect(result.current.isMobile).toBe(true);
        });

        it('should clean up listeners on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

            const { unmount } = renderHook(() => useMobile());
            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
            removeEventListenerSpy.mockRestore();
        });
    });
});

describe('useTouch', () => {
    let originalOntouchstart: typeof window.ontouchstart;
    let originalMaxTouchPoints: number;

    beforeEach(() => {
        originalOntouchstart = window.ontouchstart;
        originalMaxTouchPoints = navigator.maxTouchPoints;
    });

    afterEach(() => {
        window.ontouchstart = originalOntouchstart;
        Object.defineProperty(navigator, 'maxTouchPoints', {
            writable: true,
            configurable: true,
            value: originalMaxTouchPoints
        });
    });

    it('should return true when touch is supported via ontouchstart', () => {
        window.ontouchstart = () => {};

        const { result } = renderHook(() => useTouch());

        expect(result.current).toBe(true);
    });

    it('should return true when maxTouchPoints > 0', () => {
        // biome-ignore lint/performance/noDelete: Required for test to properly check 'in' operator
        delete (window as { ontouchstart?: unknown }).ontouchstart;
        Object.defineProperty(navigator, 'maxTouchPoints', {
            writable: true,
            configurable: true,
            value: 5
        });

        const { result } = renderHook(() => useTouch());

        expect(result.current).toBe(true);
    });

    it('should return false when no touch support', () => {
        // Remove ontouchstart property entirely (not just set to undefined)
        const descriptor = Object.getOwnPropertyDescriptor(window, 'ontouchstart');
        // biome-ignore lint/performance/noDelete: Required for test to properly check 'in' operator
        delete (window as { ontouchstart?: unknown }).ontouchstart;

        Object.defineProperty(navigator, 'maxTouchPoints', {
            writable: true,
            configurable: true,
            value: 0
        });

        const { result } = renderHook(() => useTouch());

        expect(result.current).toBe(false);

        // Restore original descriptor if it existed
        if (descriptor) {
            Object.defineProperty(window, 'ontouchstart', descriptor);
        }
    });
});
