# Phase 03: Preview and Markdown Rendering

## Overview

This phase implements the Markdown preview panel with the unified/remark processing pipeline, theme support, and real-time updates with scroll synchronization.

**Prerequisites**: Phase 02 completed
**Estimated Tasks**: 32
**Dependencies**: unified, remark-*, rehype-*, shiki

---

## Tasks

### 3.1 Unified Pipeline Setup

#### TASK-054: Install unified ecosystem packages
- **Description**: Install all packages for Markdown processing
- **Acceptance Criteria**:
  - [ ] unified installed
  - [ ] remark-parse installed
  - [ ] remark-gfm installed
  - [ ] remark-frontmatter installed
  - [ ] remark-rehype installed
  - [ ] rehype-stringify installed
  - [ ] rehype-sanitize installed
- **Files**: `package.json`

#### TASK-055: Create Markdown service structure
- **Description**: Set up the Markdown service folder
- **Acceptance Criteria**:
  - [ ] `src/services/markdown/` folder created
  - [ ] `src/services/markdown/parser.ts` - Core parser
  - [ ] `src/services/markdown/renderer.ts` - HTML renderer
  - [ ] `src/services/markdown/plugins/` - Custom plugins
  - [ ] `src/services/markdown/index.ts` - Exports
- **Files**: Multiple files in `src/services/markdown/`

#### TASK-056: Implement base Markdown parser
- **Description**: Create the core unified processor
- **Acceptance Criteria**:
  - [ ] Parses Markdown to AST
  - [ ] Supports CommonMark
  - [ ] Supports GFM (tables, autolinks, strikethrough)
  - [ ] Async processing support
- **Files**: `src/services/markdown/parser.ts`

#### TASK-057: Implement HTML renderer
- **Description**: Convert AST to sanitized HTML
- **Acceptance Criteria**:
  - [ ] Converts remark AST to rehype
  - [ ] Sanitizes HTML output
  - [ ] Returns string HTML
  - [ ] Configurable sanitization schema
- **Files**: `src/services/markdown/renderer.ts`

---

### 3.2 Preview Component

#### TASK-058: Create Preview component structure
- **Description**: Set up the Preview component folder
- **Acceptance Criteria**:
  - [ ] `src/components/preview/Preview.tsx` main component
  - [ ] `src/components/preview/index.ts` exports
  - [ ] `src/components/preview/hooks/` folder
  - [ ] Basic component renders HTML
- **Files**: Multiple files in `src/components/preview/`

#### TASK-059: Implement useMarkdown hook
- **Description**: Hook to process Markdown and return HTML
- **Acceptance Criteria**:
  - [ ] Accepts Markdown string input
  - [ ] Returns processed HTML
  - [ ] Debounced processing (300ms)
  - [ ] Loading state while processing
  - [ ] Error handling for invalid Markdown
- **Files**: `src/components/preview/hooks/useMarkdown.ts`

#### TASK-060: Implement Preview component
- **Description**: Create the main Preview React component
- **Acceptance Criteria**:
  - [ ] Renders processed HTML
  - [ ] Uses dangerouslySetInnerHTML with sanitized content
  - [ ] Full height within container
  - [ ] Scrollable content
  - [ ] Base typography styles
- **Files**: `src/components/preview/Preview.tsx`

---

### 3.3 Preview Themes

#### TASK-061: Create preview theme structure
- **Description**: Set up CSS for preview themes
- **Acceptance Criteria**:
  - [ ] `src/styles/preview-themes/` folder
  - [ ] CSS custom properties for theming
  - [ ] Theme class structure
- **Files**: `src/styles/preview-themes/`

#### TASK-062: Implement GitHub theme (light)
- **Description**: Replicate GitHub's Markdown styling
- **Acceptance Criteria**:
  - [ ] Typography matches GitHub
  - [ ] Code block styling
  - [ ] Table styling
  - [ ] Blockquote styling
  - [ ] List styling
  - [ ] Link colors
- **Files**: `src/styles/preview-themes/github-light.css`

#### TASK-063: Implement GitHub theme (dark)
- **Description**: GitHub dark mode styling
- **Acceptance Criteria**:
  - [ ] All elements from light theme
  - [ ] Dark color palette
  - [ ] Proper contrast ratios
- **Files**: `src/styles/preview-themes/github-dark.css`

#### TASK-064: Implement GitLab theme
- **Description**: Replicate GitLab's Markdown styling
- **Acceptance Criteria**:
  - [ ] GitLab-specific typography
  - [ ] Light and dark variants
  - [ ] Distinctive styling elements
- **Files**: `src/styles/preview-themes/gitlab.css`

#### TASK-065: Implement Notion theme
- **Description**: Replicate Notion's styling
- **Acceptance Criteria**:
  - [ ] Clean, minimal typography
  - [ ] Notion-style code blocks
  - [ ] Light and dark variants
- **Files**: `src/styles/preview-themes/notion.css`

#### TASK-066: Implement Obsidian theme
- **Description**: Replicate Obsidian's styling
- **Acceptance Criteria**:
  - [ ] Obsidian typography
  - [ ] Characteristic styling
  - [ ] Light and dark variants
- **Files**: `src/styles/preview-themes/obsidian.css`

#### TASK-067: Implement Stack Overflow theme
- **Description**: Replicate SO's styling
- **Acceptance Criteria**:
  - [ ] SO typography
  - [ ] Code block styling
  - [ ] Light and dark variants
- **Files**: `src/styles/preview-themes/stackoverflow.css`

#### TASK-068: Implement Dev.to theme
- **Description**: Replicate Dev.to's styling
- **Acceptance Criteria**:
  - [ ] Dev.to typography
  - [ ] Article styling
  - [ ] Light and dark variants
- **Files**: `src/styles/preview-themes/devto.css`

#### TASK-069: Create theme switcher hook
- **Description**: Hook to switch preview themes
- **Acceptance Criteria**:
  - [ ] Applies theme CSS class
  - [ ] Syncs with settings store
  - [ ] Combined app theme + preview style
- **Files**: `src/components/preview/hooks/usePreviewTheme.ts`

---

### 3.4 Syntax Highlighting

#### TASK-070: Install Shiki
- **Description**: Install Shiki for syntax highlighting
- **Acceptance Criteria**:
  - [ ] shiki installed
  - [ ] @shikijs/rehype installed
  - [ ] Required themes bundled
- **Files**: `package.json`

#### TASK-071: Configure Shiki with rehype
- **Description**: Integrate Shiki into the Markdown pipeline
- **Acceptance Criteria**:
  - [ ] Code blocks highlighted
  - [ ] Language detection from fence
  - [ ] Theme matches app theme
  - [ ] 30+ common languages supported
- **Files**: `src/services/markdown/renderer.ts` (update)

#### TASK-072: Implement copy code button
- **Description**: Add copy button to code blocks
- **Acceptance Criteria**:
  - [ ] Copy button appears on hover
  - [ ] Copies code content to clipboard
  - [ ] Visual feedback on copy
  - [ ] Positioned top-right of code block
- **Files**: `src/components/preview/CodeBlock.tsx`

---

### 3.5 Scroll Synchronization

#### TASK-073: Implement scroll position mapping
- **Description**: Map editor lines to preview positions
- **Acceptance Criteria**:
  - [ ] Track source line for each preview element
  - [ ] Build line-to-position map on render
  - [ ] Handle elements spanning multiple lines
- **Files**: `src/services/markdown/scrollMap.ts`

#### TASK-074: Implement editor-to-preview sync
- **Description**: Scroll preview when editor scrolls
- **Acceptance Criteria**:
  - [ ] Editor scroll triggers preview scroll
  - [ ] Smooth scrolling animation
  - [ ] Debounced to prevent jitter
  - [ ] Can be disabled in settings
- **Files**: `src/components/preview/hooks/useScrollSync.ts`

#### TASK-075: Implement preview-to-editor sync
- **Description**: Scroll editor when preview scrolls
- **Acceptance Criteria**:
  - [ ] Preview scroll triggers editor scroll
  - [ ] Bidirectional sync doesn't cause loops
  - [ ] User scroll detected vs programmatic
- **Files**: `src/components/preview/hooks/useScrollSync.ts` (update)

---

### 3.6 Split View Layout

#### TASK-076: Create SplitPane component
- **Description**: Resizable split view container
- **Acceptance Criteria**:
  - [ ] Two panes: editor and preview
  - [ ] Draggable divider
  - [ ] Minimum/maximum pane sizes
  - [ ] Remembers size preference
- **Files**: `src/components/ui/SplitPane.tsx`

#### TASK-077: Implement MainLayout component
- **Description**: Main content area with split view
- **Acceptance Criteria**:
  - [ ] Contains SplitPane with Editor and Preview
  - [ ] Handles responsive breakpoints
  - [ ] Fullscreen mode support
- **Files**: `src/components/layout/MainLayout.tsx`

#### TASK-078: Implement responsive behavior
- **Description**: Adapt layout for small screens
- **Acceptance Criteria**:
  - [ ] Below breakpoint: show tabs instead of split
  - [ ] Tab for Editor, tab for Preview
  - [ ] Smooth transition between modes
  - [ ] Touch-friendly on mobile
- **Files**: `src/components/layout/MainLayout.tsx` (update)

---

### 3.7 Preview in New Window

#### TASK-079: Create PreviewWindow component
- **Description**: Standalone preview for new window
- **Acceptance Criteria**:
  - [ ] Renders only preview content
  - [ ] Full viewport
  - [ ] No editor UI
  - [ ] Theme applied
- **Files**: `src/components/preview/PreviewWindow.tsx`

#### TASK-080: Implement BroadcastChannel sync
- **Description**: Sync content between tabs
- **Acceptance Criteria**:
  - [ ] useBroadcastChannel hook
  - [ ] Send content updates from main tab
  - [ ] Receive and render in preview tab
  - [ ] Handle disconnect gracefully
- **Files**: `src/hooks/useBroadcastChannel.ts`

#### TASK-081: Implement open preview in new window
- **Description**: Button to open preview externally
- **Acceptance Criteria**:
  - [ ] Button in toolbar opens new window/tab
  - [ ] New window loads PreviewWindow route
  - [ ] Content syncs in real-time
  - [ ] Theme syncs
- **Files**: `src/components/toolbar/PreviewButton.tsx`

#### TASK-082: Handle editor closed state
- **Description**: Show message when editor disconnects
- **Acceptance Criteria**:
  - [ ] Detect main tab close
  - [ ] Show "Editor closed" message
  - [ ] Offer reconnect option
  - [ ] Keep last content visible
- **Files**: `src/components/preview/PreviewWindow.tsx` (update)

---

### 3.8 Performance Optimization

#### TASK-083: Implement render debouncing
- **Description**: Debounce preview updates
- **Acceptance Criteria**:
  - [ ] 300ms debounce on content changes
  - [ ] Immediate render on first load
  - [ ] Cancel pending renders on new input
- **Files**: `src/components/preview/hooks/useMarkdown.ts` (update)

#### TASK-084: Implement virtual rendering for long documents
- **Description**: Only render visible portion
- **Acceptance Criteria**:
  - [ ] For documents > 5000 lines
  - [ ] Render buffer around viewport
  - [ ] Smooth scroll experience
  - [ ] Memory efficient
- **Files**: `src/components/preview/VirtualPreview.tsx`

#### TASK-085: Add loading states
- **Description**: Show loading while processing
- **Acceptance Criteria**:
  - [ ] Skeleton or spinner during processing
  - [ ] Only show for slow renders (>100ms)
  - [ ] Smooth transition to content
- **Files**: `src/components/preview/PreviewLoading.tsx`

---

## Completion Checklist

- [ ] All 32 tasks completed
- [ ] Preview renders all Markdown elements
- [ ] Syntax highlighting works
- [ ] All themes available and working
- [ ] Scroll sync functional
- [ ] New window preview works
- [ ] Performance acceptable for large docs
- [ ] Ready for Phase 04

---

## Testing Notes

- Test with complex Markdown (tables, nested lists, code)
- Test all 6 preview themes
- Test scroll sync accuracy
- Test with 10,000+ line document
- Test BroadcastChannel across tabs

---

*Phase 03 - Preview and Rendering*
*MarkView Development Plan*
