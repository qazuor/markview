import { IconButton, Tooltip } from '@/components/ui';
import { cn } from '@/utils/cn';
import { FileText, List, Search } from 'lucide-react';

export type SidebarSection = 'explorer' | 'toc' | 'search';

interface SidebarNavProps {
    activeSection: SidebarSection;
    onSectionChange: (section: SidebarSection) => void;
    className?: string;
}

const sections = [
    { id: 'explorer' as const, icon: FileText, label: 'Explorer' },
    { id: 'toc' as const, icon: List, label: 'Table of Contents' },
    { id: 'search' as const, icon: Search, label: 'Search' }
];

/**
 * Sidebar navigation icons
 */
export function SidebarNav({ activeSection, onSectionChange, className }: SidebarNavProps) {
    return (
        <nav aria-label="Sidebar sections" className={cn('flex flex-col items-center gap-1 p-1', className)}>
            {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                    <Tooltip key={section.id} content={section.label} side="right">
                        <IconButton
                            icon={<Icon className="h-5 w-5" />}
                            label={section.label}
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
