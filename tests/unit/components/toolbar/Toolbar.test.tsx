import { Toolbar } from '@/components/toolbar/Toolbar';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock hooks
const mockIsMobile = vi.fn(() => false);
vi.mock('@/hooks', () => ({
    useMobile: () => ({ isMobile: mockIsMobile() })
}));

// Mock UI store
const mockToggleDocumentPanel = vi.fn();
vi.mock('@/stores/uiStore', () => ({
    useUIStore: (selector: (state: unknown) => unknown) => {
        const state = {
            activeDocumentPanel: null,
            toggleDocumentPanel: mockToggleDocumentPanel
        };
        return selector(state);
    }
}));

// Mock toolbar hooks
const mockHandleFormat = vi.fn();
const mockHandleHeading = vi.fn();
const mockHandleInsert = vi.fn();
const mockHandleList = vi.fn();
const mockHandleEmojiInsert = vi.fn();
vi.mock('@/components/toolbar/hooks/useToolbarActions', () => ({
    useToolbarActions: () => ({
        handleFormat: mockHandleFormat,
        handleHeading: mockHandleHeading,
        handleInsert: mockHandleInsert,
        handleList: mockHandleList,
        handleEmojiInsert: mockHandleEmojiInsert
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ChevronDown: () => <span data-testid="icon-chevron-down" />,
    List: () => <span data-testid="icon-list" />,
    MoreHorizontal: () => <span data-testid="icon-more" />,
    Search: () => <span data-testid="icon-search" />,
    X: () => <span data-testid="icon-x" />
}));

// Mock toolbar components
vi.mock('@/components/toolbar/EmojiPicker', () => ({
    EmojiPicker: ({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) => (
        <button type="button" data-testid="emoji-picker" onClick={() => onEmojiSelect('😀')}>
            Emoji
        </button>
    )
}));

vi.mock('@/components/toolbar/FormatButton', () => ({
    FormatButtonGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="format-button-group">{children}</div>,
    ToolbarSeparator: () => <div data-testid="toolbar-separator" />
}));

vi.mock('@/components/toolbar/buttons', () => ({
    BoldButton: ({ onFormat }: { onFormat: (type: string) => void }) => (
        <button type="button" onClick={() => onFormat('bold')}>
            Bold
        </button>
    ),
    ItalicButton: ({ onFormat }: { onFormat: (type: string) => void }) => (
        <button type="button" onClick={() => onFormat('italic')}>
            Italic
        </button>
    ),
    StrikethroughButton: ({ onFormat }: { onFormat: (type: string) => void }) => (
        <button type="button" onClick={() => onFormat('strikethrough')}>
            Strike
        </button>
    ),
    HeadingDropdown: ({ onHeading }: { onHeading: (level: number) => void }) => (
        <button type="button" onClick={() => onHeading(1)}>
            Heading
        </button>
    ),
    LinkButton: ({ onInsert }: { onInsert: (type: string) => void }) => (
        <button type="button" onClick={() => onInsert('link')}>
            Link
        </button>
    ),
    ImageButton: ({ onInsert }: { onInsert: (type: string) => void }) => (
        <button type="button" onClick={() => onInsert('image')}>
            Image
        </button>
    ),
    InlineCodeButton: ({ onInsert }: { onInsert: (type: string) => void }) => (
        <button type="button" onClick={() => onInsert('inline-code')}>
            Code
        </button>
    ),
    CodeBlockButton: ({ onInsert }: { onInsert: (type: string) => void }) => (
        <button type="button" onClick={() => onInsert('code-block')}>
            Code Block
        </button>
    ),
    QuoteButton: ({ onInsert }: { onInsert: (type: string) => void }) => (
        <button type="button" onClick={() => onInsert('quote')}>
            Quote
        </button>
    ),
    HorizontalRuleButton: ({ onInsert }: { onInsert: (type: string) => void }) => (
        <button type="button" onClick={() => onInsert('horizontal-rule')}>
            HR
        </button>
    ),
    BulletListButton: ({ onList }: { onList: (type: string) => void }) => (
        <button type="button" onClick={() => onList('bullet')}>
            Bullet List
        </button>
    ),
    NumberedListButton: ({ onList }: { onList: (type: string) => void }) => (
        <button type="button" onClick={() => onList('numbered')}>
            Numbered List
        </button>
    ),
    TaskListButton: ({ onList }: { onList: (type: string) => void }) => (
        <button type="button" onClick={() => onList('task')}>
            Task List
        </button>
    )
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('Toolbar', () => {
    const mockEditorView = {} as never;

    beforeEach(() => {
        vi.clearAllMocks();
        mockIsMobile.mockReturnValue(false);
    });

    describe('desktop rendering', () => {
        it('should render toolbar', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByRole('toolbar')).toBeInTheDocument();
        });

        it('should have aria label for accessibility', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByLabelText('aria.formattingToolbar')).toBeInTheDocument();
        });

        it('should render heading dropdown', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByText('Heading')).toBeInTheDocument();
        });

        it('should render format buttons', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByText('Bold')).toBeInTheDocument();
            expect(screen.getByText('Italic')).toBeInTheDocument();
            expect(screen.getByText('Strike')).toBeInTheDocument();
        });

        it('should render link and image buttons', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByText('Link')).toBeInTheDocument();
            expect(screen.getByText('Image')).toBeInTheDocument();
        });

        it('should render code buttons', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByText('Code')).toBeInTheDocument();
            expect(screen.getByText('Code Block')).toBeInTheDocument();
        });

        it('should render block element buttons', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByText('Quote')).toBeInTheDocument();
            expect(screen.getByText('HR')).toBeInTheDocument();
        });

        it('should render list buttons', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByText('Bullet List')).toBeInTheDocument();
            expect(screen.getByText('Numbered List')).toBeInTheDocument();
            expect(screen.getByText('Task List')).toBeInTheDocument();
        });

        it('should render emoji picker', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
        });

        it('should render document navigation buttons', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByTitle('sidebar.toc')).toBeInTheDocument();
            expect(screen.getByTitle('sidebar.search')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            render(<Toolbar editorView={mockEditorView} className="custom-class" />);

            expect(screen.getByRole('toolbar')).toHaveClass('custom-class');
        });

        it('should have data-tour attribute', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByRole('toolbar')).toHaveAttribute('data-tour', 'toolbar');
        });
    });

    describe('desktop interactions', () => {
        it('should call handleFormat when bold button is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByText('Bold'));

            expect(mockHandleFormat).toHaveBeenCalledWith('bold');
        });

        it('should call handleFormat when italic button is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByText('Italic'));

            expect(mockHandleFormat).toHaveBeenCalledWith('italic');
        });

        it('should call handleHeading when heading is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByText('Heading'));

            expect(mockHandleHeading).toHaveBeenCalledWith(1);
        });

        it('should call handleInsert when link button is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByText('Link'));

            expect(mockHandleInsert).toHaveBeenCalledWith('link');
        });

        it('should call handleList when bullet list button is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByText('Bullet List'));

            expect(mockHandleList).toHaveBeenCalledWith('bullet');
        });

        it('should call handleEmojiInsert when emoji is selected', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByTestId('emoji-picker'));

            expect(mockHandleEmojiInsert).toHaveBeenCalledWith('😀');
        });

        it('should toggle TOC panel when TOC button is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByTitle('sidebar.toc'));

            expect(mockToggleDocumentPanel).toHaveBeenCalledWith('toc');
        });

        it('should toggle search panel when search button is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByTitle('sidebar.search'));

            expect(mockToggleDocumentPanel).toHaveBeenCalledWith('search');
        });
    });

    describe('mobile rendering', () => {
        beforeEach(() => {
            mockIsMobile.mockReturnValue(true);
        });

        it('should render mobile toolbar', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByRole('toolbar')).toBeInTheDocument();
        });

        it('should show basic formatting buttons', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByText('Bold')).toBeInTheDocument();
            expect(screen.getByText('Italic')).toBeInTheDocument();
        });

        it('should show more button', () => {
            render(<Toolbar editorView={mockEditorView} />);

            expect(screen.getByLabelText('common.more')).toBeInTheDocument();
        });

        it('should open bottom sheet when more button is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByLabelText('common.more'));

            expect(screen.getByText('toolbar.moreOptions')).toBeInTheDocument();
        });

        it('should show additional options in bottom sheet', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByLabelText('common.more'));

            expect(screen.getByText('toolbar.text')).toBeInTheDocument();
            expect(screen.getByText('toolbar.insert')).toBeInTheDocument();
            expect(screen.getByText('toolbar.lists')).toBeInTheDocument();
            expect(screen.getByText('toolbar.emoji')).toBeInTheDocument();
        });

        it('should close bottom sheet when close button is clicked', () => {
            render(<Toolbar editorView={mockEditorView} />);

            fireEvent.click(screen.getByLabelText('common.more'));
            expect(screen.getByText('toolbar.moreOptions')).toBeInTheDocument();

            fireEvent.click(screen.getByLabelText('common.close'));

            expect(screen.queryByText('toolbar.moreOptions')).not.toBeInTheDocument();
        });
    });

    describe('null editor view', () => {
        it('should render toolbar with null editorView', () => {
            render(<Toolbar editorView={null} />);

            expect(screen.getByRole('toolbar')).toBeInTheDocument();
        });
    });
});
