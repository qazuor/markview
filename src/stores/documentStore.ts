import type { Document, Version } from '@/types';
import { extractHeading, sanitizeFilename } from '@/utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface DocumentState {
    documents: Map<string, Document>;
    activeDocumentId: string | null;
    versions: Map<string, Version[]>;

    // Document operations
    createDocument: () => string;
    openDocument: (id: string) => void;
    closeDocument: (id: string) => void;
    updateContent: (id: string, content: string) => void;
    renameDocument: (id: string, name: string, isManual?: boolean) => void;
    deleteDocument: (id: string) => void;

    // Getters
    getActiveDocument: () => Document | null;
    getDocument: (id: string) => Document | undefined;

    // Version history
    saveVersion: (id: string, label?: string) => void;
    getVersions: (id: string) => Version[];
    restoreVersion: (id: string, versionId: string) => void;
    deleteVersion: (id: string, versionId: string) => void;

    // State
    markAsSaved: (id: string) => void;
    updateCursor: (id: string, line: number, column: number) => void;
    updateScroll: (id: string, line: number, percentage: number) => void;
}

const generateId = () => crypto.randomUUID();

const createEmptyDocument = (): Document => ({
    id: generateId(),
    name: 'Untitled',
    content: '',
    isModified: false,
    isManuallyNamed: false,
    source: 'local',
    cursor: { line: 1, column: 1 },
    scroll: { line: 1, percentage: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
});

export const useDocumentStore = create<DocumentState>()(
    devtools(
        persist(
            (set, get) => ({
                documents: new Map(),
                activeDocumentId: null,
                versions: new Map(),

                createDocument: () => {
                    const doc = createEmptyDocument();
                    set((state) => {
                        const newDocs = new Map(state.documents);
                        newDocs.set(doc.id, doc);
                        return { documents: newDocs, activeDocumentId: doc.id };
                    });
                    return doc.id;
                },

                openDocument: (id) => {
                    set({ activeDocumentId: id });
                },

                closeDocument: (id) => {
                    set((state) => {
                        const newDocs = new Map(state.documents);
                        newDocs.delete(id);

                        let newActiveId = state.activeDocumentId;
                        if (state.activeDocumentId === id) {
                            const remaining = Array.from(newDocs.keys());
                            newActiveId = remaining.length > 0 ? (remaining[0] ?? null) : null;
                        }

                        return { documents: newDocs, activeDocumentId: newActiveId };
                    });
                },

                updateContent: (id, content) => {
                    set((state) => {
                        const doc = state.documents.get(id);
                        if (!doc) return state;

                        const newDocs = new Map(state.documents);
                        const updatedDoc: Document = {
                            ...doc,
                            content,
                            isModified: true,
                            updatedAt: new Date()
                        };

                        // Auto-name from first H1 if not manually named
                        if (!doc.isManuallyNamed) {
                            const heading = extractHeading(content);
                            if (heading) {
                                updatedDoc.name = sanitizeFilename(heading);
                            } else if (doc.name !== 'Untitled' && !content.trim()) {
                                // Reset to Untitled if content is cleared
                                updatedDoc.name = 'Untitled';
                            }
                        }

                        newDocs.set(id, updatedDoc);
                        return { documents: newDocs };
                    });
                },

                renameDocument: (id, name, isManual = true) => {
                    set((state) => {
                        const doc = state.documents.get(id);
                        if (!doc) return state;

                        const newDocs = new Map(state.documents);
                        newDocs.set(id, {
                            ...doc,
                            name,
                            isManuallyNamed: isManual,
                            updatedAt: new Date()
                        });
                        return { documents: newDocs };
                    });
                },

                deleteDocument: (id) => {
                    set((state) => {
                        const newDocs = new Map(state.documents);
                        const newVersions = new Map(state.versions);
                        newDocs.delete(id);
                        newVersions.delete(id);

                        let newActiveId = state.activeDocumentId;
                        if (state.activeDocumentId === id) {
                            const remaining = Array.from(newDocs.keys());
                            newActiveId = remaining.length > 0 ? (remaining[0] ?? null) : null;
                        }

                        return { documents: newDocs, versions: newVersions, activeDocumentId: newActiveId };
                    });
                },

                getActiveDocument: () => {
                    const state = get();
                    if (!state.activeDocumentId) return null;
                    return state.documents.get(state.activeDocumentId) ?? null;
                },

                getDocument: (id) => {
                    return get().documents.get(id);
                },

                saveVersion: (id, label) => {
                    set((state) => {
                        const doc = state.documents.get(id);
                        if (!doc) return state;

                        const version: Version = {
                            id: generateId(),
                            documentId: id,
                            content: doc.content,
                            label,
                            createdAt: new Date()
                        };

                        const newVersions = new Map(state.versions);
                        const docVersions = newVersions.get(id) ?? [];

                        // Keep max 10 versions
                        const updatedVersions = [version, ...docVersions].slice(0, 10);
                        newVersions.set(id, updatedVersions);

                        return { versions: newVersions };
                    });
                },

                getVersions: (id) => {
                    return get().versions.get(id) ?? [];
                },

                restoreVersion: (id, versionId) => {
                    set((state) => {
                        const versions = state.versions.get(id) ?? [];
                        const version = versions.find((v) => v.id === versionId);
                        if (!version) return state;

                        const doc = state.documents.get(id);
                        if (!doc) return state;

                        const newDocs = new Map(state.documents);
                        newDocs.set(id, {
                            ...doc,
                            content: version.content,
                            isModified: true,
                            updatedAt: new Date()
                        });

                        return { documents: newDocs };
                    });
                },

                deleteVersion: (id, versionId) => {
                    set((state) => {
                        const versions = state.versions.get(id) ?? [];
                        const newVersions = new Map(state.versions);
                        newVersions.set(
                            id,
                            versions.filter((v) => v.id !== versionId)
                        );
                        return { versions: newVersions };
                    });
                },

                markAsSaved: (id) => {
                    set((state) => {
                        const doc = state.documents.get(id);
                        if (!doc) return state;

                        const newDocs = new Map(state.documents);
                        newDocs.set(id, { ...doc, isModified: false });
                        return { documents: newDocs };
                    });
                },

                updateCursor: (id, line, column) => {
                    set((state) => {
                        const doc = state.documents.get(id);
                        if (!doc) return state;

                        const newDocs = new Map(state.documents);
                        newDocs.set(id, { ...doc, cursor: { line, column } });
                        return { documents: newDocs };
                    });
                },

                updateScroll: (id, line, percentage) => {
                    set((state) => {
                        const doc = state.documents.get(id);
                        if (!doc) return state;

                        const newDocs = new Map(state.documents);
                        newDocs.set(id, { ...doc, scroll: { line, percentage } });
                        return { documents: newDocs };
                    });
                }
            }),
            {
                name: 'markview:documents',
                partialize: (state) => ({
                    documents: Array.from(state.documents.entries()),
                    activeDocumentId: state.activeDocumentId,
                    versions: Array.from(state.versions.entries())
                }),
                merge: (persisted, current) => {
                    const persistedState = persisted as {
                        documents?: [string, Document][];
                        activeDocumentId?: string | null;
                        versions?: [string, Version[]][];
                    };

                    return {
                        ...current,
                        documents: new Map(persistedState.documents ?? []),
                        activeDocumentId: persistedState.activeDocumentId ?? null,
                        versions: new Map(persistedState.versions ?? [])
                    };
                }
            }
        ),
        { name: 'DocumentStore' }
    )
);
