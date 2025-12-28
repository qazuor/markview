import { renderMarkdown } from '@/services/markdown';
import { useDocumentStore } from '@/stores/documentStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { ChevronDown, Download, FileCode, FilePlus, FileText, FileType, FolderOpen, Info, Keyboard, Save, Settings } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    onImport?: () => void;
    onSave?: () => void;
    className?: string;
}

type ExportFormat = 'markdown' | 'html' | 'pdf';

interface MenuItem {
    id: string;
    icon?: React.ComponentType<{ className?: string }>;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    type?: 'separator' | 'submenu';
    children?: MenuItem[];
}

export function Header({ onImport, onSave, className }: HeaderProps) {
    const { t } = useTranslation();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const createDocument = useDocumentStore((s) => s.createDocument);
    const activeDocumentId = useDocumentStore((s) => s.activeDocumentId);
    const documents = useDocumentStore((s) => s.documents);
    const currentDocument = activeDocumentId ? documents.get(activeDocumentId) : null;

    const openModal = useUIStore((s) => s.openModal);
    const theme = useSettingsStore((s) => s.theme);

    const closeMenu = useCallback(() => setActiveMenu(null), []);

    const handleNewDocument = useCallback(() => {
        createDocument();
        closeMenu();
    }, [createDocument, closeMenu]);

    const handleImport = useCallback(() => {
        onImport?.();
        closeMenu();
    }, [onImport, closeMenu]);

    const handleSave = useCallback(() => {
        onSave?.();
        closeMenu();
    }, [onSave, closeMenu]);

    const handleSettings = useCallback(() => {
        openModal('settings');
        closeMenu();
    }, [openModal, closeMenu]);

    const handleShortcuts = useCallback(() => {
        openModal('shortcuts');
        closeMenu();
    }, [openModal, closeMenu]);

    const handleExport = useCallback(
        async (format: ExportFormat) => {
            if (!currentDocument || isExporting) return;

            setIsExporting(true);
            closeMenu();

            try {
                const filename = currentDocument.name || 'document';
                const exportTheme = theme === 'dark' ? 'dark' : 'light';

                if (format === 'markdown') {
                    const { downloadMarkdown } = await import('@/services/export');
                    downloadMarkdown(currentDocument.content, filename);
                } else if (format === 'html') {
                    const { exportHtml } = await import('@/services/export');
                    const htmlContent = await renderMarkdown(currentDocument.content, exportTheme);
                    exportHtml(htmlContent, filename, { theme: exportTheme });
                } else if (format === 'pdf') {
                    const { exportToPdf } = await import('@/services/export');
                    const htmlContent = await renderMarkdown(currentDocument.content, exportTheme);
                    await exportToPdf(htmlContent, {
                        filename,
                        theme: exportTheme
                    });
                }
            } catch (error) {
                console.error(`Export to ${format} failed:`, error);
            } finally {
                setIsExporting(false);
            }
        },
        [currentDocument, isExporting, theme, closeMenu]
    );

    const fileMenuItems: MenuItem[] = [
        { id: 'new', icon: FilePlus, label: t('common.new'), shortcut: 'Ctrl+N', onClick: handleNewDocument },
        { id: 'import', icon: FolderOpen, label: t('common.import'), onClick: handleImport },
        { id: 'save', icon: Save, label: t('common.save'), shortcut: 'Ctrl+S', onClick: handleSave },
        { id: 'sep-1', type: 'separator', label: '' },
        {
            id: 'export',
            icon: Download,
            label: t('common.export'),
            type: 'submenu',
            children: [
                { id: 'export-md', icon: FileText, label: t('export.markdown'), onClick: () => handleExport('markdown') },
                { id: 'export-html', icon: FileCode, label: t('export.html'), onClick: () => handleExport('html') },
                { id: 'export-pdf', icon: FileType, label: t('export.pdf'), onClick: () => handleExport('pdf') }
            ]
        },
        { id: 'sep-2', type: 'separator', label: '' },
        { id: 'settings', icon: Settings, label: t('common.settings'), shortcut: 'Ctrl+,', onClick: handleSettings },
        { id: 'shortcuts', icon: Keyboard, label: t('shortcuts.title'), shortcut: 'Ctrl+/', onClick: handleShortcuts }
    ];

    const helpMenuItems: MenuItem[] = [
        { id: 'shortcuts-help', icon: Keyboard, label: t('shortcuts.title'), onClick: handleShortcuts },
        { id: 'sep-1', type: 'separator', label: '' },
        { id: 'about', icon: Info, label: t('common.about') || 'About' }
    ];

    const renderMenuItem = (item: MenuItem, isSubmenu = false) => {
        if (item.type === 'separator') {
            return <div key={item.id} className="my-1 border-t border-border" />;
        }

        if (item.type === 'submenu' && item.children) {
            return (
                <div key={item.id} className="relative group">
                    <button
                        type="button"
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
                            'hover:bg-bg-hover transition-colors duration-150'
                        )}
                    >
                        {item.icon && <item.icon className="h-4 w-4 text-text-muted" />}
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown className="h-3 w-3 text-text-muted -rotate-90" />
                    </button>
                    <div
                        className={cn(
                            'absolute left-full top-0 ml-1',
                            'min-w-[160px] py-1',
                            'bg-bg-primary border border-border rounded-lg shadow-lg',
                            'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                            'transition-all duration-150'
                        )}
                    >
                        {item.children.map((child) => renderMenuItem(child, true))}
                    </div>
                </div>
            );
        }

        return (
            <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                disabled={isExporting && item.id.startsWith('export')}
                className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
                    'hover:bg-bg-hover transition-colors duration-150',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
            >
                {item.icon && <item.icon className="h-4 w-4 text-text-muted" />}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && !isSubmenu && <span className="text-xs text-text-muted">{item.shortcut}</span>}
            </button>
        );
    };

    const renderMenu = (id: string, label: string, items: MenuItem[]) => {
        const isOpen = activeMenu === id;

        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setActiveMenu(isOpen ? null : id)}
                    className={cn('px-3 py-1 text-sm rounded', 'hover:bg-bg-hover transition-colors duration-150', isOpen && 'bg-bg-hover')}
                >
                    {label}
                </button>

                {isOpen && (
                    <div
                        className={cn(
                            'absolute top-full left-0 mt-1 z-50',
                            'min-w-[200px] py-1',
                            'bg-bg-primary border border-border rounded-lg shadow-lg',
                            'animate-in fade-in slide-in-from-top-2 duration-150'
                        )}
                    >
                        {items.map((item) => renderMenuItem(item))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <header ref={menuRef} className={cn('flex items-center gap-1 px-2 h-10', 'bg-bg-secondary border-b border-border', className)}>
            {/* Logo and App Name */}
            <div className="flex items-center gap-2 px-2">
                <div
                    className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center',
                        'bg-gradient-to-br from-primary-500 to-primary-600',
                        'text-white font-bold text-sm'
                    )}
                >
                    Q
                </div>
                <span className="font-semibold text-text-primary hidden sm:inline">{t('app.name')}</span>
                <span className="text-xs text-text-muted hidden md:inline">{t('app.version')}</span>
            </div>

            {/* Menu bar */}
            <nav className="flex items-center gap-0.5 ml-2">
                {renderMenu('file', t('menu.file') || 'File', fileMenuItems)}
                {renderMenu('help', t('menu.help') || 'Help', helpMenuItems)}
            </nav>

            {/* Backdrop */}
            {activeMenu && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop is purely visual
                <div className="fixed inset-0 z-40" onClick={closeMenu} />
            )}
        </header>
    );
}
