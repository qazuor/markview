import { Preview } from '@/components/preview/Preview';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock markdown services
vi.mock('@/services/markdown', () => ({
    buildScrollMap: vi.fn(
        () =>
            new Map([
                [1, 0],
                [10, 100]
            ])
    ),
    findEditorLine: vi.fn(() => 1),
    findPreviewPosition: vi.fn(() => 50)
}));

// Mock settings store
vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: () => ({
        previewFontSize: 16,
        fontFamily: 'Inter'
    })
}));

// Mock preview hooks
const mockUseMarkdown = vi.fn();
vi.mock('@/components/preview/hooks', () => ({
    useMarkdown: (...args: unknown[]) => mockUseMarkdown(...args),
    usePreviewTheme: () => ({
        themeClass: 'theme-light',
        isDark: false
    })
}));

// Mock preview processors
vi.mock('@/components/preview/Callout', () => ({
    processCallouts: vi.fn()
}));

vi.mock('@/components/preview/Checklist', () => ({
    processChecklists: vi.fn(),
    toggleCheckboxInContent: vi.fn((content) => content)
}));

vi.mock('@/components/preview/CodeBlock', () => ({
    processCodeBlocks: vi.fn()
}));

vi.mock('@/components/preview/Mermaid', () => ({
    processMermaidBlocks: vi.fn()
}));

// Mock PreviewLoading
vi.mock('@/components/preview/PreviewLoading', () => ({
    PreviewLoading: () => <div data-testid="preview-loading">Loading...</div>
}));

// Mock PreviewContextMenu
vi.mock('@/components/preview/context-menus', () => ({
    PreviewContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="preview-context-menu">{children}</div>
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('Preview', () => {
    const defaultProps = {
        content: '# Hello World\n\nThis is a test.',
        onScroll: vi.fn(),
        onScrollToReady: vi.fn(),
        onContentChange: vi.fn(),
        onScrollLine: vi.fn(),
        onScrollToLineReady: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseMarkdown.mockReturnValue({
            html: '<h1>Hello World</h1><p>This is a test.</p>',
            isLoading: false,
            error: null
        });
    });

    describe('rendering', () => {
        it('should render preview section', async () => {
            render(<Preview {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('region')).toBeInTheDocument();
            });
        });

        it('should have aria label for accessibility', async () => {
            render(<Preview {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByLabelText('aria.markdownPreview')).toBeInTheDocument();
            });
        });

        it('should render html content', async () => {
            render(<Preview {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('Hello World')).toBeInTheDocument();
            });
        });

        it('should apply custom className', async () => {
            render(<Preview {...defaultProps} className="custom-class" />);

            await waitFor(() => {
                expect(screen.getByRole('region')).toHaveClass('custom-class');
            });
        });
    });

    describe('loading state', () => {
        it('should show loading when initializing', () => {
            mockUseMarkdown.mockReturnValue({
                html: '',
                isLoading: true,
                error: null
            });

            render(<Preview {...defaultProps} />);

            expect(screen.getByTestId('preview-loading')).toBeInTheDocument();
        });

        it('should show loading overlay when updating', async () => {
            mockUseMarkdown.mockReturnValue({
                html: '<h1>Hello</h1>',
                isLoading: true,
                error: null
            });

            render(<Preview {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('preview.loading')).toBeInTheDocument();
            });
        });

        it('should have aria-busy when loading', async () => {
            mockUseMarkdown.mockReturnValue({
                html: '<h1>Hello</h1>',
                isLoading: true,
                error: null
            });

            render(<Preview {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true');
            });
        });
    });

    describe('error state', () => {
        it('should show error message', () => {
            mockUseMarkdown.mockReturnValue({
                html: '',
                isLoading: false,
                error: new Error('Failed to render markdown')
            });

            render(<Preview {...defaultProps} />);

            expect(screen.getByText('preview.errorTitle')).toBeInTheDocument();
            expect(screen.getByText('Failed to render markdown')).toBeInTheDocument();
        });
    });

    describe('empty state', () => {
        it('should show empty state when no content', () => {
            mockUseMarkdown.mockReturnValue({
                html: '',
                isLoading: false,
                error: null
            });

            render(<Preview {...defaultProps} content="" />);

            expect(screen.getByText('preview.emptyState')).toBeInTheDocument();
        });
    });

    describe('markdown rendering', () => {
        it('should call useMarkdown with content and options', () => {
            render(<Preview {...defaultProps} />);

            expect(mockUseMarkdown).toHaveBeenCalledWith(defaultProps.content, {
                theme: 'light',
                debounceMs: 300
            });
        });

        it('should apply font styles', async () => {
            render(<Preview {...defaultProps} />);

            await waitFor(() => {
                const contentDiv = screen.getByText('Hello World').closest('[data-preview-content]');
                expect(contentDiv).toHaveStyle({ fontSize: '16px' });
            });
        });
    });

    describe('context menu', () => {
        it('should wrap content in context menu', async () => {
            render(<Preview {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByTestId('preview-context-menu')).toBeInTheDocument();
            });
        });
    });
});
