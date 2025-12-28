export type SidebarSection = 'explorer' | 'toc' | 'search';

export type ModalType = 'settings' | 'shortcuts' | 'onboarding' | 'versions' | 'export' | null;

export type SaveStatus = 'saved' | 'saving' | 'modified' | 'error';

export type ViewMode = 'split' | 'editor' | 'preview';

export interface SearchResult {
    line: number;
    column: number;
    match: string;
    context: string;
}

export interface UIState {
    // Layout
    sidebarOpen: boolean;
    sidebarSection: SidebarSection;
    sidebarWidth: number;
    viewMode: ViewMode;
    zenMode: boolean;

    // Modals
    activeModal: ModalType;

    // Search
    searchQuery: string;
    searchResults: SearchResult[];
    replaceQuery: string;
    searchCaseSensitive: boolean;
    searchRegex: boolean;

    // Status
    saveStatus: SaveStatus;
    lastSavedAt: Date | null;
}
