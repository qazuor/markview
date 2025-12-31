import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock usePWA hook
const mockUsePWA = vi.fn();
vi.mock('@/hooks/usePWA', () => ({
    usePWA: () => mockUsePWA()
}));

describe('OfflineIndicator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('when online', () => {
        it('should not render when online', () => {
            mockUsePWA.mockReturnValue({ isOnline: true });
            const { container } = render(<OfflineIndicator />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe('when offline', () => {
        it('should render offline indicator', () => {
            mockUsePWA.mockReturnValue({ isOnline: false });
            render(<OfflineIndicator />);

            expect(screen.getByText('pwa.offline.message')).toBeInTheDocument();
        });

        it('should have amber background', () => {
            mockUsePWA.mockReturnValue({ isOnline: false });
            const { container } = render(<OfflineIndicator />);

            const indicator = container.querySelector('.bg-amber-500');
            expect(indicator).toBeInTheDocument();
        });

        it('should be fixed positioned at top', () => {
            mockUsePWA.mockReturnValue({ isOnline: false });
            const { container } = render(<OfflineIndicator />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('fixed', 'top-0');
        });

        it('should have high z-index', () => {
            mockUsePWA.mockReturnValue({ isOnline: false });
            const { container } = render(<OfflineIndicator />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('z-50');
        });
    });

    // Note: Reconnection tests are complex due to state dependencies
    // The component tracks wasOffline state internally which requires
    // specific sequence of online/offline changes;

    describe('when never went offline', () => {
        it('should not show reconnected when first online', () => {
            mockUsePWA.mockReturnValue({ isOnline: true });
            const { container } = render(<OfflineIndicator />);

            expect(container.firstChild).toBeNull();
            expect(screen.queryByText('pwa.offline.reconnected')).not.toBeInTheDocument();
        });
    });
});
