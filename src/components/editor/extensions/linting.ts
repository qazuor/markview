import { lintMarkdownSync, toCodeMirrorDiagnostics } from '@/services/markdown/linter';
import { linter } from '@codemirror/lint';

/**
 * Create markdown linting extension for CodeMirror
 */
export function createMarkdownLinter() {
    return linter(
        (view) => {
            const content = view.state.doc.toString();
            const results = lintMarkdownSync(content);
            return toCodeMirrorDiagnostics(results, view.state.doc);
        },
        {
            delay: 500
        }
    );
}

/**
 * Empty linter extension (when linting is disabled)
 */
export function createEmptyLinter() {
    return linter(() => [], { delay: 1000 });
}
