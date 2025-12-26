import { cn } from '@/utils/cn';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
}

/**
 * Code block with copy button
 */
export function CodeBlock({ code, language, className }: CodeBlockProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    }, [code]);

    return (
        <div className={cn('group relative', className)}>
            {/* Language badge */}
            {language && (
                <div className="absolute right-12 top-2 text-xs text-secondary-500 opacity-0 transition-opacity group-hover:opacity-100">
                    {language}
                </div>
            )}

            {/* Copy button */}
            <button
                type="button"
                onClick={handleCopy}
                className={cn(
                    'absolute right-2 top-2 rounded px-2 py-1 text-xs transition-all',
                    'opacity-0 group-hover:opacity-100',
                    'bg-secondary-200 text-secondary-700 hover:bg-secondary-300',
                    'dark:bg-secondary-700 dark:text-secondary-300 dark:hover:bg-secondary-600',
                    copied && 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300'
                )}
                title={t('common.copy', 'Copy')}
            >
                {copied ? '✓' : 'Copy'}
            </button>

            {/* Code content - This is a wrapper, actual code is rendered via dangerouslySetInnerHTML */}
            <pre className="overflow-x-auto rounded-lg p-4">
                <code>{code}</code>
            </pre>
        </div>
    );
}

/**
 * Wrap code blocks in preview HTML with copy buttons
 * This processes the rendered HTML to add interactive elements
 */
export function processCodeBlocks(container: HTMLElement): void {
    const codeBlocks = container.querySelectorAll('pre');

    for (const pre of codeBlocks) {
        // Skip if already processed
        if (pre.querySelector('.copy-button')) continue;

        // Create copy button
        const button = document.createElement('button');
        button.className =
            'copy-button absolute right-2 top-2 rounded px-2 py-1 text-xs transition-all opacity-0 group-hover:opacity-100 bg-secondary-200 text-secondary-700 hover:bg-secondary-300 dark:bg-secondary-700 dark:text-secondary-300 dark:hover:bg-secondary-600';
        button.textContent = 'Copy';
        button.type = 'button';

        // Get code content
        const code = pre.querySelector('code');
        const codeText = code?.textContent ?? pre.textContent ?? '';

        // Add click handler
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeText);
                button.textContent = '✓';
                button.classList.add('bg-green-200', 'text-green-700');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('bg-green-200', 'text-green-700');
                }, 2000);
            } catch (error) {
                console.error('Failed to copy:', error);
            }
        });

        // Wrap pre in a group container
        const wrapper = document.createElement('div');
        wrapper.className = 'group relative';
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(button);
    }
}
