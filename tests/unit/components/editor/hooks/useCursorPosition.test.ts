import { useCursorPosition } from '@/components/editor/hooks/useCursorPosition';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useCursorPosition', () => {
    describe('initial state', () => {
        it('should return initial position at line 1, column 1', () => {
            const { result } = renderHook(() => useCursorPosition());

            expect(result.current.position).toEqual({ line: 1, column: 1 });
        });

        it('should return initial selection with no selection', () => {
            const { result } = renderHook(() => useCursorPosition());

            expect(result.current.selection).toEqual({
                from: { line: 1, column: 1 },
                to: { line: 1, column: 1 },
                hasSelection: false
            });
        });

        it('should return updatePosition function', () => {
            const { result } = renderHook(() => useCursorPosition());

            expect(typeof result.current.updatePosition).toBe('function');
        });

        it('should return updateSelection function', () => {
            const { result } = renderHook(() => useCursorPosition());

            expect(typeof result.current.updateSelection).toBe('function');
        });
    });

    describe('updatePosition', () => {
        it('should update cursor position', () => {
            const { result } = renderHook(() => useCursorPosition());

            act(() => {
                result.current.updatePosition(5, 10);
            });

            expect(result.current.position).toEqual({ line: 5, column: 10 });
        });

        it('should update position multiple times', () => {
            const { result } = renderHook(() => useCursorPosition());

            act(() => {
                result.current.updatePosition(2, 3);
            });

            expect(result.current.position).toEqual({ line: 2, column: 3 });

            act(() => {
                result.current.updatePosition(10, 20);
            });

            expect(result.current.position).toEqual({ line: 10, column: 20 });
        });

        it('should handle large line and column numbers', () => {
            const { result } = renderHook(() => useCursorPosition());

            act(() => {
                result.current.updatePosition(1000, 500);
            });

            expect(result.current.position).toEqual({ line: 1000, column: 500 });
        });
    });

    describe('updateSelection', () => {
        it('should update selection with hasSelection true when different', () => {
            const { result } = renderHook(() => useCursorPosition());

            act(() => {
                result.current.updateSelection(1, 1, 5, 10);
            });

            expect(result.current.selection).toEqual({
                from: { line: 1, column: 1 },
                to: { line: 5, column: 10 },
                hasSelection: true
            });
        });

        it('should set hasSelection false when from equals to', () => {
            const { result } = renderHook(() => useCursorPosition());

            act(() => {
                result.current.updateSelection(3, 7, 3, 7);
            });

            expect(result.current.selection).toEqual({
                from: { line: 3, column: 7 },
                to: { line: 3, column: 7 },
                hasSelection: false
            });
        });

        it('should detect selection when only line differs', () => {
            const { result } = renderHook(() => useCursorPosition());

            act(() => {
                result.current.updateSelection(1, 5, 3, 5);
            });

            expect(result.current.selection.hasSelection).toBe(true);
        });

        it('should detect selection when only column differs', () => {
            const { result } = renderHook(() => useCursorPosition());

            act(() => {
                result.current.updateSelection(2, 1, 2, 10);
            });

            expect(result.current.selection.hasSelection).toBe(true);
        });

        it('should handle reverse selection (to before from)', () => {
            const { result } = renderHook(() => useCursorPosition());

            act(() => {
                result.current.updateSelection(5, 10, 1, 1);
            });

            expect(result.current.selection).toEqual({
                from: { line: 5, column: 10 },
                to: { line: 1, column: 1 },
                hasSelection: true
            });
        });
    });

    describe('callback stability', () => {
        it('should maintain stable updatePosition reference', () => {
            const { result, rerender } = renderHook(() => useCursorPosition());

            const firstUpdatePosition = result.current.updatePosition;
            rerender();

            expect(result.current.updatePosition).toBe(firstUpdatePosition);
        });

        it('should maintain stable updateSelection reference', () => {
            const { result, rerender } = renderHook(() => useCursorPosition());

            const firstUpdateSelection = result.current.updateSelection;
            rerender();

            expect(result.current.updateSelection).toBe(firstUpdateSelection);
        });
    });
});
