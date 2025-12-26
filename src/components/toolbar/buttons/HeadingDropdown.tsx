import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ChevronDown, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Pilcrow } from 'lucide-react';

interface HeadingDropdownProps {
    onHeading: (level: number | 0) => void;
    currentLevel?: number;
}

const headings = [
    { level: 0, label: 'Paragraph', icon: Pilcrow, shortcut: 'Ctrl+0' },
    { level: 1, label: 'Heading 1', icon: Heading1, shortcut: 'Ctrl+1' },
    { level: 2, label: 'Heading 2', icon: Heading2, shortcut: 'Ctrl+2' },
    { level: 3, label: 'Heading 3', icon: Heading3, shortcut: 'Ctrl+3' },
    { level: 4, label: 'Heading 4', icon: Heading4, shortcut: 'Ctrl+4' },
    { level: 5, label: 'Heading 5', icon: Heading5, shortcut: 'Ctrl+5' },
    { level: 6, label: 'Heading 6', icon: Heading6, shortcut: 'Ctrl+6' }
];

/**
 * Dropdown to select heading level
 */
const DEFAULT_HEADING = headings[0];

export function HeadingDropdown({ onHeading, currentLevel = 0 }: HeadingDropdownProps) {
    const current = headings.find((h) => h.level === currentLevel) ?? DEFAULT_HEADING;
    const CurrentIcon = current?.icon ?? Pilcrow;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    'inline-flex items-center justify-center gap-1',
                    'h-8 px-2 rounded-md',
                    'text-sm text-text-secondary hover:text-text-primary',
                    'hover:bg-bg-tertiary',
                    'transition-colors duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                )}
            >
                <CurrentIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{current?.label ?? 'Paragraph'}</span>
                <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                {headings.map((heading) => {
                    const Icon = heading.icon;
                    return (
                        <DropdownMenuItem
                            key={heading.level}
                            onClick={() => onHeading(heading.level)}
                            className={cn(currentLevel === heading.level && 'bg-bg-tertiary')}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{heading.label}</span>
                            <DropdownMenuShortcut>{heading.shortcut}</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
