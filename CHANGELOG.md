# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive test suite with 2920+ tests and 77%+ coverage
  - Unit tests for all major components (MainLayout, GitHubExplorer, GoogleDriveExplorer)
  - Hook tests (useCodeMirror, useTabs, useToolbarActions)
  - Store tests (documentStore, settingsStore, syncStore, githubStore, gdriveStore)
  - Server route tests (user, sync, github, google APIs)
  - Service tests (sync, markdown, export, storage)
- Test infrastructure with helpers for auth, db, and server mocking
- Integration test setup

## [0.1.0] - 2025-12-31

### Added

- **Cloud Sync Integration**
  - Real-time synchronization with cloud storage
  - Conflict resolution modal for sync conflicts
  - Sync status indicator in status bar
  - Auto-sync with configurable intervals

- **GitHub Integration**
  - Browse and open files from repositories
  - Create and save markdown files directly to GitHub
  - Commit changes with custom messages
  - Delete files from repositories
  - Branch selection support

- **Google Drive Integration**
  - Browse and open files from Google Drive
  - Create files in any folder (with folder creation support)
  - Auto-save to Google Drive (30 seconds after last edit)
  - Manual save with Ctrl+S
  - Delete files from Drive
  - Sync status indicator

- **Editor Features**
  - CodeMirror 6 with full markdown support
  - Syntax highlighting with GitHub Flavored Markdown
  - Line numbers and minimap
  - Real-time linting with remark-lint
  - Format on save with Prettier
  - Smart auto-complete

- **Preview Features**
  - Live preview with synchronized scrolling
  - Multiple themes (GitHub, GitLab, Notion, Obsidian, Stack Overflow, Dev.to)
  - Mermaid diagrams support
  - KaTeX math equations
  - Syntax highlighting with Shiki
  - Callouts and admonitions

- **Document Management**
  - Multiple tabs with tab context menu
  - Version history with diff viewer
  - Auto-save to localStorage
  - Drag & drop file import
  - File explorer with context menus
  - Search & replace with regex support

- **Import & Export**
  - Import .md, .markdown, .txt, .mdx files
  - Export to Markdown, HTML, PDF, PNG/JPEG

- **User Interface**
  - Dark/Light theme with system preference detection
  - Responsive design for mobile devices
  - Internationalization (English, Spanish)
  - Customizable settings (font size, font family, editor preferences)
  - Zen mode for distraction-free writing
  - Keyboard shortcuts modal

- **Progressive Web App**
  - Installable on any device
  - Offline support with service worker
  - Auto updates

- **Onboarding**
  - Welcome guide for new users
  - Interactive feature tour
  - Help menu with shortcuts reference

### Technical

- React 18 with TypeScript 5.7
- Vite 6 for fast development and builds
- Zustand for state management
- Tailwind CSS for styling
- Hono for backend API
- Better Auth for authentication
- Drizzle ORM with Neon PostgreSQL

[Unreleased]: https://github.com/qazuor/markview/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/qazuor/markview/releases/tag/v0.1.0
