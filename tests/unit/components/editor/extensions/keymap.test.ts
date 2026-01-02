import { createDefaultKeymap, createMarkdownKeymap } from '@/components/editor/extensions/keymap';
import { describe, expect, it, vi } from 'vitest';

// Mock @codemirror/commands
vi.mock('@codemirror/commands', () => ({
    defaultKeymap: [{ key: 'default', run: vi.fn() }],
    indentWithTab: { key: 'Tab', run: vi.fn() }
}));

// Mock @codemirror/view
vi.mock('@codemirror/view', () => ({
    keymap: {
        of: vi.fn((keybindings) => ({ type: 'keymap', bindings: keybindings }))
    }
}));

// Mock commands
vi.mock('@/components/editor/commands', () => ({
    toggleBold: vi.fn(),
    toggleItalic: vi.fn(),
    toggleStrikethrough: vi.fn(),
    setHeading1: vi.fn(),
    setHeading2: vi.fn(),
    setHeading3: vi.fn(),
    setHeading4: vi.fn(),
    setHeading5: vi.fn(),
    setHeading6: vi.fn(),
    insertLink: vi.fn(),
    insertImage: vi.fn(),
    toggleInlineCode: vi.fn(),
    insertCodeBlock: vi.fn(),
    toggleQuote: vi.fn(),
    toggleBulletList: vi.fn(),
    toggleNumberedList: vi.fn(),
    toggleTaskList: vi.fn(),
    insertHorizontalRule: vi.fn()
}));

describe('createMarkdownKeymap', () => {
    it('should return a keymap extension', () => {
        const extension = createMarkdownKeymap();

        expect(extension).toBeDefined();
        expect(extension).toHaveProperty('type', 'keymap');
    });

    it('should include formatting keybindings', () => {
        const extension = createMarkdownKeymap() as { type: string; bindings: { key: string }[] };
        const keys = extension.bindings.map((b) => b.key);

        expect(keys).toContain('Mod-b'); // Bold
        expect(keys).toContain('Mod-i'); // Italic
        expect(keys).toContain('Mod-Shift-s'); // Strikethrough
    });

    it('should include heading keybindings', () => {
        const extension = createMarkdownKeymap() as { type: string; bindings: { key: string }[] };
        const keys = extension.bindings.map((b) => b.key);

        expect(keys).toContain('Mod-1'); // H1
        expect(keys).toContain('Mod-2'); // H2
        expect(keys).toContain('Mod-3'); // H3
        expect(keys).toContain('Mod-4'); // H4
        expect(keys).toContain('Mod-5'); // H5
        expect(keys).toContain('Mod-6'); // H6
    });

    it('should include link and image keybindings', () => {
        const extension = createMarkdownKeymap() as { type: string; bindings: { key: string }[] };
        const keys = extension.bindings.map((b) => b.key);

        expect(keys).toContain('Mod-k'); // Link
        expect(keys).toContain('Mod-Shift-i'); // Image
    });

    it('should include code keybindings', () => {
        const extension = createMarkdownKeymap() as { type: string; bindings: { key: string }[] };
        const keys = extension.bindings.map((b) => b.key);

        expect(keys).toContain('Mod-`'); // Inline code
        expect(keys).toContain('Mod-Shift-`'); // Code block
    });

    it('should include list keybindings', () => {
        const extension = createMarkdownKeymap() as { type: string; bindings: { key: string }[] };
        const keys = extension.bindings.map((b) => b.key);

        expect(keys).toContain('Mod-Shift-q'); // Quote
        expect(keys).toContain('Mod-Shift-u'); // Bullet list
        expect(keys).toContain('Mod-Shift-o'); // Numbered list
        expect(keys).toContain('Mod-Shift-t'); // Task list
    });

    it('should include horizontal rule keybinding', () => {
        const extension = createMarkdownKeymap() as { type: string; bindings: { key: string }[] };
        const keys = extension.bindings.map((b) => b.key);

        expect(keys).toContain('Mod-Shift-h');
    });

    it('should include indentWithTab', () => {
        const extension = createMarkdownKeymap() as { type: string; bindings: { key: string }[] };
        const hasTab = extension.bindings.some((b) => b.key === 'Tab');

        expect(hasTab).toBe(true);
    });

    it('should have correct number of keybindings', () => {
        const extension = createMarkdownKeymap() as { type: string; bindings: unknown[] };

        // 3 formatting + 6 headings + 2 link/image + 2 code + 4 lists + 1 hr + 1 tab = 19
        expect(extension.bindings.length).toBe(19);
    });
});

describe('createDefaultKeymap', () => {
    it('should return a keymap extension', () => {
        const extension = createDefaultKeymap();

        expect(extension).toBeDefined();
        expect(extension).toHaveProperty('type', 'keymap');
    });

    it('should include default keybindings', () => {
        const extension = createDefaultKeymap() as { type: string; bindings: { key: string }[] };

        expect(extension.bindings.length).toBeGreaterThan(0);
    });
});
