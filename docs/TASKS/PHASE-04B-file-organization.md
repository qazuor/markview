# Phase 04B: File Explorer Organization

## Overview

This phase implements an organized file explorer in the sidebar with categorization by provider/source (Local, GitHub, Google Drive) and virtual folder organization for local documents.

**Prerequisites**: Phase 04 completed, Phase 06 and 06B recommended
**Estimated Tasks**: 32
**Dependencies**: None additional

---

## Tasks

### 4B.1 Provider Categories Structure

#### TASK-FO-001: Design provider category system
- **Description**: Define the category structure for file sources
- **Acceptance Criteria**:
  - [ ] Define provider types: `local`, `github`, `google-drive`
  - [ ] TypeScript types for provider categories
  - [ ] Each provider has: name, icon, color, connection status
  - [ ] Document type extended with `provider` field
- **Files**: `src/types/provider.ts`, `src/types/document.ts` (update)

#### TASK-FO-002: Create provider icons and styling
- **Description**: Visual identity for each provider
- **Acceptance Criteria**:
  - [ ] Local: Folder icon, neutral color
  - [ ] GitHub: GitHub icon, brand color
  - [ ] Google Drive: Drive icon, brand colors
  - [ ] Consistent size and styling
- **Files**: `src/components/sidebar/icons/`

#### TASK-FO-003: Implement collapsible provider sections
- **Description**: Expandable sections per provider
- **Acceptance Criteria**:
  - [ ] Each provider is a collapsible section
  - [ ] Section header with icon, name, file count
  - [ ] Expand/collapse animation
  - [ ] Remember collapsed state
  - [ ] Collapse all / Expand all options
- **Files**: `src/components/sidebar/ProviderSection.tsx`

#### TASK-FO-004: Show provider connection status
- **Description**: Indicate if provider is connected
- **Acceptance Criteria**:
  - [ ] Connected: Green dot, "Connected as [user]"
  - [ ] Disconnected: Gray, "Connect" button
  - [ ] Syncing: Animated sync icon
  - [ ] Error: Red, error message
- **Files**: `src/components/sidebar/ProviderStatus.tsx`

---

### 4B.2 Local Files - Virtual Folders

#### TASK-FO-005: Design virtual folder system
- **Description**: Define folder structure for local files
- **Acceptance Criteria**:
  - [ ] Folders exist only in app (not filesystem)
  - [ ] Folder has: id, name, parentId (for nesting), color (optional)
  - [ ] Documents have: folderId (null = root)
  - [ ] TypeScript types defined
- **Files**: `src/types/folder.ts`

#### TASK-FO-006: Implement folder store
- **Description**: Zustand store for folder management
- **Acceptance Criteria**:
  - [ ] `foldersStore.ts` with CRUD operations
  - [ ] createFolder, renameFolder, deleteFolder, moveFolder
  - [ ] getFolderChildren, getFolderPath
  - [ ] Persist with localStorage
- **Files**: `src/stores/foldersStore.ts`

#### TASK-FO-007: Create folder tree component
- **Description**: Hierarchical folder display
- **Acceptance Criteria**:
  - [ ] Tree view with expand/collapse
  - [ ] Folder icons (open/closed states)
  - [ ] Indent for nesting levels
  - [ ] Show file count per folder
  - [ ] Drag indicator for drop targets
- **Files**: `src/components/sidebar/FolderTree.tsx`

#### TASK-FO-008: Implement folder creation
- **Description**: Create new folders
- **Acceptance Criteria**:
  - [ ] "New Folder" button in Local section header
  - [ ] Inline rename input on creation
  - [ ] Create inside current folder or root
  - [ ] Validation: no empty names, no duplicates in same parent
- **Files**: `src/components/sidebar/NewFolderButton.tsx`

#### TASK-FO-009: Implement folder rename
- **Description**: Rename existing folders
- **Acceptance Criteria**:
  - [ ] Right-click > Rename option
  - [ ] Inline editing mode
  - [ ] Enter to confirm, Escape to cancel
  - [ ] Validation: no empty, no duplicates
- **Files**: `src/components/sidebar/FolderTree.tsx` (update)

#### TASK-FO-010: Implement folder delete
- **Description**: Delete folders
- **Acceptance Criteria**:
  - [ ] Right-click > Delete option
  - [ ] Confirm if folder has contents
  - [ ] Option: Delete folder only (move contents to parent) or Delete all
  - [ ] Cannot delete if contains unsaved files
- **Files**: `src/components/sidebar/FolderContextMenu.tsx`

#### TASK-FO-011: Implement folder move
- **Description**: Reorganize folder hierarchy
- **Acceptance Criteria**:
  - [ ] Drag folder to new parent
  - [ ] Cannot drop folder into itself or descendants
  - [ ] Visual feedback during drag
  - [ ] Update all children paths
- **Files**: `src/components/sidebar/FolderTree.tsx` (update)

---

### 4B.3 File Organization in Folders

#### TASK-FO-012: Display files within folders
- **Description**: Show files under their folders
- **Acceptance Criteria**:
  - [ ] Files appear under their folder
  - [ ] Root files shown at Local section root
  - [ ] Consistent file item styling
  - [ ] Modified indicator on files
- **Files**: `src/components/sidebar/LocalFilesExplorer.tsx`

#### TASK-FO-013: Implement file move to folder
- **Description**: Move files between folders
- **Acceptance Criteria**:
  - [ ] Drag file to folder
  - [ ] Right-click > Move to... option
  - [ ] Folder picker dialog
  - [ ] Move to root option
- **Files**: `src/components/sidebar/LocalFilesExplorer.tsx` (update)

#### TASK-FO-014: Implement move to folder dialog
- **Description**: Modal for selecting target folder
- **Acceptance Criteria**:
  - [ ] Folder tree picker
  - [ ] Create new folder option within dialog
  - [ ] Current location shown
  - [ ] Confirm/Cancel buttons
- **Files**: `src/components/modals/MoveToFolderModal.tsx`

#### TASK-FO-015: Update document store for folders
- **Description**: Integrate folders with documents
- **Acceptance Criteria**:
  - [ ] Add `folderId` to Document type
  - [ ] Update createDocument to accept folderId
  - [ ] Migrate existing documents to root (folderId: null)
  - [ ] Update persistence
- **Files**: `src/stores/documentStore.ts` (update), `src/types/document.ts` (update)

---

### 4B.4 Unified File Explorer

#### TASK-FO-016: Refactor FileExplorer component
- **Description**: Unified explorer with all providers
- **Acceptance Criteria**:
  - [ ] Container for all provider sections
  - [ ] Consistent styling across providers
  - [ ] Global search across all providers
  - [ ] Configurable section order
- **Files**: `src/components/sidebar/FileExplorer.tsx` (refactor)

#### TASK-FO-017: Implement provider section order
- **Description**: Customizable section ordering
- **Acceptance Criteria**:
  - [ ] Drag to reorder sections
  - [ ] Persist order preference
  - [ ] Default order: Local, GitHub, Google Drive
  - [ ] Settings option to configure
- **Files**: `src/components/sidebar/FileExplorer.tsx` (update)

#### TASK-FO-018: Implement cross-provider search
- **Description**: Search across all providers
- **Acceptance Criteria**:
  - [ ] Single search input at top
  - [ ] Search in: file names, folder names
  - [ ] Results grouped by provider
  - [ ] Highlight matching text
  - [ ] Filter by provider option
- **Files**: `src/components/sidebar/GlobalFileSearch.tsx`

#### TASK-FO-019: Implement file filtering
- **Description**: Filter files in explorer
- **Acceptance Criteria**:
  - [ ] Filter dropdown: All, Modified, Recent, Favorites
  - [ ] Filter by modified date range
  - [ ] Show filter indicator when active
  - [ ] Clear filter option
- **Files**: `src/components/sidebar/FileFilter.tsx`

---

### 4B.5 Drag and Drop

#### TASK-FO-020: Implement drag and drop system
- **Description**: Unified drag-drop for explorer
- **Acceptance Criteria**:
  - [ ] Drag files within Local provider
  - [ ] Drag files between folders
  - [ ] Visual drag preview
  - [ ] Drop zone highlighting
  - [ ] Cancel drag with Escape
- **Files**: `src/hooks/useExplorerDragDrop.ts`

#### TASK-FO-021: Implement multi-select
- **Description**: Select multiple files/folders
- **Acceptance Criteria**:
  - [ ] Ctrl+Click to add to selection
  - [ ] Shift+Click for range select
  - [ ] Selection highlight styling
  - [ ] Drag multiple items
  - [ ] Bulk operations on selection
- **Files**: `src/components/sidebar/FileExplorer.tsx` (update)

#### TASK-FO-022: Implement bulk operations
- **Description**: Actions on multiple items
- **Acceptance Criteria**:
  - [ ] Delete multiple files
  - [ ] Move multiple to folder
  - [ ] Context menu for selection
  - [ ] Confirmation for destructive actions
- **Files**: `src/components/sidebar/BulkActionsMenu.tsx`

---

### 4B.6 Favorites and Quick Access

#### TASK-FO-023: Implement favorites system
- **Description**: Mark files as favorites
- **Acceptance Criteria**:
  - [ ] Star icon to toggle favorite
  - [ ] Favorites section at top of explorer (optional)
  - [ ] Works across all providers
  - [ ] Persist favorites
- **Files**: `src/stores/favoritesStore.ts`, `src/components/sidebar/FavoritesStar.tsx`

#### TASK-FO-024: Implement recent files
- **Description**: Quick access to recent files
- **Acceptance Criteria**:
  - [ ] "Recent" section showing last 10 opened
  - [ ] Across all providers
  - [ ] Click to open directly
  - [ ] Clear recent option
- **Files**: `src/components/sidebar/RecentFiles.tsx`

#### TASK-FO-025: Implement pinned folders
- **Description**: Pin frequently used folders
- **Acceptance Criteria**:
  - [ ] Pin icon on folders
  - [ ] Pinned folders shown at top
  - [ ] Quick navigation
  - [ ] Persist pins
- **Files**: `src/components/sidebar/PinnedFolders.tsx`

---

### 4B.7 Context Menus

#### TASK-FO-026: Enhance file context menu
- **Description**: Complete file context menu
- **Acceptance Criteria**:
  - [ ] Open
  - [ ] Open in New Tab
  - [ ] Rename
  - [ ] Move to...
  - [ ] Add to Favorites
  - [ ] Copy Path
  - [ ] Delete
  - [ ] Provider-specific actions (e.g., "Open in GitHub")
- **Files**: `src/components/sidebar/FileContextMenu.tsx` (update)

#### TASK-FO-027: Create folder context menu
- **Description**: Context menu for folders
- **Acceptance Criteria**:
  - [ ] New File in Folder
  - [ ] New Subfolder
  - [ ] Rename
  - [ ] Move to...
  - [ ] Pin/Unpin
  - [ ] Set Color
  - [ ] Delete
- **Files**: `src/components/sidebar/FolderContextMenu.tsx` (update)

#### TASK-FO-028: Create provider section context menu
- **Description**: Context menu for provider headers
- **Acceptance Criteria**:
  - [ ] Refresh/Sync
  - [ ] New File
  - [ ] New Folder (for Local)
  - [ ] Collapse All
  - [ ] Connection settings
  - [ ] Disconnect (for remote providers)
- **Files**: `src/components/sidebar/ProviderContextMenu.tsx`

---

### 4B.8 Visual Enhancements

#### TASK-FO-029: Implement folder colors
- **Description**: Custom colors for folders
- **Acceptance Criteria**:
  - [ ] Color picker in folder context menu
  - [ ] Preset color options
  - [ ] Color shown on folder icon
  - [ ] Persist color preference
- **Files**: `src/components/sidebar/FolderColorPicker.tsx`

#### TASK-FO-030: Implement file badges
- **Description**: Status badges on files
- **Acceptance Criteria**:
  - [ ] Modified (unsaved) indicator
  - [ ] Sync status for remote files
  - [ ] Favorite star
  - [ ] Shared indicator
- **Files**: `src/components/sidebar/FileBadges.tsx`

#### TASK-FO-031: Implement empty states
- **Description**: UI for empty sections
- **Acceptance Criteria**:
  - [ ] Empty Local: "Create your first document" + button
  - [ ] Empty GitHub: "Connect GitHub to see your files"
  - [ ] Empty Google Drive: "Connect Google Drive"
  - [ ] Empty folder: "This folder is empty"
  - [ ] No search results: "No files found"
- **Files**: `src/components/sidebar/EmptyState.tsx`

#### TASK-FO-032: Implement loading states
- **Description**: Loading UI for remote providers
- **Acceptance Criteria**:
  - [ ] Skeleton loader while fetching
  - [ ] Spinner on refresh
  - [ ] Progress for large operations
  - [ ] Error state with retry
- **Files**: `src/components/sidebar/ProviderLoadingState.tsx`

---

## Completion Checklist

- [ ] All 32 tasks completed
- [ ] Provider sections display correctly
- [ ] Local folders work (create, rename, delete, move)
- [ ] Files can be organized in folders
- [ ] Drag and drop functional
- [ ] Search works across providers
- [ ] Context menus complete
- [ ] Favorites and recents work
- [ ] Visual polish complete
- [ ] Ready for production use

---

## Testing Notes

- Test with many files (100+)
- Test deep folder nesting (5+ levels)
- Test drag and drop edge cases
- Test with multiple providers connected
- Test search performance
- Test mobile/touch interactions
- Test keyboard navigation

---

## UX Considerations

- Keep interactions familiar (like file managers)
- Provide visual feedback for all actions
- Allow undo for destructive actions
- Lazy load remote provider contents
- Cache provider data for offline access
- Sync status always visible

---

## Data Model

```typescript
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  // ... existing fields
  provider: 'local' | 'github' | 'google-drive';
  folderId?: string | null; // For local files
  providerMetadata?: {
    // Provider-specific data (fileId, repo, path, etc.)
  };
}

type ProviderType = 'local' | 'github' | 'google-drive';

interface ProviderConfig {
  type: ProviderType;
  name: string;
  icon: string;
  isConnected: boolean;
  user?: { name: string; avatar?: string };
}
```

---

*Phase 04B - File Explorer Organization*
*MarkView Development Plan*
