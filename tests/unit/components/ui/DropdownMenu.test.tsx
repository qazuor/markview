import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/DropdownMenu';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('DropdownMenu', () => {
    describe('basic rendering', () => {
        it('should render trigger', () => {
            render(
                <DropdownMenu>
                    <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Item 1</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            expect(screen.getByText('Open Menu')).toBeInTheDocument();
        });

        it('should show content when open', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Item 1</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                expect(screen.getByText('Item 1')).toBeInTheDocument();
            });
        });
    });

    describe('DropdownMenuItem', () => {
        it('should render item content', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Click me</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                expect(screen.getByText('Click me')).toBeInTheDocument();
            });
        });

        it('should call onSelect when clicked', async () => {
            const onSelect = vi.fn();
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={onSelect}>Click me</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                fireEvent.click(screen.getByText('Click me'));
            });

            expect(onSelect).toHaveBeenCalled();
        });

        it('should apply inset style when inset prop is true', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const item = screen.getByText('Inset Item');
                expect(item).toHaveClass('pl-8');
            });
        });
    });

    describe('DropdownMenuLabel', () => {
        it('should render label text', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Label</DropdownMenuLabel>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                expect(screen.getByText('My Label')).toBeInTheDocument();
            });
        });

        it('should apply inset style when inset prop is true', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const label = screen.getByText('Inset Label');
                expect(label).toHaveClass('pl-8');
            });
        });
    });

    describe('DropdownMenuSeparator', () => {
        it('should render separator', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Item 1</DropdownMenuItem>
                        <DropdownMenuSeparator data-testid="separator" />
                        <DropdownMenuItem>Item 2</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                expect(screen.getByTestId('separator')).toBeInTheDocument();
            });
        });

        it('should have separator styling', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuSeparator data-testid="separator" />
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const separator = screen.getByTestId('separator');
                expect(separator).toHaveClass('h-px', 'bg-border');
            });
        });
    });

    describe('DropdownMenuShortcut', () => {
        it('should render shortcut text', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            Save
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                expect(screen.getByText('⌘S')).toBeInTheDocument();
            });
        });

        it('should have muted text style', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            Save
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const shortcut = screen.getByText('⌘S');
                expect(shortcut).toHaveClass('text-text-muted');
            });
        });
    });

    describe('DropdownMenuCheckboxItem', () => {
        it('should render checkbox item', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuCheckboxItem checked>Show Status Bar</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                expect(screen.getByText('Show Status Bar')).toBeInTheDocument();
            });
        });
    });

    describe('DropdownMenuRadioGroup and RadioItem', () => {
        it('should render radio items', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value="option1">
                            <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                expect(screen.getByText('Option 1')).toBeInTheDocument();
                expect(screen.getByText('Option 2')).toBeInTheDocument();
            });
        });
    });

    describe('DropdownMenuSub', () => {
        it('should render sub menu trigger', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Sub Item</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                expect(screen.getByText('More Options')).toBeInTheDocument();
            });
        });

        it('should apply inset style to sub trigger', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger inset>Inset Sub</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Sub Item</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const trigger = screen.getByText('Inset Sub').closest('[class*="pl-8"]');
                expect(trigger).toBeInTheDocument();
            });
        });
    });

    describe('custom classNames', () => {
        it('should apply custom className to content', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent className="custom-content" data-testid="content">
                        <DropdownMenuItem>Item</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const content = screen.getByTestId('content');
                expect(content).toHaveClass('custom-content');
            });
        });

        it('should apply custom className to item', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem className="custom-item">Custom Item</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const item = screen.getByText('Custom Item');
                expect(item).toHaveClass('custom-item');
            });
        });

        it('should apply custom className to separator', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuSeparator className="custom-separator" data-testid="sep" />
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const separator = screen.getByTestId('sep');
                expect(separator).toHaveClass('custom-separator');
            });
        });

        it('should apply custom className to shortcut', async () => {
            render(
                <DropdownMenu defaultOpen>
                    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuShortcut className="custom-shortcut">⌘K</DropdownMenuShortcut>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

            await waitFor(() => {
                const shortcut = screen.getByText('⌘K');
                expect(shortcut).toHaveClass('custom-shortcut');
            });
        });
    });
});
