# Phase 04: UI Components (Sidebar, Toolbar, Tabs, Status Bar)

## Overview

This phase implements the main UI components: sidebar with file explorer and TOC, toolbar with formatting buttons, tab system for multiple files, and status bar.

**Prerequisites**: Phase 03 completed
**Estimated Tasks**: 38
**Dependencies**: None additional

---

## Tasks

### 4.1 Toolbar Implementation

#### TASK-086: Create Toolbar container
- **Description**: Main toolbar component structure
- **Acceptance Criteria**:
  - [ ] `src/components/toolbar/Toolbar.tsx`
  - [ ] Fixed at top of editor area
  - [ ] Responsive design
  - [ ] Groups for different button types
- **Files**: `src/components/toolbar/Toolbar.tsx`

#### TASK-087: Create format button component
- **Description**: Reusable button for formatting actions
- **Acceptance Criteria**:
  - [ ] Icon + optional label
  - [ ] Tooltip with shortcut
  - [ ] Active state when in formatted text
  - [ ] Disabled state
  - [ ] Click handler
- **Files**: `src/components/toolbar/FormatButton.tsx`

#### TASK-088: Implement Bold button
- **Description**: Bold formatting button
- **Acceptance Criteria**:
  - [ ] Icon (B)
  - [ ] Tooltip: "Bold (Ctrl+B)"
  - [ ] Triggers bold command
  - [ ] Active when cursor in bold text
- **Files**: `src/components/toolbar/buttons/BoldButton.tsx`

#### TASK-089: Implement Italic button
- **Description**: Italic formatting button
- **Acceptance Criteria**:
  - [ ] Icon (I)
  - [ ] Tooltip: "Italic (Ctrl+I)"
  - [ ] Triggers italic command
  - [ ] Active when cursor in italic text
- **Files**: `src/components/toolbar/buttons/ItalicButton.tsx`

#### TASK-090: Implement Strikethrough button
- **Description**: Strikethrough formatting button
- **Acceptance Criteria**:
  - [ ] Icon (S with line)
  - [ ] Tooltip: "Strikethrough (Ctrl+Shift+S)"
  - [ ] Triggers strikethrough command
- **Files**: `src/components/toolbar/buttons/StrikethroughButton.tsx`

#### TASK-091: Implement Heading dropdown
- **Description**: Dropdown to select heading level
- **Acceptance Criteria**:
  - [ ] Dropdown with H1-H6 options
  - [ ] Shows current heading level
  - [ ] Keyboard shortcuts shown
  - [ ] Paragraph option to remove heading
- **Files**: `src/components/toolbar/buttons/HeadingDropdown.tsx`

#### TASK-092: Implement Link button
- **Description**: Insert link button
- **Acceptance Criteria**:
  - [ ] Link icon
  - [ ] Tooltip: "Insert Link (Ctrl+K)"
  - [ ] Triggers link command
- **Files**: `src/components/toolbar/buttons/LinkButton.tsx`

#### TASK-093: Implement Image button
- **Description**: Insert image button
- **Acceptance Criteria**:
  - [ ] Image icon
  - [ ] Tooltip: "Insert Image (Ctrl+Shift+I)"
  - [ ] Triggers image command
- **Files**: `src/components/toolbar/buttons/ImageButton.tsx`

#### TASK-094: Implement Code buttons
- **Description**: Inline code and code block buttons
- **Acceptance Criteria**:
  - [ ] Inline code button
  - [ ] Code block button
  - [ ] Respective tooltips
- **Files**: `src/components/toolbar/buttons/CodeButtons.tsx`

#### TASK-095: Implement Quote button
- **Description**: Blockquote button
- **Acceptance Criteria**:
  - [ ] Quote icon
  - [ ] Tooltip: "Quote (Ctrl+Shift+Q)"
  - [ ] Triggers quote command
- **Files**: `src/components/toolbar/buttons/QuoteButton.tsx`

#### TASK-096: Implement List buttons
- **Description**: Bullet, numbered, and task list buttons
- **Acceptance Criteria**:
  - [ ] Bullet list button
  - [ ] Numbered list button
  - [ ] Task list button
  - [ ] Respective shortcuts in tooltips
- **Files**: `src/components/toolbar/buttons/ListButtons.tsx`

#### TASK-097: Implement Horizontal rule button
- **Description**: Insert horizontal rule
- **Acceptance Criteria**:
  - [ ] HR icon
  - [ ] Inserts horizontal rule
- **Files**: `src/components/toolbar/buttons/HRButton.tsx`

#### TASK-098: Implement Emoji picker button
- **Description**: Emoji selection popup
- **Acceptance Criteria**:
  - [ ] Emoji icon button
  - [ ] Opens emoji picker popup
  - [ ] Search emojis
  - [ ] Insert selected emoji
  - [ ] Recent emojis
- **Files**: `src/components/toolbar/buttons/EmojiButton.tsx`, `src/components/toolbar/EmojiPicker.tsx`

#### TASK-099: Implement Mermaid insert button
- **Description**: Insert Mermaid diagram template
- **Acceptance Criteria**:
  - [ ] Diagram icon
  - [ ] Dropdown with diagram types
  - [ ] Inserts template code block
- **Files**: `src/components/toolbar/buttons/MermaidButton.tsx`

#### TASK-100: Implement Format button
- **Description**: Auto-format document
- **Acceptance Criteria**:
  - [ ] Format icon
  - [ ] Tooltip: "Format Document"
  - [ ] Triggers Prettier formatting
- **Files**: `src/components/toolbar/buttons/FormatButton.tsx`

---

### 4.2 Tab System

#### TASK-101: Create Tabs container
- **Description**: Tab bar component
- **Acceptance Criteria**:
  - [ ] `src/components/tabs/TabBar.tsx`
  - [ ] Horizontal scrollable when many tabs
  - [ ] Below toolbar
  - [ ] Add new tab button
- **Files**: `src/components/tabs/TabBar.tsx`

#### TASK-102: Create Tab component
- **Description**: Individual tab component
- **Acceptance Criteria**:
  - [ ] Shows file name
  - [ ] Close button (X)
  - [ ] Modified indicator (dot)
  - [ ] Active state styling
  - [ ] Click to activate
  - [ ] Middle-click to close
- **Files**: `src/components/tabs/Tab.tsx`

#### TASK-103: Implement tab store integration
- **Description**: Connect tabs to document store
- **Acceptance Criteria**:
  - [ ] Tab per open document
  - [ ] Active tab from activeDocumentId
  - [ ] Click updates active document
  - [ ] Close removes from store
- **Files**: `src/components/tabs/hooks/useTabs.ts`

#### TASK-104: Implement close confirmation
- **Description**: Confirm before closing modified tab
- **Acceptance Criteria**:
  - [ ] Modal when closing modified file
  - [ ] Options: Save, Don't Save, Cancel
  - [ ] Save triggers save action
  - [ ] Don't Save closes without saving
- **Files**: `src/components/tabs/CloseConfirmModal.tsx`

#### TASK-105: Implement tab overflow handling
- **Description**: Handle many open tabs
- **Acceptance Criteria**:
  - [ ] Scroll arrows when tabs overflow
  - [ ] Or dropdown for hidden tabs
  - [ ] Limit indicator if max reached
- **Files**: `src/components/tabs/TabBar.tsx` (update)

#### TASK-106: Implement tab reordering
- **Description**: Drag and drop to reorder tabs
- **Acceptance Criteria**:
  - [ ] Drag tab to new position
  - [ ] Visual feedback during drag
  - [ ] Order persists
- **Files**: `src/components/tabs/TabBar.tsx` (update)

---

### 4.3 Sidebar

#### TASK-107: Create Sidebar container
- **Description**: Main sidebar component
- **Acceptance Criteria**:
  - [ ] `src/components/sidebar/Sidebar.tsx`
  - [ ] Left side of screen
  - [ ] Collapsible
  - [ ] Section navigation
- **Files**: `src/components/sidebar/Sidebar.tsx`

#### TASK-108: Implement sidebar collapse
- **Description**: Toggle sidebar visibility
- **Acceptance Criteria**:
  - [ ] Collapse button
  - [ ] Keyboard shortcut
  - [ ] Smooth animation
  - [ ] State persists
- **Files**: `src/components/sidebar/Sidebar.tsx` (update)

#### TASK-109: Create sidebar section navigation
- **Description**: Tabs/icons to switch sections
- **Acceptance Criteria**:
  - [ ] Icon buttons for: Explorer, TOC, Search
  - [ ] Active section highlighted
  - [ ] Section content changes
- **Files**: `src/components/sidebar/SidebarNav.tsx`

---

### 4.4 File Explorer

#### TASK-110: Create FileExplorer component
- **Description**: File tree component
- **Acceptance Criteria**:
  - [ ] `src/components/sidebar/FileExplorer.tsx`
  - [ ] Tree structure
  - [ ] Local files section
  - [ ] GitHub files section (placeholder)
- **Files**: `src/components/sidebar/FileExplorer.tsx`

#### TASK-111: Implement local files list
- **Description**: Show files from localStorage
- **Acceptance Criteria**:
  - [ ] List all documents
  - [ ] Show file name
  - [ ] Modified date
  - [ ] Click to open
  - [ ] Active file highlighted
- **Files**: `src/components/sidebar/LocalFiles.tsx`

#### TASK-112: Implement file context menu
- **Description**: Right-click menu for files
- **Acceptance Criteria**:
  - [ ] Rename option
  - [ ] Delete option
  - [ ] Duplicate option
  - [ ] Download option
- **Files**: `src/components/sidebar/FileContextMenu.tsx`

#### TASK-113: Implement new file action
- **Description**: Create new document
- **Acceptance Criteria**:
  - [ ] New file button in explorer header
  - [ ] Creates untitled document
  - [ ] Opens in new tab
  - [ ] Focus on editor
- **Files**: `src/components/sidebar/NewFileButton.tsx`

#### TASK-114: Implement file search/filter
- **Description**: Filter files in explorer
- **Acceptance Criteria**:
  - [ ] Search input in explorer
  - [ ] Filters list as you type
  - [ ] Highlights matching text
- **Files**: `src/components/sidebar/FileSearch.tsx`

---

### 4.5 Table of Contents

#### TASK-115: Create TOC component
- **Description**: Table of contents panel
- **Acceptance Criteria**:
  - [ ] `src/components/sidebar/TableOfContents.tsx`
  - [ ] Lists all headings
  - [ ] Hierarchical display
  - [ ] Updates on content change
- **Files**: `src/components/sidebar/TableOfContents.tsx`

#### TASK-116: Implement heading extraction
- **Description**: Parse headings from content
- **Acceptance Criteria**:
  - [ ] Extract H1-H6 from Markdown
  - [ ] Preserve hierarchy
  - [ ] Include line numbers
  - [ ] Handle edge cases
- **Files**: `src/services/markdown/toc.ts`

#### TASK-117: Implement TOC navigation
- **Description**: Click heading to navigate
- **Acceptance Criteria**:
  - [ ] Click scrolls editor to heading
  - [ ] Scrolls preview to heading
  - [ ] Smooth scroll animation
- **Files**: `src/components/sidebar/TableOfContents.tsx` (update)

#### TASK-118: Implement current heading highlight
- **Description**: Show current section in TOC
- **Acceptance Criteria**:
  - [ ] Active heading highlighted
  - [ ] Updates on scroll
  - [ ] Updates on cursor move
- **Files**: `src/components/sidebar/TableOfContents.tsx` (update)

---

### 4.6 Search Panel

#### TASK-119: Create SearchPanel component
- **Description**: Find and replace panel
- **Acceptance Criteria**:
  - [ ] `src/components/sidebar/SearchPanel.tsx`
  - [ ] Search input
  - [ ] Replace input
  - [ ] Options (case, regex)
- **Files**: `src/components/sidebar/SearchPanel.tsx`

#### TASK-120: Implement search functionality
- **Description**: Find text in document
- **Acceptance Criteria**:
  - [ ] Search as you type
  - [ ] Highlight all matches
  - [ ] Match counter
  - [ ] Next/Previous navigation
- **Files**: `src/components/sidebar/hooks/useSearch.ts`

#### TASK-121: Implement replace functionality
- **Description**: Replace matched text
- **Acceptance Criteria**:
  - [ ] Replace current match
  - [ ] Replace all matches
  - [ ] Undo support
- **Files**: `src/components/sidebar/hooks/useSearch.ts` (update)

#### TASK-122: Implement regex search
- **Description**: Search with regular expressions
- **Acceptance Criteria**:
  - [ ] Regex toggle option
  - [ ] Valid regex highlighting
  - [ ] Error for invalid regex
- **Files**: `src/components/sidebar/hooks/useSearch.ts` (update)

---

### 4.7 Status Bar

#### TASK-123: Create StatusBar component
- **Description**: Bottom status bar
- **Acceptance Criteria**:
  - [ ] `src/components/statusbar/StatusBar.tsx`
  - [ ] Fixed at bottom
  - [ ] Multiple sections
  - [ ] Responsive
- **Files**: `src/components/statusbar/StatusBar.tsx`

#### TASK-124: Implement cursor position display
- **Description**: Show current line:column
- **Acceptance Criteria**:
  - [ ] Format: "Ln X, Col Y"
  - [ ] Updates on cursor move
  - [ ] Click opens go-to-line (future)
- **Files**: `src/components/statusbar/CursorPosition.tsx`

#### TASK-125: Implement word count display
- **Description**: Show document statistics
- **Acceptance Criteria**:
  - [ ] Word count
  - [ ] Character count on hover
  - [ ] Reading time on hover
  - [ ] Updates on content change
- **Files**: `src/components/statusbar/WordCount.tsx`

#### TASK-126: Implement encoding display
- **Description**: Show file encoding
- **Acceptance Criteria**:
  - [ ] Shows "UTF-8"
  - [ ] Click could change (future)
- **Files**: `src/components/statusbar/Encoding.tsx`

#### TASK-127: Implement line ending display
- **Description**: Show line ending type
- **Acceptance Criteria**:
  - [ ] Shows "LF" or "CRLF"
  - [ ] Click could change (future)
- **Files**: `src/components/statusbar/LineEnding.tsx`

#### TASK-128: Implement lint status display
- **Description**: Show linting errors/warnings
- **Acceptance Criteria**:
  - [ ] Error count with icon
  - [ ] Warning count with icon
  - [ ] Click opens problems panel (future)
- **Files**: `src/components/statusbar/LintStatus.tsx`

#### TASK-129: Implement save status display
- **Description**: Show save state
- **Acceptance Criteria**:
  - [ ] "Saved" when synced
  - [ ] "Saving..." during save
  - [ ] "Modified" when unsaved
  - [ ] Icon + text
- **Files**: `src/components/statusbar/SaveStatus.tsx`

---

### 4.8 Modals

#### TASK-130: Create Modal base component
- **Description**: Reusable modal component
- **Acceptance Criteria**:
  - [ ] `src/components/ui/Modal.tsx`
  - [ ] Overlay background
  - [ ] Close on escape
  - [ ] Close on overlay click
  - [ ] Animation
  - [ ] Focus trap
- **Files**: `src/components/ui/Modal.tsx`

#### TASK-131: Implement keyboard shortcuts modal
- **Description**: Show all keyboard shortcuts
- **Acceptance Criteria**:
  - [ ] Opens with Ctrl+/
  - [ ] Lists all shortcuts grouped
  - [ ] Searchable
  - [ ] Shows key combinations
- **Files**: `src/components/modals/KeyboardShortcutsModal.tsx`

---

## Completion Checklist

- [ ] All 46 tasks completed
- [ ] Toolbar fully functional
- [ ] Tab system works
- [ ] Sidebar with all sections
- [ ] Status bar displays all info
- [ ] Keyboard shortcuts modal
- [ ] Responsive on all sizes
- [ ] Ready for Phase 05

---

## Testing Notes

- Test toolbar on different screen sizes
- Test tab system with 20+ tabs
- Test sidebar collapse/expand
- Test search with large documents
- Test keyboard navigation

---

*Phase 04 - UI Components*
*MarkView Development Plan*
