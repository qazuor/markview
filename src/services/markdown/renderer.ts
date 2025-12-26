import rehypeShiki from '@shikijs/rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export type SyntaxTheme = 'light' | 'dark';

// Extended sanitization schema for Shiki output
const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        code: [...(defaultSchema.attributes?.code ?? []), 'className', 'style'],
        span: [...(defaultSchema.attributes?.span ?? []), 'className', 'style'],
        pre: [...(defaultSchema.attributes?.pre ?? []), 'className', 'style', 'tabindex'],
        div: [...(defaultSchema.attributes?.div ?? []), 'className', 'data-line', 'data-language']
    },
    tagNames: [...(defaultSchema.tagNames ?? []), 'section', 'aside', 'details', 'summary']
};

/**
 * Create Markdown processor with syntax highlighting
 */
export async function createRendererProcessor(theme: SyntaxTheme = 'light') {
    const shikiTheme = theme === 'dark' ? 'github-dark' : 'github-light';

    return unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml', 'toml'])
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeShiki, {
            theme: shikiTheme,
            fallbackLanguage: 'text'
        })
        .use(rehypeSanitize, sanitizeSchema)
        .use(rehypeStringify);
}

/**
 * Render Markdown to HTML with syntax highlighting
 */
export async function renderMarkdown(markdown: string, theme: SyntaxTheme = 'light'): Promise<string> {
    const processor = await createRendererProcessor(theme);
    const result = await processor.process(markdown);
    return String(result);
}

/**
 * Render Markdown with line position data attributes for scroll sync
 */
export async function renderMarkdownWithPositions(
    markdown: string,
    theme: SyntaxTheme = 'light'
): Promise<{ html: string; lineMap: Map<number, number> }> {
    const html = await renderMarkdown(markdown, theme);

    // Build line map from source positions
    const lineMap = new Map<number, number>();
    const lines = markdown.split('\n');
    let position = 0;

    for (let i = 0; i < lines.length; i++) {
        lineMap.set(i + 1, position);
        position += (lines[i]?.length ?? 0) + 1;
    }

    return { html, lineMap };
}
