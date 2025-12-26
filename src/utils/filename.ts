/**
 * Extract the first H1 heading from Markdown content
 */
export function extractHeading(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    if (!match?.[1]) return null;

    // Clean up the heading
    return match[1]
        .trim()
        .replace(/[#*_`[\]]/g, '') // Remove markdown characters
        .trim();
}

/**
 * Sanitize a filename by removing invalid characters
 */
export function sanitizeFilename(name: string): string {
    return name
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .slice(0, 100); // Limit length
}

/**
 * Generate a filename from content or use default
 */
export function generateFilename(content: string, defaultName = 'Untitled'): string {
    const heading = extractHeading(content);
    if (heading) {
        return sanitizeFilename(heading);
    }
    return defaultName;
}
