import welcomeContentEs from '@/assets/welcome-es.md?raw';
import welcomeContentEn from '@/assets/welcome.md?raw';
import { UserMenu } from '@/components/auth';
import { ExportOverlay } from '@/components/ui/ExportOverlay';
import { useMobile, useTheme } from '@/hooks';
import { renderMarkdown } from '@/services/markdown';
import { useDocumentStore } from '@/stores/documentStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import type { PreviewStyle } from '@/types/settings';
import { cn } from '@/utils/cn';
import {
    BookOpen,
    Check,
    ChevronDown,
    Columns2,
    Download,
    ExternalLink,
    FileCode,
    FilePlus,
    FileText,
    FileType,
    FolderOpen,
    Image,
    Info,
    Keyboard,
    Menu,
    Minus,
    Moon,
    Palette,
    PanelLeft,
    PanelRight,
    Plus,
    RotateCcw,
    Settings,
    Sun
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    onImport?: () => void;
    onStartTour: () => void;
    className?: string;
}

type ExportFormat = 'markdown' | 'html' | 'pdf' | 'png' | 'jpeg';

interface MenuItem {
    id: string;
    icon?: React.ComponentType<{ className?: string }>;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    type?: 'separator' | 'submenu';
    children?: MenuItem[];
}

export function Header({ onImport, onStartTour, className }: HeaderProps) {
    const { t, i18n } = useTranslation();
    const { isMobile } = useMobile();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportingFormat, setExportingFormat] = useState<'pdf' | 'png' | 'jpeg' | null>(null);
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const previewWindowRef = useRef<Window | null>(null);
    const styleDropdownRef = useRef<HTMLDivElement>(null);

    const createDocument = useDocumentStore((s) => s.createDocument);
    const activeDocumentId = useDocumentStore((s) => s.activeDocumentId);
    const documents = useDocumentStore((s) => s.documents);
    const currentDocument = activeDocumentId ? documents.get(activeDocumentId) : null;

    const openModal = useUIStore((s) => s.openModal);
    const setViewMode = useUIStore((s) => s.setViewMode);
    const toggleSidebar = useUIStore((s) => s.toggleSidebar);
    const setPendingRenameDocumentId = useUIStore((s) => s.setPendingRenameDocumentId);
    const { isDark, setTheme } = useTheme();
    const previewStyle = useSettingsStore((s) => s.previewStyle);
    const setPreviewStyle = useSettingsStore((s) => s.setPreviewStyle);
    const zoomIn = useSettingsStore((s) => s.zoomIn);
    const zoomOut = useSettingsStore((s) => s.zoomOut);
    const resetZoom = useSettingsStore((s) => s.resetZoom);
    const getZoomPercentage = useSettingsStore((s) => s.getZoomPercentage);

    const closeMenu = useCallback(() => setActiveMenu(null), []);

    // Preview style options
    const previewStyles: { value: PreviewStyle; label: string }[] = [
        { value: 'github', label: 'GitHub' },
        { value: 'gitlab', label: 'GitLab' },
        { value: 'notion', label: 'Notion' },
        { value: 'obsidian', label: 'Obsidian' },
        { value: 'stackoverflow', label: 'Stack Overflow' },
        { value: 'devto', label: 'Dev.to' }
    ];

    // Toggle theme between light and dark
    const handleToggleTheme = useCallback(() => {
        const newTheme = isDark ? 'light' : 'dark';
        setTheme(newTheme);
    }, [isDark, setTheme]);

    // Handle preview style change
    const handlePreviewStyleChange = useCallback(
        (style: PreviewStyle) => {
            setPreviewStyle(style);
            setIsStyleDropdownOpen(false);
        },
        [setPreviewStyle]
    );

    // Close style dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
                setIsStyleDropdownOpen(false);
            }
        };

        if (isStyleDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isStyleDropdownOpen]);

    const handleNewDocument = useCallback(() => {
        const id = createDocument();
        setPendingRenameDocumentId(id);
        closeMenu();
    }, [createDocument, setPendingRenameDocumentId, closeMenu]);

    const handleImport = useCallback(() => {
        onImport?.();
        closeMenu();
    }, [onImport, closeMenu]);

    const handleSettings = useCallback(() => {
        openModal('settings');
        closeMenu();
    }, [openModal, closeMenu]);

    const handleShortcuts = useCallback(() => {
        openModal('shortcuts');
        closeMenu();
    }, [openModal, closeMenu]);

    const handleShowWelcome = useCallback(() => {
        const welcomeContent = i18n.language === 'es' ? welcomeContentEs : welcomeContentEn;
        const title = i18n.language === 'es' ? 'Bienvenido a MarkView' : 'Welcome to MarkView';
        createDocument({
            name: title,
            content: welcomeContent
        });
        closeMenu();
    }, [i18n.language, createDocument, closeMenu]);

    const handleRestartTour = useCallback(() => {
        onStartTour();
        closeMenu();
    }, [onStartTour, closeMenu]);

    const handleOpenDocs = useCallback(() => {
        window.open('https://github.com/qazuor/markview', '_blank', 'noopener,noreferrer');
        closeMenu();
    }, [closeMenu]);

    const handleAbout = useCallback(() => {
        openModal('about');
        closeMenu();
    }, [openModal, closeMenu]);

    const handleOpenPreviewWindow = useCallback(() => {
        const previewUrl = `${window.location.origin}${window.location.pathname}?preview`;
        const newWindow = window.open(previewUrl, 'markview-preview', 'width=800,height=600,menubar=no,toolbar=no,location=no,status=no');
        previewWindowRef.current = newWindow;
        // Auto-collapse preview to show editor full-width when opening preview in new window
        setViewMode('editor');
        closeMenu();
    }, [setViewMode, closeMenu]);

    // Monitor preview window close to restore split view
    useEffect(() => {
        const checkWindowClosed = setInterval(() => {
            if (previewWindowRef.current?.closed) {
                previewWindowRef.current = null;
                setViewMode('split');
            }
        }, 500);

        return () => clearInterval(checkWindowClosed);
    }, [setViewMode]);

    const handleSetViewMode = useCallback(
        (mode: 'split' | 'editor' | 'preview') => {
            setViewMode(mode);
            closeMenu();
        },
        [setViewMode, closeMenu]
    );

    const handleZoomIn = useCallback(() => {
        zoomIn();
        closeMenu();
    }, [zoomIn, closeMenu]);

    const handleZoomOut = useCallback(() => {
        zoomOut();
        closeMenu();
    }, [zoomOut, closeMenu]);

    const handleResetZoom = useCallback(() => {
        resetZoom();
        closeMenu();
    }, [resetZoom, closeMenu]);

    const handleExport = useCallback(
        async (format: ExportFormat) => {
            if (!currentDocument || isExporting) return;

            setIsExporting(true);
            closeMenu();

            // Set exporting format for overlay (only for server-side exports)
            if (format === 'pdf' || format === 'png' || format === 'jpeg') {
                setExportingFormat(format);
            }

            try {
                const filename = currentDocument.name || 'document';
                const exportTheme = isDark ? 'dark' : 'light';

                if (format === 'markdown') {
                    // Client-side: works fine
                    const { downloadMarkdown } = await import('@/services/export');
                    downloadMarkdown(currentDocument.content, filename);
                } else if (format === 'html') {
                    // Client-side: works fine
                    const { exportHtml } = await import('@/services/export');
                    const htmlContent = await renderMarkdown(currentDocument.content, exportTheme);
                    exportHtml(htmlContent, filename, { theme: exportTheme });
                } else if (format === 'pdf' || format === 'png' || format === 'jpeg') {
                    // Server-side: use Puppeteer on Vercel
                    const { wrapHtmlForExport } = await import('@/services/export');
                    const { saveAs } = await import('file-saver');

                    const htmlContent = await renderMarkdown(currentDocument.content, exportTheme);
                    const wrappedHtml = wrapHtmlForExport(htmlContent, {
                        title: filename,
                        theme: exportTheme
                    });

                    const response = await fetch(`/api/export/${format}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            html: wrappedHtml,
                            filename,
                            options: format === 'pdf' ? { pageSize: 'A4' } : { quality: 90 }
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json().catch(() => ({ error: 'Export failed' }));
                        throw new Error(error.error || 'Export failed');
                    }

                    const blob = await response.blob();
                    const extension = format === 'jpeg' ? 'jpg' : format;
                    saveAs(blob, `${filename}.${extension}`);
                }
            } catch (error) {
                console.error(`Export to ${format} failed:`, error);
            } finally {
                setIsExporting(false);
                setExportingFormat(null);
            }
        },
        [currentDocument, isExporting, isDark, closeMenu]
    );

    const fileMenuItems: MenuItem[] = [
        { id: 'new', icon: FilePlus, label: t('common.new'), shortcut: 'Ctrl+N', onClick: handleNewDocument },
        { id: 'import', icon: FolderOpen, label: t('common.import'), onClick: handleImport },
        { id: 'sep-1', type: 'separator', label: '' },
        {
            id: 'export',
            icon: Download,
            label: t('common.export'),
            type: 'submenu',
            children: [
                { id: 'export-md', icon: FileText, label: t('export.markdown'), onClick: () => handleExport('markdown') },
                { id: 'export-html', icon: FileCode, label: t('export.html'), onClick: () => handleExport('html') },
                { id: 'export-pdf', icon: FileType, label: t('export.pdf'), onClick: () => handleExport('pdf') },
                { id: 'export-png', icon: Image, label: t('export.png'), onClick: () => handleExport('png') },
                { id: 'export-jpeg', icon: Image, label: t('export.jpeg'), onClick: () => handleExport('jpeg') }
            ]
        },
        { id: 'sep-2', type: 'separator', label: '' },
        { id: 'settings', icon: Settings, label: t('common.settings'), shortcut: 'Ctrl+,', onClick: handleSettings },
        { id: 'shortcuts', icon: Keyboard, label: t('shortcuts.title'), shortcut: 'Ctrl+/', onClick: handleShortcuts }
    ];

    const viewMenuItems: MenuItem[] = [
        {
            id: 'view-editor',
            icon: PanelLeft,
            label: t('layout.showEditor'),
            onClick: () => handleSetViewMode('editor')
        },
        {
            id: 'view-split',
            icon: Columns2,
            label: t('layout.splitView'),
            onClick: () => handleSetViewMode('split')
        },
        {
            id: 'view-preview',
            icon: PanelRight,
            label: t('layout.showPreview'),
            onClick: () => handleSetViewMode('preview')
        },
        { id: 'sep-view', type: 'separator', label: '' },
        {
            id: 'zoom-in',
            icon: Plus,
            label: `${t('zoom.zoomIn')} (${getZoomPercentage()}%)`,
            shortcut: 'Ctrl++',
            onClick: handleZoomIn
        },
        {
            id: 'zoom-out',
            icon: Minus,
            label: t('zoom.zoomOut'),
            shortcut: 'Ctrl+-',
            onClick: handleZoomOut
        },
        {
            id: 'reset-zoom',
            icon: RotateCcw,
            label: t('zoom.resetZoom'),
            shortcut: 'Ctrl+0',
            onClick: handleResetZoom
        },
        { id: 'sep-view-2', type: 'separator', label: '' },
        {
            id: 'preview-window',
            icon: ExternalLink,
            label: t('preview.openInNewWindow'),
            onClick: handleOpenPreviewWindow
        }
    ];

    const helpMenuItems: MenuItem[] = [
        { id: 'shortcuts-help', icon: Keyboard, label: t('help.shortcuts'), onClick: handleShortcuts },
        { id: 'restart-tour', icon: RotateCcw, label: t('help.restartTour'), onClick: handleRestartTour },
        { id: 'sep-1', type: 'separator', label: '' },
        { id: 'welcome', icon: BookOpen, label: t('help.welcome'), onClick: handleShowWelcome },
        { id: 'documentation', icon: ExternalLink, label: t('help.documentation'), onClick: handleOpenDocs },
        { id: 'sep-2', type: 'separator', label: '' },
        { id: 'about', icon: Info, label: t('help.about'), onClick: handleAbout }
    ];

    const renderMenuItem = (item: MenuItem, isSubmenu = false) => {
        if (item.type === 'separator') {
            return <hr key={item.id} className="my-1 border-t border-border" />;
        }

        if (item.type === 'submenu' && item.children) {
            return (
                <div key={item.id} className="relative group">
                    <button
                        type="button"
                        role="menuitem"
                        aria-haspopup="menu"
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
                            'hover:bg-bg-hover transition-colors duration-150'
                        )}
                    >
                        {item.icon && <item.icon className="h-4 w-4 text-text-muted" aria-hidden="true" />}
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown className="h-3 w-3 text-text-muted -rotate-90" aria-hidden="true" />
                    </button>
                    <div
                        role="menu"
                        aria-label={item.label}
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
                role="menuitem"
                onClick={item.onClick}
                disabled={isExporting && item.id.startsWith('export')}
                className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
                    'hover:bg-bg-hover transition-colors duration-150',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
            >
                {item.icon && <item.icon className="h-4 w-4 text-text-muted" aria-hidden="true" />}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && !isSubmenu && <span className="text-xs text-text-muted">{item.shortcut}</span>}
            </button>
        );
    };

    const renderMenu = (id: string, label: string, items: MenuItem[]) => {
        const isOpen = activeMenu === id;
        const menuId = `menu-${id}`;

        return (
            <div className="relative">
                <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? menuId : undefined}
                    onClick={() => setActiveMenu(isOpen ? null : id)}
                    className={cn('px-3 py-1 text-sm rounded', 'hover:bg-bg-hover transition-colors duration-150', isOpen && 'bg-bg-hover')}
                >
                    {label}
                </button>

                {isOpen && (
                    <div
                        id={menuId}
                        role="menu"
                        aria-label={label}
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
            {/* Mobile hamburger menu */}
            {isMobile && (
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className={cn(
                        'p-2 -ml-1 rounded-lg',
                        'text-text-secondary hover:text-text-primary',
                        'hover:bg-bg-tertiary active:bg-bg-tertiary',
                        'transition-colors touch-manipulation'
                    )}
                    aria-label={t('common.menu')}
                >
                    <Menu className="h-5 w-5" />
                </button>
            )}

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

            {/* Menu bar - hidden on mobile */}
            <nav aria-label={t('aria.mainMenu')} className="hidden sm:flex items-center gap-0.5 ml-2" role="menubar">
                {renderMenu('file', t('menu.file') || 'File', fileMenuItems)}
                {renderMenu('view', t('menu.view') || 'View', viewMenuItems)}
                {renderMenu('help', t('menu.help') || 'Help', helpMenuItems)}
            </nav>

            {/* Mobile quick actions */}
            {isMobile && (
                <div className="flex items-center gap-1 ml-auto">
                    <button
                        type="button"
                        onClick={handleSettings}
                        className={cn(
                            'p-2 rounded-lg',
                            'text-text-secondary hover:text-text-primary',
                            'hover:bg-bg-tertiary active:bg-bg-tertiary',
                            'transition-colors touch-manipulation'
                        )}
                        aria-label={t('common.settings')}
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Spacer - only on desktop */}
            {!isMobile && <div className="flex-1" />}

            {/* Quick access controls - desktop only */}
            {!isMobile && (
                <div className="flex items-center gap-1 mr-2">
                    {/* Theme toggle */}
                    <button
                        type="button"
                        onClick={handleToggleTheme}
                        className={cn(
                            'p-2 rounded-lg',
                            'text-text-secondary hover:text-text-primary',
                            'hover:bg-bg-tertiary active:bg-bg-tertiary',
                            'transition-colors'
                        )}
                        aria-label={isDark ? t('settings.themeLight') : t('settings.themeDark')}
                        title={isDark ? t('settings.themeLight') : t('settings.themeDark')}
                    >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>

                    {/* Preview style selector */}
                    <div ref={styleDropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                            className={cn(
                                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg',
                                'text-text-secondary hover:text-text-primary',
                                'hover:bg-bg-tertiary active:bg-bg-tertiary',
                                'transition-colors text-sm',
                                isStyleDropdownOpen && 'bg-bg-tertiary'
                            )}
                            aria-label={t('settings.previewStyle')}
                            aria-expanded={isStyleDropdownOpen}
                            aria-haspopup="listbox"
                        >
                            <Palette className="h-4 w-4" />
                            <span className="hidden lg:inline">{previewStyles.find((s) => s.value === previewStyle)?.label}</span>
                            <ChevronDown className={cn('h-3 w-3 transition-transform', isStyleDropdownOpen && 'rotate-180')} />
                        </button>

                        {isStyleDropdownOpen && (
                            <div
                                className={cn(
                                    'absolute top-full right-0 mt-1 z-50',
                                    'min-w-[160px] py-1',
                                    'bg-bg-primary border border-border rounded-lg shadow-lg',
                                    'animate-in fade-in slide-in-from-top-2 duration-150'
                                )}
                            >
                                {previewStyles.map((style) => (
                                    <button
                                        key={style.value}
                                        type="button"
                                        onClick={() => handlePreviewStyleChange(style.value)}
                                        className={cn(
                                            'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                                            'hover:bg-bg-hover transition-colors duration-150',
                                            previewStyle === style.value && 'text-primary-500'
                                        )}
                                    >
                                        <span className="flex-1">{style.label}</span>
                                        {previewStyle === style.value && <Check className="h-4 w-4" aria-hidden="true" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* User menu */}
            <UserMenu />

            {/* Backdrop */}
            {activeMenu && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop is purely visual
                <div className="fixed inset-0 z-40" onClick={closeMenu} />
            )}

            {/* Export loading overlay */}
            <ExportOverlay isVisible={isExporting && exportingFormat !== null} format={exportingFormat} />
        </header>
    );
}
