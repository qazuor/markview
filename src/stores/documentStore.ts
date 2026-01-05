import type { Document, DriveFileInfo, GitHubFileInfo, SyncStatus, Version } from '@/types';
import { extractHeading, sanitizeFilename } from '@/utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface CreateDocumentOptions {
    name?: string;
    content?: string;
    source?: Document['source'];
    githubInfo?: GitHubFileInfo;
    driveInfo?: DriveFileInfo;
}

/**
 * Simple hash function for content comparison
 */
function hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

/**
 * Determine sync status based on document source and content
 * For local docs: compare with last persisted content
 * For cloud docs: compare with original cloud content
 */
function computeSyncStatus(doc: Document, newContent: string): SyncStatus {
    // If we have a hash to compare against, check if content changed
    if (doc.originalContentHash) {
        const currentHash = hashContent(newContent);
        return currentHash === doc.originalContentHash ? 'synced' : 'modified';
    }
    // No hash yet means new document, treat as synced (will get hash on next persist)
    return 'synced';
}

interface DocumentState {
    documents: Map<string, Document>;
    activeDocumentId: string | null;
    versions: Map<string, Version[]>;
    _hasHydrated: boolean;

    // Document operations
    createDocument: (options?: CreateDocumentOptions) => string;
    findDocumentByGitHub: (repo: string, path: string) => Document | undefined;
    findDocumentByDrive: (fileId: string) => Document | undefined;
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
    updateCursor: (id: string, line: number, column: number) => void;
    updateScroll: (id: string, line: number, percentage: number) => void;
    setSyncStatus: (id: string, status: SyncStatus) => void;
}

const generateId = () => crypto.randomUUID();

// Timers for simulating sync cycle
const syncTimers = new Map<string, NodeJS.Timeout>();

/**
 * Simulate sync cycle: modified -> syncing -> synced/cloud-pending
 */
function scheduleSyncCycle(docId: string, content: string, setSyncStatus: (id: string, status: SyncStatus) => void) {
    // Clear any existing timer for this document
    const existingTimer = syncTimers.get(docId);
    if (existingTimer) {
        clearTimeout(existingTimer);
    }

    // After 800ms of no changes, start "syncing"
    const timer = setTimeout(() => {
        setSyncStatus(docId, 'syncing');

        // After 400ms of "syncing", determine final status
        setTimeout(() => {
            const store = useDocumentStore.getState();
            const doc = store.documents.get(docId);
            if (doc) {
                const newDocs = new Map(store.documents);
                const currentHash = hashContent(content);

                // Determine final status based on source
                let finalStatus: SyncStatus = 'synced';
                if (doc.source === 'github' || doc.source === 'gdrive') {
                    // For cloud files: check if content differs from original cloud version
                    if (doc.originalContentHash && currentHash !== doc.originalContentHash) {
                        finalStatus = 'cloud-pending';
                    }
                }

                newDocs.set(docId, {
                    ...doc,
                    syncStatus: finalStatus,
                    // For local files, update the hash (it's their "saved" baseline)
                    // For cloud files, DON'T update originalContentHash (it represents cloud version)
                    ...(doc.source === 'local' ? { originalContentHash: currentHash } : {})
                });
                useDocumentStore.setState({ documents: newDocs });
            }
            syncTimers.delete(docId);
        }, 400);
    }, 800);

    syncTimers.set(docId, timer);
}

const createEmptyDocument = (): Document => ({
    id: generateId(),
    name: 'Untitled',
    content: '',
    syncStatus: 'synced',
    originalContentHash: hashContent(''), // Empty content hash
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
                _hasHydrated: false,

                createDocument: (options) => {
                    const doc = createEmptyDocument();

                    // Apply options if provided
                    if (options?.name) {
                        doc.name = options.name;
                        doc.isManuallyNamed = true;
                    }
                    if (options?.content) {
                        doc.content = options.content;
                        // Update hash to match content
                        doc.originalContentHash = hashContent(options.content);
                    }
                    if (options?.source) {
                        doc.source = options.source;
                    }
                    if (options?.githubInfo) {
                        doc.githubInfo = options.githubInfo;
                    }
                    if (options?.driveInfo) {
                        doc.driveInfo = options.driveInfo;
                    }

                    set((state) => {
                        const newDocs = new Map(state.documents);
                        newDocs.set(doc.id, doc);
                        return { documents: newDocs, activeDocumentId: doc.id };
                    });
                    return doc.id;
                },

                findDocumentByGitHub: (repo, path) => {
                    const state = get();
                    for (const doc of state.documents.values()) {
                        if (doc.source === 'github' && doc.githubInfo) {
                            const fullRepo = `${doc.githubInfo.owner}/${doc.githubInfo.repo}`;
                            if (fullRepo === repo && doc.githubInfo.path === path) {
                                return doc;
                            }
                        }
                    }
                    return undefined;
                },

                findDocumentByDrive: (fileId) => {
                    const state = get();
                    for (const doc of state.documents.values()) {
                        if (doc.source === 'gdrive' && doc.driveInfo) {
                            if (doc.driveInfo.fileId === fileId) {
                                return doc;
                            }
                        }
                    }
                    return undefined;
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
                    const state = get();
                    const doc = state.documents.get(id);
                    if (!doc) return;

                    const newSyncStatus = computeSyncStatus(doc, content);

                    set((state) => {
                        const currentDoc = state.documents.get(id);
                        if (!currentDoc) return state;

                        const newDocs = new Map(state.documents);
                        const updatedDoc: Document = {
                            ...currentDoc,
                            content,
                            syncStatus: newSyncStatus,
                            updatedAt: new Date()
                        };

                        // Auto-name from first H1 if not manually named
                        if (!currentDoc.isManuallyNamed) {
                            const heading = extractHeading(content);
                            if (heading) {
                                updatedDoc.name = sanitizeFilename(heading);
                            } else if (currentDoc.name !== 'Untitled' && !content.trim()) {
                                // Reset to Untitled if content is cleared
                                updatedDoc.name = 'Untitled';
                            }
                        }

                        newDocs.set(id, updatedDoc);
                        return { documents: newDocs };
                    });

                    // Schedule sync cycle if document was modified
                    if (newSyncStatus === 'modified') {
                        scheduleSyncCycle(id, content, get().setSyncStatus);
                    }
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
                            syncStatus: computeSyncStatus(doc, version.content),
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

                setSyncStatus: (id, status) => {
                    set((state) => {
                        const doc = state.documents.get(id);
                        if (!doc) return state;

                        const newDocs = new Map(state.documents);
                        newDocs.set(id, { ...doc, syncStatus: status });
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

                    // Rehydrate Date objects from persisted strings and ensure all docs have hash
                    const rehydratedDocs = (persistedState.documents ?? []).map(([id, doc]) => {
                        const rehydrated: Document = {
                            ...doc,
                            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
                            updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
                            // Ensure syncStatus exists (for old documents)
                            syncStatus: doc.syncStatus === 'local' ? 'synced' : (doc.syncStatus ?? 'synced')
                        };

                        // For any document without originalContentHash, set it now
                        // This treats the current persisted content as the "synced" baseline
                        if (!doc.originalContentHash) {
                            rehydrated.originalContentHash = hashContent(doc.content ?? '');
                            rehydrated.syncStatus = 'synced';
                        }

                        return [id, rehydrated] as [string, Document];
                    });

                    const rehydratedVersions = (persistedState.versions ?? []).map(([id, versions]) => {
                        return [
                            id,
                            versions.map((v) => ({
                                ...v,
                                createdAt: v.createdAt ? new Date(v.createdAt) : new Date()
                            }))
                        ] as [string, Version[]];
                    });

                    return {
                        ...current,
                        documents: new Map(rehydratedDocs),
                        activeDocumentId: persistedState.activeDocumentId ?? null,
                        versions: new Map(rehydratedVersions)
                    };
                },
                onRehydrateStorage: () => {
                    return (_state, error) => {
                        if (!error) {
                            useDocumentStore.setState({ _hasHydrated: true });
                        }
                    };
                }
            }
        ),
        { name: 'DocumentStore' }
    )
);

// Also mark as hydrated immediately if localStorage is empty (no data to hydrate)
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('markview:documents');
    if (!stored) {
        // No persisted data, mark as hydrated immediately
        useDocumentStore.setState({ _hasHydrated: true });
    }
}
