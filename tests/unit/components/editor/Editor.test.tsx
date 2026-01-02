import { Editor } from '@/components/editor/Editor';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock settings store
vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: () => ({
        lineNumbers: true,
        wordWrap: true,
        minimap: false,
        editorFontSize: 14,
        fontFamily: 'monospace',
        lintOnType: true
    })
}));

// Mock editor hooks
const mockSetValue = vi.fn();
const mockGetValue = vi.fn(() => '# Test');
const mockFocus = vi.fn();
const mockScrollToPercent = vi.fn();
const mockScrollToLine = vi.fn();
const mockView = {};

vi.mock('@/components/editor/hooks/useCodeMirror', () => ({
    useCodeMirror: () => ({
        editorRef: { current: document.createElement('div') },
        view: mockView,
        setValue: mockSetValue,
        getValue: mockGetValue,
        focus: mockFocus,
        scrollToPercent: mockScrollToPercent,
        scrollToLine: mockScrollToLine
    })
}));

const mockHandleChange = vi.fn();
const mockHandleCursorChange = vi.fn();

vi.mock('@/components/editor/hooks/useEditorSync', () => ({
    useEditorSync: () => ({
        content: '# Test Content',
        documentId: 'doc-1',
        handleChange: mockHandleChange,
        handleCursorChange: mockHandleCursorChange
    })
}));

vi.mock('@/components/editor/hooks/useEditorTheme', () => ({
    useEditorTheme: () => 'light'
}));

// Mock EditorContextMenu
vi.mock('@/components/editor/EditorContextMenu', () => ({
    EditorContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="editor-context-menu">{children}</div>
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('Editor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render editor section', () => {
            render(<Editor />);

            expect(screen.getByRole('region')).toBeInTheDocument();
        });

        it('should have aria label for accessibility', () => {
            render(<Editor />);

            expect(screen.getByLabelText('aria.markdownEditor')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            render(<Editor className="custom-class" />);

            expect(screen.getByRole('region')).toHaveClass('custom-class');
        });

        it('should wrap content in EditorContextMenu', () => {
            render(<Editor />);

            expect(screen.getByTestId('editor-context-menu')).toBeInTheDocument();
        });
    });

    describe('callbacks', () => {
        it('should call onViewReady when view is available', async () => {
            const onViewReady = vi.fn();

            render(<Editor onViewReady={onViewReady} />);

            await waitFor(() => {
                expect(onViewReady).toHaveBeenCalledWith(mockView);
            });
        });

        it('should call onScrollToReady with scrollToPercent function', async () => {
            const onScrollToReady = vi.fn();

            render(<Editor onScrollToReady={onScrollToReady} />);

            await waitFor(() => {
                expect(onScrollToReady).toHaveBeenCalledWith(mockScrollToPercent);
            });
        });

        it('should call onScrollToLineReady with scrollToLine function', async () => {
            const onScrollToLineReady = vi.fn();

            render(<Editor onScrollToLineReady={onScrollToLineReady} />);

            await waitFor(() => {
                expect(onScrollToLineReady).toHaveBeenCalledWith(mockScrollToLine);
            });
        });
    });

    describe('focus', () => {
        it('should focus editor when documentId is available', async () => {
            render(<Editor />);

            await waitFor(() => {
                expect(mockFocus).toHaveBeenCalled();
            });
        });
    });

    describe('content sync', () => {
        it('should sync content when document changes', async () => {
            render(<Editor />);

            // Wait for initial effects to run
            await waitFor(() => {
                expect(mockSetValue).toHaveBeenCalledWith('# Test Content');
            });
        });
    });
});

describe('Editor with null document', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render without documentId', async () => {
        // Override mock for this test
        vi.doMock('@/components/editor/hooks/useEditorSync', () => ({
            useEditorSync: () => ({
                content: '',
                documentId: null,
                handleChange: vi.fn(),
                handleCursorChange: vi.fn()
            })
        }));

        render(<Editor />);

        expect(screen.getByRole('region')).toBeInTheDocument();
    });
});

describe('Editor content detection', () => {
    it('should detect external content changes', async () => {
        // First render with initial content
        mockGetValue.mockReturnValue('# Initial Content');

        const { rerender } = render(<Editor />);

        // Simulate external content change
        mockGetValue.mockReturnValue('# Different Content');

        await act(async () => {
            rerender(<Editor />);
        });

        // The editor should be ready even with different content
        expect(screen.getByRole('region')).toBeInTheDocument();
    });
});
