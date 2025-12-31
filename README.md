# MarkView

<div align="center">

![MarkView Logo](https://via.placeholder.com/200x200.png?text=MarkView)

**Markdown, visualized** - A modern, feature-rich markdown editor and previewer.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo](https://markview-demo.vercel.app) • [Documentation](docs/USER_GUIDE.md) • [Contributing](CONTRIBUTING.md)

</div>

---

## Features

### Editor

- **CodeMirror 6** - Modern, extensible code editor with excellent performance
- **Syntax Highlighting** - Full markdown syntax support with GitHub Flavored Markdown
- **Smart Auto-Complete** - Context-aware suggestions for headings, links, and more
- **Line Numbers & Minimap** - Enhanced navigation for long documents
- **Format on Save** - Automatically format markdown with Prettier
- **Real-time Linting** - Catch markdown issues as you type with remark-lint
- **Keyboard Shortcuts** - Complete keyboard navigation support

### Preview

- **Live Preview** - Real-time rendering as you type with debounced updates
- **Synchronized Scrolling** - Editor and preview stay in sync
- **Multiple Themes** - GitHub, GitLab, Notion, Obsidian, Stack Overflow, Dev.to styles
- **Syntax Highlighting** - Beautiful code blocks with Shiki
- **Mermaid Diagrams** - Flowcharts, sequence diagrams, and more
- **KaTeX Math** - Beautiful mathematical equations
- **GFM Support** - Tables, task lists, strikethrough, autolinks
- **Callouts** - GitHub and Obsidian-style admonitions
- **Frontmatter** - YAML frontmatter parsing and display

### Document Management

- **Multiple Tabs** - Work with several files simultaneously
- **Auto-Save** - Automatic saving to localStorage (customizable interval)
- **Version History** - Track and restore previous versions with diff viewer
- **Drag & Drop** - Drop files directly into the editor
- **File Explorer** - Browse and manage your documents
- **Search & Replace** - Powerful find and replace with regex support
- **Smart Document Creation** - New documents start with auto-edit name and H1 heading
- **Context Menus** - Right-click menus for files (rename, duplicate, export, delete)

### Cloud Integration

- **GitHub Integration**
  - Browse and open files from your repositories
  - Create and save markdown files directly to GitHub
  - Commit changes with custom messages
  - Delete files from repositories
  - Branch selection support

- **Google Drive Integration**
  - Browse and open files from your Google Drive
  - Create files in any folder (with folder creation support)
  - Auto-save to Google Drive (30 seconds after last edit)
  - Manual save with Ctrl+S
  - Delete files from Drive or just remove from local list
  - Sync status indicator in status bar

### Import & Export

- **Import Files** - Support for .md, .markdown, .txt, .mdx files
- **Export to Markdown** - Download as .md file with original formatting
- **Export to HTML** - Standalone HTML with embedded styles
- **Export to PDF** - High-quality PDF generation
- **Export to Image** - PNG/JPEG export for sharing

### Interface

- **Dark/Light Themes** - System preference detection with manual override
- **Responsive Design** - Mobile-friendly interface with adaptive layout
- **Internationalization** - Full support for English and Spanish
- **Customizable** - Font size, font family, editor preferences
- **Zen Mode** - Distraction-free writing mode
- **Keyboard Shortcuts** - Quick reference modal (Ctrl+/)
- **Context Menus** - Right-click menus for editor, preview, tabs, files, and more

### Progressive Web App (PWA)

- **Installable** - Install as a standalone app on any device
- **Offline Support** - Work without internet connection
- **Auto Updates** - Automatic updates when new versions are available
- **Fast Loading** - Service worker caching for instant loading

### Onboarding

- **Welcome Guide** - Interactive introduction for new users
- **Feature Tour** - Guided tour highlighting key UI elements
- **Help Menu** - Quick access to shortcuts, tour, and documentation

---

## Screenshots

<div align="center">

![Editor View](https://via.placeholder.com/800x500.png?text=Editor+View)
*Main editor interface with live preview*

![Dark Theme](https://via.placeholder.com/800x500.png?text=Dark+Theme)
*Dark theme with GitHub preview style*

![Mobile View](https://via.placeholder.com/400x700.png?text=Mobile+View)
*Responsive mobile interface*

</div>

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 |
| **Language** | TypeScript 5.7 |
| **Build Tool** | Vite 6 |
| **Editor** | CodeMirror 6 |
| **State** | Zustand |
| **Styling** | Tailwind CSS |
| **Markdown** | unified, remark, rehype |
| **Syntax Highlighting** | Shiki |
| **Diagrams** | Mermaid |
| **Math** | KaTeX |
| **i18n** | i18next |
| **Testing** | Vitest, Playwright |
| **Linting** | Biome |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8+ (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/qazuor/markview.git
cd markview

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm lint` | Check code with Biome |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm format` | Format code with Biome |
| `pnpm format:check` | Check code formatting |
| `pnpm typecheck` | Run TypeScript type checking |

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| **Formatting** |
| Bold | `Ctrl+B` | `Cmd+B` |
| Italic | `Ctrl+I` | `Cmd+I` |
| Strikethrough | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Inline Code | `Ctrl+` ` | `Cmd+` ` |
| Code Block | `Ctrl+Shift+` ` | `Cmd+Shift+` ` |
| Link | `Ctrl+K` | `Cmd+K` |
| **File Operations** |
| Save (local/cloud) | `Ctrl+S` | `Cmd+S` |
| New Document | `Ctrl+N` | `Cmd+N` |
| Open File | `Ctrl+O` | `Cmd+O` |
| Close Tab | `Ctrl+W` | `Cmd+W` |
| **Editing** |
| Undo | `Ctrl+Z` | `Cmd+Z` |
| Redo | `Ctrl+Shift+Z` | `Cmd+Shift+Z` |
| Find | `Ctrl+F` | `Cmd+F` |
| Replace | `Ctrl+H` | `Cmd+H` |
| **View** |
| Toggle Sidebar | `Ctrl+B` | `Cmd+B` |
| Zen Mode | `F11` | `Cmd+Shift+F` |
| **Help** |
| Show Shortcuts | `Ctrl+/` | `Cmd+/` |

[View all shortcuts](docs/USER_GUIDE.md#keyboard-shortcuts)

---

## Project Structure

```
markview/
├── src/
│   ├── app/              # App entry and providers
│   ├── components/       # React components
│   │   ├── editor/       # CodeMirror editor
│   │   ├── preview/      # Markdown preview
│   │   ├── toolbar/      # Formatting toolbar
│   │   ├── tabs/         # Document tabs
│   │   ├── sidebar/      # File explorer, TOC
│   │   ├── statusbar/    # Status bar
│   │   ├── modals/       # Dialogs
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic
│   │   ├── markdown/     # Markdown processing
│   │   ├── storage/      # Local storage
│   │   ├── export/       # Export functionality
│   │   ├── github/       # GitHub API integration
│   │   └── gdrive/       # Google Drive API integration
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── i18n/             # Internationalization
│   └── styles/           # Global styles
├── tests/
│   ├── unit/             # Vitest unit tests
│   └── e2e/              # Playwright e2e tests
└── docs/                 # Documentation
```

---

## Configuration

Access settings through the gear icon in the toolbar or press `Ctrl+,` (Windows/Linux) or `Cmd+,` (macOS).

### Available Settings

- **Appearance**
  - Theme (Dark, Light, System)
  - Preview Style (GitHub, GitLab, Notion, Obsidian, Stack Overflow, Dev.to)
  - Editor Font Size (10-24px)
  - Preview Font Size (12-28px)
  - Font Family

- **Editor**
  - Word Wrap
  - Line Numbers
  - Minimap
  - Sync Scroll

- **Behavior**
  - Auto Save
  - Auto Save Interval
  - Format on Save
  - Lint on Type

- **Sync** (Cloud Integration)
  - GitHub: Connect/disconnect, view connected account
  - Google Drive: Connect/disconnect, view connected account
  - Sync status indicators

- **Language**
  - English
  - Spanish (Español)

---

## Documentation

- [User Guide](docs/USER_GUIDE.md) - Complete user documentation
- [Architecture](docs/ARCHITECTURE.md) - Technical architecture details
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Changelog](CHANGELOG.md) - Version history

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

---

## Roadmap

- [x] PWA with offline support
- [x] Onboarding and feature tour
- [x] Context menus for all components
- [x] Zoom controls (keyboard, mouse wheel, menu)
- [x] Version history with diff viewer
- [x] GitHub integration for opening/saving/deleting files
- [x] Google Drive integration with auto-sync
- [x] Smart document creation (auto-edit name, H1 heading)
- [x] Cloud delete options (local only or also from cloud)
- [ ] Real-time collaboration
- [ ] Desktop app with Tauri
- [ ] Advanced export options (DOCX, LaTeX)
- [ ] Plugin system
- [ ] Custom themes editor
- [ ] Vim/Emacs keybindings

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [CodeMirror](https://codemirror.net/) - Excellent code editor
- [unified](https://unifiedjs.com/) - Markdown processing
- [Mermaid](https://mermaid.js.org/) - Diagram generation
- [KaTeX](https://katex.org/) - Math rendering
- [Shiki](https://shiki.matsu.io/) - Syntax highlighting

---

## Author

**qazuor**
- GitHub: [@qazuor](https://github.com/qazuor)
- Project: [markview](https://github.com/qazuor/markview)

---

<div align="center">

Made with ❤️ by qazuor

[⬆ Back to Top](#markview)

</div>
