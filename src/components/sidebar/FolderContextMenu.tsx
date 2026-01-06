import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger
} from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import type { Folder } from '@/stores/folderStore';
import { FOLDER_COLORS, FOLDER_ICONS, useFolderStore } from '@/stores/folderStore';
import { useUIStore } from '@/stores/uiStore';
import { Circle, FilePlus, FolderPlus, Palette, Pencil, Smile, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getIconComponent } from './NewFolderModal';

interface FolderContextMenuProps {
    folder: Folder;
    children: React.ReactNode;
}

/**
 * Context menu for folder operations
 */
export function FolderContextMenu({ folder, children }: FolderContextMenuProps) {
    const { t } = useTranslation();
    const { updateFolder, deleteFolder } = useFolderStore();
    const { createDocument, moveToFolder } = useDocumentStore();
    const getDocumentsByFolder = useDocumentStore((s) => s.getDocumentsByFolder);
    const setPendingRenameDocumentId = useUIStore((s) => s.setPendingRenameDocumentId);
    const openNewFolderModal = useUIStore((s) => s.openNewFolderModal);

    const handleNewFolder = useCallback(() => {
        openNewFolderModal(folder.id);
    }, [folder.id, openNewFolderModal]);

    const handleNewDocument = useCallback(() => {
        const id = createDocument();
        moveToFolder(id, folder.id);
        setPendingRenameDocumentId(id);
    }, [createDocument, moveToFolder, folder.id, setPendingRenameDocumentId]);

    const handleRename = useCallback(() => {
        const newName = prompt(t('contextMenu.enterNewName'), folder.name);
        if (newName?.trim()) {
            updateFolder(folder.id, { name: newName.trim() });
        }
    }, [folder.id, folder.name, updateFolder, t]);

    const handleSetColor = useCallback(
        (color: string | null) => {
            updateFolder(folder.id, { color });
        },
        [folder.id, updateFolder]
    );

    const handleSetIcon = useCallback(
        (icon: string | null) => {
            updateFolder(folder.id, { icon });
        },
        [folder.id, updateFolder]
    );

    const handleDelete = useCallback(() => {
        // Get documents in this folder
        const docsInFolder = getDocumentsByFolder(folder.id);

        // Confirm deletion
        const confirmed = confirm(t('fileExplorer.folder.deleteConfirm', { name: folder.name }));

        if (confirmed) {
            // Move documents to root first
            for (const doc of docsInFolder) {
                moveToFolder(doc.id, null);
            }
            // Then delete the folder
            deleteFolder(folder.id);
        }
    }, [folder.id, folder.name, getDocumentsByFolder, moveToFolder, deleteFolder, t]);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={handleNewDocument}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    {t('contextMenu.newFile')}
                </ContextMenuItem>

                <ContextMenuItem onClick={handleNewFolder}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {t('fileExplorer.folder.new')}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem onClick={handleRename}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('common.rename')}
                </ContextMenuItem>

                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <Palette className="mr-2 h-4 w-4" />
                        {t('fileExplorer.folder.color')}
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="grid grid-cols-5 gap-1 p-2 w-auto">
                        {/* No color option */}
                        <ContextMenuItem onClick={() => handleSetColor(null)} className="p-1 justify-center">
                            <Circle
                                className="h-5 w-5"
                                style={{
                                    color: folder.color === null ? 'var(--color-primary-500)' : 'var(--color-text-muted)'
                                }}
                            />
                        </ContextMenuItem>
                        {/* Color options */}
                        {FOLDER_COLORS.map((color) => (
                            <ContextMenuItem key={color.name} onClick={() => handleSetColor(color.value)} className="p-1 justify-center">
                                <Circle
                                    className="h-5 w-5"
                                    fill={color.value}
                                    style={{
                                        color: color.value,
                                        stroke: folder.color === color.value ? 'var(--color-text-primary)' : 'transparent',
                                        strokeWidth: 2
                                    }}
                                />
                            </ContextMenuItem>
                        ))}
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <Smile className="mr-2 h-4 w-4" />
                        {t('fileExplorer.folder.icon')}
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="grid grid-cols-7 gap-1 p-2 w-auto max-h-48 overflow-y-auto">
                        {FOLDER_ICONS.map((iconName) => {
                            const IconComponent = getIconComponent(iconName);
                            const isSelected = folder.icon === iconName || (folder.icon === null && iconName === 'folder');

                            return (
                                <ContextMenuItem
                                    key={iconName}
                                    onClick={() => handleSetIcon(iconName === 'folder' ? null : iconName)}
                                    className="p-1.5 justify-center"
                                    style={{
                                        backgroundColor: isSelected ? 'var(--color-primary-500-20)' : undefined,
                                        color: isSelected ? 'var(--color-primary-500)' : undefined
                                    }}
                                >
                                    <IconComponent className="h-4 w-4" />
                                </ContextMenuItem>
                            );
                        })}
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSeparator />

                <ContextMenuItem variant="danger" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
