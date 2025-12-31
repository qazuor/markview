import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import { ExternalLink, Github, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const APP_VERSION = '0.1.0';
const GITHUB_URL = 'https://github.com/qazuor/markview';

/**
 * About modal showing app information
 */
export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    const { t } = useTranslation();

    const features = [
        t('about.features.editor'),
        t('about.features.preview'),
        t('about.features.github'),
        t('about.features.gdrive'),
        t('about.features.export'),
        t('about.features.pwa')
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('about.title')} size="md">
            <div className="space-y-6">
                {/* Logo and name */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white text-2xl font-bold">
                        MV
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">MarkView</h2>
                    <p className="text-sm text-text-muted">{t('about.tagline')}</p>
                    <p className="text-xs text-text-muted">
                        {t('about.version')} {APP_VERSION}
                    </p>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary text-center">{t('about.description')}</p>

                {/* Features */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-primary">{t('about.featuresTitle')}</h3>
                    <ul className="grid grid-cols-2 gap-2">
                        {features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-xs text-text-secondary">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'CodeMirror'].map((tech) => (
                        <span
                            key={tech}
                            className={cn('px-2 py-1 text-xs rounded-full', 'bg-bg-tertiary text-text-secondary', 'border border-border')}
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Links */}
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-border">
                    <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-md',
                            'text-sm text-text-secondary hover:text-text-primary',
                            'hover:bg-bg-tertiary transition-colors'
                        )}
                    >
                        <Github className="h-4 w-4" />
                        GitHub
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-text-muted space-y-1">
                    <p className="flex items-center justify-center gap-1">
                        {t('about.madeWith')} <Heart className="h-3 w-3 text-red-500 fill-red-500" /> {t('about.by')}{' '}
                        <a
                            href="https://github.com/qazuor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:underline"
                        >
                            qazuor
                        </a>
                    </p>
                    <p>{t('about.license')}</p>
                </div>
            </div>
        </Modal>
    );
}
