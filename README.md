# MarkView

**Markdown, visualized** - A modern, feature-rich markdown editor and previewer built with React.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Features

### Editor

- **CodeMirror 6** - Modern, extensible editor with excellent performance
- **Syntax highlighting** - Full markdown syntax support with GFM extensions
- **Line numbers** - Optional line number display
- **Word wrap** - Toggle word wrapping
- **Minimap** - Code minimap for quick navigation
- **Format on save** - Auto-format markdown on save
- **Lint on type** - Real-time markdown linting with remark-lint
- **Keyboard shortcuts** - Full keyboard navigation support

### Preview

- **Live preview** - Real-time markdown rendering
- **Synchronized scrolling** - Editor and preview scroll together
- **Multiple themes** - GitHub, GitLab, Notion, Obsidian, StackOverflow, Dev.to styles
- **Syntax highlighting** - Code blocks with Shiki
- **GFM support** - Tables, task lists, strikethrough, autolinks
- **Frontmatter** - YAML and TOML frontmatter parsing

### Document Management

- **Multiple documents** - Work with multiple files in tabs
- **Auto-save** - Automatic document saving to localStorage
- **Version history** - Track document changes over time
- **Rename documents** - Double-click tabs to rename
- **File explorer** - Browse and manage documents

### Import/Export

- **Import files** - Open .md, .markdown, .txt, .mdx files
- **Drag and drop** - Drop files directly into the editor
- **Export to Markdown** - Download as .md file
- **Export to HTML** - Full HTML document with styles
- **Export to PDF** - PDF generation with html2pdf.js

### Interface

- **Dark/Light themes** - System preference detection
- **Responsive design** - Mobile-friendly with tab navigation
- **Internationalization** - English and Spanish support
- **Customizable** - Font size, font family, and more
- **Keyboard shortcuts modal** - Quick reference for all shortcuts

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Language | TypeScript 5.7 |
| Build | Vite 6 |
| Editor | CodeMirror 6 |
| State | Zustand |
| Styling | Tailwind CSS |
| Markdown | unified, remark, rehype |
| Syntax Highlighting | Shiki |
| i18n | i18next |
| Testing | Vitest, Playwright |
| Linting | Biome |

## Getting Started

### Prerequisites

- Node.js 18+
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

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm lint` | Check code with Biome |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Format code with Biome |
| `pnpm typecheck` | Run TypeScript type checking |

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
│   │   ├── statusbar/    # Status bar components
│   │   ├── modals/       # Modal dialogs
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic
│   │   ├── markdown/     # Markdown processing
│   │   ├── storage/      # Local storage
│   │   └── export/       # Export functionality
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

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Bold | `Ctrl+B` | `Cmd+B` |
| Italic | `Ctrl+I` | `Cmd+I` |
| Strikethrough | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Link | `Ctrl+K` | `Cmd+K` |
| Code | `Ctrl+\`` | `Cmd+\`` |
| Save | `Ctrl+S` | `Cmd+S` |
| Undo | `Ctrl+Z` | `Cmd+Z` |
| Redo | `Ctrl+Shift+Z` | `Cmd+Shift+Z` |

## Settings

Access settings through the gear icon in the toolbar:

- **Theme** - Dark, Light, or System
- **Preview Style** - GitHub, GitLab, Notion, Obsidian, StackOverflow, Dev.to
- **Editor Font Size** - 10-24px
- **Preview Font Size** - 12-28px
- **Font Family** - Customizable font
- **Word Wrap** - Toggle line wrapping
- **Line Numbers** - Show/hide line numbers
- **Minimap** - Show/hide code minimap
- **Sync Scroll** - Synchronized editor/preview scrolling
- **Auto Save** - Enable automatic saving
- **Format on Save** - Auto-format on save
- **Lint on Type** - Real-time linting
- **Language** - English or Spanish

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

## Roadmap

- [ ] Mermaid diagram support
- [ ] Callouts/admonitions
- [ ] Interactive checklists
- [ ] Emoji picker
- [ ] GitHub integration
- [ ] Real-time collaboration

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

**qazuor** - [GitHub](https://github.com/qazuor)
