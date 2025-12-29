import { Modal, ModalFooter } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Code, Eye, Keyboard, ListTree, Search, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (startTour: boolean) => void;
}

const STEPS = ['welcome', 'features', 'shortcuts'] as const;
const TOTAL_STEPS = STEPS.length;

/**
 * Onboarding modal for first-time users
 */
export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSkip = () => {
        onComplete(false);
        onClose();
    };

    const handleStartTour = () => {
        onComplete(true);
        onClose();
    };

    const handleGetStarted = () => {
        onComplete(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleSkip} size="lg">
            <div className="relative">
                {/* Progress indicator */}
                <div className="flex gap-1 mb-6">
                    {STEPS.map((step, index) => (
                        <div
                            key={step}
                            className={cn(
                                'h-1 flex-1 rounded-full transition-colors',
                                index <= currentStep ? 'bg-primary-500' : 'bg-bg-tertiary'
                            )}
                        />
                    ))}
                </div>

                {/* Step 1: Welcome */}
                {currentStep === 0 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30">
                                <Zap className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary">{t('onboarding.welcome.title')}</h2>
                            <p className="text-text-secondary text-lg">{t('onboarding.welcome.subtitle')}</p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-text-primary">{t('onboarding.welcome.description')}</p>

                            <div className="bg-bg-tertiary rounded-lg p-4 space-y-2">
                                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary-500" />
                                    {t('onboarding.welcome.features.title')}
                                </h3>
                                <ul className="space-y-2 text-sm text-text-secondary ml-6">
                                    <li>{t('onboarding.welcome.features.realtime')}</li>
                                    <li>{t('onboarding.welcome.features.syntax')}</li>
                                    <li>{t('onboarding.welcome.features.diagrams')}</li>
                                    <li>{t('onboarding.welcome.features.math')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Key Features */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-3">
                            <h2 className="text-2xl font-bold text-text-primary">{t('onboarding.features.title')}</h2>
                            <p className="text-text-secondary">{t('onboarding.features.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FeatureCard
                                icon={Code}
                                title={t('onboarding.features.editor.title')}
                                description={t('onboarding.features.editor.description')}
                            />
                            <FeatureCard
                                icon={Eye}
                                title={t('onboarding.features.preview.title')}
                                description={t('onboarding.features.preview.description')}
                            />
                            <FeatureCard
                                icon={ListTree}
                                title={t('onboarding.features.toc.title')}
                                description={t('onboarding.features.toc.description')}
                            />
                            <FeatureCard
                                icon={Search}
                                title={t('onboarding.features.search.title')}
                                description={t('onboarding.features.search.description')}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Keyboard Shortcuts */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30">
                                <Keyboard className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary">{t('onboarding.shortcuts.title')}</h2>
                            <p className="text-text-secondary">{t('onboarding.shortcuts.subtitle')}</p>
                        </div>

                        <div className="space-y-3">
                            <ShortcutRow shortcut="Ctrl+B" description={t('onboarding.shortcuts.bold')} />
                            <ShortcutRow shortcut="Ctrl+I" description={t('onboarding.shortcuts.italic')} />
                            <ShortcutRow shortcut="Ctrl+K" description={t('onboarding.shortcuts.link')} />
                            <ShortcutRow shortcut="Ctrl+S" description={t('onboarding.shortcuts.save')} />
                            <ShortcutRow shortcut="Ctrl+/" description={t('onboarding.shortcuts.allShortcuts')} />
                        </div>

                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                            <p className="text-sm text-primary-900 dark:text-primary-100">
                                <strong>{t('onboarding.shortcuts.tip')}:</strong> {t('onboarding.shortcuts.tipText')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <ModalFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="dont-show-again"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="rounded border-border text-primary-500 focus:ring-primary-500"
                        />
                        <label htmlFor="dont-show-again" className="text-sm text-text-secondary cursor-pointer">
                            {t('onboarding.dontShowAgain')}
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4 inline mr-1" />
                                {t('common.previous')}
                            </button>
                        )}

                        {currentStep < TOTAL_STEPS - 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSkip}
                                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {t('onboarding.skip')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors flex items-center gap-1"
                                >
                                    {t('common.next')}
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </>
                        )}

                        {currentStep === TOTAL_STEPS - 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleGetStarted}
                                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {t('onboarding.getStarted')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartTour}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors flex items-center gap-1"
                                >
                                    {t('onboarding.startTour')}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </ModalFooter>
            </div>
        </Modal>
    );
}

interface FeatureCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="bg-bg-tertiary rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary-100 dark:bg-primary-900/30">
                    <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
            </div>
            <p className="text-xs text-text-secondary">{description}</p>
        </div>
    );
}

interface ShortcutRowProps {
    shortcut: string;
    description: string;
}

function ShortcutRow({ shortcut, description }: ShortcutRowProps) {
    return (
        <div className="flex items-center justify-between py-2 px-3 bg-bg-tertiary rounded-md">
            <span className="text-sm text-text-primary">{description}</span>
            <kbd className="px-2 py-1 text-xs font-mono bg-bg-primary border border-border rounded">{shortcut}</kbd>
        </div>
    );
}
