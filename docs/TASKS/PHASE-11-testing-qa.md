# Phase 11: Testing and Quality Assurance

## Overview

This phase implements comprehensive testing including unit tests, integration tests, end-to-end tests, accessibility testing, and performance testing.

**Prerequisites**: Phase 10 completed
**Estimated Tasks**: 28
**Dependencies**: Vitest, Playwright, axe-core

---

## Tasks

### 11.1 Unit Testing Setup

#### TASK-278: Configure Vitest for components
- **Description**: Set up component testing
- **Acceptance Criteria**:
  - [ ] React Testing Library configured
  - [ ] jsdom environment
  - [ ] Custom render with providers
  - [ ] Mock setup for stores
- **Files**: `vitest.config.ts`, `tests/setup.ts`

#### TASK-279: Create test utilities
- **Description**: Helper functions for tests
- **Acceptance Criteria**:
  - [ ] Custom render with all providers
  - [ ] Mock localStorage
  - [ ] Mock CodeMirror
  - [ ] Mock Tauri commands
- **Files**: `tests/utils/`

---

### 11.2 Service Unit Tests

#### TASK-280: Test Markdown parser
- **Description**: Unit tests for parser
- **Acceptance Criteria**:
  - [ ] Test CommonMark parsing
  - [ ] Test GFM extensions
  - [ ] Test frontmatter parsing
  - [ ] Test edge cases
- **Files**: `tests/unit/services/markdown/parser.test.ts`

#### TASK-281: Test Markdown renderer
- **Description**: Unit tests for renderer
- **Acceptance Criteria**:
  - [ ] Test HTML output
  - [ ] Test sanitization
  - [ ] Test all element types
  - [ ] Test plugin integration
- **Files**: `tests/unit/services/markdown/renderer.test.ts`

#### TASK-282: Test storage service
- **Description**: Unit tests for localStorage
- **Acceptance Criteria**:
  - [ ] Test document save/load
  - [ ] Test settings persistence
  - [ ] Test version history
  - [ ] Test quota handling
- **Files**: `tests/unit/services/storage/localStorage.test.ts`

#### TASK-283: Test export services
- **Description**: Unit tests for exports
- **Acceptance Criteria**:
  - [ ] Test Markdown export
  - [ ] Test HTML generation
  - [ ] Test filename handling
- **Files**: `tests/unit/services/export/`

#### TASK-284: Test GitHub service
- **Description**: Unit tests for GitHub API
- **Acceptance Criteria**:
  - [ ] Test auth flow (mocked)
  - [ ] Test repo listing
  - [ ] Test file fetching
  - [ ] Test error handling
- **Files**: `tests/unit/services/github/`

---

### 11.3 Store Unit Tests

#### TASK-285: Test document store
- **Description**: Unit tests for document state
- **Acceptance Criteria**:
  - [ ] Test document CRUD
  - [ ] Test active document
  - [ ] Test modified state
  - [ ] Test version history
- **Files**: `tests/unit/stores/documentStore.test.ts`

#### TASK-286: Test settings store
- **Description**: Unit tests for settings
- **Acceptance Criteria**:
  - [ ] Test all setting changes
  - [ ] Test persistence
  - [ ] Test defaults
  - [ ] Test reset
- **Files**: `tests/unit/stores/settingsStore.test.ts`

#### TASK-287: Test UI store
- **Description**: Unit tests for UI state
- **Acceptance Criteria**:
  - [ ] Test sidebar toggle
  - [ ] Test modal management
  - [ ] Test zen mode
  - [ ] Test search state
- **Files**: `tests/unit/stores/uiStore.test.ts`

---

### 11.4 Component Unit Tests

#### TASK-288: Test Editor component
- **Description**: Unit tests for editor
- **Acceptance Criteria**:
  - [ ] Test rendering
  - [ ] Test content changes
  - [ ] Test keyboard shortcuts
  - [ ] Test theme switching
- **Files**: `tests/unit/components/editor/Editor.test.tsx`

#### TASK-289: Test Preview component
- **Description**: Unit tests for preview
- **Acceptance Criteria**:
  - [ ] Test HTML rendering
  - [ ] Test theme application
  - [ ] Test interactive elements
- **Files**: `tests/unit/components/preview/Preview.test.tsx`

#### TASK-290: Test Toolbar component
- **Description**: Unit tests for toolbar
- **Acceptance Criteria**:
  - [ ] Test button rendering
  - [ ] Test click handlers
  - [ ] Test dropdown menus
- **Files**: `tests/unit/components/toolbar/Toolbar.test.tsx`

#### TASK-291: Test Sidebar component
- **Description**: Unit tests for sidebar
- **Acceptance Criteria**:
  - [ ] Test file explorer
  - [ ] Test TOC generation
  - [ ] Test search panel
  - [ ] Test collapse
- **Files**: `tests/unit/components/sidebar/Sidebar.test.tsx`

#### TASK-292: Test Tab component
- **Description**: Unit tests for tabs
- **Acceptance Criteria**:
  - [ ] Test tab rendering
  - [ ] Test tab switching
  - [ ] Test close behavior
  - [ ] Test modified indicator
- **Files**: `tests/unit/components/tabs/Tab.test.tsx`

---

### 11.5 Integration Tests

#### TASK-293: Test document workflow
- **Description**: Integration test for full workflow
- **Acceptance Criteria**:
  - [ ] Create document
  - [ ] Edit content
  - [ ] Save document
  - [ ] Close and reopen
  - [ ] Verify persistence
- **Files**: `tests/integration/documentWorkflow.test.tsx`

#### TASK-294: Test editor-preview sync
- **Description**: Integration test for sync
- **Acceptance Criteria**:
  - [ ] Type in editor
  - [ ] Verify preview updates
  - [ ] Test scroll sync
  - [ ] Test checkbox toggle
- **Files**: `tests/integration/editorPreviewSync.test.tsx`

#### TASK-295: Test settings persistence
- **Description**: Integration test for settings
- **Acceptance Criteria**:
  - [ ] Change settings
  - [ ] Reload app
  - [ ] Verify settings preserved
- **Files**: `tests/integration/settingsPersistence.test.tsx`

---

### 11.6 E2E Tests (Playwright)

#### TASK-296: Configure Playwright
- **Description**: Set up Playwright for E2E
- **Acceptance Criteria**:
  - [ ] Playwright configured
  - [ ] Multiple browsers configured
  - [ ] Viewport configurations
  - [ ] CI integration
- **Files**: `playwright.config.ts`

#### TASK-297: E2E: Basic editing flow
- **Description**: Full editing workflow test
- **Acceptance Criteria**:
  - [ ] Open app
  - [ ] Type content
  - [ ] Apply formatting
  - [ ] Verify preview
  - [ ] Download file
- **Files**: `tests/e2e/editing.spec.ts`

#### TASK-298: E2E: File management
- **Description**: File operations test
- **Acceptance Criteria**:
  - [ ] Create new file
  - [ ] Rename file
  - [ ] Open multiple files
  - [ ] Switch between tabs
  - [ ] Close file
- **Files**: `tests/e2e/fileManagement.spec.ts`

#### TASK-299: E2E: Settings flow
- **Description**: Settings workflow test
- **Acceptance Criteria**:
  - [ ] Open settings
  - [ ] Change theme
  - [ ] Change font size
  - [ ] Verify changes apply
  - [ ] Verify persistence
- **Files**: `tests/e2e/settings.spec.ts`

#### TASK-300: E2E: Export flow
- **Description**: Export workflow test
- **Acceptance Criteria**:
  - [ ] Create document with content
  - [ ] Export as Markdown
  - [ ] Export as PDF
  - [ ] Export as HTML
  - [ ] Verify downloads
- **Files**: `tests/e2e/export.spec.ts`

#### TASK-301: E2E: Mobile experience
- **Description**: Mobile viewport tests
- **Acceptance Criteria**:
  - [ ] Test on mobile viewport
  - [ ] Test drawer navigation
  - [ ] Test editor/preview tabs
  - [ ] Test touch interactions
- **Files**: `tests/e2e/mobile.spec.ts`

---

### 11.7 Accessibility Testing

#### TASK-302: Install and configure axe-core
- **Description**: Set up accessibility testing
- **Acceptance Criteria**:
  - [ ] @axe-core/playwright installed
  - [ ] axe-core for unit tests
  - [ ] Automated a11y checks
- **Files**: `package.json`, test configs

#### TASK-303: Run accessibility audits
- **Description**: Audit all main views
- **Acceptance Criteria**:
  - [ ] Main editor view passes
  - [ ] Settings modal passes
  - [ ] All modals pass
  - [ ] Mobile view passes
  - [ ] No critical violations
- **Files**: `tests/a11y/`

#### TASK-304: Fix accessibility issues
- **Description**: Address any violations
- **Acceptance Criteria**:
  - [ ] All critical issues fixed
  - [ ] All serious issues fixed
  - [ ] WCAG AA compliance
  - [ ] Keyboard navigation works
- **Files**: Various component fixes

---

### 11.8 Performance Testing

#### TASK-305: Create performance benchmarks
- **Description**: Benchmark critical operations
- **Acceptance Criteria**:
  - [ ] Benchmark Markdown parsing
  - [ ] Benchmark preview rendering
  - [ ] Benchmark with large documents
  - [ ] Establish baselines
- **Files**: `tests/performance/`

---

## Completion Checklist

- [ ] All 28 tasks completed
- [ ] >80% code coverage
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Accessibility compliant
- [ ] Performance benchmarks documented
- [ ] Ready for Phase 12

---

## Coverage Requirements

| Area | Target Coverage |
|------|-----------------|
| Services | >90% |
| Stores | >90% |
| Utils | >95% |
| Components | >80% |
| Hooks | >85% |
| Overall | >80% |

---

## CI Integration

All tests should run in CI:
- Unit tests on every PR
- Integration tests on every PR
- E2E tests on main branch
- Accessibility checks on every PR
- Performance benchmarks weekly

---

*Phase 11 - Testing and QA*
*MarkView Development Plan*
