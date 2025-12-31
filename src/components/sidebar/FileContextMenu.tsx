import { DeleteDocumentModal } from '@/components/modals';
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
import type { Document } from '@/types';
import { Copy, Download, FileCode, FileImage, FileText, Pencil, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FileContextMenuProps {
    documentId: string;
    children: React.ReactNode;
}

/**
 * Context menu for file operations in the sidebar
 */
export function FileContextMenu({ documentId, children }: FileContextMenuProps) {
    const { t } = useTranslation();
    const { getDocument, deleteDocument, renameDocument, createDocument, documents } = useDocumentStore();
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

    const handleRename = () => {
        const doc = getDocument(documentId);
        if (!doc) return;

        const newName = prompt(t('contextMenu.enterNewName'), doc.name);
        if (newName?.trim()) {
            renameDocument(documentId, newName.trim(), true);
        }
    };

    const handleDuplicate = () => {
        const doc = getDocument(documentId);
        if (!doc) return;

        const newId = createDocument();
        const newDoc = documents.get(newId);
        if (newDoc) {
            renameDocument(newId, `${doc.name} (copy)`, true);
            useDocumentStore.getState().updateContent(newId, doc.content);
        }
    };

    const handleDownload = (format: 'md' | 'html' | 'txt' = 'md') => {
        const doc = getDocument(documentId);
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

    const handleDelete = () => {
        const doc = getDocument(documentId);
        if (!doc) return;

        // For cloud documents, show the delete modal with options
        if (doc.source === 'github' || doc.source === 'gdrive') {
            setDocumentToDelete(doc);
        } else {
            // For local documents, use simple confirm
            const confirmed = confirm(t('confirm.deleteFile'));
            if (confirmed) {
                deleteDocument(documentId);
            }
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
                <ContextMenuContent>
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
                            <ContextMenuItem onClick={() => handleDownload('md')}>
                                <FileText className="mr-2 h-4 w-4" />
                                {t('export.markdown')}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleDownload('html')}>
                                <FileCode className="mr-2 h-4 w-4" />
                                {t('export.html')}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleDownload('txt')}>
                                <FileImage className="mr-2 h-4 w-4" />
                                {t('contextMenu.plainText')}
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSeparator />

                    <ContextMenuItem variant="danger" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Delete Document Modal */}
            <DeleteDocumentModal isOpen={!!documentToDelete} onClose={() => setDocumentToDelete(null)} document={documentToDelete} />
        </>
    );
}
