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
import { useSettingsStore } from '@/stores/settingsStore';
import { ClipboardCopy, FileText, Minus, Plus, RotateCcw, SquareCheck, ZoomIn } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface PreviewContextMenuProps {
    children: React.ReactNode;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Context menu for preview area with copy actions
 */
export function PreviewContextMenu({ children, containerRef }: PreviewContextMenuProps) {
    const { t } = useTranslation();
    const zoomPreviewIn = useSettingsStore((s) => s.zoomPreviewIn);
    const zoomPreviewOut = useSettingsStore((s) => s.zoomPreviewOut);
    const resetPreviewZoom = useSettingsStore((s) => s.resetPreviewZoom);
    const previewFontSize = useSettingsStore((s) => s.previewFontSize);

    const handleCopy = useCallback(async () => {
        const selection = window.getSelection();
        const text = selection?.toString();
        if (text) {
            await navigator.clipboard.writeText(text);
        }
    }, []);

    const handleCopyAsMarkdown = useCallback(async () => {
        const selection = window.getSelection();
        const text = selection?.toString();
        if (text) {
            // For now, just copy the plain text
            // A more advanced implementation would convert HTML back to Markdown
            await navigator.clipboard.writeText(text);
        }
    }, []);

    const handleSelectAll = useCallback(() => {
        if (containerRef.current) {
            const range = document.createRange();
            range.selectNodeContents(containerRef.current);
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }, [containerRef]);

    const hasSelection = typeof window !== 'undefined' && window.getSelection()?.toString();

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={handleCopy} disabled={!hasSelection}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    {t('contextMenu.copy')}
                    <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem onClick={handleCopyAsMarkdown} disabled={!hasSelection}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('contextMenu.copyAsMarkdown')}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem onClick={handleSelectAll}>
                    <SquareCheck className="mr-2 h-4 w-4" />
                    {t('contextMenu.selectAll')}
                    <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuSeparator />

                {/* Zoom submenu */}
                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <ZoomIn className="mr-2 h-4 w-4" />
                        {t('zoom.zoom')} ({previewFontSize}px)
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuItem onClick={zoomPreviewIn}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('zoom.zoomIn')}
                            <ContextMenuShortcut>Ctrl++</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={zoomPreviewOut}>
                            <Minus className="mr-2 h-4 w-4" />
                            {t('zoom.zoomOut')}
                            <ContextMenuShortcut>Ctrl+-</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuSeparator />

                        <ContextMenuItem onClick={resetPreviewZoom}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t('zoom.resetZoom')}
                            <ContextMenuShortcut>Ctrl+0</ContextMenuShortcut>
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
