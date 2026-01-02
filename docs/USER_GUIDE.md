# MarkView User Guide

A comprehensive guide to using MarkView, the modern markdown editor and previewer.

## Table of Contents

- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
- [Editor](#editor)
- [Preview](#preview)
- [Document Management](#document-management)
- [Cloud Integration](#cloud-integration)
- [Import & Export](#import--export)
- [Settings](#settings)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tips & Tricks](#tips--tricks)

---

## Getting Started

### First Launch

When you first open MarkView, you'll be greeted with:

1. **Welcome Document** - A sample document showcasing markdown features
2. **Feature Tour** - An optional interactive tour highlighting key UI elements
3. **Help Menu** - Access anytime via the `?` button in the toolbar

### Creating Your First Document

1. Click the **+** button in the tab bar, or press `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)
2. A new document opens with the name field ready to edit
3. Type your document name and press Enter
4. Start writing in markdown!

---

## Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Toolbar (formatting, view controls, settings)              │
├─────────────┬───────────────────────────────────────────────┤
│             │  Tab Bar (open documents)                     │
│  Sidebar    ├───────────────────────┬───────────────────────┤
│  - Files    │                       │                       │
│  - TOC      │      Editor           │      Preview          │
│  - GitHub   │                       │                       │
│  - GDrive   │                       │                       │
│             │                       │                       │
├─────────────┴───────────────────────┴───────────────────────┤
│  Status Bar (word count, cursor position, sync status)      │
└─────────────────────────────────────────────────────────────┘
```

### Toolbar

- **Formatting buttons** - Bold, italic, headings, lists, links, etc.
- **View controls** - Toggle editor/preview, sync scroll
- **Actions** - New document, import, export
- **Settings** - Theme, preferences, cloud connections

### Sidebar

Toggle with `Ctrl+B` or the sidebar button. Contains:

- **Files** - Local documents and folders
- **TOC** - Table of contents for current document
- **GitHub** - Connected GitHub repositories
- **Google Drive** - Connected Google Drive files

### Status Bar

Shows:
- Word and character count
- Cursor position (line:column)
- Document encoding
- Line ending format
- Sync status (for cloud files)

---

## Editor

### Markdown Support

MarkView supports GitHub Flavored Markdown (GFM) including:

- **Headings** - `# H1` through `###### H6`
- **Emphasis** - `**bold**`, `*italic*`, `~~strikethrough~~`
- **Lists** - Ordered, unordered, and task lists
- **Links** - `[text](url)` and auto-linked URLs
- **Images** - `![alt](url)`
- **Code** - Inline `` `code` `` and fenced code blocks
- **Tables** - GFM table syntax
- **Blockquotes** - `> quoted text`
- **Horizontal rules** - `---`

### Extended Syntax

- **Mermaid Diagrams** - Use ` ```mermaid ` code blocks
- **Math Equations** - Use `$inline$` or `$$block$$` for KaTeX
- **Callouts** - GitHub and Obsidian-style admonitions
- **Frontmatter** - YAML metadata at document start

### Editor Features

- **Line Numbers** - Toggle in settings
- **Minimap** - Document overview on the right
- **Word Wrap** - Toggle soft wrapping
- **Syntax Highlighting** - Automatic markdown highlighting
- **Auto-complete** - Suggestions for headings, links
- **Linting** - Real-time markdown issue detection

---

## Preview

### Preview Modes

- **Split View** - Editor and preview side by side (default)
- **Editor Only** - Full-width editor
- **Preview Only** - Full-width preview

Toggle with toolbar buttons or keyboard shortcuts.

### Preview Themes

Available styles:
- GitHub (light/dark)
- GitLab
- Notion
- Obsidian
- Stack Overflow
- Dev.to

Change in Settings > Appearance > Preview Style.

### Synchronized Scrolling

When enabled, scrolling in the editor automatically scrolls the preview to the same position, and vice versa.

Toggle with the sync button in the toolbar or in Settings.

---

## Document Management

### Tabs

- **Open multiple documents** - Each in its own tab
- **Reorder tabs** - Drag and drop
- **Close tabs** - Click X or middle-click
- **Tab context menu** - Right-click for options:
  - Close
  - Close Others
  - Close All
  - Close Saved

### File Explorer

Access local documents in the sidebar:

- **Create folders** - Organize your documents
- **Rename** - Right-click > Rename
- **Duplicate** - Right-click > Duplicate
- **Delete** - Right-click > Delete
- **Move** - Drag and drop into folders

### Version History

MarkView automatically saves versions of your documents.

1. Click the clock icon in the toolbar or right-click the tab
2. View version list with timestamps
3. Preview any version
4. Compare versions with diff view
5. Restore a previous version

### Auto-Save

Documents are automatically saved to localStorage. Configure in Settings:

- **Auto-save interval** - 5 to 60 seconds
- **Disable auto-save** - Save manually with Ctrl+S

---

## Cloud Integration

### GitHub

#### Connecting

1. Go to Settings > Sync > GitHub
2. Click "Connect GitHub"
3. Authorize MarkView in the popup
4. Your repositories will appear in the sidebar

#### Working with GitHub Files

- **Browse** - Navigate repositories and folders
- **Open** - Click any markdown file to open
- **Create** - Right-click > New File
- **Save** - Ctrl+S commits changes
- **Delete** - Right-click > Delete

#### Commit Messages

When saving to GitHub, you can customize the commit message in the save dialog.

### Google Drive

#### Connecting

1. Go to Settings > Sync > Google Drive
2. Click "Connect Google Drive"
3. Authorize MarkView in the popup
4. Your Drive files will appear in the sidebar

#### Working with Drive Files

- **Browse** - Navigate folders
- **Open** - Click any markdown file
- **Create** - Right-click > New File (choose folder)
- **Auto-save** - Changes sync automatically after 30 seconds
- **Manual save** - Ctrl+S for immediate sync
- **Delete** - Right-click > Delete

#### Sync Status

The status bar shows sync status for cloud files:
- **Synced** - All changes saved
- **Syncing** - Upload in progress
- **Pending** - Changes waiting to sync
- **Conflict** - Manual resolution needed

### Conflict Resolution

When the same file is modified both locally and in the cloud:

1. A conflict modal appears
2. Review both versions side by side
3. Choose to keep:
   - **Local version** - Your changes
   - **Server version** - Cloud changes
   - **Both** - Creates a copy

---

## Import & Export

### Import

Supported formats:
- `.md` - Markdown
- `.markdown` - Markdown
- `.txt` - Plain text
- `.mdx` - MDX

Methods:
- **File menu** - Import button in toolbar
- **Drag & drop** - Drop files onto the editor
- **Keyboard** - Ctrl+O

### Export

#### Markdown (.md)

Downloads the raw markdown file.

#### HTML

Standalone HTML file with:
- Embedded styles
- Syntax highlighting
- Math rendering

#### PDF

High-quality PDF with:
- Print-optimized layout
- Preserved formatting
- Page breaks

#### Image (PNG/JPEG)

Export preview as image for sharing on social media.

---

## Settings

Access via gear icon or `Ctrl+,`.

### Appearance

| Setting | Options | Default |
|---------|---------|---------|
| Theme | Dark, Light, System | System |
| Preview Style | GitHub, GitLab, Notion, Obsidian, etc. | GitHub |
| Editor Font Size | 10-24px | 14px |
| Preview Font Size | 12-28px | 16px |
| Font Family | System fonts | JetBrains Mono |

### Editor

| Setting | Description | Default |
|---------|-------------|---------|
| Word Wrap | Soft wrap long lines | On |
| Line Numbers | Show line numbers | On |
| Minimap | Show document minimap | Off |
| Sync Scroll | Sync editor and preview scroll | On |

### Behavior

| Setting | Description | Default |
|---------|-------------|---------|
| Auto Save | Automatically save documents | On |
| Auto Save Interval | Seconds between saves | 30 |
| Format on Save | Format markdown on save | Off |
| Lint on Type | Show linting errors while typing | On |

### Language

- English
- Español (Spanish)

---

## Keyboard Shortcuts

### File Operations

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Document | `Ctrl+N` | `Cmd+N` |
| Open File | `Ctrl+O` | `Cmd+O` |
| Save | `Ctrl+S` | `Cmd+S` |
| Close Tab | `Ctrl+W` | `Cmd+W` |

### Formatting

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Bold | `Ctrl+B` | `Cmd+B` |
| Italic | `Ctrl+I` | `Cmd+I` |
| Strikethrough | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Inline Code | `` Ctrl+` `` | `` Cmd+` `` |
| Code Block | `` Ctrl+Shift+` `` | `` Cmd+Shift+` `` |
| Link | `Ctrl+K` | `Cmd+K` |
| Heading 1 | `Ctrl+1` | `Cmd+1` |
| Heading 2 | `Ctrl+2` | `Cmd+2` |
| Heading 3 | `Ctrl+3` | `Cmd+3` |

### Editing

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Undo | `Ctrl+Z` | `Cmd+Z` |
| Redo | `Ctrl+Shift+Z` | `Cmd+Shift+Z` |
| Find | `Ctrl+F` | `Cmd+F` |
| Replace | `Ctrl+H` | `Cmd+H` |
| Select All | `Ctrl+A` | `Cmd+A` |

### View

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Toggle Sidebar | `Ctrl+B` | `Cmd+B` |
| Zen Mode | `F11` | `Cmd+Shift+F` |
| Zoom In | `Ctrl++` | `Cmd++` |
| Zoom Out | `Ctrl+-` | `Cmd+-` |
| Reset Zoom | `Ctrl+0` | `Cmd+0` |

### Help

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Show Shortcuts | `Ctrl+/` | `Cmd+/` |
| Open Settings | `Ctrl+,` | `Cmd+,` |

---

## Tips & Tricks

### Quick Formatting

- Select text and press `Ctrl+B` to bold
- Double-click a word to select it, then format

### Navigation

- Click on TOC entries to jump to sections
- Use `Ctrl+G` to go to a specific line

### Productivity

- Use Zen mode (`F11`) for distraction-free writing
- Enable format on save for consistent formatting
- Use the minimap for quick document navigation

### Markdown Tips

- Use `---` for horizontal rules between sections
- Create task lists with `- [ ]` and `- [x]`
- Use fenced code blocks with language for syntax highlighting

### Cloud Workflow

- Keep important docs in Google Drive for auto-backup
- Use GitHub for versioned documentation projects
- Check sync status before closing the app

---

## Troubleshooting

### Document Not Saving

1. Check if auto-save is enabled in Settings
2. For cloud files, verify your connection status
3. Check browser storage permissions

### Preview Not Updating

1. Ensure sync scroll is enabled
2. Try toggling preview mode off and on
3. Refresh the page if issues persist

### Cloud Connection Issues

1. Check your internet connection
2. Try disconnecting and reconnecting the service
3. Clear browser cache and re-authorize

---

## Getting Help

- **Keyboard Shortcuts** - Press `Ctrl+/` anytime
- **Feature Tour** - Help menu > Start Tour
- **GitHub Issues** - [Report bugs](https://github.com/qazuor/markview/issues)

---

*Last updated: January 2026*
