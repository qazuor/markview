# Phase 08: Advanced Markdown Features

## Overview

This phase implements advanced Markdown features including Mermaid diagrams, KaTeX math, callouts, interactive checklists, frontmatter, footnotes, linting, and formatting.

**Prerequisites**: Phase 07 completed
**Estimated Tasks**: 32
**Dependencies**: mermaid, katex, markdownlint, prettier

---

## Tasks

### 8.1 Mermaid Diagrams

#### TASK-198: Install Mermaid
- **Description**: Install Mermaid library
- **Acceptance Criteria**:
  - [ ] mermaid installed
  - [ ] Types available
  - [ ] Version compatible with project
- **Files**: `package.json`

#### TASK-199: Create Mermaid remark plugin
- **Description**: Plugin to process Mermaid code blocks
- **Acceptance Criteria**:
  - [ ] Detect ```mermaid code blocks
  - [ ] Mark for client-side rendering
  - [ ] Pass through to rehype
- **Files**: `src/services/markdown/plugins/mermaid.ts`

#### TASK-200: Implement Mermaid renderer component
- **Description**: React component to render Mermaid
- **Acceptance Criteria**:
  - [ ] Render Mermaid diagrams
  - [ ] Support all diagram types (flowchart, sequence, gantt, pie, mindmap, timeline)
  - [ ] Handle render errors gracefully
  - [ ] Show error message for invalid syntax
- **Files**: `src/components/preview/MermaidDiagram.tsx`

#### TASK-201: Implement Mermaid theming
- **Description**: Match diagram theme to app theme
- **Acceptance Criteria**:
  - [ ] Dark theme for dark mode
  - [ ] Light theme for light mode
  - [ ] Theme changes without re-render
- **Files**: `src/components/preview/MermaidDiagram.tsx` (update)

#### TASK-202: Add Mermaid toolbar templates
- **Description**: Quick insert for diagram types
- **Acceptance Criteria**:
  - [ ] Dropdown with diagram types
  - [ ] Insert template code block
  - [ ] Templates for: flowchart, sequence, gantt, pie
- **Files**: `src/components/toolbar/buttons/MermaidButton.tsx` (update)

---

### 8.2 KaTeX Math

#### TASK-203: Install KaTeX
- **Description**: Install KaTeX library
- **Acceptance Criteria**:
  - [ ] katex installed
  - [ ] rehype-katex installed
  - [ ] KaTeX CSS available
- **Files**: `package.json`

#### TASK-204: Configure KaTeX in pipeline
- **Description**: Add KaTeX to Markdown pipeline
- **Acceptance Criteria**:
  - [ ] remark-math parses math syntax
  - [ ] rehype-katex renders to HTML
  - [ ] Inline math: $formula$
  - [ ] Block math: $$formula$$
- **Files**: `src/services/markdown/renderer.ts` (update)

#### TASK-205: Style KaTeX output
- **Description**: CSS for math rendering
- **Acceptance Criteria**:
  - [ ] KaTeX CSS imported
  - [ ] Styled for both themes
  - [ ] Proper sizing and spacing
- **Files**: `src/styles/katex.css`

#### TASK-206: Handle KaTeX errors
- **Description**: Graceful handling of invalid math
- **Acceptance Criteria**:
  - [ ] Show raw syntax on error
  - [ ] Error styling (red border)
  - [ ] Don't break rest of document
- **Files**: `src/services/markdown/plugins/katex.ts`

---

### 8.3 Callouts

#### TASK-207: Create callouts remark plugin
- **Description**: Plugin to parse callout syntax
- **Acceptance Criteria**:
  - [ ] Parse GitHub syntax: `> [!NOTE]`, `> [!WARNING]`, etc.
  - [ ] Parse Obsidian syntax: `> [!info]`, etc.
  - [ ] Convert to custom nodes
- **Files**: `src/services/markdown/plugins/callouts.ts`

#### TASK-208: Implement callout renderer
- **Description**: Render callouts with proper styling
- **Acceptance Criteria**:
  - [ ] Distinct styling per type (note, warning, tip, important, caution)
  - [ ] Icons for each type
  - [ ] Collapsible option (future)
  - [ ] Both themes supported
- **Files**: `src/components/preview/Callout.tsx`

#### TASK-209: Style callouts
- **Description**: CSS for callout components
- **Acceptance Criteria**:
  - [ ] Background colors per type
  - [ ] Border and icon colors
  - [ ] Dark and light theme variants
  - [ ] Match GitHub/Obsidian appearance
- **Files**: `src/styles/callouts.css`

---

### 8.4 Interactive Checklists

#### TASK-210: Create checkbox remark plugin
- **Description**: Plugin to make checkboxes interactive
- **Acceptance Criteria**:
  - [ ] Parse `- [ ]` and `- [x]` syntax
  - [ ] Add data attributes for line numbers
  - [ ] Enable click handling
- **Files**: `src/services/markdown/plugins/checkbox.ts`

#### TASK-211: Implement checkbox click handler
- **Description**: Toggle checkbox on click
- **Acceptance Criteria**:
  - [ ] Click toggles checkbox state
  - [ ] Updates editor content
  - [ ] Preserves cursor position
  - [ ] Triggers auto-save
- **Files**: `src/components/preview/hooks/useCheckboxToggle.ts`

#### TASK-212: Style checkboxes
- **Description**: CSS for interactive checkboxes
- **Acceptance Criteria**:
  - [ ] Clickable cursor
  - [ ] Hover state
  - [ ] Checked/unchecked states
  - [ ] Strikethrough for completed (optional)
- **Files**: `src/styles/checkbox.css`

---

### 8.5 Frontmatter

#### TASK-213: Configure frontmatter parsing
- **Description**: Parse YAML frontmatter
- **Acceptance Criteria**:
  - [ ] remark-frontmatter parses `---` blocks
  - [ ] Extract metadata
  - [ ] Make available to components
- **Files**: `src/services/markdown/renderer.ts` (update)

#### TASK-214: Create frontmatter display component
- **Description**: Show frontmatter as metadata
- **Acceptance Criteria**:
  - [ ] Display title, date, author, tags
  - [ ] Styled metadata panel
  - [ ] Hidden from main content
  - [ ] Optional: edit frontmatter
- **Files**: `src/components/preview/FrontmatterDisplay.tsx`

#### TASK-215: Use frontmatter for document info
- **Description**: Apply frontmatter to document
- **Acceptance Criteria**:
  - [ ] Title from frontmatter for document name
  - [ ] Author shown in status bar (optional)
  - [ ] Tags available for future features
- **Files**: `src/hooks/useFrontmatter.ts`

---

### 8.6 Footnotes

#### TASK-216: Configure footnotes plugin
- **Description**: Enable footnotes in pipeline
- **Acceptance Criteria**:
  - [ ] remark-gfm includes footnotes
  - [ ] Or add dedicated footnote plugin
  - [ ] Syntax: `[^1]` and `[^1]: text`
- **Files**: `src/services/markdown/renderer.ts` (update)

#### TASK-217: Style footnotes
- **Description**: CSS for footnote rendering
- **Acceptance Criteria**:
  - [ ] Superscript reference numbers
  - [ ] Footnotes section at bottom
  - [ ] Back-reference links
  - [ ] Both themes supported
- **Files**: `src/styles/footnotes.css`

---

### 8.7 Linting

#### TASK-218: Install markdownlint
- **Description**: Install linting library
- **Acceptance Criteria**:
  - [ ] markdownlint installed
  - [ ] Browser-compatible version
- **Files**: `package.json`

#### TASK-219: Create lint service
- **Description**: Service to lint Markdown content
- **Acceptance Criteria**:
  - [ ] `src/services/linting/markdownLint.ts`
  - [ ] Accept content, return issues
  - [ ] Configurable rules
  - [ ] Debounced execution
- **Files**: `src/services/linting/markdownLint.ts`

#### TASK-220: Create CodeMirror lint extension
- **Description**: Show lint errors in editor
- **Acceptance Criteria**:
  - [ ] Underline errors/warnings
  - [ ] Hover shows message
  - [ ] Gutter icons
  - [ ] Performance optimized
- **Files**: `src/components/editor/extensions/lint.ts`

#### TASK-221: Create lint configuration
- **Description**: Default lint rules config
- **Acceptance Criteria**:
  - [ ] Sensible defaults
  - [ ] Disable noisy rules
  - [ ] User can customize (future)
- **Files**: `src/services/linting/config.ts`

#### TASK-222: Add lint toggle to settings
- **Description**: Enable/disable linting
- **Acceptance Criteria**:
  - [ ] Toggle in settings
  - [ ] Persisted preference
  - [ ] Immediate effect
- **Files**: `src/stores/settingsStore.ts` (update)

---

### 8.8 Formatting

#### TASK-223: Install Prettier
- **Description**: Install Prettier with Markdown plugin
- **Acceptance Criteria**:
  - [ ] prettier installed
  - [ ] prettier-plugin-md or built-in Markdown
  - [ ] Browser-compatible
- **Files**: `package.json`

#### TASK-224: Create format service
- **Description**: Service to format Markdown
- **Acceptance Criteria**:
  - [ ] `src/services/formatting/prettier.ts`
  - [ ] Accept content, return formatted
  - [ ] Preserve cursor position (best effort)
- **Files**: `src/services/formatting/prettier.ts`

#### TASK-225: Implement format command
- **Description**: Format document action
- **Acceptance Criteria**:
  - [ ] Format button in toolbar
  - [ ] Keyboard shortcut (Shift+Alt+F)
  - [ ] Applies Prettier formatting
  - [ ] Undo support
- **Files**: `src/components/editor/commands/format.ts`

#### TASK-226: Implement format on save
- **Description**: Auto-format when saving
- **Acceptance Criteria**:
  - [ ] Setting to enable/disable
  - [ ] Runs before save
  - [ ] Does not save if format fails
- **Files**: `src/hooks/useAutoSave.ts` (update)

---

### 8.9 Settings Modal

#### TASK-227: Create Settings modal
- **Description**: Full settings UI
- **Acceptance Criteria**:
  - [ ] Modal with all settings
  - [ ] Grouped by category
  - [ ] Live preview of changes
  - [ ] Reset to defaults option
- **Files**: `src/components/modals/SettingsModal.tsx`

#### TASK-228: Implement settings sections
- **Description**: Organize settings into tabs/sections
- **Acceptance Criteria**:
  - [ ] Appearance section
  - [ ] Editor section
  - [ ] Behavior section
  - [ ] Account section (GitHub)
- **Files**: `src/components/modals/settings/`

#### TASK-229: Implement font size controls
- **Description**: Font size adjustments
- **Acceptance Criteria**:
  - [ ] Slider or input for editor font
  - [ ] Slider or input for preview font
  - [ ] Live preview
  - [ ] Reasonable min/max
- **Files**: `src/components/modals/settings/AppearanceSettings.tsx`

---

## Completion Checklist

- [ ] All 32 tasks completed
- [ ] Mermaid diagrams render correctly
- [ ] KaTeX math renders correctly
- [ ] Callouts display properly
- [ ] Checklists are interactive
- [ ] Frontmatter parsed and displayed
- [ ] Footnotes work
- [ ] Linting shows issues inline
- [ ] Formatting works
- [ ] Settings modal complete
- [ ] Ready for Phase 09

---

## Testing Notes

- Test Mermaid with all diagram types
- Test KaTeX with complex formulas
- Test callouts with nested content
- Test checkbox toggle with auto-save
- Test linting performance on large docs
- Test formatting preservation

---

*Phase 08 - Advanced Features*
*MarkView Development Plan*
