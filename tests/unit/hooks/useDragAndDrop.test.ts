import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useDragAndDrop', () => {
    const createDragEvent = (type: string, hasFiles = true): DragEvent => {
        const event = new Event(type, { bubbles: true }) as DragEvent;
        Object.defineProperty(event, 'dataTransfer', {
            value: {
                types: hasFiles ? ['Files'] : [],
                files: hasFiles ? ([{ name: 'test.md' }] as unknown as FileList) : ([] as unknown as FileList)
            }
        });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });
        return event;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return isDragging as false initially', () => {
        const onDrop = vi.fn();

        const { result } = renderHook(() => useDragAndDrop({ onDrop }));

        expect(result.current.isDragging).toBe(false);
    });

    it('should set isDragging to true on dragenter with files', () => {
        const onDrop = vi.fn();

        const { result } = renderHook(() => useDragAndDrop({ onDrop }));

        act(() => {
            document.dispatchEvent(createDragEvent('dragenter'));
        });

        expect(result.current.isDragging).toBe(true);
    });

    it('should not set isDragging when disabled', () => {
        const onDrop = vi.fn();

        const { result } = renderHook(() => useDragAndDrop({ onDrop, enabled: false }));

        act(() => {
            document.dispatchEvent(createDragEvent('dragenter'));
        });

        expect(result.current.isDragging).toBe(false);
    });

    it('should call onDrop when files are dropped', () => {
        const onDrop = vi.fn();

        renderHook(() => useDragAndDrop({ onDrop }));

        const dropEvent = createDragEvent('drop');
        Object.defineProperty(dropEvent.dataTransfer, 'files', {
            value: { length: 1, 0: { name: 'test.md' } }
        });

        act(() => {
            document.dispatchEvent(dropEvent);
        });

        expect(onDrop).toHaveBeenCalled();
    });

    it('should not call onDrop when disabled', () => {
        const onDrop = vi.fn();

        renderHook(() => useDragAndDrop({ onDrop, enabled: false }));

        act(() => {
            document.dispatchEvent(createDragEvent('drop'));
        });

        expect(onDrop).not.toHaveBeenCalled();
    });

    it('should set isDragging to false after drop', () => {
        const onDrop = vi.fn();

        const { result } = renderHook(() => useDragAndDrop({ onDrop }));

        act(() => {
            document.dispatchEvent(createDragEvent('dragenter'));
        });

        expect(result.current.isDragging).toBe(true);

        const dropEvent = createDragEvent('drop');
        Object.defineProperty(dropEvent.dataTransfer, 'files', {
            value: { length: 1, 0: { name: 'test.md' } }
        });

        act(() => {
            document.dispatchEvent(dropEvent);
        });

        expect(result.current.isDragging).toBe(false);
    });

    it('should handle dragover event', () => {
        const onDrop = vi.fn();

        renderHook(() => useDragAndDrop({ onDrop }));

        const event = createDragEvent('dragover');

        act(() => {
            document.dispatchEvent(event);
        });

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should set isDragging to false after dragleave when counter reaches 0', () => {
        const onDrop = vi.fn();

        const { result } = renderHook(() => useDragAndDrop({ onDrop }));

        // Enter drag
        act(() => {
            document.dispatchEvent(createDragEvent('dragenter'));
        });

        expect(result.current.isDragging).toBe(true);

        // Leave drag
        act(() => {
            document.dispatchEvent(createDragEvent('dragleave'));
        });

        expect(result.current.isDragging).toBe(false);
    });

    it('should handle nested drag events correctly', () => {
        const onDrop = vi.fn();

        const { result } = renderHook(() => useDragAndDrop({ onDrop }));

        // Enter outer element
        act(() => {
            document.dispatchEvent(createDragEvent('dragenter'));
        });

        // Enter inner element (counter = 2)
        act(() => {
            document.dispatchEvent(createDragEvent('dragenter'));
        });

        expect(result.current.isDragging).toBe(true);

        // Leave inner element (counter = 1, still dragging)
        act(() => {
            document.dispatchEvent(createDragEvent('dragleave'));
        });

        expect(result.current.isDragging).toBe(true);

        // Leave outer element (counter = 0, stop dragging)
        act(() => {
            document.dispatchEvent(createDragEvent('dragleave'));
        });

        expect(result.current.isDragging).toBe(false);
    });

    it('should not set isDragging when no files in dataTransfer', () => {
        const onDrop = vi.fn();

        const { result } = renderHook(() => useDragAndDrop({ onDrop }));

        act(() => {
            document.dispatchEvent(createDragEvent('dragenter', false));
        });

        expect(result.current.isDragging).toBe(false);
    });

    it('should remove event listeners on unmount', () => {
        const onDrop = vi.fn();
        const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

        const { unmount } = renderHook(() => useDragAndDrop({ onDrop }));

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('dragenter', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('dragleave', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function));

        removeEventListenerSpy.mockRestore();
    });

    it('should not add event listeners when disabled', () => {
        const onDrop = vi.fn();
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

        renderHook(() => useDragAndDrop({ onDrop, enabled: false }));

        // Should not be called because enabled is false
        expect(addEventListenerSpy).not.toHaveBeenCalledWith('dragenter', expect.any(Function));

        addEventListenerSpy.mockRestore();
    });

    it('should default enabled to true', () => {
        const onDrop = vi.fn();
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

        renderHook(() => useDragAndDrop({ onDrop }));

        expect(addEventListenerSpy).toHaveBeenCalledWith('dragenter', expect.any(Function));

        addEventListenerSpy.mockRestore();
    });
});
