import welcomeContentEs from '@/assets/welcome-es.md?raw';
import welcomeContentEn from '@/assets/welcome.md?raw';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/DropdownMenu';
import { useDocumentStore } from '@/stores/documentStore';
import { BookOpen, ExternalLink, HelpCircle, Keyboard, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HelpButtonProps {
    onShowShortcuts: () => void;
    onStartTour: () => void;
}

/**
 * Help button with dropdown menu
 */
export function HelpButton({ onShowShortcuts, onStartTour }: HelpButtonProps) {
    const { t, i18n } = useTranslation();
    const createDocument = useDocumentStore((s) => s.createDocument);

    const handleShowWelcome = () => {
        const welcomeContent = i18n.language === 'es' ? welcomeContentEs : welcomeContentEn;
        const title = i18n.language === 'es' ? 'Bienvenido a MarkView' : 'Welcome to MarkView';

        createDocument({
            name: title,
            content: welcomeContent
        });
    };

    const handleShowShortcuts = () => {
        onShowShortcuts();
    };

    const handleRestartTour = () => {
        onStartTour();
    };

    const handleOpenDocs = () => {
        window.open('https://github.com/qazuor/markdown-previewer', '_blank', 'noopener,noreferrer');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
                    aria-label={t('menu.help')}
                >
                    <HelpCircle className="h-5 w-5" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleShowShortcuts}>
                    <Keyboard className="h-4 w-4 mr-2" />
                    <span>{t('help.shortcuts')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleRestartTour}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    <span>{t('help.restartTour')}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleShowWelcome}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{t('help.welcome')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleOpenDocs}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>{t('help.documentation')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
