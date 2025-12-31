import { useOnboarding } from '@/hooks/useOnboarding';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useOnboarding', () => {
    const STORAGE_KEY = 'markview:onboarding';

    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should show onboarding for first time user', () => {
            const { result } = renderHook(() => useOnboarding());

            expect(result.current.showOnboarding).toBe(true);
            expect(result.current.showTour).toBe(false);
            expect(result.current.currentTourStep).toBe(0);
        });

        it('should not show onboarding if already seen', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ hasSeenOnboarding: true, hasSeenTour: false }));

            const { result } = renderHook(() => useOnboarding());

            expect(result.current.showOnboarding).toBe(false);
        });

        it('should show onboarding if not yet seen in storage', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ hasSeenOnboarding: false, hasSeenTour: false }));

            const { result } = renderHook(() => useOnboarding());

            expect(result.current.showOnboarding).toBe(true);
        });

        it('should show onboarding on localStorage error', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('Storage error');
            });

            const { result } = renderHook(() => useOnboarding());

            expect(result.current.showOnboarding).toBe(true);
        });
    });

    describe('completeOnboarding', () => {
        it('should hide onboarding and save state', () => {
            const { result } = renderHook(() => useOnboarding());

            expect(result.current.showOnboarding).toBe(true);

            act(() => {
                result.current.completeOnboarding();
            });

            expect(result.current.showOnboarding).toBe(false);

            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            expect(stored.hasSeenOnboarding).toBe(true);
        });

        it('should start tour when requested', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.completeOnboarding(true);
            });

            expect(result.current.showOnboarding).toBe(false);
            expect(result.current.showTour).toBe(true);
            expect(result.current.currentTourStep).toBe(0);
        });

        it('should handle storage error gracefully', () => {
            const { result } = renderHook(() => useOnboarding());

            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Storage error');
            });

            act(() => {
                result.current.completeOnboarding();
            });

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('completeTour', () => {
        it('should hide tour and save state', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.startTour();
            });

            expect(result.current.showTour).toBe(true);

            act(() => {
                result.current.completeTour();
            });

            expect(result.current.showTour).toBe(false);
            expect(result.current.currentTourStep).toBe(0);

            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            expect(stored.hasSeenTour).toBe(true);
        });

        it('should handle storage error gracefully', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.startTour();
            });

            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Storage error');
            });

            act(() => {
                result.current.completeTour();
            });

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('resetOnboarding', () => {
        it('should reset all state', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.completeOnboarding(true);
                result.current.nextTourStep();
                result.current.nextTourStep();
            });

            expect(result.current.showOnboarding).toBe(false);
            expect(result.current.currentTourStep).toBe(2);

            act(() => {
                result.current.resetOnboarding();
            });

            expect(result.current.showOnboarding).toBe(true);
            expect(result.current.showTour).toBe(false);
            expect(result.current.currentTourStep).toBe(0);
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });

        it('should handle storage error gracefully', () => {
            const { result } = renderHook(() => useOnboarding());

            vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('Storage error');
            });

            act(() => {
                result.current.resetOnboarding();
            });

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('startTour', () => {
        it('should show tour and reset step', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.startTour();
            });

            expect(result.current.showTour).toBe(true);
            expect(result.current.currentTourStep).toBe(0);
        });
    });

    describe('skipTour', () => {
        it('should complete the tour', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.startTour();
            });

            expect(result.current.showTour).toBe(true);

            act(() => {
                result.current.skipTour();
            });

            expect(result.current.showTour).toBe(false);
        });
    });

    describe('tour navigation', () => {
        it('should move to next step', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.startTour();
            });

            expect(result.current.currentTourStep).toBe(0);

            act(() => {
                result.current.nextTourStep();
            });

            expect(result.current.currentTourStep).toBe(1);

            act(() => {
                result.current.nextTourStep();
            });

            expect(result.current.currentTourStep).toBe(2);
        });

        it('should move to previous step', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.startTour();
                result.current.nextTourStep();
                result.current.nextTourStep();
            });

            expect(result.current.currentTourStep).toBe(2);

            act(() => {
                result.current.previousTourStep();
            });

            expect(result.current.currentTourStep).toBe(1);
        });

        it('should not go below step 0', () => {
            const { result } = renderHook(() => useOnboarding());

            act(() => {
                result.current.startTour();
            });

            expect(result.current.currentTourStep).toBe(0);

            act(() => {
                result.current.previousTourStep();
            });

            expect(result.current.currentTourStep).toBe(0);
        });
    });
});
