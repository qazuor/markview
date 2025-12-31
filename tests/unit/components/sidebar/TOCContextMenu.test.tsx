import { TOCContextMenu } from '@/components/sidebar/TOCContextMenu';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
    clipboard: {
        writeText: mockWriteText
    }
});

// Track context menu state
let mockIsOpen = false;

// Mock UI components
vi.mock('@/components/ui', () => ({
    ContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu">{children}</div>,
    ContextMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
        <div
            data-testid="context-trigger"
            onContextMenu={() => {
                mockIsOpen = true;
            }}
        >
            {children}
        </div>
    ),
    ContextMenuContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="context-content" className={className} style={{ display: mockIsOpen ? 'block' : 'none' }}>
            {children}
        </div>
    ),
    ContextMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <button type="button" onClick={onClick} data-testid="context-item">
            {children}
        </button>
    ),
    ContextMenuSeparator: () => <hr data-testid="context-separator" />
}));

describe('TOCContextMenu', () => {
    const mockOnNavigate = vi.fn();
    const defaultProps = {
        headingId: 'introduction',
        headingText: 'Introduction',
        headingLine: 10,
        onNavigate: mockOnNavigate
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockIsOpen = false;
        mockWriteText.mockResolvedValue(undefined);
    });

    describe('rendering', () => {
        it('should render children', () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            expect(screen.getByText('TOC Item')).toBeInTheDocument();
        });

        it('should render context menu container', () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        });

        it('should render context trigger', () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            expect(screen.getByTestId('context-trigger')).toBeInTheDocument();
        });
    });

    describe('menu items', () => {
        it('should render go to section item', () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            expect(screen.getByText('contextMenu.goToSection')).toBeInTheDocument();
        });

        it('should render copy section link item', () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            expect(screen.getByText('contextMenu.copySectionLink')).toBeInTheDocument();
        });

        it('should render copy section text item', () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            expect(screen.getByText('contextMenu.copySectionText')).toBeInTheDocument();
        });

        it('should render separator', () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            expect(screen.getByTestId('context-separator')).toBeInTheDocument();
        });
    });

    describe('go to section', () => {
        it('should call onNavigate with heading line when clicked', () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            const items = screen.getAllByTestId('context-item');
            expect(items[0]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[0]!); // Go to section

            expect(mockOnNavigate).toHaveBeenCalledWith(10);
        });

        it('should use correct heading line for different props', () => {
            render(
                <TOCContextMenu {...defaultProps} headingLine={42}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            const items = screen.getAllByTestId('context-item');
            expect(items[0]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[0]!);

            expect(mockOnNavigate).toHaveBeenCalledWith(42);
        });
    });

    describe('copy section link', () => {
        it('should copy anchor link to clipboard', async () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            const items = screen.getAllByTestId('context-item');
            expect(items[1]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[1]!); // Copy section link

            expect(mockWriteText).toHaveBeenCalledWith('#introduction');
        });

        it('should use correct heading id for anchor', async () => {
            render(
                <TOCContextMenu {...defaultProps} headingId="my-section">
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            const items = screen.getAllByTestId('context-item');
            expect(items[1]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[1]!);

            expect(mockWriteText).toHaveBeenCalledWith('#my-section');
        });
    });

    describe('copy section text', () => {
        it('should copy heading text to clipboard', async () => {
            render(
                <TOCContextMenu {...defaultProps}>
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            const items = screen.getAllByTestId('context-item');
            expect(items[2]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[2]!); // Copy section text

            expect(mockWriteText).toHaveBeenCalledWith('Introduction');
        });

        it('should use correct heading text', async () => {
            render(
                <TOCContextMenu {...defaultProps} headingText="Getting Started">
                    <span>TOC Item</span>
                </TOCContextMenu>
            );

            fireEvent.contextMenu(screen.getByTestId('context-trigger'));

            const items = screen.getAllByTestId('context-item');
            expect(items[2]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[2]!);

            expect(mockWriteText).toHaveBeenCalledWith('Getting Started');
        });
    });
});
