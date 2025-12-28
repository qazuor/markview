import { useCallback, useState } from 'react';

interface ContextMenuPosition {
    x: number;
    y: number;
}

interface UseContextMenuReturn {
    isOpen: boolean;
    position: ContextMenuPosition;
    open: (event: React.MouseEvent) => void;
    close: () => void;
    toggle: (event: React.MouseEvent) => void;
}

/**
 * Hook for managing context menu state and position
 */
export function useContextMenu(): UseContextMenuReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

    const open = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setPosition({ x: event.clientX, y: event.clientY });
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggle = useCallback(
        (event: React.MouseEvent) => {
            if (isOpen) {
                close();
            } else {
                open(event);
            }
        },
        [isOpen, open, close]
    );

    return {
        isOpen,
        position,
        open,
        close,
        toggle
    };
}

interface ContextMenuAction<T = unknown> {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    shortcut?: string;
    disabled?: boolean;
    variant?: 'default' | 'danger';
    onAction: (data?: T) => void;
}

interface ContextMenuGroup<T = unknown> {
    id: string;
    label?: string;
    items: ContextMenuAction<T>[];
}

interface UseContextMenuActionsProps<T = unknown> {
    groups: ContextMenuGroup<T>[];
    data?: T;
}

interface UseContextMenuActionsReturn<T = unknown> {
    groups: ContextMenuGroup<T>[];
    executeAction: (actionId: string) => void;
    getAction: (actionId: string) => ContextMenuAction<T> | undefined;
}

/**
 * Hook for managing context menu actions
 */
export function useContextMenuActions<T = unknown>({ groups, data }: UseContextMenuActionsProps<T>): UseContextMenuActionsReturn<T> {
    const executeAction = useCallback(
        (actionId: string) => {
            for (const group of groups) {
                const action = group.items.find((item) => item.id === actionId);
                if (action && !action.disabled) {
                    action.onAction(data);
                    return;
                }
            }
        },
        [groups, data]
    );

    const getAction = useCallback(
        (actionId: string): ContextMenuAction<T> | undefined => {
            for (const group of groups) {
                const action = group.items.find((item) => item.id === actionId);
                if (action) {
                    return action;
                }
            }
            return undefined;
        },
        [groups]
    );

    return {
        groups,
        executeAction,
        getAction
    };
}

export type { ContextMenuAction, ContextMenuGroup, ContextMenuPosition };
