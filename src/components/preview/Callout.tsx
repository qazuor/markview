import { cn } from '@/utils/cn';
import { AlertCircle, AlertTriangle, Info, Lightbulb, XCircle } from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

interface CalloutConfig {
    icon: typeof Info;
    bgClass: string;
    borderClass: string;
    titleClass: string;
    iconClass: string;
    label: string;
}

const calloutConfigs: Record<CalloutType, CalloutConfig> = {
    note: {
        icon: Info,
        bgClass: 'bg-blue-50 dark:bg-blue-950/30',
        borderClass: 'border-blue-200 dark:border-blue-800',
        titleClass: 'text-blue-700 dark:text-blue-400',
        iconClass: 'text-blue-500',
        label: 'Note'
    },
    tip: {
        icon: Lightbulb,
        bgClass: 'bg-green-50 dark:bg-green-950/30',
        borderClass: 'border-green-200 dark:border-green-800',
        titleClass: 'text-green-700 dark:text-green-400',
        iconClass: 'text-green-500',
        label: 'Tip'
    },
    important: {
        icon: AlertCircle,
        bgClass: 'bg-purple-50 dark:bg-purple-950/30',
        borderClass: 'border-purple-200 dark:border-purple-800',
        titleClass: 'text-purple-700 dark:text-purple-400',
        iconClass: 'text-purple-500',
        label: 'Important'
    },
    warning: {
        icon: AlertTriangle,
        bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
        borderClass: 'border-yellow-200 dark:border-yellow-800',
        titleClass: 'text-yellow-700 dark:text-yellow-400',
        iconClass: 'text-yellow-500',
        label: 'Warning'
    },
    caution: {
        icon: XCircle,
        bgClass: 'bg-red-50 dark:bg-red-950/30',
        borderClass: 'border-red-200 dark:border-red-800',
        titleClass: 'text-red-700 dark:text-red-400',
        iconClass: 'text-red-500',
        label: 'Caution'
    }
};

interface CalloutProps {
    type: CalloutType;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Callout component for displaying alerts and notes
 */
export function Callout({ type, title, children, className }: CalloutProps) {
    const config = calloutConfigs[type] ?? calloutConfigs.note;
    const Icon = config.icon;
    const displayTitle = title ?? config.label;

    return (
        <div className={cn('callout my-4 rounded-lg border p-4', config.bgClass, config.borderClass, className)} role="alert">
            <div className="flex items-start gap-3">
                <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconClass)} />
                <div className="flex-1 min-w-0">
                    <p className={cn('font-semibold mb-1', config.titleClass)}>{displayTitle}</p>
                    <div className="text-sm text-secondary-700 dark:text-secondary-300">{children}</div>
                </div>
            </div>
        </div>
    );
}

/**
 * Process blockquotes to convert GitHub-style callouts
 * Converts > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]
 */
export function processCallouts(container: HTMLElement): void {
    const blockquotes = container.querySelectorAll('blockquote');

    for (const blockquote of blockquotes) {
        // Skip if already processed
        if (blockquote.classList.contains('callout-processed')) continue;
        blockquote.classList.add('callout-processed');

        // Get the first paragraph
        const firstP = blockquote.querySelector('p');
        if (!firstP) continue;

        // Check for callout syntax: [!TYPE]
        const text = firstP.textContent ?? '';
        const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
        if (!match) continue;

        const type = match[1]?.toLowerCase() as CalloutType;
        const config = calloutConfigs[type];
        if (!config) continue;

        // Remove the callout marker from the first paragraph
        const firstTextNode = firstP.childNodes[0];
        if (firstTextNode?.nodeType === Node.TEXT_NODE) {
            firstTextNode.textContent = (firstTextNode.textContent ?? '').replace(match[0], '');
        }

        // Check if there's a custom title after the type
        let title = config.label;
        const titleMatch = (firstTextNode?.textContent ?? '').match(/^\s*(.+?)(?:\n|$)/);
        if (titleMatch?.[1]?.trim() && firstTextNode) {
            const customTitle = titleMatch[1].trim();
            if (customTitle && customTitle !== firstP.textContent?.trim()) {
                title = customTitle;
                firstTextNode.textContent = (firstTextNode.textContent ?? '').replace(titleMatch[0], '');
            }
        }

        // Create the callout HTML
        const iconHtml = renderToStaticMarkup(createElement(config.icon, { className: cn('h-5 w-5 shrink-0 mt-0.5', config.iconClass) }));

        // Build new callout structure
        const calloutDiv = document.createElement('div');
        calloutDiv.className = cn('callout my-4 rounded-lg border p-4', config.bgClass, config.borderClass);
        calloutDiv.setAttribute('role', 'alert');

        const innerDiv = document.createElement('div');
        innerDiv.className = 'flex items-start gap-3';

        const iconSpan = document.createElement('span');
        iconSpan.innerHTML = iconHtml;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-1 min-w-0';

        const titleP = document.createElement('p');
        titleP.className = cn('font-semibold mb-1', config.titleClass);
        titleP.textContent = title;

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'text-sm text-secondary-700 dark:text-secondary-300 callout-content';

        // Move blockquote content to body
        while (blockquote.firstChild) {
            bodyDiv.appendChild(blockquote.firstChild);
        }

        // Clean up empty first paragraph if content was just the marker
        const firstBodyP = bodyDiv.querySelector('p');
        if (firstBodyP && !firstBodyP.textContent?.trim()) {
            firstBodyP.remove();
        }

        contentDiv.appendChild(titleP);
        contentDiv.appendChild(bodyDiv);
        innerDiv.appendChild(iconSpan);
        innerDiv.appendChild(contentDiv);
        calloutDiv.appendChild(innerDiv);

        // Replace blockquote with callout
        blockquote.parentNode?.replaceChild(calloutDiv, blockquote);
    }
}
