import html2pdf from 'html2pdf.js';

export interface PdfExportOptions {
    filename?: string;
    margin?: number;
    pageSize?: 'a4' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    theme?: 'light' | 'dark';
    onProgress?: (stage: string) => void;
}

/**
 * Get PDF export styles based on theme
 */
function getPdfStyles(theme: 'light' | 'dark'): string {
    const colors = {
        textPrimary: theme === 'dark' ? '#e5e7eb' : '#111827',
        textSecondary: theme === 'dark' ? '#9ca3af' : '#6b7280',
        bgPrimary: theme === 'dark' ? '#1f2937' : '#ffffff',
        bgSecondary: theme === 'dark' ? '#374151' : '#f3f4f6',
        borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
        accentColor: '#3b82f6'
    };

    return `
        * { box-sizing: border-box; }
        .pdf-content {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: ${colors.textPrimary};
            background: ${colors.bgPrimary};
            padding: 2rem;
        }
        .pdf-content h1, .pdf-content h2, .pdf-content h3,
        .pdf-content h4, .pdf-content h5, .pdf-content h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
            line-height: 1.25;
        }
        .pdf-content h1 { font-size: 2em; border-bottom: 1px solid ${colors.borderColor}; padding-bottom: 0.3em; }
        .pdf-content h2 { font-size: 1.5em; border-bottom: 1px solid ${colors.borderColor}; padding-bottom: 0.3em; }
        .pdf-content h3 { font-size: 1.25em; }
        .pdf-content p { margin: 1em 0; }
        .pdf-content a { color: ${colors.accentColor}; text-decoration: none; }
        .pdf-content code {
            background: ${colors.bgSecondary};
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Fira Code', Consolas, Monaco, monospace;
            font-size: 0.9em;
        }
        .pdf-content pre {
            background: ${colors.bgSecondary};
            padding: 1em;
            border-radius: 6px;
            overflow-x: auto;
        }
        .pdf-content pre code { background: none; padding: 0; }
        .pdf-content blockquote {
            margin: 1em 0;
            padding: 0.5em 1em;
            border-left: 4px solid ${colors.accentColor};
            background: ${colors.bgSecondary};
            color: ${colors.textSecondary};
        }
        .pdf-content ul, .pdf-content ol { margin: 1em 0; padding-left: 2em; }
        .pdf-content li { margin: 0.5em 0; }
        .pdf-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .pdf-content th, .pdf-content td {
            border: 1px solid ${colors.borderColor};
            padding: 0.5em;
            text-align: left;
        }
        .pdf-content th { background: ${colors.bgSecondary}; font-weight: 600; }
        .pdf-content img { max-width: 100%; height: auto; }
        .pdf-content hr { border: none; border-top: 1px solid ${colors.borderColor}; margin: 2em 0; }
        .pdf-content input[type="checkbox"] { margin-right: 0.5em; }
    `;
}

/**
 * Wait for next animation frame + small delay to ensure browser repaint
 */
function waitForRepaint(): Promise<void> {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            setTimeout(resolve, 100);
        });
    });
}

/**
 * Export HTML content to PDF
 */
export async function exportToPdf(htmlContent: string, options: PdfExportOptions = {}): Promise<void> {
    const { filename = 'document.pdf', margin = 10, pageSize = 'a4', orientation = 'portrait', theme = 'light', onProgress } = options;

    // Add styles to document head temporarily
    const styleElement = document.createElement('style');
    styleElement.id = 'pdf-export-styles';
    styleElement.textContent = getPdfStyles(theme);
    document.head.appendChild(styleElement);

    // Create a temporary container - positioned absolutely, visible but behind content
    const container = document.createElement('div');
    container.id = 'pdf-export-container';
    container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 210mm;
        min-height: 297mm;
        z-index: -1;
        background: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
        overflow: visible;
    `;

    // Add content wrapper with class for styling
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'pdf-content';
    contentWrapper.innerHTML = htmlContent;
    container.appendChild(contentWrapper);

    document.body.appendChild(container);

    // Force a reflow to ensure styles are applied
    void container.offsetHeight;

    try {
        onProgress?.('Rendering...');

        // Get page size dimensions
        const pageSizes = {
            a4: [210, 297] as const,
            letter: [215.9, 279.4] as const,
            legal: [215.9, 355.6] as const
        };
        const dimensions = pageSizes[pageSize] ?? pageSizes.a4;
        const width = dimensions[0];
        const height = dimensions[1];

        // Wait for browser to fully render the content
        await waitForRepaint();

        // Get dimensions after repaint
        const containerWidth = container.scrollWidth || container.offsetWidth;
        const containerHeight = container.scrollHeight || container.offsetHeight;

        // Configure html2pdf options
        const opt = {
            margin,
            filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                width: containerWidth,
                height: containerHeight,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0
            },
            jsPDF: {
                unit: 'mm' as const,
                format: (orientation === 'landscape' ? [height, width] : [width, height]) as [number, number],
                orientation
            },
            pagebreak: { mode: ['css', 'legacy'] as const, avoid: ['pre', 'code', 'img'] }
        };

        onProgress?.('Generating PDF...');

        // Generate and save PDF
        await html2pdf().set(opt).from(container).save();

        onProgress?.('Complete');
    } finally {
        // Clean up
        document.body.removeChild(container);
        const styleEl = document.getElementById('pdf-export-styles');
        if (styleEl) {
            document.head.removeChild(styleEl);
        }
    }
}

/**
 * Export HTML content to PDF blob (for preview or custom handling)
 */
export async function generatePdfBlob(htmlContent: string, options: Omit<PdfExportOptions, 'filename'> = {}): Promise<Blob> {
    const { margin = 10, pageSize = 'a4', orientation = 'portrait', theme = 'light' } = options;

    // Add styles to document head temporarily
    const styleElement = document.createElement('style');
    styleElement.id = 'pdf-export-styles-blob';
    styleElement.textContent = getPdfStyles(theme);
    document.head.appendChild(styleElement);

    // Create a temporary container - positioned absolutely, visible but behind content
    const container = document.createElement('div');
    container.id = 'pdf-export-container-blob';
    container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 210mm;
        min-height: 297mm;
        z-index: -1;
        background: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
        overflow: visible;
    `;

    // Add content wrapper with class for styling
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'pdf-content';
    contentWrapper.innerHTML = htmlContent;
    container.appendChild(contentWrapper);

    document.body.appendChild(container);

    // Force a reflow to ensure styles are applied
    void container.offsetHeight;

    try {
        const pageSizes = {
            a4: [210, 297] as const,
            letter: [215.9, 279.4] as const,
            legal: [215.9, 355.6] as const
        };
        const dimensions = pageSizes[pageSize] ?? pageSizes.a4;
        const width = dimensions[0];
        const height = dimensions[1];

        // Wait for browser to fully render the content
        await waitForRepaint();

        // Get dimensions after repaint
        const containerWidth = container.scrollWidth || container.offsetWidth;
        const containerHeight = container.scrollHeight || container.offsetHeight;

        const opt = {
            margin,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                width: containerWidth,
                height: containerHeight,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0
            },
            jsPDF: {
                unit: 'mm' as const,
                format: (orientation === 'landscape' ? [height, width] : [width, height]) as [number, number],
                orientation
            },
            pagebreak: { mode: ['css', 'legacy'] as const, avoid: ['pre', 'code', 'img'] }
        };

        const blob = await html2pdf().set(opt).from(container).outputPdf('blob');
        return blob as Blob;
    } finally {
        document.body.removeChild(container);
        const styleEl = document.getElementById('pdf-export-styles-blob');
        if (styleEl) {
            document.head.removeChild(styleEl);
        }
    }
}
