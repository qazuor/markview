import { IconButton, Tooltip } from '@/components/ui';
import type { SidebarSection } from '@/types/ui';
import { cn } from '@/utils/cn';
import { FileText, Github, HardDrive } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SidebarNavProps {
    activeSection: SidebarSection;
    onSectionChange: (section: SidebarSection) => void;
    className?: string;
}

/**
 * Sidebar navigation icons for file management
 * TOC and Search have been moved to the floating DocumentPanel
 */
export function SidebarNav({ activeSection, onSectionChange, className }: SidebarNavProps) {
    const { t } = useTranslation();

    const mainSections: { id: SidebarSection; icon: typeof FileText; labelKey: string }[] = [
        { id: 'explorer', icon: FileText, labelKey: 'sidebar.explorer' }
    ];

    const cloudSections: { id: SidebarSection; icon: typeof Github; labelKey: string }[] = [
        { id: 'github', icon: Github, labelKey: 'sidebar.github' },
        { id: 'gdrive', icon: HardDrive, labelKey: 'sidebar.gdrive' }
    ];

    const renderNavButton = (section: { id: SidebarSection; icon: typeof FileText; labelKey: string }) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        const label = t(section.labelKey);

        return (
            <Tooltip key={section.id} content={label} side="right">
                <IconButton
                    icon={<Icon className="h-5 w-5" />}
                    label={label}
                    onClick={() => onSectionChange(section.id)}
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(isActive && 'bg-bg-tertiary text-primary-500')}
                />
            </Tooltip>
        );
    };

    return (
        <nav aria-label={t('aria.sidebarSections')} className={cn('flex flex-col items-center gap-1 p-1', className)}>
            {mainSections.map(renderNavButton)}

            {/* Cloud integrations */}
            <div data-tour="cloud" className="flex flex-col items-center gap-1 mt-2 pt-2 border-t border-border">
                {cloudSections.map(renderNavButton)}
            </div>
        </nav>
    );
}
