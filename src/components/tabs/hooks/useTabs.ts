import { useDocumentStore } from '@/stores/documentStore';
import { useUIStore } from '@/stores/uiStore';
import type { SyncStatus } from '@/types';
import { useCallback, useMemo, useState } from 'react';

interface TabInfo {
    id: string;
    name: string;
    syncStatus: SyncStatus;
}

/**
 * Check if a tab has unsaved cloud changes that require confirmation
 */
function hasUnsyncedCloudChanges(syncStatus: SyncStatus): boolean {
    return syncStatus === 'modified';
}

/**
 * Hook for tab management integrated with document store
 */
export function useTabs() {
    const { documents, activeDocumentId, openDocument, closeDocument, createDocument, getDocument } = useDocumentStore();
    const setPendingRenameDocumentId = useUIStore((s) => s.setPendingRenameDocumentId);

    const [tabOrder, setTabOrder] = useState<string[]>([]);

    // Get tabs in order (maintain tab order separately from document order)
    const tabs = useMemo((): TabInfo[] => {
        const documentIds = Array.from(documents.keys());

        // Initialize tab order if needed
        const orderedIds = tabOrder.length > 0 ? tabOrder.filter((id) => documentIds.includes(id)) : documentIds;

        // Add any new documents not in order
        const newIds = documentIds.filter((id) => !orderedIds.includes(id));
        const allIds = [...orderedIds, ...newIds];

        return allIds.map((id) => {
            const doc = documents.get(id);
            return {
                id,
                name: doc?.name ?? 'Untitled',
                syncStatus: doc?.syncStatus ?? 'local'
            };
        });
    }, [documents, tabOrder]);

    const activeTab = activeDocumentId;

    const selectTab = useCallback(
        (id: string) => {
            openDocument(id);
        },
        [openDocument]
    );

    const closeTab = useCallback(
        (id: string): { requiresConfirmation: boolean; document: ReturnType<typeof getDocument> } => {
            const doc = getDocument(id);

            // Only require confirmation for cloud files with unsynced changes
            if (doc && hasUnsyncedCloudChanges(doc.syncStatus)) {
                return { requiresConfirmation: true, document: doc };
            }

            closeDocument(id);
            setTabOrder((prev) => prev.filter((tabId) => tabId !== id));
            return { requiresConfirmation: false, document: doc };
        },
        [closeDocument, getDocument]
    );

    const forceCloseTab = useCallback(
        (id: string) => {
            closeDocument(id);
            setTabOrder((prev) => prev.filter((tabId) => tabId !== id));
        },
        [closeDocument]
    );

    const addTab = useCallback(() => {
        const id = createDocument();
        setTabOrder((prev) => [...prev, id]);
        setPendingRenameDocumentId(id);
        return id;
    }, [createDocument, setPendingRenameDocumentId]);

    const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
        setTabOrder((prev) => {
            const newOrder = [...prev];
            const [removed] = newOrder.splice(fromIndex, 1);
            if (removed) {
                newOrder.splice(toIndex, 0, removed);
            }
            return newOrder;
        });
    }, []);

    const hasModifiedTabs = useMemo(() => tabs.some((tab) => hasUnsyncedCloudChanges(tab.syncStatus)), [tabs]);

    const closeOtherTabs = useCallback(
        (keepTabId: string) => {
            const tabsToClose = tabs.filter((tab) => tab.id !== keepTabId && !hasUnsyncedCloudChanges(tab.syncStatus));
            for (const tab of tabsToClose) {
                closeDocument(tab.id);
            }
            setTabOrder((prev) =>
                prev.filter((id) => id === keepTabId || hasUnsyncedCloudChanges(tabs.find((t) => t.id === id)?.syncStatus ?? 'local'))
            );
        },
        [tabs, closeDocument]
    );

    const closeAllTabs = useCallback(() => {
        const tabsToClose = tabs.filter((tab) => !hasUnsyncedCloudChanges(tab.syncStatus));
        for (const tab of tabsToClose) {
            closeDocument(tab.id);
        }
        setTabOrder((prev) => prev.filter((id) => hasUnsyncedCloudChanges(tabs.find((t) => t.id === id)?.syncStatus ?? 'local')));
    }, [tabs, closeDocument]);

    const closeSyncedTabs = useCallback(() => {
        const tabsToClose = tabs.filter((tab) => tab.syncStatus === 'synced' || tab.syncStatus === 'local');
        for (const tab of tabsToClose) {
            closeDocument(tab.id);
        }
        setTabOrder((prev) => prev.filter((id) => hasUnsyncedCloudChanges(tabs.find((t) => t.id === id)?.syncStatus ?? 'local')));
    }, [tabs, closeDocument]);

    return {
        tabs,
        activeTab,
        selectTab,
        closeTab,
        forceCloseTab,
        addTab,
        reorderTabs,
        hasModifiedTabs,
        tabCount: tabs.length,
        closeOtherTabs,
        closeAllTabs,
        closeSyncedTabs
    };
}
