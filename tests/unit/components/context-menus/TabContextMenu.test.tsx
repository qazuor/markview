import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock document store
vi.mock('@/stores/documentStore', () => {
    const mockStore = () => ({
        getDocument: vi.fn(() => ({ name: 'Test Doc', content: '# Test' })),
        renameDocument: vi.fn(),
        createDocument: vi.fn(() => 'new-doc-id'),
        documents: new Map([['new-doc-id', { name: 'New Doc', content: '' }]])
    });
    mockStore.getState = () => ({ updateContent: vi.fn() });
    return { useDocumentStore: mockStore };
});

// Import after mocks
import { TabContextMenu } from '@/components/tabs/TabContextMenu';

describe('TabContextMenu', () => {
    const defaultProps = {
        tabId: 'test-tab-id',
        onClose: vi.fn(),
        onCloseOthers: vi.fn(),
        onCloseAll: vi.fn(),
        onCloseSynced: vi.fn()
    };

    it('should render children', () => {
        render(
            <TabContextMenu {...defaultProps}>
                <button type="button">Tab Button</button>
            </TabContextMenu>
        );

        expect(screen.getByText('Tab Button')).toBeInTheDocument();
    });

    it('should show context menu on right click', async () => {
        render(
            <TabContextMenu {...defaultProps}>
                <button type="button">Tab Button</button>
            </TabContextMenu>
        );

        const trigger = screen.getByText('Tab Button');
        fireEvent.contextMenu(trigger);

        // Context menu items should appear
        expect(await screen.findByText('contextMenu.closeTab')).toBeInTheDocument();
        expect(await screen.findByText('contextMenu.closeOtherTabs')).toBeInTheDocument();
        expect(await screen.findByText('contextMenu.closeAllTabs')).toBeInTheDocument();
    });

    it('should call onClose when Close Tab is clicked', async () => {
        const onClose = vi.fn();

        render(
            <TabContextMenu {...defaultProps} onClose={onClose}>
                <button type="button">Tab Button</button>
            </TabContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('Tab Button'));

        const closeItem = await screen.findByText('contextMenu.closeTab');
        fireEvent.click(closeItem);

        expect(onClose).toHaveBeenCalled();
    });

    it('should call onCloseOthers when Close Other Tabs is clicked', async () => {
        const onCloseOthers = vi.fn();

        render(
            <TabContextMenu {...defaultProps} onCloseOthers={onCloseOthers}>
                <button type="button">Tab Button</button>
            </TabContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('Tab Button'));

        const closeOthersItem = await screen.findByText('contextMenu.closeOtherTabs');
        fireEvent.click(closeOthersItem);

        expect(onCloseOthers).toHaveBeenCalled();
    });

    it('should call onCloseAll when Close All Tabs is clicked', async () => {
        const onCloseAll = vi.fn();

        render(
            <TabContextMenu {...defaultProps} onCloseAll={onCloseAll}>
                <button type="button">Tab Button</button>
            </TabContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('Tab Button'));

        const closeAllItem = await screen.findByText('contextMenu.closeAllTabs');
        fireEvent.click(closeAllItem);

        expect(onCloseAll).toHaveBeenCalled();
    });

    it('should show rename and duplicate options', async () => {
        render(
            <TabContextMenu {...defaultProps}>
                <button type="button">Tab Button</button>
            </TabContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('Tab Button'));

        expect(await screen.findByText('common.rename')).toBeInTheDocument();
        expect(await screen.findByText('common.duplicate')).toBeInTheDocument();
    });

    it('should show export submenu', async () => {
        render(
            <TabContextMenu {...defaultProps}>
                <button type="button">Tab Button</button>
            </TabContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('Tab Button'));

        expect(await screen.findByText('contextMenu.exportAs')).toBeInTheDocument();
    });
});
