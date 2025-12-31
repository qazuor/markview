import { SearchPanel } from '@/components/sidebar/SearchPanel';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: { current?: number; total?: number }) => {
            if (params?.current !== undefined && params?.total !== undefined) {
                return `${params.current} of ${params.total}`;
            }
            return key;
        }
    })
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
    IconButton: ({
        icon,
        label,
        onClick,
        disabled
    }: {
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
        disabled?: boolean;
        size?: string;
    }) => (
        <button type="button" onClick={onClick} disabled={disabled} aria-label={label}>
            {icon}
        </button>
    ),
    Tooltip: ({ children }: { children: React.ReactNode; content: string }) => <>{children}</>
}));

describe('SearchPanel', () => {
    const mockOnNavigate = vi.fn();
    const mockOnReplace = vi.fn();
    const sampleContent = `First line with hello
Second line
Third line with hello world
Fourth line`;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render search input', () => {
            render(<SearchPanel content={sampleContent} />);

            expect(screen.getByPlaceholderText('searchPanel.searchPlaceholder')).toBeInTheDocument();
        });

        it('should render panel title', () => {
            render(<SearchPanel content={sampleContent} />);

            expect(screen.getByText('searchPanel.title')).toBeInTheDocument();
        });

        it('should render expand/collapse button for replace', () => {
            render(<SearchPanel content={sampleContent} />);

            expect(screen.getByLabelText('searchPanel.showReplace')).toBeInTheDocument();
        });

        it('should render search options', () => {
            render(<SearchPanel content={sampleContent} />);

            expect(screen.getByText('searchPanel.caseSensitive')).toBeInTheDocument();
            expect(screen.getByText('searchPanel.useRegex')).toBeInTheDocument();
        });
    });

    describe('search functionality', () => {
        it('should show results when searching', () => {
            render(<SearchPanel content={sampleContent} onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'hello' } });

            expect(screen.getByText('1 of 2')).toBeInTheDocument();
        });

        it('should show no results message when no matches', () => {
            render(<SearchPanel content={sampleContent} onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'xyz123' } });

            expect(screen.getByText('common.noResults')).toBeInTheDocument();
        });

        it('should clear search when X button is clicked', () => {
            render(<SearchPanel content={sampleContent} onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'hello' } });

            const clearButton = screen.getByLabelText('searchPanel.clearSearch');
            fireEvent.click(clearButton);

            expect(searchInput).toHaveValue('');
        });

        it('should not show clear button when search is empty', () => {
            render(<SearchPanel content={sampleContent} />);

            expect(screen.queryByLabelText('searchPanel.clearSearch')).not.toBeInTheDocument();
        });
    });

    describe('navigation', () => {
        it('should call onNavigate when next button is clicked', () => {
            render(<SearchPanel content={sampleContent} onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'hello' } });

            const nextButton = screen.getByLabelText('searchPanel.nextMatch');
            fireEvent.click(nextButton);

            expect(mockOnNavigate).toHaveBeenCalled();
        });

        it('should call onNavigate when previous button is clicked', () => {
            render(<SearchPanel content={sampleContent} onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'hello' } });

            const prevButton = screen.getByLabelText('searchPanel.previousMatch');
            fireEvent.click(prevButton);

            expect(mockOnNavigate).toHaveBeenCalled();
        });

        it('should disable navigation buttons when no results', () => {
            render(<SearchPanel content={sampleContent} onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'xyz123' } });

            const nextButton = screen.getByLabelText('searchPanel.nextMatch');
            const prevButton = screen.getByLabelText('searchPanel.previousMatch');

            expect(nextButton).toBeDisabled();
            expect(prevButton).toBeDisabled();
        });
    });

    describe('replace functionality', () => {
        it('should show replace input when expanded', () => {
            render(<SearchPanel content={sampleContent} onReplace={mockOnReplace} />);

            const expandButton = screen.getByLabelText('searchPanel.showReplace');
            fireEvent.click(expandButton);

            expect(screen.getByPlaceholderText('searchPanel.replacePlaceholder')).toBeInTheDocument();
        });

        it('should hide replace input when collapsed', () => {
            render(<SearchPanel content={sampleContent} onReplace={mockOnReplace} />);

            expect(screen.queryByPlaceholderText('searchPanel.replacePlaceholder')).not.toBeInTheDocument();
        });

        it('should call onReplace when replace button is clicked', () => {
            render(<SearchPanel content={sampleContent} onReplace={mockOnReplace} />);

            // Expand replace
            fireEvent.click(screen.getByLabelText('searchPanel.showReplace'));

            // Enter search and replace
            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'hello' } });

            const replaceInput = screen.getByPlaceholderText('searchPanel.replacePlaceholder');
            fireEvent.change(replaceInput, { target: { value: 'hi' } });

            // Click replace
            const replaceButton = screen.getByText('common.replace');
            fireEvent.click(replaceButton);

            expect(mockOnReplace).toHaveBeenCalledWith('hello', 'hi', false);
        });

        it('should call onReplace with all=true when replace all is clicked', () => {
            render(<SearchPanel content={sampleContent} onReplace={mockOnReplace} />);

            // Expand replace
            fireEvent.click(screen.getByLabelText('searchPanel.showReplace'));

            // Enter search and replace
            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'hello' } });

            const replaceInput = screen.getByPlaceholderText('searchPanel.replacePlaceholder');
            fireEvent.change(replaceInput, { target: { value: 'hi' } });

            // Click replace all
            const replaceAllButton = screen.getByText('common.replaceAll');
            fireEvent.click(replaceAllButton);

            expect(mockOnReplace).toHaveBeenCalledWith('hello', 'hi', true);
        });
    });

    describe('options', () => {
        it('should toggle case sensitivity', () => {
            render(<SearchPanel content="Hello hello" onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'Hello' } });

            // Initially case-insensitive - should find 2
            expect(screen.getByText('1 of 2')).toBeInTheDocument();

            // Toggle case sensitive
            const caseSensitiveCheckbox = screen.getByRole('checkbox', { name: /caseSensitive/i });
            fireEvent.click(caseSensitiveCheckbox);

            // Now should find only 1
            expect(screen.getByText('1 of 1')).toBeInTheDocument();
        });

        it('should toggle regex mode', () => {
            render(<SearchPanel content="test123 test456" onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');

            // Enable regex
            const regexCheckbox = screen.getByRole('checkbox', { name: /useRegex/i });
            fireEvent.click(regexCheckbox);

            // Search with regex pattern
            fireEvent.change(searchInput, { target: { value: 'test\\d+' } });

            // Should find 2 matches
            expect(screen.getByText('1 of 2')).toBeInTheDocument();
        });
    });

    describe('results list', () => {
        it('should show results list when there are matches', () => {
            render(<SearchPanel content={sampleContent} onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'hello' } });

            // Should show line numbers
            expect(screen.getByText(/Ln 1:/)).toBeInTheDocument();
            expect(screen.getByText(/Ln 3:/)).toBeInTheDocument();
        });

        it('should navigate when clicking a result', () => {
            render(<SearchPanel content={sampleContent} onNavigate={mockOnNavigate} />);

            const searchInput = screen.getByPlaceholderText('searchPanel.searchPlaceholder');
            fireEvent.change(searchInput, { target: { value: 'hello' } });

            // Click second result
            const secondResult = screen.getByText(/Ln 3:/);
            fireEvent.click(secondResult.closest('button') as HTMLElement);

            expect(mockOnNavigate).toHaveBeenCalled();
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            const { container } = render(<SearchPanel content={sampleContent} className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });
});
