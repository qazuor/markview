export interface TocItem {
    id: string;
    level: number;
    text: string;
    line: number;
}

/**
 * Extract table of contents from Markdown content
 */
export function extractToc(content: string): TocItem[] {
    const lines = content.split('\n');
    const toc: TocItem[] = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';

        // Track code blocks to ignore headings inside them
        if (line.startsWith('```') || line.startsWith('~~~')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (inCodeBlock) continue;

        // Match ATX headings (# heading)
        const atxMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (atxMatch?.[1] && atxMatch[2]) {
            const level = atxMatch[1].length;
            const text = atxMatch[2].trim();

            // Generate unique ID
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

            toc.push({
                id: `${id}-${i}`,
                level,
                text,
                line: i + 1 // 1-based line number
            });
        }
    }

    return toc;
}

/**
 * Build hierarchical TOC structure
 */
export function buildTocTree(items: TocItem[]): TocItem[] {
    // For now, just return flat list
    // Can be enhanced to build nested structure if needed
    return items;
}
