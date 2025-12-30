import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger
} from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import { Copy, Download, FileCode, FileImage, FileText, Pencil, X, XCircle } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

interface TabContextMenuProps {
    tabId: string;
    children: React.ReactNode;
    onClose: () => void;
    onCloseOthers: () => void;
    onCloseAll: () => void;
    onCloseSynced: () => void;
}

/**
 * Context menu for tab operations
 */
export function TabContextMenu({ tabId, children, onClose, onCloseOthers, onCloseAll, onCloseSynced }: TabContextMenuProps) {
    const { t } = useTranslation();
    const { getDocument, renameDocument, createDocument, documents } = useDocumentStore();

    const handleRename = () => {
        const doc = getDocument(tabId);
        if (!doc) return;

        const newName = prompt(t('contextMenu.enterNewName'), doc.name);
        if (newName?.trim()) {
            renameDocument(tabId, newName.trim(), true);
        }
    };

    const handleDuplicate = () => {
        const doc = getDocument(tabId);
        if (!doc) return;

        const newId = createDocument();
        const newDoc = documents.get(newId);
        if (newDoc) {
            renameDocument(newId, `${doc.name} (copy)`, true);
            useDocumentStore.getState().updateContent(newId, doc.content);
        }
    };

    const handleExport = (format: 'md' | 'html' | 'txt') => {
        const doc = getDocument(tabId);
        if (!doc) return;

        let content = doc.content;
        let mimeType = 'text/markdown';
        let extension = 'md';

        if (format === 'html') {
            content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${doc.name}</title>
</head>
<body>
<pre>${doc.content}</pre>
</body>
</html>`;
            mimeType = 'text/html';
            extension = 'html';
        } else if (format === 'txt') {
            mimeType = 'text/plain';
            extension = 'txt';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.name}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={onClose}>
                    <X className="mr-2 h-4 w-4" />
                    {t('contextMenu.closeTab')}
                    <ContextMenuShortcut>Ctrl+W</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem onClick={onCloseOthers}>
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('contextMenu.closeOtherTabs')}
                </ContextMenuItem>

                <ContextMenuItem onClick={onCloseAll}>
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('contextMenu.closeAllTabs')}
                </ContextMenuItem>

                <ContextMenuItem onClick={onCloseSynced}>
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('contextMenu.closeSyncedTabs')}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem onClick={handleRename}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('common.rename')}
                    <ContextMenuShortcut>F2</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('common.duplicate')}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <Download className="mr-2 h-4 w-4" />
                        {t('contextMenu.exportAs')}
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem onClick={() => handleExport('md')}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t('export.markdown')}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleExport('html')}>
                            <FileCode className="mr-2 h-4 w-4" />
                            {t('export.html')}
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleExport('txt')}>
                            <FileImage className="mr-2 h-4 w-4" />
                            {t('contextMenu.plainText')}
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
