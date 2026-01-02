# Contributing to MarkView

Thank you for your interest in contributing to MarkView! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Commit Convention](#commit-convention)
- [Testing](#testing)
- [Code Style](#code-style)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **pnpm** 8 or higher (recommended package manager)
- **Git**

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/markview.git
cd markview
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/qazuor/markview.git
```

---

## Development Setup

### Install Dependencies

```bash
pnpm install
```

### Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm lint` | Check code with Biome |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm format` | Format code with Biome |
| `pnpm format:check` | Check code formatting |
| `pnpm typecheck` | Run TypeScript type checking |

---

## Project Structure

```
markview/
├── src/
│   ├── app/                  # Application entry point
│   │   ├── App.tsx          # Main App component
│   │   └── Providers.tsx    # Context providers
│   │
│   ├── components/           # React components
│   │   ├── editor/          # CodeMirror editor components
│   │   ├── preview/         # Markdown preview components
│   │   ├── toolbar/         # Formatting toolbar
│   │   ├── tabs/            # Document tabs
│   │   ├── sidebar/         # File explorer, TOC, cloud browsers
│   │   ├── statusbar/       # Status bar
│   │   ├── modals/          # Modal dialogs
│   │   ├── layout/          # Layout components
│   │   ├── sync/            # Cloud sync components
│   │   ├── auth/            # Authentication components
│   │   ├── onboarding/      # Onboarding flow
│   │   ├── pwa/             # PWA components
│   │   └── ui/              # Reusable UI primitives
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useSettingsSync.ts
│   │   ├── usePWA.ts
│   │   └── ...
│   │
│   ├── services/            # Business logic
│   │   ├── markdown/        # Markdown processing
│   │   ├── storage/         # Local storage
│   │   ├── export/          # Export functionality
│   │   ├── github/          # GitHub API integration
│   │   ├── gdrive/          # Google Drive integration
│   │   └── sync/            # Cloud sync service
│   │
│   ├── stores/              # Zustand state stores
│   │   ├── documentStore.ts # Document state
│   │   ├── settingsStore.ts # Settings state
│   │   ├── uiStore.ts       # UI state
│   │   ├── githubStore.ts   # GitHub connection state
│   │   ├── gdriveStore.ts   # Google Drive state
│   │   └── syncStore.ts     # Cloud sync state
│   │
│   ├── server/              # Backend API (Hono)
│   │   ├── api/             # API routes and middleware
│   │   ├── auth/            # Authentication (Better Auth)
│   │   ├── db/              # Database schema (Drizzle)
│   │   └── utils/           # Server utilities
│   │
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── i18n/                # Internationalization
│   └── styles/              # Global styles
│
├── tests/
│   ├── unit/                # Vitest unit tests
│   ├── integration/         # Integration tests
│   ├── e2e/                 # Playwright e2e tests
│   └── helpers/             # Test utilities
│
├── docs/                    # Documentation
└── public/                  # Static assets
```

---

## Development Guidelines

### Code Standards

- **Primary Language**: TypeScript (strict mode enabled)
- **Maximum File Length**: 500 lines
- **Component Size**: Keep components focused and small
- **Naming Conventions**:
  - Components: PascalCase (e.g., `EditorToolbar.tsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useDebounce.ts`)
  - Utilities: camelCase (e.g., `formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### TypeScript Best Practices

- Avoid `any` type. Use `unknown` if type is truly unknown
- Define explicit return types for functions
- Use interfaces for object shapes, types for unions/intersections
- Leverage TypeScript's type inference where appropriate

### React Best Practices

- Use functional components with hooks
- Memoize expensive computations with `useMemo`
- Prevent unnecessary re-renders with `React.memo`
- Keep components pure and side-effect free
- Use custom hooks to extract reusable logic

### State Management (Zustand)

- Keep stores focused on specific domains
- Use selectors to prevent unnecessary re-renders
- Document store structure and actions
- Avoid deeply nested state

Example:

```typescript
interface DocumentStore {
  documents: Map<string, Document>;
  activeDocumentId: string | null;

  // Actions
  createDocument: () => string;
  updateContent: (id: string, content: string) => void;
}
```

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

4. **Run quality checks**:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

5. **Commit your changes** (see [Commit Convention](#commit-convention))

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting the PR

1. Open a Pull Request on GitHub
2. Fill out the PR template completely
3. Link related issues
4. Request review from maintainers

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New code has appropriate test coverage (90%+)
- [ ] Documentation updated (if applicable)
- [ ] No TypeScript errors
- [ ] Commits follow conventional commit format
- [ ] PR description clearly explains changes

### Review Process

- At least one maintainer approval required
- All CI checks must pass
- Address reviewer feedback promptly
- Keep PRs focused and reasonably sized

---

## Issue Guidelines

### Before Creating an Issue

1. Search existing issues to avoid duplicates
2. Check if the issue is already fixed in `main`
3. Gather relevant information (browser, OS, steps to reproduce)

### Bug Reports

Use the bug report template and include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos (if applicable)
- Environment details
- Error messages/stack traces

### Feature Requests

Use the feature request template and include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (optional)
- Alternatives considered

### Good First Issues

Look for issues labeled `good first issue` if you're new to the project.

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

### Examples

```bash
feat(editor): add syntax highlighting for mermaid diagrams

Implement custom CodeMirror extension to highlight mermaid diagram syntax
in code blocks. Improves the editing experience for users creating diagrams.

Closes #123
```

```bash
fix(preview): correct scroll sync calculation

The scroll sync was off by a few pixels when using large font sizes.
Updated the calculation to account for variable line heights.
```

```bash
docs: update contributing guidelines

Add section about commit conventions and PR process.
```

### Scope

Common scopes include:
- `editor` - Editor component
- `preview` - Preview component
- `toolbar` - Formatting toolbar
- `sidebar` - Sidebar components
- `export` - Export functionality
- `i18n` - Internationalization
- `storage` - Storage service
- `sync` - Cloud sync service
- `github` - GitHub integration
- `gdrive` - Google Drive integration
- `server` - Backend API
- `auth` - Authentication
- `stores` - Zustand stores
- `hooks` - Custom hooks
- `components` - General components
- `deps` - Dependencies

---

## Testing

### Test Coverage

Current project coverage: **77%+ statements**, **2900+ tests**

Coverage goals:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Requirements:
- All new features must include tests
- Bug fixes should include regression tests
- PR coverage should not decrease overall coverage

### Unit Tests (Vitest)

Located in `tests/unit/`, following AAA pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '@/services/markdown';

describe('markdownParser', () => {
  it('should parse headings correctly', async () => {
    // Arrange
    const input = '# Hello World';

    // Act
    const result = await renderMarkdown(input);

    // Assert
    expect(result).toContain('<h1>Hello World</h1>');
  });
});
```

### E2E Tests (Playwright)

Located in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test('should create and save a document', async ({ page }) => {
  await page.goto('/');

  // Type content
  await page.fill('[data-testid="editor"]', '# My Document');

  // Verify auto-save
  await expect(page.locator('[data-testid="save-status"]'))
    .toHaveText('Saved');
});
```

### Running Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# E2E with UI
pnpm test:e2e --ui
```

---

## Code Style

### Linting and Formatting

This project uses **Biome** for both linting and formatting.

```bash
# Check code
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Configuration

Biome configuration is in `biome.json`. Key rules:

- 2-space indentation for TS/TSX
- 4-space for JSON
- Single quotes
- Semicolons required
- Max line length: 100 characters

### Import Order

Organize imports in the following order:

```typescript
// 1. External dependencies
import React from 'react';
import { create } from 'zustand';

// 2. Internal modules
import { Editor } from '@/components/editor';
import { useDebounce } from '@/hooks/useDebounce';

// 3. Types
import type { Document } from '@/types';

// 4. Styles
import './styles.css';
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types
interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

// 3. Component
export function Editor({ content, onChange }: EditorProps) {
  // Hooks
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleChange = () => {
    // ...
  };

  // Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

---

## Documentation

### Code Comments

- Use JSDoc for exported functions and complex logic
- Explain "why", not "what"
- Keep comments up-to-date with code changes

Example:

```typescript
/**
 * Renders markdown content to HTML with syntax highlighting and diagrams.
 *
 * Uses unified/remark/rehype pipeline with custom plugins for:
 * - Mermaid diagram rendering
 * - KaTeX math equations
 * - GitHub-style callouts
 *
 * @param content - Raw markdown string
 * @returns Rendered HTML string
 * @throws {Error} If markdown parsing fails
 */
export async function renderMarkdown(content: string): Promise<string> {
  // Implementation
}
```

### README Updates

Update the README when:
- Adding new features
- Changing installation process
- Modifying configuration options

### Changelog

Maintainers will update `CHANGELOG.md` during release process.

---

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord**: [Join our community](https://discord.gg/markview) (if available)

---

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to MarkView!

---

*Last updated: January 2026*
