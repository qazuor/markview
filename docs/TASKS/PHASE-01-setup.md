# Phase 01: Project Setup and Infrastructure

## Overview

This phase establishes the foundation of the MarkView project, including project initialization, tooling configuration, and basic folder structure.

**Prerequisites**: None
**Estimated Tasks**: 25
**Dependencies**: None

---

## Tasks

### 1.1 Project Initialization

#### TASK-001: Initialize pnpm project
- **Description**: Create new project with `pnpm init`
- **Acceptance Criteria**:
  - [ ] `package.json` created with correct project name "markview"
  - [ ] Version set to "0.1.0"
  - [ ] Author and license (MIT) configured
- **Files**: `package.json`

#### TASK-002: Initialize Git repository
- **Description**: Set up Git with initial commit
- **Acceptance Criteria**:
  - [ ] Git repository initialized
  - [ ] `.gitignore` configured for Node.js, Vite, Tauri
  - [ ] Initial commit created
- **Files**: `.gitignore`

#### TASK-003: Create GitHub repository
- **Description**: Create repo on GitHub and push initial commit
- **Acceptance Criteria**:
  - [ ] Repository created at github.com/qazuor/markview
  - [ ] Remote origin configured
  - [ ] Initial push successful
  - [ ] README.md with project description
- **Files**: `README.md`

---

### 1.2 Vite + React + TypeScript Setup

#### TASK-004: Install Vite with React template
- **Description**: Set up Vite with React and TypeScript
- **Acceptance Criteria**:
  - [ ] Vite installed and configured
  - [ ] React 18 installed
  - [ ] TypeScript 5.x installed
  - [ ] `vite.config.ts` created
  - [ ] Development server runs on `pnpm dev`
- **Files**: `vite.config.ts`, `package.json`
- **Commands**: `pnpm create vite@latest . --template react-ts`

#### TASK-005: Configure TypeScript
- **Description**: Set up TypeScript with strict configuration
- **Acceptance Criteria**:
  - [ ] `tsconfig.json` with strict mode enabled
  - [ ] `tsconfig.node.json` for Vite config
  - [ ] Path aliases configured (`@/` for `src/`)
  - [ ] Types for all dependencies included
- **Files**: `tsconfig.json`, `tsconfig.node.json`

#### TASK-006: Create folder structure
- **Description**: Set up the project folder structure as defined in TECH-SPEC
- **Acceptance Criteria**:
  - [ ] `src/app/` - App entry point
  - [ ] `src/components/` - React components
  - [ ] `src/stores/` - Zustand stores
  - [ ] `src/services/` - Business logic
  - [ ] `src/hooks/` - Custom hooks
  - [ ] `src/utils/` - Utilities
  - [ ] `src/types/` - TypeScript types
  - [ ] `src/i18n/` - Internationalization
  - [ ] `src/styles/` - Global styles
  - [ ] Create index files for each folder
- **Files**: Multiple folders and index.ts files

---

### 1.3 Styling Setup (Tailwind CSS)

#### TASK-007: Install Tailwind CSS
- **Description**: Set up Tailwind CSS with PostCSS
- **Acceptance Criteria**:
  - [ ] Tailwind CSS installed
  - [ ] PostCSS configured
  - [ ] Autoprefixer installed
  - [ ] `tailwind.config.ts` created
  - [ ] `postcss.config.js` created
- **Files**: `tailwind.config.ts`, `postcss.config.js`, `package.json`

#### TASK-008: Configure Tailwind
- **Description**: Set up Tailwind configuration with custom theme
- **Acceptance Criteria**:
  - [ ] Content paths configured for React components
  - [ ] Custom color palette defined (primary, secondary, accent)
  - [ ] Dark mode configured with class strategy
  - [ ] Custom font families added (sans, mono)
  - [ ] Custom spacing/sizing if needed
- **Files**: `tailwind.config.ts`

#### TASK-009: Create base styles
- **Description**: Set up global CSS with Tailwind directives
- **Acceptance Criteria**:
  - [ ] `src/styles/globals.css` with Tailwind directives
  - [ ] Base typography styles
  - [ ] CSS custom properties for theming
  - [ ] Import in main entry file
- **Files**: `src/styles/globals.css`, `src/main.tsx`

---

### 1.4 Code Quality Tools

#### TASK-010: Install and configure Biome
- **Description**: Set up Biome for linting and formatting
- **Acceptance Criteria**:
  - [ ] Biome installed
  - [ ] `biome.json` configured with project rules
  - [ ] Lint rules for TypeScript and React
  - [ ] Format rules (indentation, quotes, etc.)
  - [ ] Scripts added: `pnpm lint`, `pnpm format`
- **Files**: `biome.json`, `package.json`

#### TASK-011: Configure Husky for Git hooks
- **Description**: Set up pre-commit hooks with Husky
- **Acceptance Criteria**:
  - [ ] Husky installed
  - [ ] Pre-commit hook runs lint
  - [ ] Pre-push hook runs type check
  - [ ] `.husky/` folder created
- **Files**: `.husky/pre-commit`, `.husky/pre-push`, `package.json`

#### TASK-012: Configure Commitlint
- **Description**: Set up commit message validation
- **Acceptance Criteria**:
  - [ ] Commitlint installed
  - [ ] Conventional commits config
  - [ ] `commitlint.config.js` created
  - [ ] Git hook for commit-msg
- **Files**: `commitlint.config.js`, `.husky/commit-msg`

---

### 1.5 Testing Setup

#### TASK-013: Install and configure Vitest
- **Description**: Set up Vitest for unit testing
- **Acceptance Criteria**:
  - [ ] Vitest installed
  - [ ] `vitest.config.ts` configured
  - [ ] React Testing Library installed
  - [ ] `tests/unit/` folder created
  - [ ] Sample test passing
  - [ ] Scripts: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`
- **Files**: `vitest.config.ts`, `tests/unit/sample.test.ts`, `package.json`

#### TASK-014: Install and configure Playwright
- **Description**: Set up Playwright for E2E testing
- **Acceptance Criteria**:
  - [ ] Playwright installed
  - [ ] `playwright.config.ts` configured
  - [ ] `tests/e2e/` folder created
  - [ ] Sample E2E test passing
  - [ ] Scripts: `pnpm test:e2e`
- **Files**: `playwright.config.ts`, `tests/e2e/sample.spec.ts`, `package.json`

---

### 1.6 State Management Setup

#### TASK-015: Install Zustand
- **Description**: Set up Zustand for state management
- **Acceptance Criteria**:
  - [ ] Zustand installed
  - [ ] Zustand devtools middleware added
  - [ ] Persist middleware added for localStorage
  - [ ] Type definitions for stores
- **Files**: `package.json`, `src/stores/index.ts`

#### TASK-016: Create base store structure
- **Description**: Set up empty stores with TypeScript types
- **Acceptance Criteria**:
  - [ ] `src/stores/documentStore.ts` - Document state
  - [ ] `src/stores/settingsStore.ts` - Settings state
  - [ ] `src/stores/uiStore.ts` - UI state
  - [ ] `src/stores/githubStore.ts` - GitHub state
  - [ ] TypeScript interfaces for each store
- **Files**: `src/stores/*.ts`, `src/types/*.ts`

---

### 1.7 Internationalization Setup

#### TASK-017: Install i18next
- **Description**: Set up i18next for internationalization
- **Acceptance Criteria**:
  - [ ] i18next installed
  - [ ] react-i18next installed
  - [ ] i18next-browser-languagedetector installed
  - [ ] `src/i18n/config.ts` created
- **Files**: `package.json`, `src/i18n/config.ts`

#### TASK-018: Create translation files
- **Description**: Set up initial translation structure
- **Acceptance Criteria**:
  - [ ] `src/i18n/locales/en.json` with basic keys
  - [ ] `src/i18n/locales/es.json` with basic keys
  - [ ] Common UI strings translated (buttons, labels)
  - [ ] i18n provider integrated in app
- **Files**: `src/i18n/locales/*.json`, `src/app/Providers.tsx`

---

### 1.8 Environment Configuration

#### TASK-019: Create environment files
- **Description**: Set up environment variables structure
- **Acceptance Criteria**:
  - [ ] `.env.example` with all required variables
  - [ ] `.env.local` added to .gitignore
  - [ ] Vite env types configured
  - [ ] Documentation for each variable
- **Files**: `.env.example`, `.gitignore`, `src/vite-env.d.ts`

#### TASK-020: Configure environment validation
- **Description**: Add runtime validation for required env vars
- **Acceptance Criteria**:
  - [ ] `src/utils/env.ts` with validation logic
  - [ ] TypeScript types for env variables
  - [ ] Error if required vars missing in production
- **Files**: `src/utils/env.ts`

---

### 1.9 CI/CD Setup

#### TASK-021: Create CI workflow
- **Description**: Set up GitHub Actions for CI
- **Acceptance Criteria**:
  - [ ] `.github/workflows/ci.yml` created
  - [ ] Runs on push and PR to main
  - [ ] Jobs: lint, typecheck, test, build
  - [ ] Caching for pnpm dependencies
- **Files**: `.github/workflows/ci.yml`

#### TASK-022: Create release workflow placeholder
- **Description**: Set up release workflow structure
- **Acceptance Criteria**:
  - [ ] `.github/workflows/release.yml` created
  - [ ] Triggered on version tags
  - [ ] Placeholder for web and desktop builds
- **Files**: `.github/workflows/release.yml`

---

### 1.10 App Shell

#### TASK-023: Create App component
- **Description**: Set up main App component with providers
- **Acceptance Criteria**:
  - [ ] `src/app/App.tsx` as root component
  - [ ] `src/app/Providers.tsx` with all providers
  - [ ] Basic layout structure (header, main, footer)
  - [ ] Theme provider placeholder
- **Files**: `src/app/App.tsx`, `src/app/Providers.tsx`

#### TASK-024: Create entry point
- **Description**: Set up main.tsx entry point
- **Acceptance Criteria**:
  - [ ] `src/main.tsx` renders App with providers
  - [ ] Strict mode enabled
  - [ ] Global styles imported
  - [ ] i18n initialized
- **Files**: `src/main.tsx`

#### TASK-025: Verify development setup
- **Description**: Ensure complete setup works
- **Acceptance Criteria**:
  - [ ] `pnpm dev` starts development server
  - [ ] `pnpm build` creates production build
  - [ ] `pnpm lint` passes
  - [ ] `pnpm test` runs sample tests
  - [ ] App renders "MarkView" in browser
- **Commands**: All scripts verified

---

## Completion Checklist

- [ ] All 25 tasks completed
- [ ] Development server running
- [ ] All linting passes
- [ ] All tests pass
- [ ] Git repository with all changes committed
- [ ] Ready for Phase 02

---

## Notes

- Ensure all dependencies are pinned to specific versions
- Document any deviations from the plan
- Keep commits atomic and well-described

---

*Phase 01 - Project Setup*
*MarkView Development Plan*
