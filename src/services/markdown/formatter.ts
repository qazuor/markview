import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

/**
 * Format markdown content using remark
 */
export async function formatMarkdown(content: string): Promise<string> {
    try {
        const processor = unified().use(remarkParse).use(remarkFrontmatter, ['yaml', 'toml']).use(remarkGfm).use(remarkStringify, {
            bullet: '-',
            bulletOther: '*',
            bulletOrdered: '.',
            emphasis: '_',
            strong: '*',
            fence: '`',
            fences: true,
            listItemIndent: 'one',
            rule: '-',
            tightDefinitions: true
        });

        const result = await processor.process(content);
        return String(result);
    } catch (error) {
        console.error('Failed to format markdown:', error);
        return content;
    }
}

/**
 * Synchronous format for simple cases (best effort)
 */
export function formatMarkdownSync(content: string): string {
    try {
        const processor = unified().use(remarkParse).use(remarkFrontmatter, ['yaml', 'toml']).use(remarkGfm).use(remarkStringify, {
            bullet: '-',
            bulletOther: '*',
            bulletOrdered: '.',
            emphasis: '_',
            strong: '*',
            fence: '`',
            fences: true,
            listItemIndent: 'one',
            rule: '-',
            tightDefinitions: true
        });

        const result = processor.processSync(content);
        return String(result);
    } catch (error) {
        console.error('Failed to format markdown:', error);
        return content;
    }
}
