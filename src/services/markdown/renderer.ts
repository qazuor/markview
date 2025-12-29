import rehypeShiki from '@shikijs/rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { rehypeLineNumbers } from './rehypeLineNumbers';

export type SyntaxTheme = 'light' | 'dark';

// Extended sanitization schema for Shiki output, KaTeX, and scroll sync
const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        // Allow data-line on all block elements for scroll sync (camelCase for hast)
        '*': [...(defaultSchema.attributes?.['*'] ?? []), 'dataLine'],
        code: [...(defaultSchema.attributes?.code ?? []), 'className', 'style'],
        span: [...(defaultSchema.attributes?.span ?? []), 'className', 'style', 'aria-hidden'],
        pre: [...(defaultSchema.attributes?.pre ?? []), 'className', 'style', 'tabindex'],
        div: [...(defaultSchema.attributes?.div ?? []), 'className', 'data-language'],
        // KaTeX elements
        math: ['xmlns', 'display'],
        semantics: [],
        annotation: ['encoding'],
        mrow: [],
        mi: [],
        mo: ['fence', 'stretchy', 'symmetric', 'lspace', 'rspace', 'minsize', 'maxsize', 'separator', 'largeop', 'movablelimits', 'accent'],
        mn: [],
        msup: [],
        msub: [],
        msubsup: [],
        mfrac: ['linethickness'],
        msqrt: [],
        mroot: [],
        munder: [],
        mover: [],
        munderover: [],
        mtable: ['columnalign', 'rowspacing', 'columnspacing'],
        mtr: [],
        mtd: [],
        mtext: [],
        mspace: ['width', 'height', 'depth'],
        menclose: ['notation'],
        mstyle: ['displaystyle', 'scriptlevel'],
        mpadded: ['width', 'height', 'depth', 'lspace', 'voffset']
    },
    tagNames: [
        ...(defaultSchema.tagNames ?? []),
        'section',
        'aside',
        'details',
        'summary',
        // KaTeX elements
        'math',
        'semantics',
        'annotation',
        'mrow',
        'mi',
        'mo',
        'mn',
        'msup',
        'msub',
        'msubsup',
        'mfrac',
        'msqrt',
        'mroot',
        'munder',
        'mover',
        'munderover',
        'mtable',
        'mtr',
        'mtd',
        'mtext',
        'mspace',
        'menclose',
        'mstyle',
        'mpadded'
    ]
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
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeKatex, {
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false
        })
        .use(rehypeShiki, {
            theme: shikiTheme,
            fallbackLanguage: 'text'
        })
        .use(rehypeLineNumbers)
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
