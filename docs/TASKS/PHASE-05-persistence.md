# Phase 05: Persistence and Storage

## Overview

This phase implements data persistence using localStorage, auto-save functionality, session restoration, and version history.

**Prerequisites**: Phase 04 completed
**Estimated Tasks**: 24
**Dependencies**: None additional

---

## Tasks

### 5.1 LocalStorage Service

#### TASK-132: Create storage service
- **Description**: Abstraction layer for localStorage
- **Acceptance Criteria**:
  - [ ] `src/services/storage/localStorage.ts`
  - [ ] Type-safe get/set methods
  - [ ] JSON serialization/deserialization
  - [ ] Error handling for quota exceeded
  - [ ] Namespace prefix for keys
- **Files**: `src/services/storage/localStorage.ts`

#### TASK-133: Implement storage keys constants
- **Description**: Define all storage keys
- **Acceptance Criteria**:
  - [ ] `src/services/storage/keys.ts`
  - [ ] Keys for: documents, settings, ui, github, versions
  - [ ] TypeScript const assertions
- **Files**: `src/services/storage/keys.ts`

#### TASK-134: Implement storage quota management
- **Description**: Handle storage limits
- **Acceptance Criteria**:
  - [ ] Check available storage
  - [ ] Warning when near limit (>80%)
  - [ ] Cleanup old data if needed
  - [ ] User notification
- **Files**: `src/services/storage/quota.ts`

---

### 5.2 Document Persistence

#### TASK-135: Implement document save
- **Description**: Save document to localStorage
- **Acceptance Criteria**:
  - [ ] Save document content
  - [ ] Save document metadata (name, dates)
  - [ ] Save cursor position
  - [ ] Save scroll position
  - [ ] Atomic save operation
- **Files**: `src/services/storage/documents.ts`

#### TASK-136: Implement document load
- **Description**: Load document from localStorage
- **Acceptance Criteria**:
  - [ ] Load by document ID
  - [ ] Restore content
  - [ ] Restore metadata
  - [ ] Handle missing documents
- **Files**: `src/services/storage/documents.ts` (update)

#### TASK-137: Implement document delete
- **Description**: Remove document from localStorage
- **Acceptance Criteria**:
  - [ ] Delete document by ID
  - [ ] Delete associated versions
  - [ ] Confirmation before delete
  - [ ] Cannot delete last document
- **Files**: `src/services/storage/documents.ts` (update)

#### TASK-138: Implement document list
- **Description**: Get all stored documents
- **Acceptance Criteria**:
  - [ ] Return list of document metadata
  - [ ] Sorted by last modified
  - [ ] Include basic info (name, date, size)
- **Files**: `src/services/storage/documents.ts` (update)

---

### 5.3 Auto-Save

#### TASK-139: Implement auto-save service
- **Description**: Automatic saving on changes
- **Acceptance Criteria**:
  - [ ] `src/services/storage/autoSave.ts`
  - [ ] Debounced save (2 seconds)
  - [ ] Cancel on new changes
  - [ ] Status callbacks (saving, saved)
- **Files**: `src/services/storage/autoSave.ts`

#### TASK-140: Implement auto-save hook
- **Description**: Hook to use auto-save in components
- **Acceptance Criteria**:
  - [ ] useAutoSave hook
  - [ ] Accepts document ID and content
  - [ ] Returns save status
  - [ ] Respects settings (enabled/disabled)
- **Files**: `src/hooks/useAutoSave.ts`

#### TASK-141: Implement save indicator
- **Description**: Visual feedback for save status
- **Acceptance Criteria**:
  - [ ] "Saving..." while saving
  - [ ] "Saved" when complete
  - [ ] Timestamp of last save
  - [ ] Error state if save fails
- **Files**: `src/components/statusbar/SaveStatus.tsx` (update)

#### TASK-142: Implement manual save
- **Description**: Explicit save action
- **Acceptance Criteria**:
  - [ ] Ctrl+S triggers save
  - [ ] Save button in toolbar
  - [ ] Immediate save (no debounce)
  - [ ] Confirmation feedback
- **Files**: `src/components/toolbar/buttons/SaveButton.tsx`

---

### 5.4 Settings Persistence

#### TASK-143: Implement settings storage
- **Description**: Save/load user settings
- **Acceptance Criteria**:
  - [ ] Save all settings to localStorage
  - [ ] Load on app start
  - [ ] Merge with defaults for new settings
  - [ ] Migration for settings schema changes
- **Files**: `src/services/storage/settings.ts`

#### TASK-144: Implement Zustand persist middleware
- **Description**: Configure Zustand persistence
- **Acceptance Criteria**:
  - [ ] Settings store uses persist
  - [ ] Custom storage adapter
  - [ ] Version for migrations
  - [ ] Selective persistence (exclude transient state)
- **Files**: `src/stores/settingsStore.ts` (update)

---

### 5.5 Session Restoration

#### TASK-145: Implement session save
- **Description**: Save app state on close
- **Acceptance Criteria**:
  - [ ] Save open document IDs
  - [ ] Save active document ID
  - [ ] Save sidebar state
  - [ ] Save window dimensions (desktop)
  - [ ] Use beforeunload event
- **Files**: `src/services/storage/session.ts`

#### TASK-146: Implement session restore
- **Description**: Restore state on app open
- **Acceptance Criteria**:
  - [ ] Restore open documents
  - [ ] Restore active document
  - [ ] Restore UI state
  - [ ] Handle missing documents gracefully
  - [ ] Show welcome if no session
- **Files**: `src/services/storage/session.ts` (update)

#### TASK-147: Implement restore cursor and scroll
- **Description**: Restore exact editing position
- **Acceptance Criteria**:
  - [ ] Restore cursor line:column
  - [ ] Restore scroll position
  - [ ] Works with CodeMirror
  - [ ] Smooth experience
- **Files**: `src/components/editor/hooks/useEditorRestore.ts`

---

### 5.6 Version History

#### TASK-148: Implement version save
- **Description**: Save document version
- **Acceptance Criteria**:
  - [ ] Manual save version button
  - [ ] Save content snapshot
  - [ ] Save timestamp
  - [ ] Optional label/description
  - [ ] Max 10 versions per document
- **Files**: `src/services/storage/versions.ts`

#### TASK-149: Implement version list
- **Description**: Get versions for document
- **Acceptance Criteria**:
  - [ ] Return list of versions
  - [ ] Sorted by date (newest first)
  - [ ] Include metadata (date, size, label)
- **Files**: `src/services/storage/versions.ts` (update)

#### TASK-150: Implement version restore
- **Description**: Restore document to version
- **Acceptance Criteria**:
  - [ ] Replace current content with version
  - [ ] Mark document as modified
  - [ ] Confirmation before restore
  - [ ] Option to save current first
- **Files**: `src/services/storage/versions.ts` (update)

#### TASK-151: Implement version diff view
- **Description**: Compare versions visually
- **Acceptance Criteria**:
  - [ ] Side-by-side diff view
  - [ ] Highlight additions/deletions
  - [ ] Line-by-line comparison
  - [ ] Navigate changes
- **Files**: `src/components/modals/VersionDiffModal.tsx`

#### TASK-152: Create Version History modal
- **Description**: UI for version management
- **Acceptance Criteria**:
  - [ ] List all versions
  - [ ] Preview version content
  - [ ] Restore button
  - [ ] Delete version option
  - [ ] Compare button
- **Files**: `src/components/modals/VersionHistoryModal.tsx`

---

### 5.7 File Name Management

#### TASK-153: Implement auto-naming from H1
- **Description**: Generate name from first heading
- **Acceptance Criteria**:
  - [ ] Extract first H1 from content
  - [ ] Use as document name
  - [ ] Update on content change
  - [ ] Only if name is "Untitled" or auto-generated
- **Files**: `src/utils/filename.ts`

#### TASK-154: Implement name editing
- **Description**: Allow manual name editing
- **Acceptance Criteria**:
  - [ ] Click tab name to edit
  - [ ] Input field appears
  - [ ] Enter to save, Escape to cancel
  - [ ] Mark as manually named (no auto-update)
- **Files**: `src/components/tabs/EditableTabName.tsx`

#### TASK-155: Implement name validation
- **Description**: Validate document names
- **Acceptance Criteria**:
  - [ ] No empty names
  - [ ] No invalid characters
  - [ ] Truncate if too long
  - [ ] Unique names (or allow duplicates?)
- **Files**: `src/utils/filename.ts` (update)

---

## Completion Checklist

- [ ] All 24 tasks completed
- [ ] Documents persist across sessions
- [ ] Auto-save works reliably
- [ ] Settings persist
- [ ] Session fully restored
- [ ] Version history functional
- [ ] File naming works
- [ ] Ready for Phase 06

---

## Testing Notes

- Test with browser storage cleared
- Test storage quota limits
- Test session restore after crash
- Test version diff with large changes
- Test auto-naming edge cases

---

*Phase 05 - Persistence and Storage*
*MarkView Development Plan*
