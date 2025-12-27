import type { Diagnostic } from '@codemirror/lint';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkLint from 'remark-lint';
import remarkParse from 'remark-parse';
import presetLintRecommended from 'remark-preset-lint-recommended';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

export interface LintResult {
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
    ruleId?: string;
}

interface VFileMessage {
    line?: number | null;
    column?: number | null;
    message: string;
    fatal?: boolean | null;
    ruleId?: string | null;
    place?: {
        end?: { line: number; column: number };
    };
}

interface VFileLike {
    messages: VFileMessage[];
}

/**
 * Lint markdown content using remark-lint
 */
export async function lintMarkdown(content: string): Promise<LintResult[]> {
    try {
        const processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, ['yaml', 'toml'])
            .use(remarkGfm)
            .use(remarkLint)
            .use(presetLintRecommended)
            .use(remarkStringify);

        const file = await processor.process(content);
        return convertVFileMessages(file as VFileLike);
    } catch (error) {
        console.error('Failed to lint markdown:', error);
        return [];
    }
}

/**
 * Synchronous lint for simple cases
 */
export function lintMarkdownSync(content: string): LintResult[] {
    try {
        const processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, ['yaml', 'toml'])
            .use(remarkGfm)
            .use(remarkLint)
            .use(presetLintRecommended)
            .use(remarkStringify);

        const file = processor.processSync(content);
        return convertVFileMessages(file as VFileLike);
    } catch (error) {
        console.error('Failed to lint markdown:', error);
        return [];
    }
}

/**
 * Convert VFile messages to LintResult format
 */
function convertVFileMessages(file: VFileLike): LintResult[] {
    return file.messages.map((msg: VFileMessage) => ({
        line: msg.line ?? 1,
        column: msg.column ?? 1,
        endLine: msg.place?.end?.line,
        endColumn: msg.place?.end?.column,
        message: msg.message,
        severity: msg.fatal ? 'error' : 'warning',
        ruleId: msg.ruleId ?? undefined
    }));
}

/**
 * Convert LintResult to CodeMirror Diagnostic format
 */
export function toCodeMirrorDiagnostics(results: LintResult[], doc: { line: (n: number) => { from: number; to: number } }): Diagnostic[] {
    return results.map((result) => {
        const lineInfo = doc.line(Math.max(1, result.line));
        const from = lineInfo.from + Math.max(0, result.column - 1);
        const to = result.endColumn ? lineInfo.from + Math.max(0, result.endColumn - 1) : lineInfo.to;

        return {
            from: Math.min(from, lineInfo.to),
            to: Math.min(to, lineInfo.to),
            severity: result.severity === 'error' ? 'error' : result.severity === 'warning' ? 'warning' : 'info',
            message: result.message,
            source: result.ruleId ?? 'remark-lint'
        };
    });
}
