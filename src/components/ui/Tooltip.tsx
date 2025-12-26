import { cn } from '@/utils/cn';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type React from 'react';

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    className?: string;
}

/**
 * Tooltip component using Radix UI
 */
export function Tooltip({ children, content, side = 'top', align = 'center', delayDuration = 300, className }: TooltipProps) {
    return (
        <TooltipPrimitive.Provider>
            <TooltipPrimitive.Root delayDuration={delayDuration}>
                <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        align={align}
                        sideOffset={4}
                        className={cn(
                            'z-50 overflow-hidden rounded-md px-3 py-1.5',
                            'bg-gray-900 text-white text-xs',
                            'dark:bg-gray-100 dark:text-gray-900',
                            'animate-in fade-in-0 zoom-in-95',
                            'shadow-md',
                            className
                        )}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className="fill-gray-900 dark:fill-gray-100" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}

interface TooltipShortcutProps {
    label: string;
    shortcut?: string;
}

/**
 * Tooltip content with label and keyboard shortcut
 */
export function TooltipWithShortcut({ label, shortcut }: TooltipShortcutProps) {
    return (
        <span className="flex items-center gap-2">
            <span>{label}</span>
            {shortcut && <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono">{shortcut}</kbd>}
        </span>
    );
}
