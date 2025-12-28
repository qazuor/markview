import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { ClipboardCopy, ExternalLink, FileText, Image } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageContextMenuProps {
    src: string;
    alt?: string;
    children: React.ReactNode;
}

/**
 * Context menu for images in preview
 */
export function ImageContextMenu({ src, alt, children }: ImageContextMenuProps) {
    const { t } = useTranslation();

    const handleCopyImageUrl = useCallback(async () => {
        await navigator.clipboard.writeText(src);
    }, [src]);

    const handleOpenInNewTab = useCallback(() => {
        window.open(src, '_blank', 'noopener,noreferrer');
    }, [src]);

    const handleCopyAsMarkdown = useCallback(async () => {
        const markdown = `![${alt || ''}](${src})`;
        await navigator.clipboard.writeText(markdown);
    }, [src, alt]);

    return (
        <ContextMenuPrimitive.Root>
            <ContextMenuPrimitive.Trigger asChild>{children}</ContextMenuPrimitive.Trigger>
            <ContextMenuContent className="w-52">
                <ContextMenuItem onClick={handleOpenInNewTab}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('contextMenu.openInNewTab')}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem onClick={handleCopyImageUrl}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    {t('contextMenu.copyImageUrl')}
                </ContextMenuItem>

                <ContextMenuItem onClick={handleCopyAsMarkdown}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('contextMenu.copyAsMarkdown')}
                </ContextMenuItem>

                {alt && (
                    <>
                        <ContextMenuSeparator />
                        <div className="px-2 py-1.5 text-xs text-text-muted flex items-center gap-2">
                            <Image className="h-3 w-3" />
                            <span className="truncate max-w-[180px]">{alt}</span>
                        </div>
                    </>
                )}
            </ContextMenuContent>
        </ContextMenuPrimitive.Root>
    );
}
