import { IconButton, Tooltip } from '@/components/ui';
import type { SidebarSection } from '@/types/ui';
import { cn } from '@/utils/cn';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileExplorer } from './FileExplorer';
import { GitHubExplorer } from './GitHubExplorer';
import { GoogleDriveExplorer } from './GoogleDriveExplorer';
import { SidebarNav } from './SidebarNav';

interface SidebarProps {
    isCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    className?: string;
}

/**
 * Main sidebar with file explorer and cloud integrations
 * TOC and Search have been moved to the floating DocumentPanel
 */
export function Sidebar({ isCollapsed = false, onCollapsedChange, className }: SidebarProps) {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState<SidebarSection>('explorer');

    if (isCollapsed) {
        return (
            <aside
                aria-label={t('aria.sidebarNavigation')}
                className={cn('flex flex-col bg-bg-secondary border-r border-border', className)}
            >
                <SidebarNav activeSection={activeSection} onSectionChange={setActiveSection} />
                <div className="flex-1" />
                <div className="p-1">
                    <Tooltip content={t('sidebar.expandSidebar')} side="right">
                        <IconButton
                            icon={<ChevronLeft className="h-4 w-4 rotate-180" />}
                            label={t('sidebar.expandSidebar')}
                            onClick={() => onCollapsedChange?.(false)}
                        />
                    </Tooltip>
                </div>
            </aside>
        );
    }

    return (
        <aside
            data-tour="sidebar"
            aria-label={t('aria.sidebarNavigation')}
            className={cn('flex bg-bg-secondary border-r border-border', className)}
        >
            {/* Navigation */}
            <SidebarNav activeSection={activeSection} onSectionChange={setActiveSection} className="border-r border-border" />

            {/* Content */}
            <div className="flex-1 flex flex-col w-[200px] max-w-[200px]">
                {/* Section content */}
                <div className="flex-1 overflow-hidden">
                    {activeSection === 'explorer' && <FileExplorer />}
                    {activeSection === 'github' && <GitHubExplorer onFileOpened={() => setActiveSection('explorer')} />}
                    {activeSection === 'gdrive' && <GoogleDriveExplorer onFileOpened={() => setActiveSection('explorer')} />}
                </div>

                {/* Collapse button */}
                <div className="p-2 border-t border-border">
                    <button
                        type="button"
                        onClick={() => onCollapsedChange?.(true)}
                        aria-label={t('sidebar.collapseSidebar')}
                        className={cn(
                            'w-full flex items-center justify-center gap-1 py-1',
                            'text-xs text-text-muted hover:text-text-secondary',
                            'transition-colors'
                        )}
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>{t('sidebar.collapse')}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
