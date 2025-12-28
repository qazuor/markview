import { cn } from '@/utils/cn';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import type React from 'react';

const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

interface ContextMenuContentProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> {
    className?: string;
}

const ContextMenuContent = ({ className, ...props }: ContextMenuContentProps) => (
    <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
            className={cn(
                'z-50 min-w-[8rem] overflow-hidden rounded-md',
                'bg-bg-primary border border-border shadow-lg',
                'animate-in fade-in-0 zoom-in-95',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
                'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                'p-1',
                className
            )}
            {...props}
        />
    </ContextMenuPrimitive.Portal>
);

interface ContextMenuItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> {
    className?: string;
    inset?: boolean;
    variant?: 'default' | 'danger';
}

const ContextMenuItem = ({ className, inset, variant = 'default', ...props }: ContextMenuItemProps) => (
    <ContextMenuPrimitive.Item
        className={cn(
            'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
            'text-sm outline-none',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            'transition-colors',
            variant === 'default' && 'text-text-primary focus:bg-bg-tertiary focus:text-text-primary',
            variant === 'danger' && 'text-red-500 focus:bg-red-50 dark:focus:bg-red-950',
            inset && 'pl-8',
            className
        )}
        {...props}
    />
);

interface ContextMenuCheckboxItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem> {
    className?: string;
}

const ContextMenuCheckboxItem = ({ className, children, checked, ...props }: ContextMenuCheckboxItemProps) => (
    <ContextMenuPrimitive.CheckboxItem
        className={cn(
            'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2',
            'text-sm text-text-primary outline-none',
            'focus:bg-bg-tertiary focus:text-text-primary',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            'transition-colors',
            className
        )}
        checked={checked}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <ContextMenuPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </ContextMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </ContextMenuPrimitive.CheckboxItem>
);

interface ContextMenuRadioItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem> {
    className?: string;
}

const ContextMenuRadioItem = ({ className, children, ...props }: ContextMenuRadioItemProps) => (
    <ContextMenuPrimitive.RadioItem
        className={cn(
            'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2',
            'text-sm text-text-primary outline-none',
            'focus:bg-bg-tertiary focus:text-text-primary',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            'transition-colors',
            className
        )}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <ContextMenuPrimitive.ItemIndicator>
                <Circle className="h-2 w-2 fill-current" />
            </ContextMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </ContextMenuPrimitive.RadioItem>
);

interface ContextMenuLabelProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> {
    className?: string;
    inset?: boolean;
}

const ContextMenuLabel = ({ className, inset, ...props }: ContextMenuLabelProps) => (
    <ContextMenuPrimitive.Label
        className={cn('px-2 py-1.5 text-xs font-semibold text-text-muted', inset && 'pl-8', className)}
        {...props}
    />
);

interface ContextMenuSeparatorProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator> {
    className?: string;
}

const ContextMenuSeparator = ({ className, ...props }: ContextMenuSeparatorProps) => (
    <ContextMenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
);

interface ContextMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
    className?: string;
}

const ContextMenuShortcut = ({ className, ...props }: ContextMenuShortcutProps) => {
    return <span className={cn('ml-auto text-xs tracking-widest text-text-muted', className)} {...props} />;
};

interface ContextMenuSubTriggerProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> {
    className?: string;
    inset?: boolean;
}

const ContextMenuSubTrigger = ({ className, inset, children, ...props }: ContextMenuSubTriggerProps) => (
    <ContextMenuPrimitive.SubTrigger
        className={cn(
            'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
            'text-sm text-text-primary outline-none',
            'focus:bg-bg-tertiary',
            'data-[state=open]:bg-bg-tertiary',
            inset && 'pl-8',
            className
        )}
        {...props}
    >
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
    </ContextMenuPrimitive.SubTrigger>
);

interface ContextMenuSubContentProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent> {
    className?: string;
}

const ContextMenuSubContent = ({ className, ...props }: ContextMenuSubContentProps) => (
    <ContextMenuPrimitive.SubContent
        className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md',
            'bg-bg-primary border border-border shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            'p-1',
            className
        )}
        {...props}
    />
);

export {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuCheckboxItem,
    ContextMenuRadioItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuGroup,
    ContextMenuPortal,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuRadioGroup
};
