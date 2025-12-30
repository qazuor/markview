import { IconButton, Tooltip } from '@/components/ui';
import { cn } from '@/utils/cn';
import { FileText, Github, HardDrive, List, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type SidebarSection = 'explorer' | 'toc' | 'search' | 'github' | 'gdrive';

interface SidebarNavProps {
    activeSection: SidebarSection;
    onSectionChange: (section: SidebarSection) => void;
    className?: string;
}

/**
 * Sidebar navigation icons
 */
export function SidebarNav({ activeSection, onSectionChange, className }: SidebarNavProps) {
    const { t } = useTranslation();

    const sections = [
        { id: 'explorer' as const, icon: FileText, labelKey: 'sidebar.explorer' },
        { id: 'toc' as const, icon: List, labelKey: 'sidebar.toc' },
        { id: 'search' as const, icon: Search, labelKey: 'sidebar.search' },
        { id: 'github' as const, icon: Github, labelKey: 'sidebar.github' },
        { id: 'gdrive' as const, icon: HardDrive, labelKey: 'sidebar.gdrive' }
    ];

    return (
        <nav aria-label={t('aria.sidebarSections')} className={cn('flex flex-col items-center gap-1 p-1', className)}>
            {sections.map((section) => {
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
            })}
        </nav>
    );
}
