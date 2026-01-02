import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies using vi.hoisted
const { mockUsePreviewSync, mockUseTheme, mockUseTranslation } = vi.hoisted(() => ({
    mockUsePreviewSync: vi.fn(),
    mockUseTheme: vi.fn(),
    mockUseTranslation: vi.fn()
}));

vi.mock('@/hooks/useBroadcastChannel', () => ({
    usePreviewSync: mockUsePreviewSync
}));

vi.mock('@/hooks/useTheme', () => ({
    useTheme: mockUseTheme
}));

vi.mock('react-i18next', () => ({
    useTranslation: mockUseTranslation
}));

vi.mock('@/components/preview', () => ({
    Preview: ({ content, className }: { content: string; className: string }) => (
        <div data-testid="preview" className={className}>
            {content}
        </div>
    )
}));

import { PreviewWindow } from '@/app/PreviewWindow';

describe('PreviewWindow', () => {
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            'preview.title': 'Preview',
            'app.name': 'MarkView',
            'preview.notSupported': 'Not Supported',
            'preview.browserNotSupported': 'Your browser does not support this feature',
            'preview.waitingForEditor': 'Waiting for Editor',
            'preview.openEditorHint': 'Open the editor to see the preview',
            'preview.connected': 'Connected'
        };
        return translations[key] || key;
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTranslation.mockReturnValue({ t: mockT });
        mockUseTheme.mockReturnValue({ theme: 'light', setTheme: vi.fn() });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.documentElement.classList.remove('dark');
    });

    describe('when BroadcastChannel is not supported', () => {
        beforeEach(() => {
            mockUsePreviewSync.mockReturnValue({
                content: '',
                theme: 'light',
                isEditorConnected: false,
                isConnected: false
            });
        });

        it('should show not supported message', () => {
            render(<PreviewWindow />);

            expect(screen.getByText('Not Supported')).toBeInTheDocument();
            expect(screen.getByText('Your browser does not support this feature')).toBeInTheDocument();
        });
    });

    describe('when waiting for editor connection', () => {
        beforeEach(() => {
            mockUsePreviewSync.mockReturnValue({
                content: '',
                theme: 'light',
                isEditorConnected: false,
                isConnected: true
            });
        });

        it('should show waiting message', () => {
            render(<PreviewWindow />);

            expect(screen.getByText('Waiting for Editor')).toBeInTheDocument();
            expect(screen.getByText('Open the editor to see the preview')).toBeInTheDocument();
        });
    });

    describe('when connected to editor', () => {
        beforeEach(() => {
            mockUsePreviewSync.mockReturnValue({
                content: '# Hello World',
                theme: 'light',
                isEditorConnected: true,
                isConnected: true
            });
        });

        it('should render the preview with content', () => {
            render(<PreviewWindow />);

            expect(screen.getByTestId('preview')).toBeInTheDocument();
            expect(screen.getByTestId('preview')).toHaveTextContent('# Hello World');
        });

        it('should show connected status', () => {
            render(<PreviewWindow />);

            expect(screen.getByText('Connected')).toBeInTheDocument();
        });

        it('should show header with title', () => {
            render(<PreviewWindow />);

            expect(screen.getByText('Preview')).toBeInTheDocument();
        });
    });

    describe('theme handling', () => {
        it('should apply dark class when theme is dark', () => {
            mockUsePreviewSync.mockReturnValue({
                content: '',
                theme: 'dark',
                isEditorConnected: true,
                isConnected: true
            });

            render(<PreviewWindow />);

            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });

        it('should remove dark class when theme is light', () => {
            document.documentElement.classList.add('dark');

            mockUsePreviewSync.mockReturnValue({
                content: '',
                theme: 'light',
                isEditorConnected: true,
                isConnected: true
            });

            render(<PreviewWindow />);

            expect(document.documentElement.classList.contains('dark')).toBe(false);
        });
    });

    describe('document title', () => {
        it('should update document title', () => {
            mockUsePreviewSync.mockReturnValue({
                content: '',
                theme: 'light',
                isEditorConnected: true,
                isConnected: true
            });

            render(<PreviewWindow />);

            expect(document.title).toBe('Preview - MarkView');
        });
    });
});
