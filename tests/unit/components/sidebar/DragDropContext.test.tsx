import { DragDropProvider, useDragDrop, useDraggable, useDroppable } from '@/components/sidebar/DragDropContext';
import type { DragItem } from '@/components/sidebar/DragDropContext';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

describe('DragDropContext', () => {
    const mockDragItem: DragItem = {
        type: 'document',
        id: 'doc-1',
        name: 'Test Document',
        currentFolderId: null
    };

    describe('DragDropProvider', () => {
        it('should render children', () => {
            render(
                <DragDropProvider>
                    <div data-testid="child">Child Content</div>
                </DragDropProvider>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
        });
    });

    describe('useDragDrop', () => {
        it('should throw error when used outside provider', () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                renderHook(() => useDragDrop());
            }).toThrow('useDragDrop must be used within a DragDropProvider');

            consoleError.mockRestore();
        });

        it('should provide initial state', () => {
            const { result } = renderHook(() => useDragDrop(), {
                wrapper: DragDropProvider
            });

            expect(result.current.dragItem).toBeNull();
            expect(result.current.dropTargetId).toBeNull();
            expect(result.current.isDragging).toBe(false);
        });

        it('should start drag', () => {
            const { result } = renderHook(() => useDragDrop(), {
                wrapper: DragDropProvider
            });

            act(() => {
                result.current.startDrag(mockDragItem);
            });

            expect(result.current.dragItem).toEqual(mockDragItem);
            expect(result.current.isDragging).toBe(true);
        });

        it('should end drag', () => {
            const { result } = renderHook(() => useDragDrop(), {
                wrapper: DragDropProvider
            });

            act(() => {
                result.current.startDrag(mockDragItem);
            });

            expect(result.current.isDragging).toBe(true);

            act(() => {
                result.current.endDrag();
            });

            expect(result.current.dragItem).toBeNull();
            expect(result.current.isDragging).toBe(false);
            expect(result.current.dropTargetId).toBeNull();
        });

        it('should set drop target', () => {
            const { result } = renderHook(() => useDragDrop(), {
                wrapper: DragDropProvider
            });

            act(() => {
                result.current.setDropTarget('folder-1');
            });

            expect(result.current.dropTargetId).toBe('folder-1');
        });

        it('should clear drop target', () => {
            const { result } = renderHook(() => useDragDrop(), {
                wrapper: DragDropProvider
            });

            act(() => {
                result.current.setDropTarget('folder-1');
                result.current.setDropTarget(null);
            });

            expect(result.current.dropTargetId).toBeNull();
        });
    });

    describe('useDraggable', () => {
        function DraggableComponent({ item }: { item: DragItem }) {
            const dragProps = useDraggable(item);
            return <div data-testid="draggable" {...dragProps} />;
        }

        it('should return draggable props', () => {
            render(
                <DragDropProvider>
                    <DraggableComponent item={mockDragItem} />
                </DragDropProvider>
            );

            const element = screen.getByTestId('draggable');
            expect(element).toHaveAttribute('draggable', 'true');
        });

        it('should start drag on dragStart', () => {
            function TestComponent() {
                const dragProps = useDraggable(mockDragItem);
                const { isDragging } = useDragDrop();
                return (
                    <div>
                        <div data-testid="draggable" {...dragProps} />
                        <span data-testid="status">{isDragging ? 'dragging' : 'idle'}</span>
                    </div>
                );
            }

            render(
                <DragDropProvider>
                    <TestComponent />
                </DragDropProvider>
            );

            const element = screen.getByTestId('draggable');

            // Create a mock dataTransfer
            const dataTransfer = {
                effectAllowed: '',
                setData: vi.fn()
            };

            fireEvent.dragStart(element, { dataTransfer });

            expect(screen.getByTestId('status').textContent).toBe('dragging');
        });

        it('should end drag on dragEnd', () => {
            function TestComponent() {
                const dragProps = useDraggable(mockDragItem);
                const { isDragging, startDrag } = useDragDrop();
                return (
                    <div>
                        <div data-testid="draggable" {...dragProps} />
                        <span data-testid="status">{isDragging ? 'dragging' : 'idle'}</span>
                        <button type="button" data-testid="start" onClick={() => startDrag(mockDragItem)}>
                            Start
                        </button>
                    </div>
                );
            }

            render(
                <DragDropProvider>
                    <TestComponent />
                </DragDropProvider>
            );

            // Start drag
            fireEvent.click(screen.getByTestId('start'));
            expect(screen.getByTestId('status').textContent).toBe('dragging');

            // End drag
            fireEvent.dragEnd(screen.getByTestId('draggable'));
            expect(screen.getByTestId('status').textContent).toBe('idle');
        });
    });

    describe('useDroppable', () => {
        const mockOnDrop = vi.fn();

        function DroppableComponent({
            targetId,
            onDrop,
            canDrop
        }: {
            targetId: string;
            onDrop: (item: DragItem, id: string | null) => void;
            canDrop?: (item: DragItem) => boolean;
        }) {
            const { isOver, ...dropProps } = useDroppable(targetId, onDrop, canDrop);
            return <div data-testid="droppable" data-is-over={isOver} {...dropProps} />;
        }

        beforeEach(() => {
            mockOnDrop.mockClear();
        });

        it('should return isOver as false initially', () => {
            render(
                <DragDropProvider>
                    <DroppableComponent targetId="folder-1" onDrop={mockOnDrop} />
                </DragDropProvider>
            );

            const element = screen.getByTestId('droppable');
            expect(element).toHaveAttribute('data-is-over', 'false');
        });

        it('should handle dragOver event', () => {
            function TestComponent() {
                const dragProps = useDraggable(mockDragItem);
                const { startDrag } = useDragDrop();
                const { isOver, ...dropProps } = useDroppable('folder-1', mockOnDrop);

                return (
                    <div>
                        <div data-testid="draggable" {...dragProps} />
                        <div data-testid="droppable" data-is-over={isOver} {...dropProps} />
                        <button type="button" data-testid="start" onClick={() => startDrag(mockDragItem)}>
                            Start
                        </button>
                    </div>
                );
            }

            render(
                <DragDropProvider>
                    <TestComponent />
                </DragDropProvider>
            );

            // Start drag
            fireEvent.click(screen.getByTestId('start'));

            // Drag over droppable
            const dataTransfer = { dropEffect: '' };
            fireEvent.dragOver(screen.getByTestId('droppable'), { dataTransfer });

            expect(screen.getByTestId('droppable')).toHaveAttribute('data-is-over', 'true');
        });

        it('should handle drop event', () => {
            function TestComponent() {
                const dragProps = useDraggable(mockDragItem);
                const { startDrag } = useDragDrop();
                const dropProps = useDroppable('folder-1', mockOnDrop);

                return (
                    <div>
                        <div data-testid="draggable" {...dragProps} />
                        <div data-testid="droppable" {...dropProps} />
                        <button type="button" data-testid="start" onClick={() => startDrag(mockDragItem)}>
                            Start
                        </button>
                    </div>
                );
            }

            render(
                <DragDropProvider>
                    <TestComponent />
                </DragDropProvider>
            );

            // Start drag
            fireEvent.click(screen.getByTestId('start'));

            // Drop
            fireEvent.drop(screen.getByTestId('droppable'));

            expect(mockOnDrop).toHaveBeenCalledWith(mockDragItem, 'folder-1');
        });

        it('should respect canDrop callback', () => {
            const canDrop = vi.fn().mockReturnValue(false);

            function TestComponent() {
                const { startDrag } = useDragDrop();
                const { isOver, ...dropProps } = useDroppable('folder-1', mockOnDrop, canDrop);

                return (
                    <div>
                        <div data-testid="droppable" data-is-over={isOver} {...dropProps} />
                        <button type="button" data-testid="start" onClick={() => startDrag(mockDragItem)}>
                            Start
                        </button>
                    </div>
                );
            }

            render(
                <DragDropProvider>
                    <TestComponent />
                </DragDropProvider>
            );

            // Start drag
            fireEvent.click(screen.getByTestId('start'));

            // Try to drag over (should be blocked by canDrop)
            const dataTransfer = { dropEffect: '' };
            fireEvent.dragOver(screen.getByTestId('droppable'), { dataTransfer });

            // isOver should be false because canDrop returns false
            expect(screen.getByTestId('droppable')).toHaveAttribute('data-is-over', 'false');
        });

        it('should not call onDrop when canDrop returns false', () => {
            const canDrop = vi.fn().mockReturnValue(false);

            function TestComponent() {
                const { startDrag } = useDragDrop();
                const dropProps = useDroppable('folder-1', mockOnDrop, canDrop);

                return (
                    <div>
                        <div data-testid="droppable" {...dropProps} />
                        <button type="button" data-testid="start" onClick={() => startDrag(mockDragItem)}>
                            Start
                        </button>
                    </div>
                );
            }

            render(
                <DragDropProvider>
                    <TestComponent />
                </DragDropProvider>
            );

            // Start drag
            fireEvent.click(screen.getByTestId('start'));

            // Try to drop
            fireEvent.drop(screen.getByTestId('droppable'));

            expect(mockOnDrop).not.toHaveBeenCalled();
        });
    });

    describe('drag item types', () => {
        it('should support document type', () => {
            const documentItem: DragItem = {
                type: 'document',
                id: 'doc-1',
                name: 'Document',
                currentFolderId: 'folder-1'
            };

            const { result } = renderHook(() => useDragDrop(), {
                wrapper: DragDropProvider
            });

            act(() => {
                result.current.startDrag(documentItem);
            });

            expect(result.current.dragItem?.type).toBe('document');
        });

        it('should support folder type', () => {
            const folderItem: DragItem = {
                type: 'folder',
                id: 'folder-1',
                name: 'Folder',
                currentFolderId: null
            };

            const { result } = renderHook(() => useDragDrop(), {
                wrapper: DragDropProvider
            });

            act(() => {
                result.current.startDrag(folderItem);
            });

            expect(result.current.dragItem?.type).toBe('folder');
        });
    });
});
