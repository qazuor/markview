/**
 * Scroll position mapping between editor and preview
 */

export interface ScrollPosition {
    line: number;
    offset: number;
}

/**
 * Build a map of source lines to preview element positions
 */
export function buildScrollMap(previewElement: HTMLElement): Map<number, number> {
    const map = new Map<number, number>();

    // Find all elements with data-line attribute
    const elements = previewElement.querySelectorAll('[data-line]');

    for (const element of elements) {
        const line = Number.parseInt(element.getAttribute('data-line') ?? '0', 10);
        if (line > 0) {
            const rect = element.getBoundingClientRect();
            const containerRect = previewElement.getBoundingClientRect();
            map.set(line, rect.top - containerRect.top + previewElement.scrollTop);
        }
    }

    // If no data-line attributes, estimate based on content structure
    if (map.size === 0) {
        const children = previewElement.children;
        const totalHeight = previewElement.scrollHeight;
        const avgHeight = totalHeight / Math.max(children.length, 1);

        for (let i = 0; i < children.length; i++) {
            map.set(i + 1, i * avgHeight);
        }
    }

    return map;
}

/**
 * Find the closest preview position for an editor line
 */
export function findPreviewPosition(line: number, scrollMap: Map<number, number>): number {
    // Exact match
    const exactMatch = scrollMap.get(line);
    if (exactMatch !== undefined) {
        return exactMatch;
    }

    // Find closest lines above and below
    let above = 0;
    let below = Number.POSITIVE_INFINITY;
    let aboveLine = 0;
    let belowLine = 0;

    for (const [mapLine, position] of scrollMap) {
        if (mapLine <= line && mapLine > aboveLine) {
            aboveLine = mapLine;
            above = position;
        }
        if (mapLine >= line && mapLine < belowLine) {
            belowLine = mapLine;
            below = position;
        }
    }

    // Interpolate if we have both above and below
    if (aboveLine > 0 && belowLine < Number.POSITIVE_INFINITY && belowLine > aboveLine) {
        const ratio = (line - aboveLine) / (belowLine - aboveLine);
        return above + ratio * (below - above);
    }

    return above;
}

/**
 * Find the closest editor line for a preview scroll position
 */
export function findEditorLine(scrollTop: number, scrollMap: Map<number, number>): number {
    let closestLine = 1;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const [line, position] of scrollMap) {
        const distance = Math.abs(position - scrollTop);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestLine = line;
        }
    }

    return closestLine;
}

/**
 * Calculate scroll percentage
 */
export function getScrollPercentage(element: HTMLElement): number {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const maxScroll = scrollHeight - clientHeight;
    return maxScroll > 0 ? scrollTop / maxScroll : 0;
}

/**
 * Set scroll position by percentage
 */
export function setScrollPercentage(element: HTMLElement, percentage: number): void {
    const { scrollHeight, clientHeight } = element;
    const maxScroll = scrollHeight - clientHeight;
    element.scrollTop = percentage * maxScroll;
}
