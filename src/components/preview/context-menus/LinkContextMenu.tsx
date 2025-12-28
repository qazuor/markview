import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { ClipboardCopy, ExternalLink, FileText, Link } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface LinkContextMenuProps {
    href: string;
    text?: string;
    children: React.ReactNode;
}

/**
 * Context menu for links in preview
 */
export function LinkContextMenu({ href, text, children }: LinkContextMenuProps) {
    const { t } = useTranslation();

    const handleOpenLink = useCallback(() => {
        window.open(href, '_self');
    }, [href]);

    const handleOpenInNewTab = useCallback(() => {
        window.open(href, '_blank', 'noopener,noreferrer');
    }, [href]);

    const handleCopyLinkUrl = useCallback(async () => {
        await navigator.clipboard.writeText(href);
    }, [href]);

    const handleCopyAsMarkdown = useCallback(async () => {
        const linkText = text || href;
        const markdown = `[${linkText}](${href})`;
        await navigator.clipboard.writeText(markdown);
    }, [href, text]);

    return (
        <ContextMenuPrimitive.Root>
            <ContextMenuPrimitive.Trigger asChild>{children}</ContextMenuPrimitive.Trigger>
            <ContextMenuContent className="w-52">
                <ContextMenuItem onClick={handleOpenLink}>
                    <Link className="mr-2 h-4 w-4" />
                    {t('contextMenu.openLink')}
                </ContextMenuItem>

                <ContextMenuItem onClick={handleOpenInNewTab}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('contextMenu.openInNewTab')}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem onClick={handleCopyLinkUrl}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    {t('contextMenu.copyLinkUrl')}
                </ContextMenuItem>

                <ContextMenuItem onClick={handleCopyAsMarkdown}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('contextMenu.copyAsMarkdown')}
                </ContextMenuItem>

                <ContextMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-text-muted truncate max-w-[200px]">{href}</div>
            </ContextMenuContent>
        </ContextMenuPrimitive.Root>
    );
}
