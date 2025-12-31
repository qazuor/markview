import { useUIStore } from '@/stores/uiStore';
import type { SearchResult } from '@/types/ui';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('uiStore', () => {
    beforeEach(() => {
        useUIStore.setState({
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
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Sidebar', () => {
        describe('toggleSidebar', () => {
            it('should toggle sidebar open/closed', () => {
                const { toggleSidebar } = useUIStore.getState();

                act(() => {
                    toggleSidebar();
                });

                expect(useUIStore.getState().sidebarOpen).toBe(false);

                act(() => {
                    toggleSidebar();
                });

                expect(useUIStore.getState().sidebarOpen).toBe(true);
            });
        });

        describe('setSidebarOpen', () => {
            it('should set sidebar to open', () => {
                const { setSidebarOpen } = useUIStore.getState();

                act(() => {
                    setSidebarOpen(false);
                    setSidebarOpen(true);
                });

                expect(useUIStore.getState().sidebarOpen).toBe(true);
            });

            it('should set sidebar to closed', () => {
                const { setSidebarOpen } = useUIStore.getState();

                act(() => {
                    setSidebarOpen(false);
                });

                expect(useUIStore.getState().sidebarOpen).toBe(false);
            });
        });

        describe('setSidebarSection', () => {
            it('should change sidebar section', () => {
                const { setSidebarSection } = useUIStore.getState();

                act(() => {
                    setSidebarSection('github');
                });

                expect(useUIStore.getState().sidebarSection).toBe('github');
            });

            it('should open sidebar when setting section', () => {
                const { setSidebarOpen, setSidebarSection } = useUIStore.getState();

                act(() => {
                    setSidebarOpen(false);
                    setSidebarSection('gdrive');
                });

                const state = useUIStore.getState();
                expect(state.sidebarSection).toBe('gdrive');
                expect(state.sidebarOpen).toBe(true);
            });
        });

        describe('setSidebarWidth', () => {
            it('should set sidebar width', () => {
                const { setSidebarWidth } = useUIStore.getState();

                act(() => {
                    setSidebarWidth(350);
                });

                expect(useUIStore.getState().sidebarWidth).toBe(350);
            });

            it('should enforce minimum width of 200', () => {
                const { setSidebarWidth } = useUIStore.getState();

                act(() => {
                    setSidebarWidth(100);
                });

                expect(useUIStore.getState().sidebarWidth).toBe(200);
            });

            it('should enforce maximum width of 500', () => {
                const { setSidebarWidth } = useUIStore.getState();

                act(() => {
                    setSidebarWidth(600);
                });

                expect(useUIStore.getState().sidebarWidth).toBe(500);
            });
        });
    });

    describe('View Mode', () => {
        describe('setViewMode', () => {
            it('should set view mode to editor', () => {
                const { setViewMode } = useUIStore.getState();

                act(() => {
                    setViewMode('editor');
                });

                expect(useUIStore.getState().viewMode).toBe('editor');
            });

            it('should set view mode to preview', () => {
                const { setViewMode } = useUIStore.getState();

                act(() => {
                    setViewMode('preview');
                });

                expect(useUIStore.getState().viewMode).toBe('preview');
            });

            it('should set view mode to split', () => {
                const { setViewMode } = useUIStore.getState();

                act(() => {
                    setViewMode('split');
                });

                expect(useUIStore.getState().viewMode).toBe('split');
            });
        });
    });

    describe('Modals', () => {
        describe('openModal', () => {
            it('should open settings modal', () => {
                const { openModal } = useUIStore.getState();

                act(() => {
                    openModal('settings');
                });

                expect(useUIStore.getState().activeModal).toBe('settings');
            });

            it('should open export modal', () => {
                const { openModal } = useUIStore.getState();

                act(() => {
                    openModal('export');
                });

                expect(useUIStore.getState().activeModal).toBe('export');
            });

            it('should switch between modals', () => {
                const { openModal } = useUIStore.getState();

                act(() => {
                    openModal('settings');
                    openModal('shortcuts');
                });

                expect(useUIStore.getState().activeModal).toBe('shortcuts');
            });
        });

        describe('closeModal', () => {
            it('should close active modal', () => {
                const { openModal, closeModal } = useUIStore.getState();

                act(() => {
                    openModal('settings');
                    closeModal();
                });

                expect(useUIStore.getState().activeModal).toBeNull();
            });
        });
    });

    describe('Zen Mode', () => {
        describe('toggleZenMode', () => {
            it('should toggle zen mode', () => {
                const { toggleZenMode } = useUIStore.getState();

                act(() => {
                    toggleZenMode();
                });

                expect(useUIStore.getState().zenMode).toBe(true);

                act(() => {
                    toggleZenMode();
                });

                expect(useUIStore.getState().zenMode).toBe(false);
            });
        });

        describe('setZenMode', () => {
            it('should enable zen mode', () => {
                const { setZenMode } = useUIStore.getState();

                act(() => {
                    setZenMode(true);
                });

                expect(useUIStore.getState().zenMode).toBe(true);
            });

            it('should disable zen mode', () => {
                const { setZenMode } = useUIStore.getState();

                act(() => {
                    setZenMode(true);
                    setZenMode(false);
                });

                expect(useUIStore.getState().zenMode).toBe(false);
            });
        });
    });

    describe('Search', () => {
        describe('setSearchQuery', () => {
            it('should set search query', () => {
                const { setSearchQuery } = useUIStore.getState();

                act(() => {
                    setSearchQuery('test query');
                });

                expect(useUIStore.getState().searchQuery).toBe('test query');
            });
        });

        describe('setSearchResults', () => {
            it('should set search results', () => {
                const { setSearchResults } = useUIStore.getState();

                const results: SearchResult[] = [
                    { line: 1, column: 5, context: 'result 1', match: 'test' },
                    { line: 3, column: 10, context: 'result 2', match: 'test' }
                ];

                act(() => {
                    setSearchResults(results);
                });

                expect(useUIStore.getState().searchResults).toEqual(results);
            });

            it('should handle empty results', () => {
                const { setSearchResults } = useUIStore.getState();

                act(() => {
                    setSearchResults([]);
                });

                expect(useUIStore.getState().searchResults).toEqual([]);
            });
        });

        describe('setReplaceQuery', () => {
            it('should set replace query', () => {
                const { setReplaceQuery } = useUIStore.getState();

                act(() => {
                    setReplaceQuery('replacement');
                });

                expect(useUIStore.getState().replaceQuery).toBe('replacement');
            });
        });

        describe('toggleSearchCaseSensitive', () => {
            it('should toggle case sensitive search', () => {
                const { toggleSearchCaseSensitive } = useUIStore.getState();

                act(() => {
                    toggleSearchCaseSensitive();
                });

                expect(useUIStore.getState().searchCaseSensitive).toBe(true);

                act(() => {
                    toggleSearchCaseSensitive();
                });

                expect(useUIStore.getState().searchCaseSensitive).toBe(false);
            });
        });

        describe('toggleSearchRegex', () => {
            it('should toggle regex search', () => {
                const { toggleSearchRegex } = useUIStore.getState();

                act(() => {
                    toggleSearchRegex();
                });

                expect(useUIStore.getState().searchRegex).toBe(true);

                act(() => {
                    toggleSearchRegex();
                });

                expect(useUIStore.getState().searchRegex).toBe(false);
            });
        });

        describe('clearSearch', () => {
            it('should clear all search state', () => {
                const { setSearchQuery, setSearchResults, setReplaceQuery, clearSearch } = useUIStore.getState();

                const results: SearchResult[] = [{ line: 1, column: 5, context: 'result', match: 'test' }];

                act(() => {
                    setSearchQuery('query');
                    setSearchResults(results);
                    setReplaceQuery('replace');
                    clearSearch();
                });

                const state = useUIStore.getState();
                expect(state.searchQuery).toBe('');
                expect(state.searchResults).toEqual([]);
                expect(state.replaceQuery).toBe('');
            });

            it('should not clear case sensitive and regex flags', () => {
                const { toggleSearchCaseSensitive, toggleSearchRegex, clearSearch } = useUIStore.getState();

                act(() => {
                    toggleSearchCaseSensitive();
                    toggleSearchRegex();
                    clearSearch();
                });

                const state = useUIStore.getState();
                expect(state.searchCaseSensitive).toBe(true);
                expect(state.searchRegex).toBe(true);
            });
        });
    });

    describe('Save Status', () => {
        describe('setSaveStatus', () => {
            it('should set save status to saving', () => {
                const { setSaveStatus } = useUIStore.getState();

                act(() => {
                    setSaveStatus('saving');
                });

                expect(useUIStore.getState().saveStatus).toBe('saving');
            });

            it('should set save status to saved', () => {
                const { setSaveStatus } = useUIStore.getState();

                act(() => {
                    setSaveStatus('saved');
                });

                expect(useUIStore.getState().saveStatus).toBe('saved');
            });

            it('should set save status to error', () => {
                const { setSaveStatus } = useUIStore.getState();

                act(() => {
                    setSaveStatus('error');
                });

                expect(useUIStore.getState().saveStatus).toBe('error');
            });
        });

        describe('setLastSavedAt', () => {
            it('should set last saved date', () => {
                const { setLastSavedAt } = useUIStore.getState();

                const now = new Date();

                act(() => {
                    setLastSavedAt(now);
                });

                expect(useUIStore.getState().lastSavedAt).toBe(now);
            });

            it('should set to null', () => {
                const { setLastSavedAt } = useUIStore.getState();

                act(() => {
                    setLastSavedAt(new Date());
                    setLastSavedAt(null);
                });

                expect(useUIStore.getState().lastSavedAt).toBeNull();
            });
        });
    });
});
