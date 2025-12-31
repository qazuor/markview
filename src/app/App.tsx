import welcomeContentEs from '@/assets/welcome-es.md?raw';
import welcomeContentEn from '@/assets/welcome.md?raw';
import { Header } from '@/components/header';
import { MainLayout } from '@/components/layout';
import {
    AboutModal,
    CommitModal,
    KeyboardShortcutsModal,
    OnboardingModal,
    SettingsModal,
    VersionDiffModal,
    VersionHistoryModal
} from '@/components/modals';
import { FeatureTour } from '@/components/onboarding/FeatureTour';
import { Sidebar } from '@/components/sidebar';
import { StatusBar } from '@/components/statusbar';
import { TabBar } from '@/components/tabs';
import { Toolbar } from '@/components/toolbar';
import { DropOverlay } from '@/components/ui';
import { useDragAndDrop, useFileImport, useGitHubSave, useGoogleDriveSave, useMobile, useOnboarding, useTheme, useZoom } from '@/hooks';
import { usePreviewSync } from '@/hooks/useBroadcastChannel';
import { useDocumentStore, useSettingsStore, useUIStore } from '@/stores';
import { cn } from '@/utils/cn';
import type { EditorView } from '@codemirror/view';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function App() {
    const { t } = useTranslation();
    useTheme();
    useZoom(); // Global zoom keyboard shortcuts and mouse wheel

    const { isMobile } = useMobile();
    const prevIsMobileRef = useRef(isMobile);
    const theme = useSettingsStore((state) => state.theme);

    // Onboarding
    const {
        showOnboarding,
        showTour,
        currentTourStep,
        completeOnboarding,
        completeTour,
        startTour,
        skipTour,
        nextTourStep,
        previousTourStep
    } = useOnboarding();

    const documents = useDocumentStore((state) => state.documents);
    const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
    const createDocument = useDocumentStore((state) => state.createDocument);
    const updateContent = useDocumentStore((state) => state.updateContent);
    const closeDocument = useDocumentStore((state) => state.closeDocument);

    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);
    const zenMode = useUIStore((state) => state.zenMode);
    const toggleZenMode = useUIStore((state) => state.toggleZenMode);
    const setZenMode = useUIStore((state) => state.setZenMode);
    const activeModal = useUIStore((state) => state.activeModal);
    const openModal = useUIStore((state) => state.openModal);
    const closeModal = useUIStore((state) => state.closeModal);
    const setPendingRenameDocumentId = useUIStore((state) => state.setPendingRenameDocumentId);

    const activeDocument = activeDocumentId ? (documents.get(activeDocumentId) ?? null) : null;
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

    // GitHub save hook
    const { showCommitModal, pendingDocument, openCommitModal, closeCommitModal, confirmCommit } = useGitHubSave();

    // Google Drive save hook with auto-save (30 seconds after last edit)
    const { saveToGoogleDrive } = useGoogleDriveSave({
        autoSaveDelay: 30000
    });

    // Refs for preview sync to avoid circular dependencies
    const syncContentRef = useRef<((content: string, theme: 'light' | 'dark') => void) | null>(null);
    const activeContentRef = useRef<string>('');
    const themeRef = useRef(theme);

    // Keep refs updated
    useEffect(() => {
        activeContentRef.current = activeDocument?.content ?? '';
    }, [activeDocument?.content]);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    // Helper to get effective theme
    const getEffectiveTheme = useCallback((): 'light' | 'dark' => {
        const currentTheme = themeRef.current;
        return currentTheme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : currentTheme;
    }, []);

    // Callback for when preview window requests content
    const handleContentRequest = useCallback(() => {
        if (syncContentRef.current && activeContentRef.current) {
            syncContentRef.current(activeContentRef.current, getEffectiveTheme());
        }
    }, [getEffectiveTheme]);

    // Preview sync with content request handler
    const { syncContent } = usePreviewSync(true, handleContentRequest);

    // Store syncContent in ref
    useEffect(() => {
        syncContentRef.current = syncContent;
    }, [syncContent]);

    // Note: Documents are auto-persisted via Zustand persist middleware

    // File import and drag & drop
    const { importFiles, openFileDialog } = useFileImport();
    const handleFileDrop = useCallback(
        (files: FileList) => {
            importFiles(files);
        },
        [importFiles]
    );
    const { isDragging } = useDragAndDrop({ onDrop: handleFileDrop });

    // Create Welcome documents on first visit, or empty document if all documents were closed
    const initialDocCreated = useRef(false);
    useEffect(() => {
        if (documents.size === 0 && !initialDocCreated.current) {
            initialDocCreated.current = true;
            const hasVisitedBefore = localStorage.getItem('markview:hasVisited') !== null;

            if (!hasVisitedBefore) {
                // First visit: create both Welcome documents and mark as visited
                localStorage.setItem('markview:hasVisited', 'true');

                // Create Spanish welcome document
                createDocument({ name: 'Bienvenido a MarkView', content: welcomeContentEs });

                // Create English welcome document (will be active since it's created second)
                createDocument({ name: 'Welcome to MarkView', content: welcomeContentEn });
            } else {
                // Returning user with no documents: create empty document
                createDocument();
            }
        }
    }, [documents.size, createDocument]);

    // Close sidebar when switching to mobile view
    useEffect(() => {
        if (isMobile && !prevIsMobileRef.current) {
            // Just switched to mobile, close sidebar
            setSidebarOpen(false);
        }
        prevIsMobileRef.current = isMobile;
    }, [isMobile, setSidebarOpen]);

    // Sync content with preview windows when content changes
    useEffect(() => {
        if (activeDocument?.content !== undefined) {
            syncContent(activeDocument.content, getEffectiveTheme());
        }
    }, [activeDocument?.content, getEffectiveTheme, syncContent]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;

            // Ctrl+N - New document
            if (isMod && e.key === 'n') {
                e.preventDefault();
                const id = createDocument();
                setPendingRenameDocumentId(id);
                return;
            }

            // Ctrl+S - Save to cloud if it's a cloud file, otherwise just prevent browser dialog
            if (isMod && e.key === 's' && !e.shiftKey) {
                e.preventDefault();
                // If active document is from GitHub, open commit modal
                if (activeDocument?.source === 'github' && activeDocument.githubInfo) {
                    openCommitModal(activeDocument);
                }
                // If active document is from Google Drive, save directly
                else if (activeDocument?.source === 'gdrive' && activeDocument.driveInfo) {
                    saveToGoogleDrive(activeDocument);
                }
                return;
            }

            // Ctrl+W - Close tab
            if (isMod && e.key === 'w') {
                e.preventDefault();
                if (activeDocumentId && documents.size > 1) {
                    closeDocument(activeDocumentId);
                }
                return;
            }

            // Ctrl+B - Toggle sidebar
            if (isMod && e.key === 'b' && !e.shiftKey) {
                e.preventDefault();
                toggleSidebar();
                return;
            }

            // Ctrl+/ or Ctrl+? - Keyboard shortcuts
            if (isMod && (e.key === '/' || e.key === '?')) {
                e.preventDefault();
                openModal('shortcuts');
                return;
            }

            // Ctrl+, - Settings
            if (isMod && e.key === ',') {
                e.preventDefault();
                openModal('settings');
                return;
            }

            // F11 or Ctrl+Shift+Z - Toggle Zen mode
            if (e.key === 'F11' || (isMod && e.shiftKey && e.key.toLowerCase() === 'z')) {
                e.preventDefault();
                toggleZenMode();
                return;
            }

            // Escape - Close modal or exit Zen mode
            if (e.key === 'Escape') {
                e.preventDefault();
                if (activeModal) {
                    closeModal();
                } else if (zenMode) {
                    setZenMode(false);
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        activeDocument,
        activeDocumentId,
        documents.size,
        createDocument,
        setPendingRenameDocumentId,
        closeDocument,
        toggleSidebar,
        openModal,
        closeModal,
        activeModal,
        zenMode,
        toggleZenMode,
        setZenMode,
        openCommitModal,
        saveToGoogleDrive
    ]);

    // Handle editor view ready
    const handleEditorViewReady = useCallback((view: EditorView | null) => {
        setEditorView(view);
    }, []);

    // Navigate to line in editor
    const handleNavigate = useCallback(
        (line: number, column = 1) => {
            if (!editorView) return;

            const doc = editorView.state.doc;
            const lineInfo = doc.line(Math.min(line, doc.lines));
            const pos = lineInfo.from + Math.min(column - 1, lineInfo.length);

            editorView.dispatch({
                selection: { anchor: pos },
                scrollIntoView: true
            });
            editorView.focus();
        },
        [editorView]
    );

    // Handle search/replace
    const handleReplace = useCallback(
        (search: string, replace: string, all: boolean) => {
            if (!editorView || !activeDocument) return;

            const content = activeDocument.content;
            let newContent: string;

            if (all) {
                newContent = content.split(search).join(replace);
            } else {
                newContent = content.replace(search, replace);
            }

            if (newContent !== content) {
                updateContent(activeDocument.id, newContent);
            }
        },
        [editorView, activeDocument, updateContent]
    );

    // Handle version restore
    const handleVersionRestore = useCallback(
        (content: string) => {
            if (!activeDocumentId) return;
            updateContent(activeDocumentId, content);

            // Also update editor
            if (editorView) {
                editorView.dispatch({
                    changes: {
                        from: 0,
                        to: editorView.state.doc.length,
                        insert: content
                    }
                });
            }
        },
        [activeDocumentId, updateContent, editorView]
    );

    // Handle version compare
    const handleVersionCompare = useCallback((versionId: string) => {
        setCompareVersionId(versionId);
    }, []);

    return (
        <div className="flex h-dvh flex-col bg-bg-primary text-text-primary">
            {/* Header with logo and file menu */}
            {!zenMode && <Header onImport={openFileDialog} onStartTour={startTour} className="shrink-0" />}

            {/* Tab bar */}
            {!zenMode && <TabBar className="shrink-0" />}

            {/* Document formatting toolbar */}
            {!zenMode && <Toolbar editorView={editorView} className="shrink-0" />}

            {/* Main content */}
            <main className="flex flex-1 min-h-0 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {isMobile && sidebarOpen && !zenMode && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                            onClick={() => setSidebarOpen(false)}
                            onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
                            role="button"
                            tabIndex={0}
                            aria-label={t('common.close')}
                        />
                        {/* Drawer */}
                        <div
                            className={cn(
                                'fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw]',
                                'bg-bg-secondary shadow-xl',
                                'animate-in slide-in-from-left duration-200'
                            )}
                        >
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'absolute top-2 right-2 p-2 rounded-lg z-10',
                                    'text-text-muted hover:text-text-primary',
                                    'hover:bg-bg-tertiary transition-colors'
                                )}
                                aria-label={t('common.close')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <Sidebar isCollapsed={false} onCollapsedChange={() => setSidebarOpen(false)} className="h-full" />
                        </div>
                    </>
                )}

                {/* Desktop Sidebar */}
                {!isMobile && !zenMode && (
                    <Sidebar
                        isCollapsed={!sidebarOpen}
                        onCollapsedChange={(collapsed) => setSidebarOpen(!collapsed)}
                        className="shrink-0"
                    />
                )}

                {/* Editor and Preview */}
                <MainLayout
                    className="flex-1 min-w-0"
                    onEditorViewReady={handleEditorViewReady}
                    activeLine={activeDocument?.cursor?.line}
                    onNavigate={handleNavigate}
                    onReplace={handleReplace}
                />
            </main>

            {/* Status bar */}
            {!zenMode && (
                <StatusBar
                    line={activeDocument?.cursor?.line}
                    column={activeDocument?.cursor?.column}
                    content={activeDocument?.content}
                    syncStatus={activeDocument?.syncStatus}
                    className="shrink-0"
                />
            )}

            {/* Zen mode exit hint */}
            {zenMode && (
                <button
                    type="button"
                    onClick={() => setZenMode(false)}
                    className="fixed top-4 right-4 z-50 px-3 py-1.5 text-xs text-text-muted bg-bg-secondary/80 backdrop-blur-sm rounded-full opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300"
                    title={`${t('zen.title')} - ESC/F11`}
                >
                    {t('zen.exit')}
                </button>
            )}

            {/* Modals */}
            <OnboardingModal isOpen={showOnboarding} onClose={() => completeOnboarding(false)} onComplete={completeOnboarding} />
            <KeyboardShortcutsModal isOpen={activeModal === 'shortcuts'} onClose={closeModal} />
            <SettingsModal isOpen={activeModal === 'settings'} onClose={closeModal} />
            <AboutModal isOpen={activeModal === 'about'} onClose={closeModal} />

            {activeDocument && (
                <VersionHistoryModal
                    isOpen={activeModal === 'versions'}
                    documentId={activeDocument.id}
                    documentName={activeDocument.name}
                    onClose={closeModal}
                    onRestore={handleVersionRestore}
                    onCompare={handleVersionCompare}
                />
            )}

            {activeDocument && compareVersionId && (
                <VersionDiffModal
                    isOpen={!!compareVersionId}
                    documentId={activeDocument.id}
                    versionId={compareVersionId}
                    currentContent={activeDocument.content}
                    onClose={() => setCompareVersionId(null)}
                />
            )}

            {/* GitHub Commit Modal */}
            {pendingDocument?.githubInfo && (
                <CommitModal
                    isOpen={showCommitModal}
                    onClose={closeCommitModal}
                    onCommit={confirmCommit}
                    fileName={pendingDocument.name}
                    repoName={`${pendingDocument.githubInfo.owner}/${pendingDocument.githubInfo.repo}`}
                    branch={pendingDocument.githubInfo.branch}
                    filePath={pendingDocument.githubInfo.path}
                />
            )}

            {/* Drag & drop overlay */}
            <DropOverlay isVisible={isDragging} />

            {/* Feature Tour */}
            <FeatureTour
                isActive={showTour}
                currentStep={currentTourStep}
                onNext={nextTourStep}
                onPrevious={previousTourStep}
                onSkip={skipTour}
                onComplete={completeTour}
            />
        </div>
    );
}
