import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger
} from '@/components/ui/ContextMenu';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('ContextMenu', () => {
    describe('basic rendering', () => {
        it('should render trigger content', () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Right click here</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>Item 1</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            expect(screen.getByText('Right click here')).toBeInTheDocument();
        });

        it('should show content on right click (context menu)', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Right click here</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>Item 1</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Right click here'));

            await waitFor(() => {
                expect(screen.getByText('Item 1')).toBeInTheDocument();
            });
        });
    });

    describe('ContextMenuItem', () => {
        it('should render item content', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>Click me</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                expect(screen.getByText('Click me')).toBeInTheDocument();
            });
        });

        it('should call onSelect when clicked', async () => {
            const onSelect = vi.fn();
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem onSelect={onSelect}>Click me</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                fireEvent.click(screen.getByText('Click me'));
            });

            expect(onSelect).toHaveBeenCalled();
        });

        it('should apply inset style when inset prop is true', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem inset>Inset Item</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const item = screen.getByText('Inset Item');
                expect(item).toHaveClass('pl-8');
            });
        });

        it('should apply danger variant style', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem variant="danger">Delete</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const item = screen.getByText('Delete');
                expect(item).toHaveClass('text-red-500');
            });
        });

        it('should apply default variant by default', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>Normal Item</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const item = screen.getByText('Normal Item');
                expect(item).toHaveClass('text-text-primary');
            });
        });
    });

    describe('ContextMenuLabel', () => {
        it('should render label text', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuLabel>My Label</ContextMenuLabel>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                expect(screen.getByText('My Label')).toBeInTheDocument();
            });
        });

        it('should apply inset style when inset prop is true', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuLabel inset>Inset Label</ContextMenuLabel>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const label = screen.getByText('Inset Label');
                expect(label).toHaveClass('pl-8');
            });
        });
    });

    describe('ContextMenuSeparator', () => {
        it('should render separator', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>Item 1</ContextMenuItem>
                        <ContextMenuSeparator data-testid="separator" />
                        <ContextMenuItem>Item 2</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                expect(screen.getByTestId('separator')).toBeInTheDocument();
            });
        });

        it('should have separator styling', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuSeparator data-testid="separator" />
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const separator = screen.getByTestId('separator');
                expect(separator).toHaveClass('h-px', 'bg-border');
            });
        });
    });

    describe('ContextMenuShortcut', () => {
        it('should render shortcut text', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>
                            Copy
                            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                expect(screen.getByText('⌘C')).toBeInTheDocument();
            });
        });

        it('should have muted text style', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>
                            Paste
                            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const shortcut = screen.getByText('⌘V');
                expect(shortcut).toHaveClass('text-text-muted');
            });
        });
    });

    describe('ContextMenuCheckboxItem', () => {
        it('should render checkbox item', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuCheckboxItem checked>Show Line Numbers</ContextMenuCheckboxItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                expect(screen.getByText('Show Line Numbers')).toBeInTheDocument();
            });
        });
    });

    describe('ContextMenuRadioGroup and RadioItem', () => {
        it('should render radio items', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuRadioGroup value="dark">
                            <ContextMenuRadioItem value="light">Light</ContextMenuRadioItem>
                            <ContextMenuRadioItem value="dark">Dark</ContextMenuRadioItem>
                        </ContextMenuRadioGroup>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                expect(screen.getByText('Light')).toBeInTheDocument();
                expect(screen.getByText('Dark')).toBeInTheDocument();
            });
        });
    });

    describe('ContextMenuSub', () => {
        it('should render sub menu trigger', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger>More Options</ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <ContextMenuItem>Sub Item</ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                expect(screen.getByText('More Options')).toBeInTheDocument();
            });
        });

        it('should apply inset style to sub trigger', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger inset>Inset Sub</ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <ContextMenuItem>Sub Item</ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const trigger = screen.getByText('Inset Sub').closest('[class*="pl-8"]');
                expect(trigger).toBeInTheDocument();
            });
        });
    });

    describe('custom classNames', () => {
        it('should apply custom className to content', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent className="custom-content" data-testid="content">
                        <ContextMenuItem>Item</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const content = screen.getByTestId('content');
                expect(content).toHaveClass('custom-content');
            });
        });

        it('should apply custom className to item', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem className="custom-item">Custom Item</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const item = screen.getByText('Custom Item');
                expect(item).toHaveClass('custom-item');
            });
        });

        it('should apply custom className to separator', async () => {
            render(
                <ContextMenu>
                    <ContextMenuTrigger>Trigger</ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuSeparator className="custom-separator" data-testid="sep" />
                    </ContextMenuContent>
                </ContextMenu>
            );

            fireEvent.contextMenu(screen.getByText('Trigger'));

            await waitFor(() => {
                const separator = screen.getByTestId('sep');
                expect(separator).toHaveClass('custom-separator');
            });
        });
    });
});
