import { MainLayout } from '@/components/layout';
import { KeyboardShortcutsModal, SettingsModal, VersionDiffModal, VersionHistoryModal } from '@/components/modals';
import { Sidebar } from '@/components/sidebar';
import { StatusBar } from '@/components/statusbar';
import { TabBar } from '@/components/tabs';
import { Toolbar } from '@/components/toolbar';
import { DropOverlay } from '@/components/ui';
import { useAutoSave, useDragAndDrop, useFileImport, useTheme } from '@/hooks';
import { useDocumentStore, useUIStore } from '@/stores';
import type { EditorView } from '@codemirror/view';
import { useCallback, useEffect, useState } from 'react';

export function App() {
    useTheme();

    const documents = useDocumentStore((state) => state.documents);
    const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
    const createDocument = useDocumentStore((state) => state.createDocument);
    const updateContent = useDocumentStore((state) => state.updateContent);
    const closeDocument = useDocumentStore((state) => state.closeDocument);

    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);
    const activeModal = useUIStore((state) => state.activeModal);
    const openModal = useUIStore((state) => state.openModal);
    const closeModal = useUIStore((state) => state.closeModal);

    const activeDocument = activeDocumentId ? (documents.get(activeDocumentId) ?? null) : null;
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

    // Auto-save
    const { isSaving, save } = useAutoSave(activeDocument);

    // File import and drag & drop
    const { importFiles } = useFileImport();
    const handleFileDrop = useCallback(
        (files: FileList) => {
            importFiles(files);
        },
        [importFiles]
    );
    const { isDragging } = useDragAndDrop({ onDrop: handleFileDrop });

    // Create initial document if none exists
    useEffect(() => {
        if (documents.size === 0) {
            createDocument();
        }
    }, [documents.size, createDocument]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;

            // Ctrl+N - New document
            if (isMod && e.key === 'n') {
                e.preventDefault();
                createDocument();
                return;
            }

            // Ctrl+S - Save
            if (isMod && e.key === 's' && !e.shiftKey) {
                e.preventDefault();
                save();
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

            // Escape - Close modal
            if (e.key === 'Escape' && activeModal) {
                e.preventDefault();
                closeModal();
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeDocumentId, documents.size, createDocument, closeDocument, toggleSidebar, openModal, closeModal, activeModal, save]);

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
        <div className="flex h-screen flex-col bg-bg-primary text-text-primary">
            {/* Tab bar */}
            <TabBar className="shrink-0" />

            {/* Toolbar */}
            <Toolbar editorView={editorView} className="shrink-0" />

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    content={activeDocument?.content}
                    activeLine={activeDocument?.cursor?.line}
                    onNavigate={handleNavigate}
                    onReplace={handleReplace}
                    isCollapsed={!sidebarOpen}
                    onCollapsedChange={(collapsed) => setSidebarOpen(!collapsed)}
                    className="shrink-0"
                />

                {/* Editor and Preview */}
                <MainLayout className="flex-1" onEditorViewReady={handleEditorViewReady} />
            </div>

            {/* Status bar */}
            <StatusBar
                line={activeDocument?.cursor?.line}
                column={activeDocument?.cursor?.column}
                content={activeDocument?.content}
                isModified={activeDocument?.isModified}
                isSaving={isSaving}
                className="shrink-0"
            />

            {/* Modals */}
            <KeyboardShortcutsModal isOpen={activeModal === 'shortcuts'} onClose={closeModal} />
            <SettingsModal isOpen={activeModal === 'settings'} onClose={closeModal} />

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

            {/* Drag & drop overlay */}
            <DropOverlay isVisible={isDragging} />
        </div>
    );
}
