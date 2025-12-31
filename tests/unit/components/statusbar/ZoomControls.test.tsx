import { ZoomControls } from '@/components/statusbar/ZoomControls';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock settings store
const mockZoomIn = vi.fn();
const mockZoomOut = vi.fn();
const mockResetZoom = vi.fn();
const mockGetZoomPercentage = vi.fn().mockReturnValue(100);

vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: (selector: (state: unknown) => unknown) => {
        const state = {
            zoomIn: mockZoomIn,
            zoomOut: mockZoomOut,
            resetZoom: mockResetZoom,
            getZoomPercentage: mockGetZoomPercentage
        };
        return selector(state);
    }
}));

describe('ZoomControls', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetZoomPercentage.mockReturnValue(100);
    });

    describe('basic rendering', () => {
        it('should render zoom percentage', () => {
            render(<ZoomControls />);

            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('should render zoom in button', () => {
            render(<ZoomControls />);

            expect(screen.getByLabelText('zoom.zoomIn')).toBeInTheDocument();
        });

        it('should render zoom out button', () => {
            render(<ZoomControls />);

            expect(screen.getByLabelText('zoom.zoomOut')).toBeInTheDocument();
        });

        it('should render reset button with percentage', () => {
            render(<ZoomControls />);

            expect(screen.getByLabelText('zoom.currentZoom: 100%')).toBeInTheDocument();
        });
    });

    describe('different zoom levels', () => {
        it('should display 75% zoom', () => {
            mockGetZoomPercentage.mockReturnValue(75);
            render(<ZoomControls />);

            expect(screen.getByText('75%')).toBeInTheDocument();
        });

        it('should display 150% zoom', () => {
            mockGetZoomPercentage.mockReturnValue(150);
            render(<ZoomControls />);

            expect(screen.getByText('150%')).toBeInTheDocument();
        });

        it('should display 200% zoom', () => {
            mockGetZoomPercentage.mockReturnValue(200);
            render(<ZoomControls />);

            expect(screen.getByText('200%')).toBeInTheDocument();
        });
    });

    describe('interactions', () => {
        it('should call zoomIn when plus button is clicked', () => {
            render(<ZoomControls />);

            fireEvent.click(screen.getByLabelText('zoom.zoomIn'));

            expect(mockZoomIn).toHaveBeenCalledTimes(1);
        });

        it('should call zoomOut when minus button is clicked', () => {
            render(<ZoomControls />);

            fireEvent.click(screen.getByLabelText('zoom.zoomOut'));

            expect(mockZoomOut).toHaveBeenCalledTimes(1);
        });

        it('should call resetZoom when percentage is clicked', () => {
            render(<ZoomControls />);

            fireEvent.click(screen.getByText('100%'));

            expect(mockResetZoom).toHaveBeenCalledTimes(1);
        });
    });

    describe('button types', () => {
        it('should have type="button" on all buttons', () => {
            render(<ZoomControls />);

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(3);
            for (const button of buttons) {
                expect(button).toHaveAttribute('type', 'button');
            }
        });
    });

    describe('accessibility', () => {
        it('should have aria-label on container', () => {
            const { container } = render(<ZoomControls />);

            const controls = container.firstChild;
            expect(controls).toHaveAttribute('aria-label', 'zoom.controls');
        });

        it('should have proper labels on buttons', () => {
            render(<ZoomControls />);

            expect(screen.getByLabelText('zoom.zoomIn')).toBeInTheDocument();
            expect(screen.getByLabelText('zoom.zoomOut')).toBeInTheDocument();
        });

        it('should have title with keyboard shortcut on zoom in', () => {
            render(<ZoomControls />);

            const zoomInButton = screen.getByLabelText('zoom.zoomIn');
            expect(zoomInButton).toHaveAttribute('title', 'zoom.zoomIn (Ctrl++)');
        });

        it('should have title with keyboard shortcut on zoom out', () => {
            render(<ZoomControls />);

            const zoomOutButton = screen.getByLabelText('zoom.zoomOut');
            expect(zoomOutButton).toHaveAttribute('title', 'zoom.zoomOut (Ctrl+-)');
        });

        it('should have title with keyboard shortcut on reset', () => {
            render(<ZoomControls />);

            const resetButton = screen.getByText('100%');
            expect(resetButton).toHaveAttribute('title', 'zoom.resetZoom (Ctrl+0)');
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            const { container } = render(<ZoomControls className="custom-class" />);

            const controls = container.firstChild;
            expect(controls).toHaveClass('custom-class');
        });

        it('should have flex layout', () => {
            const { container } = render(<ZoomControls />);

            const controls = container.firstChild;
            expect(controls).toHaveClass('flex', 'items-center', 'gap-1');
        });
    });
});
