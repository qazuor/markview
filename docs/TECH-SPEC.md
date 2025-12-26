# MarkView - Technical Specification

## 1. Overview

This document defines the technical architecture, technology stack, and implementation details for MarkView, a cross-platform Markdown editor and previewer.

---

## 2. Technology Stack

### 2.1 Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Framework** | React | 18.x | UI components |
| **Build Tool** | Vite | 5.x | Fast builds, HMR |
| **State Management** | Zustand | 4.x | Simple, performant state |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Editor** | CodeMirror | 6.x | Code editing |
| **Desktop** | Tauri | 2.x | Native desktop apps |
| **Testing** | Vitest | 1.x | Unit testing |
| **E2E Testing** | Playwright | 1.x | End-to-end testing |

### 2.2 Markdown Processing

| Library | Purpose |
|---------|---------|
| **unified** | Core processing pipeline |
| **remark-parse** | Parse Markdown to AST |
| **remark-gfm** | GitHub Flavored Markdown |
| **remark-frontmatter** | YAML frontmatter support |
| **remark-math** | Math notation support |
| **remark-rehype** | Convert to HTML AST |
| **rehype-stringify** | Serialize to HTML |
| **rehype-sanitize** | Sanitize HTML output |
| **rehype-highlight** | Syntax highlighting (or Shiki) |

### 2.3 Extended Features

| Feature | Library |
|---------|---------|
| **Syntax Highlighting** | Shiki |
| **Diagrams** | Mermaid |
| **Math** | KaTeX |
| **Linting** | markdownlint |
| **Formatting** | Prettier |
| **PDF Export** | html2pdf.js (web), Tauri print (desktop) |
| **Image Upload** | Cloudinary SDK or Imgur API |
| **i18n** | i18next + react-i18next |
| **GitHub API** | Octokit |

### 2.4 Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager |
| **Biome** | Linting and formatting |
| **Husky** | Git hooks |
| **Commitlint** | Commit message validation |

---

## 3. Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Editor  │ │ Preview │ │ Sidebar │ │ Toolbar │ │ Modals  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
└───────┼───────────┼───────────┼───────────┼───────────┼─────────┘
        │           │           │           │           │
┌───────┴───────────┴───────────┴───────────┴───────────┴─────────┐
│                          STATE LAYER (Zustand)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Document │ │ Settings │ │   UI     │ │  GitHub  │            │
│  │  Store   │ │  Store   │ │  Store   │ │  Store   │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
└───────┼────────────┼────────────┼────────────┼──────────────────┘
        │            │            │            │
┌───────┴────────────┴────────────┴────────────┴──────────────────┐
│                         SERVICE LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Markdown │ │ Storage  │ │  Export  │ │  GitHub  │            │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────────────────┘
        │            │            │            │
┌───────┴────────────┴────────────┴────────────┴──────────────────┐
│                       INFRASTRUCTURE LAYER                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Unified │ │ Local    │ │ html2pdf │ │ Octokit  │            │
│  │  Remark  │ │ Storage  │ │ Tauri FS │ │          │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Project Structure

```
markview/
├── src/
│   ├── app/                    # App entry point and providers
│   │   ├── App.tsx
│   │   ├── Providers.tsx
│   │   └── routes.tsx
│   │
│   ├── components/             # React components
│   │   ├── editor/
│   │   │   ├── Editor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── EditorTabs.tsx
│   │   │   └── hooks/
│   │   │       ├── useEditor.ts
│   │   │       └── useKeyboardShortcuts.ts
│   │   │
│   │   ├── preview/
│   │   │   ├── Preview.tsx
│   │   │   ├── PreviewTheme.tsx
│   │   │   └── hooks/
│   │   │       └── usePreview.ts
│   │   │
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   └── SearchPanel.tsx
│   │   │
│   │   ├── toolbar/
│   │   │   ├── MainToolbar.tsx
│   │   │   └── FormatButtons.tsx
│   │   │
│   │   ├── statusbar/
│   │   │   └── StatusBar.tsx
│   │   │
│   │   ├── modals/
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── KeyboardShortcutsModal.tsx
│   │   │   ├── OnboardingModal.tsx
│   │   │   └── VersionHistoryModal.tsx
│   │   │
│   │   └── ui/                 # Shared UI primitives
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Dropdown.tsx
│   │       ├── Tabs.tsx
│   │       └── ...
│   │
│   ├── stores/                 # Zustand stores
│   │   ├── documentStore.ts
│   │   ├── settingsStore.ts
│   │   ├── uiStore.ts
│   │   └── githubStore.ts
│   │
│   ├── services/               # Business logic
│   │   ├── markdown/
│   │   │   ├── parser.ts
│   │   │   ├── renderer.ts
│   │   │   ├── plugins/
│   │   │   │   ├── mermaid.ts
│   │   │   │   ├── katex.ts
│   │   │   │   ├── callouts.ts
│   │   │   │   └── frontmatter.ts
│   │   │   └── themes/
│   │   │       ├── github.css
│   │   │       ├── gitlab.css
│   │   │       └── ...
│   │   │
│   │   ├── storage/
│   │   │   ├── localStorage.ts
│   │   │   ├── fileSystem.ts      # Tauri-specific
│   │   │   └── syncService.ts
│   │   │
│   │   ├── export/
│   │   │   ├── pdf.ts
│   │   │   ├── html.ts
│   │   │   └── image.ts
│   │   │
│   │   ├── github/
│   │   │   ├── auth.ts
│   │   │   ├── repos.ts
│   │   │   └── files.ts
│   │   │
│   │   ├── linting/
│   │   │   └── markdownLint.ts
│   │   │
│   │   └── upload/
│   │       └── imageUpload.ts
│   │
│   ├── hooks/                  # Shared React hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useBroadcastChannel.ts
│   │   └── useFileWatcher.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── filename.ts
│   │   ├── wordCount.ts
│   │   └── formatters.ts
│   │
│   ├── i18n/                   # Internationalization
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── es.json
│   │
│   ├── types/                  # TypeScript types
│   │   ├── document.ts
│   │   ├── settings.ts
│   │   └── github.ts
│   │
│   └── styles/                 # Global styles
│       ├── globals.css
│       ├── themes/
│       │   ├── dark.css
│       │   └── light.css
│       └── preview-themes/
│           ├── github.css
│           └── ...
│
├── src-tauri/                  # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/
│   │   │   ├── file.rs
│   │   │   └── watcher.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── public/
│   ├── favicon.ico
│   ├── manifest.json           # PWA manifest
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── IDEA-BASE.md
│   ├── PDR.md
│   ├── TECH-SPEC.md
│   └── TASKS/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── biome.json
├── package.json
└── README.md
```

---

## 4. State Management

### 4.1 Store Structure

#### Document Store
```typescript
interface DocumentState {
  // Open documents
  documents: Map<string, Document>;
  activeDocumentId: string | null;

  // Document operations
  createDocument: () => string;
  openDocument: (id: string) => void;
  closeDocument: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  renameDocument: (id: string, name: string) => void;

  // Version history
  saveVersion: (id: string) => void;
  getVersions: (id: string) => Version[];
  restoreVersion: (id: string, versionId: string) => void;
}

interface Document {
  id: string;
  name: string;
  content: string;
  isModified: boolean;
  source: 'local' | 'github';
  githubInfo?: {
    owner: string;
    repo: string;
    path: string;
    sha: string;
  };
  cursor: { line: number; column: number };
  scroll: { line: number };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Settings Store
```typescript
interface SettingsState {
  // Appearance
  theme: 'dark' | 'light' | 'system';
  previewStyle: 'github' | 'gitlab' | 'notion' | 'obsidian' | 'stackoverflow' | 'devto';
  editorFontSize: number;
  previewFontSize: number;
  fontFamily: string;

  // Editor
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  syncScroll: boolean;

  // Behavior
  autoSave: boolean;
  autoSaveInterval: number;
  formatOnSave: boolean;
  lintOnType: boolean;

  // Language
  language: 'en' | 'es';

  // Actions
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
}
```

#### UI Store
```typescript
interface UIState {
  // Layout
  sidebarOpen: boolean;
  sidebarSection: 'explorer' | 'toc' | 'search';
  zenMode: boolean;

  // Modals
  activeModal: 'settings' | 'shortcuts' | 'onboarding' | 'versions' | null;

  // Search
  searchQuery: string;
  searchResults: SearchResult[];

  // Status
  saveStatus: 'saved' | 'saving' | 'modified';

  // Actions
  toggleSidebar: () => void;
  setSidebarSection: (section: string) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  toggleZenMode: () => void;
}
```

#### GitHub Store
```typescript
interface GitHubState {
  // Auth
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;

  // Repos
  repos: Repository[];
  selectedRepo: Repository | null;
  currentPath: string[];
  files: GitHubFile[];

  // Actions
  login: () => Promise<void>;
  logout: () => void;
  fetchRepos: () => Promise<void>;
  navigateToPath: (path: string[]) => Promise<void>;
  openFile: (file: GitHubFile) => Promise<void>;
}
```

---

## 5. Key Components

### 5.1 Editor Component

The editor is built on CodeMirror 6 with custom extensions:

```typescript
// CodeMirror extensions
const extensions = [
  markdown(),
  syntaxHighlighting(customHighlightStyle),
  lineNumbers(),
  highlightActiveLine(),
  bracketMatching(),
  closeBrackets(),
  history(),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
    ...markdownKeymap,  // Custom markdown shortcuts
  ]),
  EditorView.lineWrapping,
  lintExtension,        // Markdownlint integration
  scrollSyncExtension,  // Sync with preview
];
```

### 5.2 Markdown Pipeline

Using unified ecosystem:

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeShiki from '@shikijs/rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// Custom plugins
import remarkCallouts from './plugins/callouts';
import remarkMermaid from './plugins/mermaid';
import remarkCheckbox from './plugins/checkbox';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkMath)
  .use(remarkCallouts)
  .use(remarkMermaid)
  .use(remarkCheckbox)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeKatex)
  .use(rehypeShiki, { theme: 'github-dark' })
  .use(rehypeSanitize)
  .use(rehypeStringify);

export async function renderMarkdown(content: string): Promise<string> {
  const result = await processor.process(content);
  return String(result);
}
```

### 5.3 Preview Sync (BroadcastChannel)

```typescript
// In main editor tab
const channel = new BroadcastChannel('markview-preview');

function updatePreview(content: string) {
  const html = renderMarkdown(content);
  channel.postMessage({ type: 'update', html, theme: currentTheme });
}

// In preview tab
const channel = new BroadcastChannel('markview-preview');

channel.onmessage = (event) => {
  if (event.data.type === 'update') {
    document.getElementById('preview').innerHTML = event.data.html;
    applyTheme(event.data.theme);
  }
  if (event.data.type === 'close') {
    showReconnectMessage();
  }
};
```

---

## 6. Data Persistence

### 6.1 localStorage Schema

```typescript
// Keys
const STORAGE_KEYS = {
  DOCUMENTS: 'markview:documents',
  SETTINGS: 'markview:settings',
  UI_STATE: 'markview:ui',
  GITHUB_TOKEN: 'markview:github:token',
  VERSIONS: 'markview:versions',
};

// Document storage
interface StoredDocument {
  id: string;
  name: string;
  content: string;
  source: 'local' | 'github';
  githubInfo?: GitHubFileInfo;
  createdAt: string;
  updatedAt: string;
}

// Version storage
interface StoredVersions {
  [documentId: string]: {
    versions: Array<{
      id: string;
      content: string;
      timestamp: string;
    }>;
  };
}
```

### 6.2 File System (Tauri)

```rust
// src-tauri/src/commands/file.rs
use std::fs;
use std::path::Path;

#[tauri::command]
pub fn read_file(path: &str) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_file(path: &str, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn watch_file(path: &str) -> Result<(), String> {
    // Implementation using notify crate
}
```

---

## 7. Export Implementation

### 7.1 PDF Export (Web)

```typescript
import html2pdf from 'html2pdf.js';

export async function exportToPdf(html: string, filename: string) {
  const element = document.createElement('div');
  element.innerHTML = html;
  element.className = getPreviewThemeClass();

  const options = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  await html2pdf().set(options).from(element).save();
}
```

### 7.2 Image Export

```typescript
import html2canvas from 'html2canvas';

export async function exportToImage(
  element: HTMLElement,
  format: 'png' | 'jpeg',
  filename: string
) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const dataUrl = canvas.toDataURL(`image/${format}`);
  downloadDataUrl(dataUrl, `${filename}.${format}`);
}
```

---

## 8. GitHub Integration

### 8.1 OAuth Flow

```typescript
import { Octokit } from '@octokit/rest';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;

export function initiateOAuth() {
  const state = generateRandomState();
  sessionStorage.setItem('github_oauth_state', state);

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', 'repo read:user');
  url.searchParams.set('state', state);

  window.location.href = url.toString();
}

// After redirect, exchange code for token via backend or serverless function
```

### 8.2 Octokit Usage

```typescript
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: token });

// List repos
const { data: repos } = await octokit.repos.listForAuthenticatedUser({
  sort: 'updated',
  per_page: 100,
});

// Get file content
const { data: file } = await octokit.repos.getContent({
  owner,
  repo,
  path,
});

// Decode content (base64)
const content = atob(file.content);
```

---

## 9. PWA Configuration

### 9.1 Vite PWA Plugin

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'MarkView',
        short_name: 'MarkView',
        description: 'Markdown editor and previewer',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.github\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## 10. Tauri Configuration

### 10.1 tauri.conf.json

```json
{
  "productName": "MarkView",
  "version": "1.0.0",
  "identifier": "com.markview.app",
  "build": {
    "beforeBuildCommand": "pnpm build",
    "beforeDevCommand": "pnpm dev",
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173"
  },
  "app": {
    "windows": [
      {
        "title": "MarkView",
        "width": 1280,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    },
    "macOS": {
      "minimumSystemVersion": "10.13"
    }
  }
}
```

### 10.2 File Association

```json
{
  "bundle": {
    "fileAssociations": [
      {
        "ext": ["md", "markdown"],
        "name": "Markdown",
        "description": "Markdown Document",
        "role": "Editor"
      }
    ]
  }
}
```

---

## 11. Performance Considerations

### 11.1 Rendering Optimization

- **Debounced rendering**: 300ms debounce on content changes
- **Virtual scrolling**: For documents > 5000 lines (using react-window)
- **Memoization**: Heavy components wrapped with React.memo
- **Web Workers**: Markdown parsing in worker thread for large documents

### 11.2 Bundle Optimization

- **Code splitting**: Lazy load modals and settings
- **Tree shaking**: Vite handles this automatically
- **Compression**: Brotli for production builds
- **Target size**: < 500KB gzipped for initial load

### 11.3 Memory Management

- **Document limit**: Warning at 10 documents, suggest closing
- **Version limit**: 10 versions per document, FIFO
- **Image handling**: Convert large base64 to object URLs

---

## 12. Security

### 12.1 Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self';
  connect-src 'self' https://api.github.com https://api.cloudinary.com;
">
```

### 12.2 HTML Sanitization

Using rehype-sanitize with custom schema to allow safe extensions:

```typescript
import { defaultSchema } from 'rehype-sanitize';

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes.div || []), 'className', 'data-*'],
    code: [...(defaultSchema.attributes.code || []), 'className'],
    span: [...(defaultSchema.attributes.span || []), 'className', 'style'],
  },
  tagNames: [...(defaultSchema.tagNames || []), 'svg', 'path', 'circle'],
};
```

### 12.3 Token Storage

- GitHub tokens stored in encrypted localStorage (web)
- Secure keychain storage in Tauri (desktop)
- Tokens never logged or exposed to console

---

## 13. Testing Strategy

### 13.1 Unit Tests (Vitest)

```typescript
// Focus areas:
// - Markdown parsing and rendering
// - Store actions and state transitions
// - Utility functions
// - Service layer logic

describe('markdownParser', () => {
  it('should parse headings correctly', async () => {
    const html = await renderMarkdown('# Hello');
    expect(html).toContain('<h1>Hello</h1>');
  });

  it('should render mermaid diagrams', async () => {
    const html = await renderMarkdown('```mermaid\ngraph TD\nA-->B\n```');
    expect(html).toContain('class="mermaid"');
  });
});
```

### 13.2 Integration Tests

```typescript
// Focus areas:
// - Component interactions
// - Store integration with components
// - localStorage persistence
// - BroadcastChannel communication
```

### 13.3 E2E Tests (Playwright)

```typescript
// Focus areas:
// - Full user flows
// - Cross-browser compatibility
// - Desktop app functionality
// - PWA installation and offline mode

test('should create and save a document', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="editor"]', '# My Document');
  await expect(page.locator('[data-testid="tab-name"]')).toHaveText('My Document');
  await page.click('[data-testid="download-btn"]');
  // Verify download
});
```

---

## 14. CI/CD Pipeline

### 14.1 GitHub Actions - CI

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
```

### 14.2 GitHub Actions - Release

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1

  release-desktop:
    strategy:
      matrix:
        platform: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - uses: tauri-apps/tauri-action@v0
        with:
          tagName: v__VERSION__
          releaseName: 'MarkView v__VERSION__'
          releaseBody: 'See CHANGELOG.md for details'
          releaseDraft: true
```

---

## 15. Environment Variables

```env
# .env.example

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback

# Image Upload (Cloudinary)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Analytics (optional)
VITE_ANALYTICS_ID=your_analytics_id
```

---

## 16. Dependencies Summary

### Production Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "@codemirror/lang-markdown": "^6.2.0",
    "@codemirror/state": "^6.2.0",
    "@codemirror/view": "^6.22.0",
    "unified": "^11.0.0",
    "remark-parse": "^11.0.0",
    "remark-gfm": "^4.0.0",
    "remark-rehype": "^11.0.0",
    "rehype-stringify": "^10.0.0",
    "rehype-sanitize": "^6.0.0",
    "shiki": "^1.0.0",
    "mermaid": "^10.6.0",
    "katex": "^0.16.0",
    "markdownlint": "^0.32.0",
    "prettier": "^3.1.0",
    "@octokit/rest": "^20.0.0",
    "i18next": "^23.7.0",
    "react-i18next": "^13.5.0",
    "html2pdf.js": "^0.10.0",
    "html2canvas": "^1.4.0",
    "@tauri-apps/api": "^2.0.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite-plugin-pwa": "^0.17.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@biomejs/biome": "^1.4.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "@tauri-apps/cli": "^2.0.0",
    "husky": "^8.0.0",
    "commitlint": "^18.4.0"
  }
}
```

---

*Technical Specification for MarkView*
*Version 1.0 - December 2024*
