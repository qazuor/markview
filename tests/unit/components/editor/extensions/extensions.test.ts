import { describe, expect, it, vi } from 'vitest';

// Mock CodeMirror modules
vi.mock('@codemirror/view', () => ({
    highlightActiveLine: vi.fn(() => ({ name: 'highlightActiveLine' })),
    highlightActiveLineGutter: vi.fn(() => ({ name: 'highlightActiveLineGutter' })),
    lineNumbers: vi.fn(() => ({ name: 'lineNumbers' })),
    EditorView: {
        lineWrapping: { name: 'lineWrapping' }
    },
    keymap: {
        of: vi.fn((keymaps) => ({ name: 'keymap', keymaps }))
    }
}));

vi.mock('@codemirror/language', () => ({
    bracketMatching: vi.fn(() => ({ name: 'bracketMatching' }))
}));

vi.mock('@codemirror/commands', () => ({
    history: vi.fn((opts) => ({ name: 'history', opts })),
    historyKeymap: [{ key: 'Mod-z' }, { key: 'Mod-Shift-z' }],
    undo: vi.fn(),
    redo: vi.fn()
}));

vi.mock('@codemirror/lang-markdown', () => ({
    markdown: vi.fn((opts) => ({ name: 'markdown', opts })),
    markdownLanguage: { name: 'markdownLanguage' }
}));

vi.mock('@codemirror/language-data', () => ({
    languages: [{ name: 'javascript' }, { name: 'python' }]
}));

vi.mock('@replit/codemirror-minimap', () => ({
    showMinimap: {
        compute: vi.fn((deps, fn) => {
            // Call the function to test its implementation
            fn();
            return { name: 'minimap', deps };
        })
    }
}));

vi.mock('@codemirror/lint', () => ({
    linter: vi.fn((source, opts) => ({ name: 'linter', source, opts }))
}));

vi.mock('@/services/markdown/linter', () => ({
    lintMarkdownSync: vi.fn(() => []),
    toCodeMirrorDiagnostics: vi.fn(() => [])
}));

describe('Editor Extensions', () => {
    describe('createActiveLineExtension', () => {
        it('should return array with highlightActiveLine and highlightActiveLineGutter', async () => {
            const { createActiveLineExtension } = await import('@/components/editor/extensions/activeLine');
            const result = createActiveLineExtension();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        it('should call CodeMirror highlight functions', async () => {
            const { highlightActiveLine, highlightActiveLineGutter } = await import('@codemirror/view');
            const { createActiveLineExtension } = await import('@/components/editor/extensions/activeLine');

            createActiveLineExtension();

            expect(highlightActiveLine).toHaveBeenCalled();
            expect(highlightActiveLineGutter).toHaveBeenCalled();
        });
    });

    describe('createBracketMatchingExtension', () => {
        it('should return bracket matching extension', async () => {
            const { createBracketMatchingExtension } = await import('@/components/editor/extensions/brackets');
            const result = createBracketMatchingExtension();

            expect(result).toBeDefined();
        });

        it('should call bracketMatching', async () => {
            const { bracketMatching } = await import('@codemirror/language');
            const { createBracketMatchingExtension } = await import('@/components/editor/extensions/brackets');

            createBracketMatchingExtension();

            expect(bracketMatching).toHaveBeenCalled();
        });
    });

    describe('createHistoryExtension', () => {
        it('should return array with history and keymap', async () => {
            const { createHistoryExtension } = await import('@/components/editor/extensions/history');
            const result = createHistoryExtension();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        it('should use default depth of 100', async () => {
            const { history } = await import('@codemirror/commands');
            const { createHistoryExtension } = await import('@/components/editor/extensions/history');

            createHistoryExtension();

            expect(history).toHaveBeenCalledWith({ minDepth: 100 });
        });

        it('should use custom depth', async () => {
            const { history } = await import('@codemirror/commands');
            const { createHistoryExtension } = await import('@/components/editor/extensions/history');

            createHistoryExtension(200);

            expect(history).toHaveBeenCalledWith({ minDepth: 200 });
        });

        it('should export undo and redo', async () => {
            const { undo, redo } = await import('@/components/editor/extensions/history');

            expect(undo).toBeDefined();
            expect(redo).toBeDefined();
        });
    });

    describe('createLineNumbersExtension', () => {
        it('should return line numbers extension when enabled', async () => {
            const { createLineNumbersExtension } = await import('@/components/editor/extensions/lineNumbers');
            const result = createLineNumbersExtension(true);

            expect(result).toBeDefined();
        });

        it('should return empty array when disabled', async () => {
            const { createLineNumbersExtension } = await import('@/components/editor/extensions/lineNumbers');
            const result = createLineNumbersExtension(false);

            expect(result).toEqual([]);
        });

        it('should default to enabled', async () => {
            const { lineNumbers } = await import('@codemirror/view');
            const { createLineNumbersExtension } = await import('@/components/editor/extensions/lineNumbers');

            createLineNumbersExtension();

            expect(lineNumbers).toHaveBeenCalled();
        });
    });

    describe('createWordWrapExtension', () => {
        it('should return lineWrapping when enabled', async () => {
            const { createWordWrapExtension } = await import('@/components/editor/extensions/wordWrap');
            const result = createWordWrapExtension(true);

            expect(result).toBeDefined();
            expect(result).toHaveProperty('name', 'lineWrapping');
        });

        it('should return empty array when disabled', async () => {
            const { createWordWrapExtension } = await import('@/components/editor/extensions/wordWrap');
            const result = createWordWrapExtension(false);

            expect(result).toEqual([]);
        });

        it('should default to enabled', async () => {
            const { createWordWrapExtension } = await import('@/components/editor/extensions/wordWrap');
            const result = createWordWrapExtension();

            expect(result).toHaveProperty('name', 'lineWrapping');
        });
    });

    describe('createMarkdownExtension', () => {
        it('should return markdown extension', async () => {
            const { createMarkdownExtension } = await import('@/components/editor/extensions/markdown');
            const result = createMarkdownExtension();

            expect(result).toBeDefined();
        });

        it('should configure markdown with GFM support', async () => {
            const { markdown, markdownLanguage } = await import('@codemirror/lang-markdown');
            const { languages } = await import('@codemirror/language-data');
            const { createMarkdownExtension } = await import('@/components/editor/extensions/markdown');

            createMarkdownExtension();

            expect(markdown).toHaveBeenCalledWith({
                base: markdownLanguage,
                codeLanguages: languages,
                addKeymap: true
            });
        });
    });

    describe('createMinimapExtension', () => {
        it('should return minimap extension when enabled', async () => {
            const { createMinimapExtension } = await import('@/components/editor/extensions/minimap');
            const result = createMinimapExtension(true);

            expect(result).toBeDefined();
        });

        it('should return empty array when disabled', async () => {
            const { createMinimapExtension } = await import('@/components/editor/extensions/minimap');
            const result = createMinimapExtension(false);

            expect(result).toEqual([]);
        });

        it('should use showMinimap.compute', async () => {
            const { showMinimap } = await import('@replit/codemirror-minimap');
            const { createMinimapExtension } = await import('@/components/editor/extensions/minimap');

            createMinimapExtension(true);

            expect(showMinimap.compute).toHaveBeenCalled();
        });
    });

    describe('createEmptyMinimapExtension', () => {
        it('should return empty array', async () => {
            const { createEmptyMinimapExtension } = await import('@/components/editor/extensions/minimap');
            const result = createEmptyMinimapExtension();

            expect(result).toEqual([]);
        });
    });

    describe('createMarkdownLinter', () => {
        it('should return linter extension', async () => {
            const { createMarkdownLinter } = await import('@/components/editor/extensions/linting');
            const result = createMarkdownLinter();

            expect(result).toBeDefined();
        });

        it('should configure linter with delay', async () => {
            const { linter } = await import('@codemirror/lint');
            const { createMarkdownLinter } = await import('@/components/editor/extensions/linting');

            createMarkdownLinter();

            expect(linter).toHaveBeenCalledWith(expect.any(Function), { delay: 500 });
        });
    });

    describe('createEmptyLinter', () => {
        it('should return linter that returns empty array', async () => {
            const { createEmptyLinter } = await import('@/components/editor/extensions/linting');
            const result = createEmptyLinter();

            expect(result).toBeDefined();
        });

        it('should configure with longer delay', async () => {
            const { linter } = await import('@codemirror/lint');
            const { createEmptyLinter } = await import('@/components/editor/extensions/linting');

            createEmptyLinter();

            expect(linter).toHaveBeenCalledWith(expect.any(Function), { delay: 1000 });
        });
    });
});
