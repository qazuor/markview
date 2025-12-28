import type { ModalType, SaveStatus, SearchResult, SidebarSection, UIState, ViewMode } from '@/types/ui';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIActions {
    // Sidebar
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSidebarSection: (section: SidebarSection) => void;
    setSidebarWidth: (width: number) => void;

    // View mode
    setViewMode: (mode: ViewMode) => void;

    // Modals
    openModal: (modal: ModalType) => void;
    closeModal: () => void;

    // Zen mode
    toggleZenMode: () => void;
    setZenMode: (enabled: boolean) => void;

    // Search
    setSearchQuery: (query: string) => void;
    setSearchResults: (results: SearchResult[]) => void;
    setReplaceQuery: (query: string) => void;
    toggleSearchCaseSensitive: () => void;
    toggleSearchRegex: () => void;
    clearSearch: () => void;

    // Status
    setSaveStatus: (status: SaveStatus) => void;
    setLastSavedAt: (date: Date | null) => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
    sidebarOpen: true,
    sidebarSection: 'explorer',
    sidebarWidth: 280,
    viewMode: 'split',
    zenMode: false,
    activeModal: null,
    searchQuery: '',
    searchResults: [],
    replaceQuery: '',
    searchCaseSensitive: false,
    searchRegex: false,
    saveStatus: 'saved',
    lastSavedAt: null
};

export const useUIStore = create<UIStore>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                toggleSidebar: () => {
                    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
                },

                setSidebarOpen: (open) => {
                    set({ sidebarOpen: open });
                },

                setSidebarSection: (section) => {
                    set({ sidebarSection: section, sidebarOpen: true });
                },

                setSidebarWidth: (width) => {
                    set({ sidebarWidth: Math.max(200, Math.min(500, width)) });
                },

                setViewMode: (mode) => {
                    set({ viewMode: mode });
                },

                openModal: (modal) => {
                    set({ activeModal: modal });
                },

                closeModal: () => {
                    set({ activeModal: null });
                },

                toggleZenMode: () => {
                    set((state) => ({ zenMode: !state.zenMode }));
                },

                setZenMode: (enabled) => {
                    set({ zenMode: enabled });
                },

                setSearchQuery: (query) => {
                    set({ searchQuery: query });
                },

                setSearchResults: (results) => {
                    set({ searchResults: results });
                },

                setReplaceQuery: (query) => {
                    set({ replaceQuery: query });
                },

                toggleSearchCaseSensitive: () => {
                    set((state) => ({ searchCaseSensitive: !state.searchCaseSensitive }));
                },

                toggleSearchRegex: () => {
                    set((state) => ({ searchRegex: !state.searchRegex }));
                },

                clearSearch: () => {
                    set({
                        searchQuery: '',
                        searchResults: [],
                        replaceQuery: ''
                    });
                },

                setSaveStatus: (status) => {
                    set({ saveStatus: status });
                },

                setLastSavedAt: (date) => {
                    set({ lastSavedAt: date });
                }
            }),
            {
                name: 'markview:ui',
                partialize: (state) => ({
                    sidebarOpen: state.sidebarOpen,
                    sidebarSection: state.sidebarSection,
                    sidebarWidth: state.sidebarWidth,
                    viewMode: state.viewMode
                })
            }
        ),
        { name: 'UIStore' }
    )
);
