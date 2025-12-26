import { Tooltip, TooltipWithShortcut } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

interface FormatButtonProps {
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    className?: string;
}

/**
 * Reusable formatting button with tooltip
 */
export function FormatButton({ icon: Icon, label, shortcut, onClick, active = false, disabled = false, className }: FormatButtonProps) {
    return (
        <Tooltip content={<TooltipWithShortcut label={label} shortcut={shortcut} />}>
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={cn(
                    'inline-flex items-center justify-center',
                    'h-8 w-8 rounded-md',
                    'text-text-secondary hover:text-text-primary',
                    'hover:bg-bg-tertiary',
                    'transition-colors duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    'disabled:pointer-events-none disabled:opacity-50',
                    active && 'bg-bg-tertiary text-primary-500',
                    className
                )}
                aria-label={label}
                aria-pressed={active}
            >
                <Icon className="h-4 w-4" />
            </button>
        </Tooltip>
    );
}

interface FormatButtonGroupProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Group of format buttons with separator
 */
export function FormatButtonGroup({ children, className }: FormatButtonGroupProps) {
    return <div className={cn('flex items-center gap-0.5', className)}>{children}</div>;
}

/**
 * Separator between button groups
 */
export function ToolbarSeparator() {
    return <div className="mx-1.5 h-6 w-px bg-border" aria-hidden="true" />;
}
