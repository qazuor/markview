import { UpdatePrompt } from '@/components/pwa/UpdatePrompt';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock usePWA hook
const mockUpdateServiceWorker = vi.fn();
const mockUsePWA = vi.fn();
vi.mock('@/hooks/usePWA', () => ({
    usePWA: () => mockUsePWA()
}));

describe('UpdatePrompt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePWA.mockReturnValue({
            hasUpdate: true,
            updateServiceWorker: mockUpdateServiceWorker
        });
    });

    describe('rendering', () => {
        it('should render when update is available', () => {
            render(<UpdatePrompt />);

            expect(screen.getByText('pwa.update.title')).toBeInTheDocument();
        });

        it('should not render when no update available', () => {
            mockUsePWA.mockReturnValue({
                hasUpdate: false,
                updateServiceWorker: mockUpdateServiceWorker
            });
            const { container } = render(<UpdatePrompt />);

            expect(container.firstChild).toBeNull();
        });

        it('should show update description', () => {
            render(<UpdatePrompt />);

            expect(screen.getByText('pwa.update.description')).toBeInTheDocument();
        });

        it('should show update button', () => {
            render(<UpdatePrompt />);

            expect(screen.getByText('pwa.update.button')).toBeInTheDocument();
        });

        it('should show later button', () => {
            render(<UpdatePrompt />);

            expect(screen.getByText('pwa.update.later')).toBeInTheDocument();
        });

        it('should show close button', () => {
            render(<UpdatePrompt />);

            expect(screen.getByRole('button', { name: 'common.close' })).toBeInTheDocument();
        });
    });

    describe('positioning', () => {
        it('should be fixed at bottom right', () => {
            const { container } = render(<UpdatePrompt />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('fixed', 'bottom-4', 'right-4');
        });

        it('should have high z-index', () => {
            const { container } = render(<UpdatePrompt />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('z-50');
        });
    });

    describe('update action', () => {
        it('should call updateServiceWorker when update button is clicked', () => {
            render(<UpdatePrompt />);

            fireEvent.click(screen.getByText('pwa.update.button'));

            expect(mockUpdateServiceWorker).toHaveBeenCalled();
        });
    });

    describe('dismiss action', () => {
        it('should hide prompt when later button is clicked', () => {
            const { container } = render(<UpdatePrompt />);

            fireEvent.click(screen.getByText('pwa.update.later'));

            expect(container.firstChild).toBeNull();
        });

        it('should hide prompt when close button is clicked', () => {
            const { container } = render(<UpdatePrompt />);

            fireEvent.click(screen.getByRole('button', { name: 'common.close' }));

            expect(container.firstChild).toBeNull();
        });
    });
});
