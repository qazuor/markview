import { TableOfContents } from '@/components/sidebar/TableOfContents';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: { count?: number }) => {
            if (params?.count !== undefined) return `${params.count} headings`;
            return key;
        }
    })
}));

// Mock TOCContextMenu
vi.mock('@/components/sidebar/TOCContextMenu', () => ({
    TOCContextMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock extractToc
vi.mock('@/services/markdown/toc', () => ({
    extractToc: (content: string) => {
        const lines = content.split('\n');
        const toc: Array<{ id: string; text: string; level: number; line: number }> = [];

        for (let i = 0; i < lines.length; i++) {
            const match = lines[i]?.match(/^(#{1,6})\s+(.+)$/);
            if (match?.[1] && match[2]) {
                toc.push({
                    id: match[2].toLowerCase().replace(/\s+/g, '-'),
                    text: match[2],
                    level: match[1].length,
                    line: i + 1
                });
            }
        }
        return toc;
    }
}));

describe('TableOfContents', () => {
    const mockOnNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('empty content', () => {
        it('should show empty state when no headings', () => {
            render(<TableOfContents content="No headings here" onNavigate={mockOnNavigate} />);

            expect(screen.getByText(/sidebar\.noHeadings/)).toBeInTheDocument();
        });

        it('should show hint for no headings', () => {
            render(<TableOfContents content="Plain text" onNavigate={mockOnNavigate} />);

            expect(screen.getByText(/sidebar\.noHeadingsHint/)).toBeInTheDocument();
        });
    });

    describe('with headings', () => {
        const contentWithHeadings = `# Introduction
## Getting Started
### Installation
## Usage
### Basic Example
### Advanced Example`;

        it('should render all headings', () => {
            render(<TableOfContents content={contentWithHeadings} onNavigate={mockOnNavigate} />);

            expect(screen.getByText('Introduction')).toBeInTheDocument();
            expect(screen.getByText('Getting Started')).toBeInTheDocument();
            expect(screen.getByText('Installation')).toBeInTheDocument();
            expect(screen.getByText('Usage')).toBeInTheDocument();
        });

        it('should show heading count', () => {
            render(<TableOfContents content={contentWithHeadings} onNavigate={mockOnNavigate} />);

            expect(screen.getByText('6 headings')).toBeInTheDocument();
        });

        it('should render toc header', () => {
            render(<TableOfContents content={contentWithHeadings} onNavigate={mockOnNavigate} />);

            expect(screen.getByText('sidebar.toc')).toBeInTheDocument();
        });

        it('should render navigation element', () => {
            render(<TableOfContents content={contentWithHeadings} onNavigate={mockOnNavigate} />);

            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });
    });

    describe('navigation', () => {
        const content = `# First
## Second
### Third`;

        it('should call onNavigate when heading is clicked', () => {
            render(<TableOfContents content={content} onNavigate={mockOnNavigate} />);

            fireEvent.click(screen.getByText('First'));

            expect(mockOnNavigate).toHaveBeenCalledWith(1);
        });

        it('should call onNavigate with correct line for nested heading', () => {
            render(<TableOfContents content={content} onNavigate={mockOnNavigate} />);

            fireEvent.click(screen.getByText('Third'));

            expect(mockOnNavigate).toHaveBeenCalledWith(3);
        });
    });

    describe('active heading', () => {
        const content = `# First
## Second
## Third`;

        it('should highlight active heading based on activeLine', () => {
            render(<TableOfContents content={content} activeLine={2} onNavigate={mockOnNavigate} />);

            const secondButton = screen.getByText('Second');
            expect(secondButton).toHaveClass('bg-bg-tertiary');
        });

        it('should highlight closest previous heading', () => {
            render(<TableOfContents content={content} activeLine={2} onNavigate={mockOnNavigate} />);

            // Line 2 is "## Second", so "Second" should be active
            const secondButton = screen.getByText('Second');
            expect(secondButton).toHaveClass('text-primary-500');
        });
    });

    describe('styling', () => {
        const content = `# H1 Heading
## H2 Heading
### H3 Heading`;

        it('should apply custom className', () => {
            const { container } = render(<TableOfContents content={content} className="custom-class" onNavigate={mockOnNavigate} />);

            expect(container.firstChild).toHaveClass('custom-class');
        });

        it('should apply font-medium to level 1 headings', () => {
            render(<TableOfContents content={content} onNavigate={mockOnNavigate} />);

            const h1Button = screen.getByText('H1 Heading');
            expect(h1Button).toHaveClass('font-medium');
        });

        it('should apply indentation for nested headings', () => {
            render(<TableOfContents content={content} onNavigate={mockOnNavigate} />);

            const h2Button = screen.getByText('H2 Heading');
            const h3Button = screen.getByText('H3 Heading');

            expect(h2Button).toHaveClass('pl-3');
            expect(h3Button).toHaveClass('pl-6');
        });
    });

    describe('heading levels', () => {
        it('should handle all heading levels 1-6', () => {
            const content = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;

            render(<TableOfContents content={content} onNavigate={mockOnNavigate} />);

            expect(screen.getByText('H1')).toBeInTheDocument();
            expect(screen.getByText('H2')).toBeInTheDocument();
            expect(screen.getByText('H3')).toBeInTheDocument();
            expect(screen.getByText('H4')).toBeInTheDocument();
            expect(screen.getByText('H5')).toBeInTheDocument();
            expect(screen.getByText('H6')).toBeInTheDocument();
        });
    });
});
