import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock usePWA hook
const mockPromptInstall = vi.fn();
const mockDismissInstall = vi.fn();
const mockUsePWA = vi.fn();
vi.mock('@/hooks/usePWA', () => ({
    usePWA: () => mockUsePWA()
}));

describe('InstallPrompt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockUsePWA.mockReturnValue({
            isInstallable: true,
            promptInstall: mockPromptInstall,
            dismissInstall: mockDismissInstall
        });
    });

    describe('rendering', () => {
        it('should render when installable', () => {
            render(<InstallPrompt />);

            expect(screen.getByText('pwa.install.title')).toBeInTheDocument();
        });

        it('should not render when not installable', () => {
            mockUsePWA.mockReturnValue({
                isInstallable: false,
                promptInstall: mockPromptInstall,
                dismissInstall: mockDismissInstall
            });
            const { container } = render(<InstallPrompt />);

            expect(container.firstChild).toBeNull();
        });

        it('should show install description', () => {
            render(<InstallPrompt />);

            expect(screen.getByText('pwa.install.description')).toBeInTheDocument();
        });

        it('should show install button', () => {
            render(<InstallPrompt />);

            expect(screen.getByText('pwa.install.button')).toBeInTheDocument();
        });

        it('should show cancel button', () => {
            render(<InstallPrompt />);

            expect(screen.getByText('common.cancel')).toBeInTheDocument();
        });

        it('should show close button', () => {
            render(<InstallPrompt />);

            expect(screen.getByRole('button', { name: 'common.close' })).toBeInTheDocument();
        });
    });

    describe('positioning', () => {
        it('should be fixed at bottom center', () => {
            const { container } = render(<InstallPrompt />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('fixed', 'bottom-4', 'left-1/2');
        });

        it('should have high z-index', () => {
            const { container } = render(<InstallPrompt />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('z-50');
        });
    });

    describe('install action', () => {
        it('should call promptInstall when install button is clicked', () => {
            render(<InstallPrompt />);

            fireEvent.click(screen.getByText('pwa.install.button'));

            expect(mockPromptInstall).toHaveBeenCalled();
        });
    });

    describe('dismiss action', () => {
        it('should hide prompt when cancel button is clicked', () => {
            const { container } = render(<InstallPrompt />);

            fireEvent.click(screen.getByText('common.cancel'));

            expect(container.firstChild).toBeNull();
            expect(mockDismissInstall).toHaveBeenCalled();
        });

        it('should hide prompt when close button is clicked', () => {
            const { container } = render(<InstallPrompt />);

            fireEvent.click(screen.getByRole('button', { name: 'common.close' }));

            expect(container.firstChild).toBeNull();
            expect(mockDismissInstall).toHaveBeenCalled();
        });
    });

    describe('persistence', () => {
        it('should not render if previously dismissed', () => {
            localStorage.setItem('pwa-install-dismissed', 'true');

            const { container } = render(<InstallPrompt />);

            expect(container.firstChild).toBeNull();
        });
    });
});
