import mermaid from 'mermaid';
import { useEffect, useId } from 'react';

// Initialize mermaid with default config
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit'
});

interface MermaidProps {
    chart: string;
    className?: string;
}

/**
 * Component to render a Mermaid diagram
 */
export function Mermaid({ chart, className }: MermaidProps) {
    const id = useId().replace(/:/g, '-');

    useEffect(() => {
        const renderChart = async () => {
            const element = document.getElementById(id);
            if (!element) return;

            try {
                const { svg } = await mermaid.render(`mermaid-${id}`, chart);
                element.innerHTML = svg;
            } catch (error) {
                console.error('Mermaid render error:', error);
                element.innerHTML = `<pre class="text-red-500 text-sm p-2">Mermaid Error: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`;
            }
        };

        renderChart();
    }, [id, chart]);

    return <div id={id} className={className} />;
}

/**
 * Update mermaid theme based on document theme
 */
export function updateMermaidTheme(isDark: boolean): void {
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit'
    });
}

/**
 * Process mermaid code blocks in the preview HTML
 * Converts ```mermaid code blocks into rendered diagrams
 */
export async function processMermaidBlocks(container: HTMLElement, isDark: boolean): Promise<void> {
    // Update theme before processing
    updateMermaidTheme(isDark);

    // Find all code blocks with language-mermaid class
    const mermaidBlocks = container.querySelectorAll('code.language-mermaid');

    for (const block of mermaidBlocks) {
        const pre = block.parentElement;
        if (!pre || pre.tagName !== 'PRE') continue;

        // Skip if already processed
        if (pre.classList.contains('mermaid-processed')) continue;
        pre.classList.add('mermaid-processed');

        const chart = block.textContent ?? '';
        if (!chart.trim()) continue;

        // Create container for the diagram
        const diagramContainer = document.createElement('div');
        diagramContainer.className = 'mermaid-diagram my-4 flex justify-center overflow-x-auto';

        const diagramId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

        try {
            const { svg } = await mermaid.render(diagramId, chart);
            diagramContainer.innerHTML = svg;

            // Replace the pre block with the diagram
            pre.parentNode?.replaceChild(diagramContainer, pre);
        } catch (error) {
            console.error('Mermaid render error:', error);
            diagramContainer.innerHTML = `
                <div class="border border-red-300 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-950">
                    <p class="text-red-600 dark:text-red-400 text-sm font-medium">Mermaid Diagram Error</p>
                    <pre class="text-red-500 text-xs mt-2 overflow-auto">${error instanceof Error ? error.message : 'Unknown error'}</pre>
                </div>
            `;
            pre.parentNode?.replaceChild(diagramContainer, pre);
        }
    }
}
