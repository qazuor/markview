# MarkView Architecture

Technical architecture documentation for the MarkView markdown editor.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Cloud Integration](#cloud-integration)
- [Testing Strategy](#testing-strategy)

---

## Overview

MarkView is a modern, full-stack markdown editor built with React and TypeScript. It follows a modular architecture with clear separation of concerns between UI components, business logic, and data management.

### Key Architectural Decisions

1. **Component-based UI** - React components organized by feature
2. **Centralized state** - Zustand stores for predictable state management
3. **Service layer** - Business logic isolated from UI
4. **API-first backend** - Hono-based REST API for cloud features
5. **Progressive enhancement** - Works offline, enhanced with cloud features

---

## Tech Stack

### Frontend

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 18 | UI components and rendering |
| Language | TypeScript 5.7 | Type safety |
| Build | Vite 6 | Development and bundling |
| Editor | CodeMirror 6 | Markdown editing |
| State | Zustand | Global state management |
| Styling | Tailwind CSS | Utility-first CSS |
| i18n | i18next | Internationalization |

### Backend

| Layer | Technology | Purpose |
|-------|------------|---------|
| API | Hono | Lightweight HTTP framework |
| Auth | Better Auth | Authentication |
| Database | Neon PostgreSQL | Cloud database |
| ORM | Drizzle | Type-safe database access |

### Markdown Processing

| Library | Purpose |
|---------|---------|
| unified | Processing pipeline |
| remark | Markdown parsing |
| rehype | HTML transformation |
| Shiki | Syntax highlighting |
| Mermaid | Diagrams |
| KaTeX | Math equations |

---

## Project Structure

```
src/
├── app/                    # Application entry
│   ├── App.tsx            # Main app component
│   ├── Providers.tsx      # Context providers
│   └── PreviewWindow.tsx  # Standalone preview
│
├── components/            # React components
│   ├── auth/             # Authentication UI
│   ├── editor/           # CodeMirror editor
│   │   ├── Editor.tsx
│   │   ├── commands/     # Editor commands
│   │   ├── extensions/   # CM extensions
│   │   ├── hooks/        # Editor hooks
│   │   └── themes/       # Editor themes
│   ├── preview/          # Markdown preview
│   │   ├── Preview.tsx
│   │   ├── Mermaid.tsx
│   │   └── hooks/
│   ├── layout/           # Layout components
│   │   └── MainLayout.tsx
│   ├── sidebar/          # Sidebar panels
│   │   ├── FileExplorer.tsx
│   │   ├── GitHubExplorer.tsx
│   │   └── GoogleDriveExplorer.tsx
│   ├── tabs/             # Document tabs
│   ├── toolbar/          # Formatting toolbar
│   ├── statusbar/        # Status indicators
│   ├── modals/           # Dialog components
│   ├── sync/             # Sync UI components
│   ├── onboarding/       # Onboarding flow
│   ├── pwa/              # PWA components
│   └── ui/               # Reusable UI primitives
│
├── hooks/                 # Global React hooks
│   ├── useSettingsSync.ts
│   ├── usePWA.ts
│   └── useMediaQuery.ts
│
├── services/              # Business logic
│   ├── markdown/         # Markdown processing
│   │   ├── renderer.ts   # MD to HTML
│   │   ├── linter.ts     # Linting
│   │   └── formatter.ts  # Formatting
│   ├── storage/          # Local persistence
│   │   ├── localStorage.ts
│   │   └── keys.ts
│   ├── export/           # Export functionality
│   │   ├── html.ts
│   │   ├── pdf.ts
│   │   └── image.ts
│   ├── github/           # GitHub API
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── files.ts
│   ├── gdrive/           # Google Drive API
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── files.ts
│   └── sync/             # Cloud sync
│       ├── sync.ts
│       └── conflict.ts
│
├── stores/                # Zustand stores
│   ├── documentStore.ts  # Documents state
│   ├── settingsStore.ts  # User preferences
│   ├── uiStore.ts        # UI state
│   ├── githubStore.ts    # GitHub state
│   ├── gdriveStore.ts    # Google Drive state
│   └── syncStore.ts      # Sync state
│
├── server/                # Backend API
│   ├── api/
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Auth, rate limiting
│   ├── auth/             # Auth configuration
│   ├── db/               # Database schema
│   └── utils/            # Server utilities
│
├── types/                 # TypeScript types
├── utils/                 # Utility functions
├── i18n/                  # Translations
└── styles/                # Global styles
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Providers (Theme, Auth, i18n)
│   └── MainLayout
│       ├── Header
│       │   └── Toolbar
│       ├── Sidebar
│       │   ├── FileExplorer
│       │   ├── TOCPanel
│       │   ├── GitHubExplorer
│       │   └── GoogleDriveExplorer
│       ├── DocumentArea
│       │   ├── TabBar
│       │   ├── Editor
│       │   └── Preview
│       └── StatusBar
└── Modals (Settings, Version History, etc.)
```

### Component Design Principles

1. **Single Responsibility** - Each component does one thing well
2. **Composition** - Complex UIs built from simple components
3. **Props Down, Events Up** - Unidirectional data flow
4. **Hooks for Logic** - Business logic extracted to custom hooks

### Editor Architecture

The editor is built on CodeMirror 6 with a modular extension system:

```
Editor
├── useCodeMirror (hook)
│   ├── State Management
│   ├── Extensions
│   │   ├── Markdown syntax
│   │   ├── Line numbers
│   │   ├── Minimap
│   │   ├── Linting
│   │   └── Keybindings
│   └── Themes
└── Commands
    ├── Formatting (bold, italic, etc.)
    ├── Lists (ordered, unordered, task)
    └── Blocks (code, quote, etc.)
```

### Preview Architecture

The preview uses a unified processing pipeline:

```
Markdown Input
    │
    ▼
┌─────────────┐
│   remark    │ ← Parse markdown
└─────────────┘
    │
    ▼
┌─────────────┐
│   plugins   │ ← GFM, math, frontmatter
└─────────────┘
    │
    ▼
┌─────────────┐
│   rehype    │ ← Convert to HTML
└─────────────┘
    │
    ▼
┌─────────────┐
│   plugins   │ ← Shiki, sanitize
└─────────────┘
    │
    ▼
HTML Output + Mermaid diagrams
```

---

## Backend Architecture

### API Structure

```
/api
├── /auth           # Authentication endpoints
│   ├── /session    # Session management
│   └── /callback   # OAuth callbacks
├── /user           # User endpoints
│   ├── GET /me     # Current user
│   └── /settings   # User settings CRUD
├── /sync           # Cloud sync endpoints
│   ├── /documents  # Document sync
│   ├── /folders    # Folder sync
│   └── /status     # Sync status
├── /github         # GitHub proxy
│   ├── /repos      # Repository list
│   ├── /files      # File operations
│   └── /commits    # Commit operations
└── /google         # Google Drive proxy
    ├── /files      # File operations
    └── /folders    # Folder operations
```

### Middleware Stack

```
Request
    │
    ▼
┌─────────────────┐
│  Rate Limiting  │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Authentication │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Validation    │ ← Zod schemas
└─────────────────┘
    │
    ▼
┌─────────────────┐
│    Handler      │
└─────────────────┘
    │
    ▼
Response
```

### Database Schema

```sql
-- Users (managed by Better Auth)
users
├── id
├── email
├── name
└── image

-- User settings
user_settings
├── id
├── user_id → users.id
├── settings (JSON)
└── updated_at

-- Synced documents
documents
├── id
├── user_id → users.id
├── name
├── content
├── folder_id
├── sync_version
├── synced_at
├── updated_at
└── deleted_at

-- Folders
folders
├── id
├── user_id → users.id
├── name
├── parent_id → folders.id
├── sort_order
└── updated_at
```

---

## State Management

### Store Architecture

MarkView uses Zustand for state management with domain-specific stores:

```
┌─────────────────────────────────────────────┐
│                  Stores                      │
├─────────────────┬─────────────────┬─────────┤
│  documentStore  │  settingsStore  │ uiStore │
│  - documents    │  - theme        │ - view  │
│  - activeId     │  - editor opts  │ - modal │
│  - versions     │  - sync prefs   │ - zoom  │
├─────────────────┼─────────────────┼─────────┤
│  githubStore    │  gdriveStore    │syncStore│
│  - connected    │  - connected    │ - status│
│  - repos        │  - files        │ - queue │
│  - fileTree     │  - quota        │ - errors│
└─────────────────┴─────────────────┴─────────┘
```

### Store Responsibilities

| Store | Responsibility |
|-------|---------------|
| `documentStore` | Document CRUD, active document, version history |
| `settingsStore` | User preferences, theme, editor settings |
| `uiStore` | UI state (view mode, modals, zoom) |
| `githubStore` | GitHub connection, repositories, file trees |
| `gdriveStore` | Google Drive connection, files, quota |
| `syncStore` | Sync status, queue, conflicts |

### Persistence

Stores persist to localStorage using Zustand's persist middleware:

```typescript
create(
  persist(
    (set, get) => ({ /* store */ }),
    {
      name: 'document-store',
      partialize: (state) => ({ /* persisted fields */ })
    }
  )
)
```

---

## Data Flow

### Document Editing Flow

```
User Input
    │
    ▼
┌─────────────┐
│   Editor    │ ← CodeMirror captures input
└─────────────┘
    │
    ▼
┌─────────────┐
│   onChange  │ ← Debounced callback
└─────────────┘
    │
    ├─────────────────────┐
    ▼                     ▼
┌─────────────┐   ┌─────────────┐
│   Store     │   │   Preview   │
│   Update    │   │   Render    │
└─────────────┘   └─────────────┘
    │
    ▼
┌─────────────┐
│  Auto-save  │ ← localStorage + cloud
└─────────────┘
```

### Cloud Sync Flow

```
Document Change
    │
    ▼
┌─────────────────┐
│  Queue Change   │ ← Add to sync queue
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Debounce       │ ← Wait for more changes
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Process Queue  │ ← Batch sync
└─────────────────┘
    │
    ├── Success ──────────────┐
    │                         ▼
    │                 ┌─────────────┐
    │                 │ Update Store│
    │                 └─────────────┘
    │
    └── Conflict ─────────────┐
                              ▼
                      ┌─────────────┐
                      │ Show Modal  │
                      └─────────────┘
```

---

## Cloud Integration

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ MarkView│────▶│ OAuth   │
│         │     │         │     │ Provider│
└─────────┘     └─────────┘     └─────────┘
                    │                │
                    │    callback    │
                    │◀───────────────┘
                    │
                    ▼
              ┌─────────┐
              │ Store   │
              │ Tokens  │ ← Encrypted in DB
              └─────────┘
```

### GitHub Integration

```
GitHubExplorer
    │
    ▼
┌─────────────────┐
│ githubService   │ ← Frontend service
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ /api/github/*   │ ← Backend proxy
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ GitHub API      │ ← Using stored token
└─────────────────┘
```

### Google Drive Integration

```
GoogleDriveExplorer
    │
    ▼
┌─────────────────┐
│ gdriveService   │ ← Frontend service
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ /api/google/*   │ ← Backend proxy
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Google Drive API│ ← Using stored token
└─────────────────┘
```

---

## Testing Strategy

### Test Pyramid

```
        ┌─────────┐
        │   E2E   │ ← Playwright (critical paths)
        ├─────────┤
        │  Integ  │ ← API integration tests
    ┌───┴─────────┴───┐
    │      Unit       │ ← Vitest (components, hooks, services)
    └─────────────────┘
```

### Test Organization

```
tests/
├── unit/
│   ├── components/    # Component tests
│   │   ├── editor/
│   │   ├── preview/
│   │   ├── sidebar/
│   │   └── ...
│   ├── hooks/         # Hook tests
│   ├── stores/        # Store tests
│   ├── services/      # Service tests
│   └── server/        # API tests
├── integration/       # Integration tests
└── e2e/              # End-to-end tests
```

### Testing Tools

| Tool | Purpose |
|------|---------|
| Vitest | Unit test runner |
| React Testing Library | Component testing |
| MSW | API mocking |
| Playwright | E2E testing |

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

---

## Performance Considerations

### Optimizations

1. **Code Splitting** - Dynamic imports for heavy components
2. **Memoization** - React.memo for expensive renders
3. **Debouncing** - Delayed processing for rapid inputs
4. **Virtual Scrolling** - For large file lists
5. **Service Worker** - Caching for offline support

### Bundle Size

Key strategies:
- Tree shaking unused code
- Lazy loading Mermaid and KaTeX
- Optimized Shiki language loading

---

## Security

### Authentication

- OAuth 2.0 for GitHub and Google
- Encrypted token storage
- Session-based auth with Better Auth

### Data Protection

- HTTPS only
- Input sanitization
- XSS prevention in preview (rehype-sanitize)

### API Security

- Rate limiting
- CORS configuration
- Request validation with Zod

---

*Last updated: January 2026*
