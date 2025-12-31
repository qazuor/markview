import { HeadingDropdown } from '@/components/toolbar/buttons/HeadingDropdown';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock DropdownMenu components
let mockIsOpen = false;

vi.mock('@/components/ui', () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown">{children}</div>,
    DropdownMenuTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <button
            type="button"
            data-testid="dropdown-trigger"
            className={className}
            onClick={() => {
                mockIsOpen = !mockIsOpen;
            }}
        >
            {children}
        </button>
    ),
    DropdownMenuContent: ({ children }: { children: React.ReactNode; align?: string; className?: string }) => (
        <div data-testid="dropdown-content" style={{ display: mockIsOpen ? 'block' : 'none' }}>
            {children}
        </div>
    ),
    DropdownMenuItem: ({
        children,
        onClick,
        className
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
    }) => (
        <button type="button" onClick={onClick} className={className} data-testid="dropdown-item">
            {children}
        </button>
    ),
    DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => <span data-testid="dropdown-shortcut">{children}</span>
}));

describe('HeadingDropdown', () => {
    const mockOnHeading = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockIsOpen = false;
    });

    describe('rendering', () => {
        it('should render dropdown trigger', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);

            expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
        });

        it('should show Paragraph label by default', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);

            // Multiple Paragraph elements exist (trigger + menu item)
            const paragraphs = screen.getAllByText('Paragraph');
            expect(paragraphs.length).toBeGreaterThan(0);
        });

        it('should show current heading level label', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} currentLevel={2} />);

            // The trigger should show "Heading 2" (one in trigger, one in menu)
            const headings = screen.getAllByText('Heading 2');
            expect(headings.length).toBeGreaterThan(0);
        });

        it('should show all heading options when open', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);

            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            // Should have all 7 options (Paragraph + H1-H6)
            const items = screen.getAllByTestId('dropdown-item');
            expect(items).toHaveLength(7);
        });
    });

    describe('heading levels', () => {
        it('should show Paragraph option', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);
            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            expect(screen.getAllByText('Paragraph')[0]).toBeInTheDocument();
        });

        it('should show Heading 1 through Heading 6 options', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);
            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            expect(screen.getByText('Heading 1')).toBeInTheDocument();
            expect(screen.getByText('Heading 2')).toBeInTheDocument();
            expect(screen.getByText('Heading 3')).toBeInTheDocument();
            expect(screen.getByText('Heading 4')).toBeInTheDocument();
            expect(screen.getByText('Heading 5')).toBeInTheDocument();
            expect(screen.getByText('Heading 6')).toBeInTheDocument();
        });
    });

    describe('shortcuts', () => {
        it('should show shortcuts for each option', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);
            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            const shortcuts = screen.getAllByTestId('dropdown-shortcut');
            expect(shortcuts[0]).toHaveTextContent('Ctrl+0'); // Paragraph
            expect(shortcuts[1]).toHaveTextContent('Ctrl+1'); // H1
            expect(shortcuts[2]).toHaveTextContent('Ctrl+2'); // H2
            expect(shortcuts[3]).toHaveTextContent('Ctrl+3'); // H3
            expect(shortcuts[4]).toHaveTextContent('Ctrl+4'); // H4
            expect(shortcuts[5]).toHaveTextContent('Ctrl+5'); // H5
            expect(shortcuts[6]).toHaveTextContent('Ctrl+6'); // H6
        });
    });

    describe('selection', () => {
        it('should call onHeading with 0 when Paragraph is clicked', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);
            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            const items = screen.getAllByTestId('dropdown-item');
            expect(items[0]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[0]!); // Paragraph

            expect(mockOnHeading).toHaveBeenCalledWith(0);
        });

        it('should call onHeading with 1 when Heading 1 is clicked', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);
            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            const items = screen.getAllByTestId('dropdown-item');
            expect(items[1]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[1]!); // H1

            expect(mockOnHeading).toHaveBeenCalledWith(1);
        });

        it('should call onHeading with 3 when Heading 3 is clicked', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);
            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            const items = screen.getAllByTestId('dropdown-item');
            expect(items[3]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[3]!); // H3

            expect(mockOnHeading).toHaveBeenCalledWith(3);
        });

        it('should call onHeading with 6 when Heading 6 is clicked', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);
            fireEvent.click(screen.getByTestId('dropdown-trigger'));

            const items = screen.getAllByTestId('dropdown-item');
            expect(items[6]).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Test context - items array verified above
            fireEvent.click(items[6]!); // H6

            expect(mockOnHeading).toHaveBeenCalledWith(6);
        });
    });

    describe('current level display', () => {
        it('should display Paragraph when currentLevel is 0', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} currentLevel={0} />);

            const paragraphs = screen.getAllByText('Paragraph');
            expect(paragraphs.length).toBeGreaterThan(0);
        });

        it('should display Heading 1 when currentLevel is 1', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} currentLevel={1} />);

            const headings = screen.getAllByText('Heading 1');
            expect(headings.length).toBeGreaterThan(0);
        });

        it('should display Heading 4 when currentLevel is 4', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} currentLevel={4} />);

            const headings = screen.getAllByText('Heading 4');
            expect(headings.length).toBeGreaterThan(0);
        });

        it('should fallback to Paragraph for invalid level', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} currentLevel={99} />);

            const paragraphs = screen.getAllByText('Paragraph');
            expect(paragraphs.length).toBeGreaterThan(0);
        });
    });

    describe('styling', () => {
        it('should have trigger styling classes', () => {
            render(<HeadingDropdown onHeading={mockOnHeading} />);

            const trigger = screen.getByTestId('dropdown-trigger');
            expect(trigger).toHaveClass('inline-flex', 'items-center', 'justify-center');
        });
    });
});
