import { FeatureTour } from '@/components/onboarding/FeatureTour';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ArrowRight: () => <span data-testid="icon-arrow-right" />,
    ChevronLeft: () => <span data-testid="icon-chevron-left" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />,
    X: () => <span data-testid="icon-x" />
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('FeatureTour', () => {
    const defaultProps = {
        isActive: true,
        currentStep: 0,
        onNext: vi.fn(),
        onPrevious: vi.fn(),
        onSkip: vi.fn(),
        onComplete: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock getBoundingClientRect for elements
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            top: 100,
            right: 300,
            bottom: 200,
            left: 100,
            toJSON: () => ({})
        }));
    });

    describe('rendering', () => {
        it('should not render when not active', () => {
            render(<FeatureTour {...defaultProps} isActive={false} />);

            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });

        it('should render when active', () => {
            render(<FeatureTour {...defaultProps} />);

            expect(screen.getByText('tour.editor.title')).toBeInTheDocument();
        });

        it('should show step counter', () => {
            render(<FeatureTour {...defaultProps} />);

            expect(screen.getByText(/1 \/ 6/)).toBeInTheDocument();
        });

        it('should show skip button', () => {
            render(<FeatureTour {...defaultProps} />);

            expect(screen.getByText('tour.skip')).toBeInTheDocument();
        });

        it('should show next button on first step', () => {
            render(<FeatureTour {...defaultProps} />);

            expect(screen.getByText('common.next')).toBeInTheDocument();
        });

        it('should not show previous button on first step', () => {
            render(<FeatureTour {...defaultProps} currentStep={0} />);

            expect(screen.queryByLabelText('common.previous')).not.toBeInTheDocument();
        });

        it('should show previous button on subsequent steps', () => {
            render(<FeatureTour {...defaultProps} currentStep={1} />);

            expect(screen.getByLabelText('common.previous')).toBeInTheDocument();
        });

        it('should show finish button on last step', () => {
            render(<FeatureTour {...defaultProps} currentStep={5} />);

            expect(screen.getByText('tour.finish')).toBeInTheDocument();
        });
    });

    describe('tour steps', () => {
        it('should display editor step content', () => {
            render(<FeatureTour {...defaultProps} currentStep={0} />);

            expect(screen.getByText('tour.editor.title')).toBeInTheDocument();
            expect(screen.getByText('tour.editor.description')).toBeInTheDocument();
        });

        it('should display preview step content', () => {
            render(<FeatureTour {...defaultProps} currentStep={1} />);

            expect(screen.getByText('tour.preview.title')).toBeInTheDocument();
            expect(screen.getByText('tour.preview.description')).toBeInTheDocument();
        });

        it('should display toolbar step content', () => {
            render(<FeatureTour {...defaultProps} currentStep={2} />);

            expect(screen.getByText('tour.toolbar.title')).toBeInTheDocument();
        });

        it('should display sidebar step content', () => {
            render(<FeatureTour {...defaultProps} currentStep={3} />);

            expect(screen.getByText('tour.sidebar.title')).toBeInTheDocument();
        });

        it('should display cloud step content', () => {
            render(<FeatureTour {...defaultProps} currentStep={4} />);

            expect(screen.getByText('tour.cloud.title')).toBeInTheDocument();
        });

        it('should display statusbar step content', () => {
            render(<FeatureTour {...defaultProps} currentStep={5} />);

            expect(screen.getByText('tour.statusbar.title')).toBeInTheDocument();
        });
    });

    describe('navigation', () => {
        it('should call onNext when next button is clicked', () => {
            render(<FeatureTour {...defaultProps} currentStep={0} />);

            fireEvent.click(screen.getByText('common.next'));

            expect(defaultProps.onNext).toHaveBeenCalled();
        });

        it('should call onPrevious when previous button is clicked', () => {
            render(<FeatureTour {...defaultProps} currentStep={1} />);

            fireEvent.click(screen.getByLabelText('common.previous'));

            expect(defaultProps.onPrevious).toHaveBeenCalled();
        });

        it('should call onSkip when skip button is clicked', () => {
            render(<FeatureTour {...defaultProps} />);

            fireEvent.click(screen.getByText('tour.skip'));

            expect(defaultProps.onSkip).toHaveBeenCalled();
        });

        it('should call onSkip when close button is clicked', () => {
            render(<FeatureTour {...defaultProps} />);

            fireEvent.click(screen.getByLabelText('common.close'));

            expect(defaultProps.onSkip).toHaveBeenCalled();
        });

        it('should call onComplete on last step finish', () => {
            render(<FeatureTour {...defaultProps} currentStep={5} />);

            fireEvent.click(screen.getByText('tour.finish'));

            expect(defaultProps.onComplete).toHaveBeenCalled();
        });

        it('should not call onNext on last step finish', () => {
            render(<FeatureTour {...defaultProps} currentStep={5} />);

            fireEvent.click(screen.getByText('tour.finish'));

            expect(defaultProps.onNext).not.toHaveBeenCalled();
        });
    });

    describe('overlay', () => {
        it('should render SVG overlay', () => {
            render(<FeatureTour {...defaultProps} />);

            expect(screen.getByTitle('Tour highlight overlay')).toBeInTheDocument();
        });
    });

    describe('step counter', () => {
        it('should show correct step number for step 1', () => {
            render(<FeatureTour {...defaultProps} currentStep={0} />);

            expect(screen.getByText('1 / 6')).toBeInTheDocument();
        });

        it('should show correct step number for step 3', () => {
            render(<FeatureTour {...defaultProps} currentStep={2} />);

            expect(screen.getByText('3 / 6')).toBeInTheDocument();
        });

        it('should show correct step number for last step', () => {
            render(<FeatureTour {...defaultProps} currentStep={5} />);

            expect(screen.getByText('6 / 6')).toBeInTheDocument();
        });
    });

    describe('icons', () => {
        it('should show chevron right icon on next button', () => {
            render(<FeatureTour {...defaultProps} currentStep={0} />);

            expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument();
        });

        it('should show arrow right icon on finish button', () => {
            render(<FeatureTour {...defaultProps} currentStep={5} />);

            expect(screen.getByTestId('icon-arrow-right')).toBeInTheDocument();
        });

        it('should show chevron left icon on previous button', () => {
            render(<FeatureTour {...defaultProps} currentStep={1} />);

            expect(screen.getByTestId('icon-chevron-left')).toBeInTheDocument();
        });

        it('should show X icon for close button', () => {
            render(<FeatureTour {...defaultProps} />);

            expect(screen.getByTestId('icon-x')).toBeInTheDocument();
        });
    });
});
