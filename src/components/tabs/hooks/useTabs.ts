import { useDocumentStore } from '@/stores/documentStore';
import { useCallback, useMemo, useState } from 'react';

interface TabInfo {
    id: string;
    name: string;
    isModified: boolean;
}

/**
 * Hook for tab management integrated with document store
 */
export function useTabs() {
    const { documents, activeDocumentId, openDocument, closeDocument, createDocument, getDocument } = useDocumentStore();

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
                isModified: doc?.isModified ?? false
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

            if (doc?.isModified) {
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
        return id;
    }, [createDocument]);

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

    const hasModifiedTabs = useMemo(() => tabs.some((tab) => tab.isModified), [tabs]);

    return {
        tabs,
        activeTab,
        selectTab,
        closeTab,
        forceCloseTab,
        addTab,
        reorderTabs,
        hasModifiedTabs,
        tabCount: tabs.length
    };
}
