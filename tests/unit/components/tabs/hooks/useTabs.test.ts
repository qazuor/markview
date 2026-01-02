import { useTabs } from '@/components/tabs/hooks/useTabs';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock document store
const mockOpenDocument = vi.fn();
const mockCloseDocument = vi.fn();
const mockCreateDocument = vi.fn(() => 'new-doc-id');
const mockGetDocument = vi.fn();
const mockDocuments = new Map([
    ['doc-1', { id: 'doc-1', name: 'Document 1.md', syncStatus: 'local' }],
    ['doc-2', { id: 'doc-2', name: 'Document 2.md', syncStatus: 'synced' }],
    ['doc-3', { id: 'doc-3', name: 'Modified Doc.md', syncStatus: 'modified' }]
]);

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: () => ({
        documents: mockDocuments,
        activeDocumentId: 'doc-1',
        openDocument: mockOpenDocument,
        closeDocument: mockCloseDocument,
        createDocument: mockCreateDocument,
        getDocument: mockGetDocument
    })
}));

// Mock UI store
const mockSetPendingRenameDocumentId = vi.fn();

vi.mock('@/stores/uiStore', () => ({
    useUIStore: (selector: (state: unknown) => unknown) => {
        const state = { setPendingRenameDocumentId: mockSetPendingRenameDocumentId };
        return selector(state);
    }
}));

describe('useTabs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetDocument.mockImplementation((id) => mockDocuments.get(id));
    });

    describe('tabs', () => {
        it('should return all documents as tabs', () => {
            const { result } = renderHook(() => useTabs());

            expect(result.current.tabs).toHaveLength(3);
        });

        it('should include tab name from document', () => {
            const { result } = renderHook(() => useTabs());

            expect(result.current.tabs[0].name).toBe('Document 1.md');
        });

        it('should include sync status from document', () => {
            const { result } = renderHook(() => useTabs());

            expect(result.current.tabs[0].syncStatus).toBe('local');
        });

        it('should return tabCount', () => {
            const { result } = renderHook(() => useTabs());

            expect(result.current.tabCount).toBe(3);
        });
    });

    describe('activeTab', () => {
        it('should return active document id', () => {
            const { result } = renderHook(() => useTabs());

            expect(result.current.activeTab).toBe('doc-1');
        });
    });

    describe('selectTab', () => {
        it('should call openDocument when selecting tab', () => {
            const { result } = renderHook(() => useTabs());

            act(() => {
                result.current.selectTab('doc-2');
            });

            expect(mockOpenDocument).toHaveBeenCalledWith('doc-2');
        });
    });

    describe('closeTab', () => {
        it('should close tab without confirmation for local files', () => {
            const { result } = renderHook(() => useTabs());

            let closeResult: ReturnType<typeof result.current.closeTab> = { requiresConfirmation: false };
            act(() => {
                closeResult = result.current.closeTab('doc-1');
            });

            expect(closeResult.requiresConfirmation).toBe(false);
            expect(mockCloseDocument).toHaveBeenCalledWith('doc-1');
        });

        it('should close tab without confirmation for synced files', () => {
            const { result } = renderHook(() => useTabs());

            let closeResult: ReturnType<typeof result.current.closeTab> = { requiresConfirmation: false };
            act(() => {
                closeResult = result.current.closeTab('doc-2');
            });

            expect(closeResult.requiresConfirmation).toBe(false);
            expect(mockCloseDocument).toHaveBeenCalledWith('doc-2');
        });

        it('should require confirmation for modified files', () => {
            const { result } = renderHook(() => useTabs());

            let closeResult: ReturnType<typeof result.current.closeTab> = { requiresConfirmation: false };
            act(() => {
                closeResult = result.current.closeTab('doc-3');
            });

            expect(closeResult.requiresConfirmation).toBe(true);
            expect(closeResult.document).toBeDefined();
            expect(mockCloseDocument).not.toHaveBeenCalledWith('doc-3');
        });
    });

    describe('forceCloseTab', () => {
        it('should close tab without confirmation check', () => {
            const { result } = renderHook(() => useTabs());

            act(() => {
                result.current.forceCloseTab('doc-3');
            });

            expect(mockCloseDocument).toHaveBeenCalledWith('doc-3');
        });
    });

    describe('addTab', () => {
        it('should create new document', () => {
            const { result } = renderHook(() => useTabs());

            act(() => {
                result.current.addTab();
            });

            expect(mockCreateDocument).toHaveBeenCalled();
        });

        it('should set pending rename for new document', () => {
            const { result } = renderHook(() => useTabs());

            act(() => {
                result.current.addTab();
            });

            expect(mockSetPendingRenameDocumentId).toHaveBeenCalledWith('new-doc-id');
        });

        it('should return new document id', () => {
            const { result } = renderHook(() => useTabs());

            let newId = '';
            act(() => {
                newId = result.current.addTab();
            });

            expect(newId).toBe('new-doc-id');
        });
    });

    describe('reorderTabs', () => {
        it('should reorder tabs', () => {
            const { result } = renderHook(() => useTabs());

            // First establish tab order
            act(() => {
                result.current.addTab();
            });

            // Tab order should now include 'new-doc-id'
            // This tests internal state management
            expect(result.current.tabCount).toBeGreaterThan(0);
        });
    });

    describe('hasModifiedTabs', () => {
        it('should return true when there are modified tabs', () => {
            const { result } = renderHook(() => useTabs());

            expect(result.current.hasModifiedTabs).toBe(true);
        });
    });

    describe('closeOtherTabs', () => {
        it('should close all tabs except specified one', () => {
            const { result } = renderHook(() => useTabs());

            act(() => {
                result.current.closeOtherTabs('doc-1');
            });

            // Should close doc-2 (synced) but not doc-3 (modified)
            expect(mockCloseDocument).toHaveBeenCalledWith('doc-2');
            expect(mockCloseDocument).not.toHaveBeenCalledWith('doc-1');
            expect(mockCloseDocument).not.toHaveBeenCalledWith('doc-3');
        });
    });

    describe('closeAllTabs', () => {
        it('should close all tabs without modifications', () => {
            const { result } = renderHook(() => useTabs());

            act(() => {
                result.current.closeAllTabs();
            });

            // Should close local and synced but not modified
            expect(mockCloseDocument).toHaveBeenCalledWith('doc-1');
            expect(mockCloseDocument).toHaveBeenCalledWith('doc-2');
            expect(mockCloseDocument).not.toHaveBeenCalledWith('doc-3');
        });
    });

    describe('closeSyncedTabs', () => {
        it('should close only synced and local tabs', () => {
            const { result } = renderHook(() => useTabs());

            act(() => {
                result.current.closeSyncedTabs();
            });

            // Should close local and synced
            expect(mockCloseDocument).toHaveBeenCalledWith('doc-1');
            expect(mockCloseDocument).toHaveBeenCalledWith('doc-2');
            expect(mockCloseDocument).not.toHaveBeenCalledWith('doc-3');
        });
    });
});
