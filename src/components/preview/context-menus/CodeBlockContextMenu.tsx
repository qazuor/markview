import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut } from '@/components/ui';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Check, ClipboardCopy, Code } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CodeBlockContextMenuProps {
    code: string;
    language?: string;
    children: React.ReactNode;
}

/**
 * Context menu for code blocks in preview
 */
export function CodeBlockContextMenu({ code, language, children }: CodeBlockContextMenuProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopyCode = useCallback(async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    const handleCopyWithLanguage = useCallback(async () => {
        const lang = language || '';
        const markdown = `\`\`\`${lang}\n${code}\n\`\`\``;
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code, language]);

    return (
        <ContextMenuPrimitive.Root>
            <ContextMenuPrimitive.Trigger asChild>{children}</ContextMenuPrimitive.Trigger>
            <ContextMenuContent className="w-52">
                <ContextMenuItem onClick={handleCopyCode}>
                    {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
                    {t('contextMenu.copyCode')}
                    <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem onClick={handleCopyWithLanguage}>
                    <Code className="mr-2 h-4 w-4" />
                    {t('contextMenu.copyWithLanguage')}
                </ContextMenuItem>

                {language && (
                    <>
                        <ContextMenuSeparator />
                        <div className="px-2 py-1.5 text-xs text-text-muted">
                            Language: <span className="font-mono">{language}</span>
                        </div>
                    </>
                )}
            </ContextMenuContent>
        </ContextMenuPrimitive.Root>
    );
}
