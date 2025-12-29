import { cn } from '@/utils/cn';
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TourStep {
    id: string;
    target: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface FeatureTourProps {
    isActive: boolean;
    currentStep: number;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    onComplete: () => void;
}

/**
 * Feature tour that highlights UI elements
 */
export function FeatureTour({ isActive, currentStep, onNext, onPrevious, onSkip, onComplete }: FeatureTourProps) {
    const { t } = useTranslation();
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const tourSteps: TourStep[] = [
        {
            id: 'editor',
            target: '[data-tour="editor"]',
            title: t('tour.editor.title'),
            description: t('tour.editor.description'),
            position: 'right'
        },
        {
            id: 'preview',
            target: '[data-tour="preview"]',
            title: t('tour.preview.title'),
            description: t('tour.preview.description'),
            position: 'left'
        },
        {
            id: 'toolbar',
            target: '[data-tour="toolbar"]',
            title: t('tour.toolbar.title'),
            description: t('tour.toolbar.description'),
            position: 'bottom'
        },
        {
            id: 'sidebar',
            target: '[data-tour="sidebar"]',
            title: t('tour.sidebar.title'),
            description: t('tour.sidebar.description'),
            position: 'right'
        },
        {
            id: 'statusbar',
            target: '[data-tour="statusbar"]',
            title: t('tour.statusbar.title'),
            description: t('tour.statusbar.description'),
            position: 'top'
        }
    ];

    const currentTourStep = tourSteps[currentStep];
    const isLastStep = currentStep === tourSteps.length - 1;

    // Update highlight and tooltip position when step changes
    useEffect(() => {
        if (!isActive || !currentTourStep) return;

        const updatePosition = () => {
            const targetElement = document.querySelector(currentTourStep.target);
            if (!targetElement || !tooltipRef.current) return;

            const targetRect = targetElement.getBoundingClientRect();
            setHighlightRect(targetRect);

            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const position = currentTourStep.position || 'bottom';

            let top = 0;
            let left = 0;

            const padding = 16;

            switch (position) {
                case 'top':
                    top = targetRect.top - tooltipRect.height - padding;
                    left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                    break;
                case 'bottom':
                    top = targetRect.bottom + padding;
                    left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                    break;
                case 'left':
                    top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                    left = targetRect.left - tooltipRect.width - padding;
                    break;
                case 'right':
                    top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                    left = targetRect.right + padding;
                    break;
            }

            // Keep tooltip within viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left < padding) left = padding;
            if (left + tooltipRect.width > viewportWidth - padding) {
                left = viewportWidth - tooltipRect.width - padding;
            }

            if (top < padding) top = padding;
            if (top + tooltipRect.height > viewportHeight - padding) {
                top = viewportHeight - tooltipRect.height - padding;
            }

            setTooltipPosition({ top, left });
        };

        // Initial update
        updatePosition();

        // Update on resize and scroll
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isActive, currentTourStep]);

    if (!isActive || !currentTourStep) return null;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            onNext();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 pointer-events-none">
                {/* Dark overlay with cutout */}
                <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                    <title>Tour highlight overlay</title>
                    <defs>
                        <mask id="tour-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {highlightRect && (
                                <rect
                                    x={highlightRect.left - 4}
                                    y={highlightRect.top - 4}
                                    width={highlightRect.width + 8}
                                    height={highlightRect.height + 8}
                                    rx="8"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#tour-mask)" />
                </svg>

                {/* Highlight border */}
                {highlightRect && (
                    <div
                        className="absolute border-2 border-primary-500 rounded-lg animate-pulse"
                        style={{
                            top: highlightRect.top - 4,
                            left: highlightRect.left - 4,
                            width: highlightRect.width + 8,
                            height: highlightRect.height + 8
                        }}
                    />
                )}
            </div>

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="fixed z-50 pointer-events-auto"
                style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left
                }}
            >
                <div className="bg-bg-primary border border-border rounded-lg shadow-xl p-5 max-w-sm animate-in fade-in zoom-in-95 duration-200">
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onSkip}
                        className="absolute top-2 right-2 p-1 text-text-muted hover:text-text-primary transition-colors"
                        aria-label={t('common.close')}
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Content */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-primary-500">
                                {currentStep + 1} / {tourSteps.length}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">{currentTourStep.title}</h3>
                        <p className="text-sm text-text-secondary">{currentTourStep.description}</p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={onSkip}
                            className="text-sm text-text-muted hover:text-text-primary transition-colors"
                        >
                            {t('tour.skip')}
                        </button>

                        <div className="flex items-center gap-2">
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={onPrevious}
                                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
                                    aria-label={t('common.previous')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleNext}
                                className={cn(
                                    'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-1',
                                    'bg-primary-500 hover:bg-primary-600'
                                )}
                            >
                                {isLastStep ? (
                                    <>
                                        {t('tour.finish')}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        {t('common.next')}
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
