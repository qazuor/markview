# Phase 02: Core Editor Implementation

## Overview

This phase implements the core CodeMirror 6 editor with Markdown syntax highlighting, basic editing features, and keyboard shortcuts.

**Prerequisites**: Phase 01 completed
**Estimated Tasks**: 28
**Dependencies**: CodeMirror 6, @codemirror/lang-markdown

---

## Tasks

### 2.1 CodeMirror Installation

#### TASK-026: Install CodeMirror dependencies
- **Description**: Install all required CodeMirror packages
- **Acceptance Criteria**:
  - [ ] @codemirror/state installed
  - [ ] @codemirror/view installed
  - [ ] @codemirror/lang-markdown installed
  - [ ] @codemirror/language installed
  - [ ] @codemirror/commands installed
  - [ ] @codemirror/autocomplete installed
  - [ ] @codemirror/search installed
  - [ ] @codemirror/lint installed
- **Files**: `package.json`

#### TASK-027: Create Editor component structure
- **Description**: Set up the Editor component folder structure
- **Acceptance Criteria**:
  - [ ] `src/components/editor/Editor.tsx` main component
  - [ ] `src/components/editor/index.ts` exports
  - [ ] `src/components/editor/hooks/` folder for hooks
  - [ ] `src/components/editor/extensions/` folder for CM extensions
- **Files**: Multiple files in `src/components/editor/`

---

### 2.2 Basic Editor Implementation

#### TASK-028: Create useCodeMirror hook
- **Description**: Custom hook to initialize and manage CodeMirror instance
- **Acceptance Criteria**:
  - [ ] Hook accepts initial content and onChange callback
  - [ ] Returns editor view reference
  - [ ] Handles cleanup on unmount
  - [ ] Exposes methods: focus, getValue, setValue
- **Files**: `src/components/editor/hooks/useCodeMirror.ts`

#### TASK-029: Implement basic Editor component
- **Description**: Create the main Editor React component
- **Acceptance Criteria**:
  - [ ] Renders CodeMirror editor
  - [ ] Accepts value and onChange props
  - [ ] Full height within container
  - [ ] Responsive sizing
  - [ ] Basic styling with Tailwind
- **Files**: `src/components/editor/Editor.tsx`

#### TASK-030: Configure Markdown language support
- **Description**: Set up Markdown syntax highlighting
- **Acceptance Criteria**:
  - [ ] Markdown language mode active
  - [ ] GFM extensions enabled
  - [ ] Headings highlighted
  - [ ] Bold/italic highlighted
  - [ ] Links highlighted
  - [ ] Code blocks highlighted
- **Files**: `src/components/editor/extensions/markdown.ts`

---

### 2.3 Editor Theme and Styling

#### TASK-031: Create light theme
- **Description**: Custom CodeMirror theme for light mode
- **Acceptance Criteria**:
  - [ ] Background and foreground colors
  - [ ] Syntax colors for all Markdown elements
  - [ ] Cursor and selection styles
  - [ ] Line number styling
  - [ ] Gutter styling
- **Files**: `src/components/editor/themes/light.ts`

#### TASK-032: Create dark theme
- **Description**: Custom CodeMirror theme for dark mode
- **Acceptance Criteria**:
  - [ ] Dark background with light text
  - [ ] Syntax colors adapted for dark mode
  - [ ] High contrast for readability
  - [ ] Consistent with app dark theme
- **Files**: `src/components/editor/themes/dark.ts`

#### TASK-033: Implement theme switching
- **Description**: Hook to switch themes based on settings
- **Acceptance Criteria**:
  - [ ] Theme changes without editor remount
  - [ ] Syncs with settings store theme value
  - [ ] Smooth transition
- **Files**: `src/components/editor/hooks/useEditorTheme.ts`

---

### 2.4 Editor Configuration

#### TASK-034: Implement line numbers extension
- **Description**: Configurable line numbers display
- **Acceptance Criteria**:
  - [ ] Line numbers visible by default
  - [ ] Toggle based on settings
  - [ ] Styled consistently with theme
- **Files**: `src/components/editor/extensions/lineNumbers.ts`

#### TASK-035: Implement word wrap extension
- **Description**: Configurable word wrap
- **Acceptance Criteria**:
  - [ ] Word wrap enabled by default
  - [ ] Toggle based on settings
  - [ ] Wraps at editor width
- **Files**: `src/components/editor/extensions/wordWrap.ts`

#### TASK-036: Implement active line highlight
- **Description**: Highlight current line
- **Acceptance Criteria**:
  - [ ] Current line has subtle background
  - [ ] Works with both themes
  - [ ] Not intrusive
- **Files**: `src/components/editor/extensions/activeLine.ts`

#### TASK-037: Implement bracket matching
- **Description**: Highlight matching brackets
- **Acceptance Criteria**:
  - [ ] Matching brackets highlighted on cursor
  - [ ] Works with (), [], {}
  - [ ] Works with Markdown syntax
- **Files**: `src/components/editor/extensions/brackets.ts`

---

### 2.5 Keyboard Shortcuts - Formatting

#### TASK-038: Create keyboard shortcuts extension
- **Description**: Base extension for custom keymaps
- **Acceptance Criteria**:
  - [ ] Extension structure for adding custom keymaps
  - [ ] Composable with other extensions
  - [ ] TypeScript types for keybindings
- **Files**: `src/components/editor/extensions/keymap.ts`

#### TASK-039: Implement bold shortcut (Ctrl+B)
- **Description**: Toggle bold formatting on selection
- **Acceptance Criteria**:
  - [ ] Ctrl+B wraps selection with `**`
  - [ ] If already bold, removes `**`
  - [ ] Works with no selection (inserts `****` and places cursor)
  - [ ] Works across multiple lines
- **Files**: `src/components/editor/commands/bold.ts`

#### TASK-040: Implement italic shortcut (Ctrl+I)
- **Description**: Toggle italic formatting on selection
- **Acceptance Criteria**:
  - [ ] Ctrl+I wraps selection with `*`
  - [ ] If already italic, removes `*`
  - [ ] Works with no selection
  - [ ] Doesn't interfere with bold
- **Files**: `src/components/editor/commands/italic.ts`

#### TASK-041: Implement strikethrough shortcut (Ctrl+Shift+S)
- **Description**: Toggle strikethrough formatting
- **Acceptance Criteria**:
  - [ ] Ctrl+Shift+S wraps selection with `~~`
  - [ ] If already strikethrough, removes `~~`
  - [ ] Works with no selection
- **Files**: `src/components/editor/commands/strikethrough.ts`

#### TASK-042: Implement heading shortcuts (Ctrl+1 to Ctrl+6)
- **Description**: Apply heading levels
- **Acceptance Criteria**:
  - [ ] Ctrl+1 applies H1 (`# `)
  - [ ] Ctrl+2 applies H2 (`## `)
  - [ ] Up to Ctrl+6 for H6
  - [ ] Replaces existing heading level
  - [ ] Works on current line
- **Files**: `src/components/editor/commands/heading.ts`

#### TASK-043: Implement link shortcut (Ctrl+K)
- **Description**: Insert link syntax
- **Acceptance Criteria**:
  - [ ] Ctrl+K inserts `[text](url)`
  - [ ] If text selected, uses as link text
  - [ ] Places cursor in URL position
  - [ ] If URL in clipboard, auto-inserts
- **Files**: `src/components/editor/commands/link.ts`

#### TASK-044: Implement code shortcuts
- **Description**: Inline code and code block shortcuts
- **Acceptance Criteria**:
  - [ ] Ctrl+` wraps with backticks for inline code
  - [ ] Ctrl+Shift+` inserts code block
  - [ ] Code block includes language placeholder
- **Files**: `src/components/editor/commands/code.ts`

#### TASK-045: Implement quote shortcut (Ctrl+Shift+Q)
- **Description**: Apply blockquote formatting
- **Acceptance Criteria**:
  - [ ] Ctrl+Shift+Q prefixes line with `> `
  - [ ] Works on multiple selected lines
  - [ ] Toggle off if already quoted
- **Files**: `src/components/editor/commands/quote.ts`

#### TASK-046: Implement list shortcuts
- **Description**: Bullet and numbered list shortcuts
- **Acceptance Criteria**:
  - [ ] Ctrl+Shift+U for bullet list (`- `)
  - [ ] Ctrl+Shift+O for numbered list (`1. `)
  - [ ] Ctrl+Shift+T for task list (`- [ ] `)
  - [ ] Works on multiple lines
  - [ ] Toggle off if already list item
- **Files**: `src/components/editor/commands/list.ts`

#### TASK-047: Implement horizontal rule shortcut
- **Description**: Insert horizontal rule
- **Acceptance Criteria**:
  - [ ] Inserts `---` on new line
  - [ ] Adds blank lines before/after
- **Files**: `src/components/editor/commands/horizontalRule.ts`

#### TASK-048: Implement image insert shortcut (Ctrl+Shift+I)
- **Description**: Insert image syntax
- **Acceptance Criteria**:
  - [ ] Ctrl+Shift+I inserts `![alt](url)`
  - [ ] Places cursor in URL position
  - [ ] If image URL in clipboard, auto-inserts
- **Files**: `src/components/editor/commands/image.ts`

---

### 2.6 Editor State Integration

#### TASK-049: Connect editor to document store
- **Description**: Sync editor content with Zustand store
- **Acceptance Criteria**:
  - [ ] Content changes update store (debounced)
  - [ ] Store changes update editor
  - [ ] Cursor position tracked
  - [ ] Scroll position tracked
- **Files**: `src/components/editor/hooks/useEditorSync.ts`

#### TASK-050: Implement cursor position tracking
- **Description**: Track and display cursor position
- **Acceptance Criteria**:
  - [ ] Current line number tracked
  - [ ] Current column tracked
  - [ ] Selection range tracked
  - [ ] Updates on cursor move
- **Files**: `src/components/editor/hooks/useCursorPosition.ts`

#### TASK-051: Implement modified state tracking
- **Description**: Track if document has unsaved changes
- **Acceptance Criteria**:
  - [ ] isModified flag in document store
  - [ ] Set to true on any edit
  - [ ] Reset on save
  - [ ] Available for UI indicators
- **Files**: `src/stores/documentStore.ts` (update)

---

### 2.7 Editor Utilities

#### TASK-052: Implement selection helpers
- **Description**: Utilities for working with text selection
- **Acceptance Criteria**:
  - [ ] getSelectedText() function
  - [ ] replaceSelection() function
  - [ ] wrapSelection() function
  - [ ] insertAtCursor() function
- **Files**: `src/components/editor/utils/selection.ts`

#### TASK-053: Implement undo/redo
- **Description**: Configure undo/redo functionality
- **Acceptance Criteria**:
  - [ ] Ctrl+Z for undo
  - [ ] Ctrl+Shift+Z for redo
  - [ ] History extension configured
  - [ ] Reasonable history limit
- **Files**: `src/components/editor/extensions/history.ts`

---

## Completion Checklist

- [ ] All 28 tasks completed
- [ ] Editor renders with syntax highlighting
- [ ] All keyboard shortcuts work
- [ ] Theme switching works
- [ ] Content syncs with store
- [ ] No console errors
- [ ] Ready for Phase 03

---

## Testing Notes

- Test all shortcuts with different selection states
- Test theme switching in both modes
- Test with large documents (1000+ lines)
- Test on different browsers

---

*Phase 02 - Core Editor Implementation*
*MarkView Development Plan*
