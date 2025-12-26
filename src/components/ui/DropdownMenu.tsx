import { cn } from '@/utils/cn';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import type React from 'react';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
    className?: string;
    sideOffset?: number;
}

const DropdownMenuContent = ({ className, sideOffset = 4, ...props }: DropdownMenuContentProps) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            sideOffset={sideOffset}
            className={cn(
                'z-50 min-w-[8rem] overflow-hidden rounded-md',
                'bg-bg-primary border border-border shadow-lg',
                'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
                'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
                'data-[side=top]:slide-in-from-bottom-2',
                'p-1',
                className
            )}
            {...props}
        />
    </DropdownMenuPrimitive.Portal>
);

interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
    className?: string;
    inset?: boolean;
}

const DropdownMenuItem = ({ className, inset, ...props }: DropdownMenuItemProps) => (
    <DropdownMenuPrimitive.Item
        className={cn(
            'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
            'text-sm text-text-primary outline-none',
            'focus:bg-bg-tertiary focus:text-text-primary',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            'transition-colors',
            inset && 'pl-8',
            className
        )}
        {...props}
    />
);

interface DropdownMenuCheckboxItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> {
    className?: string;
}

const DropdownMenuCheckboxItem = ({ className, children, checked, ...props }: DropdownMenuCheckboxItemProps) => (
    <DropdownMenuPrimitive.CheckboxItem
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
            <DropdownMenuPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.CheckboxItem>
);

interface DropdownMenuRadioItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> {
    className?: string;
}

const DropdownMenuRadioItem = ({ className, children, ...props }: DropdownMenuRadioItemProps) => (
    <DropdownMenuPrimitive.RadioItem
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
            <DropdownMenuPrimitive.ItemIndicator>
                <Circle className="h-2 w-2 fill-current" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.RadioItem>
);

interface DropdownMenuLabelProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> {
    className?: string;
    inset?: boolean;
}

const DropdownMenuLabel = ({ className, inset, ...props }: DropdownMenuLabelProps) => (
    <DropdownMenuPrimitive.Label
        className={cn('px-2 py-1.5 text-xs font-semibold text-text-muted', inset && 'pl-8', className)}
        {...props}
    />
);

interface DropdownMenuSeparatorProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> {
    className?: string;
}

const DropdownMenuSeparator = ({ className, ...props }: DropdownMenuSeparatorProps) => (
    <DropdownMenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
);

interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
    className?: string;
}

const DropdownMenuShortcut = ({ className, ...props }: DropdownMenuShortcutProps) => {
    return <span className={cn('ml-auto text-xs tracking-widest text-text-muted', className)} {...props} />;
};

interface DropdownMenuSubTriggerProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> {
    className?: string;
    inset?: boolean;
}

const DropdownMenuSubTrigger = ({ className, inset, children, ...props }: DropdownMenuSubTriggerProps) => (
    <DropdownMenuPrimitive.SubTrigger
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
    </DropdownMenuPrimitive.SubTrigger>
);

interface DropdownMenuSubContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> {
    className?: string;
}

const DropdownMenuSubContent = ({ className, ...props }: DropdownMenuSubContentProps) => (
    <DropdownMenuPrimitive.SubContent
        className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md',
            'bg-bg-primary border border-border shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            'p-1',
            className
        )}
        {...props}
    />
);

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup
};
