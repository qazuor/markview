import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

// Extended sanitization schema to allow more elements
const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        code: [...(defaultSchema.attributes?.code ?? []), 'className'],
        span: [...(defaultSchema.attributes?.span ?? []), 'className', 'style'],
        pre: [...(defaultSchema.attributes?.pre ?? []), 'className'],
        div: [...(defaultSchema.attributes?.div ?? []), 'className', 'data-line']
    },
    tagNames: [...(defaultSchema.tagNames ?? []), 'section', 'aside', 'details', 'summary']
};

/**
 * Create the base Markdown processor
 */
export function createProcessor() {
    return unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml', 'toml'])
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSanitize, sanitizeSchema)
        .use(rehypeStringify);
}

/**
 * Parse Markdown to HTML
 */
export async function parseMarkdown(markdown: string): Promise<string> {
    const processor = createProcessor();
    const result = await processor.process(markdown);
    return String(result);
}

/**
 * Parse Markdown synchronously (for smaller documents)
 */
export function parseMarkdownSync(markdown: string): string {
    const processor = createProcessor();
    const result = processor.processSync(markdown);
    return String(result);
}
