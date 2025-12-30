# Phase 06B: Google Drive Integration

## Overview

This phase implements Google Drive integration for browsing, viewing, editing, and managing Markdown files (.md, .mdx). All API calls go through the backend proxy for security.

**Prerequisites**: Phase 05B (Backend & Auth) completed
**Estimated Tasks**: 32
**Dependencies**: Google Drive API v3 (via backend proxy)

---

## Features

- Browse user's Google Drive
- Navigate folder structure
- View/filter .md and .mdx files
- Open files in editor
- Edit and save files
- Create new .md files
- Delete and rename files
- Configurable file visibility (all files or only .md/.mdx)

---

## Tasks

### 6B.1 Google Drive Service Setup

#### TASK-GD-001: Create Google Drive service structure
- **Description**: Set up Google Drive service folder
- **Acceptance Criteria**:
  - [ ] `src/services/google-drive/` folder created
  - [ ] `src/services/google-drive/api.ts` - API client (uses backend proxy)
  - [ ] `src/services/google-drive/files.ts` - File operations
  - [ ] `src/services/google-drive/folders.ts` - Folder navigation
  - [ ] `src/services/google-drive/index.ts` - Exports
- **Files**: Multiple files in `src/services/google-drive/`

#### TASK-GD-002: Create Google Drive API client
- **Description**: Client that calls backend proxy
- **Acceptance Criteria**:
  - [ ] All calls go through `/api/google/proxy`
  - [ ] Automatic error handling
  - [ ] Type-safe request/response
  - [ ] Quota awareness
- **Files**: `src/services/google-drive/api.ts`

#### TASK-GD-003: Create Google Drive types
- **Description**: TypeScript types for Drive entities
- **Acceptance Criteria**:
  - [ ] DriveFile type
  - [ ] DriveFolder type
  - [ ] DriveUser type
  - [ ] API response types
- **Files**: `src/types/google-drive.ts`

---

### 6B.2 Folder Navigation

#### TASK-GD-004: Implement fetch root contents
- **Description**: List files/folders in root
- **Acceptance Criteria**:
  - [ ] Fetch items where 'root' in parents
  - [ ] Separate files and folders
  - [ ] Return: id, name, mimeType, modifiedTime
  - [ ] Cache with TTL (5 minutes)
- **Files**: `src/services/google-drive/folders.ts`

#### TASK-GD-005: Implement fetch folder contents
- **Description**: List contents of a folder
- **Acceptance Criteria**:
  - [ ] Fetch items with specific parent
  - [ ] Handle pagination (large folders)
  - [ ] Sort: folders first, then files
  - [ ] Cache per folder
- **Files**: `src/services/google-drive/folders.ts` (update)

#### TASK-GD-006: Implement file filtering logic
- **Description**: Filter based on settings
- **Acceptance Criteria**:
  - [ ] Setting: "Show all files" or "Only Markdown"
  - [ ] If all files: show everything, disable non-.md/.mdx
  - [ ] If only Markdown: hide non-.md/.mdx files
  - [ ] Hide empty folders (no .md/.mdx descendants)
  - [ ] Check descendants recursively
- **Files**: `src/services/google-drive/files.ts`

#### TASK-GD-007: Display Drive in sidebar
- **Description**: Google Drive section in file explorer
- **Acceptance Criteria**:
  - [ ] "Google Drive" provider section
  - [ ] Folder tree with expand/collapse
  - [ ] File icons (folder, markdown, other)
  - [ ] Disabled styling for non-markdown
  - [ ] Search within Drive
- **Files**: `src/components/sidebar/GoogleDriveExplorer.tsx`

#### TASK-GD-008: Implement breadcrumb navigation
- **Description**: Path breadcrumbs for current location
- **Acceptance Criteria**:
  - [ ] Show: My Drive > folder > folder
  - [ ] Click any part to navigate
  - [ ] Truncate long paths
- **Files**: `src/components/sidebar/GoogleDriveBreadcrumb.tsx`

---

### 6B.3 File Operations - Read

#### TASK-GD-009: Implement fetch file content
- **Description**: Get file content from Drive
- **Acceptance Criteria**:
  - [ ] Fetch file using `alt=media`
  - [ ] Handle text encoding (UTF-8)
  - [ ] Track file version (modifiedTime)
  - [ ] Cache content with version
- **Files**: `src/services/google-drive/files.ts` (update)

#### TASK-GD-010: Implement open file in editor
- **Description**: Load Drive file into editor
- **Acceptance Criteria**:
  - [ ] Click .md/.mdx file to open
  - [ ] Create document with Drive source
  - [ ] Store: fileId, name, mimeType, version
  - [ ] Show loading state
  - [ ] Mark as "Google Drive" source in tab
- **Files**: `src/components/sidebar/GoogleDriveExplorer.tsx` (update)

#### TASK-GD-011: Display Drive file indicator in tab
- **Description**: Visual indicator for Drive files
- **Acceptance Criteria**:
  - [ ] Google Drive icon in tab
  - [ ] Tooltip: file path in Drive
  - [ ] Different background tint
- **Files**: `src/components/tabs/Tab.tsx` (update)

---

### 6B.4 File Operations - Write

#### TASK-GD-012: Implement file update (save)
- **Description**: Save changes back to Drive
- **Acceptance Criteria**:
  - [ ] PATCH file content via API
  - [ ] Check for conflicts (version changed)
  - [ ] Return new version on success
  - [ ] Handle quota exceeded
- **Files**: `src/services/google-drive/files.ts` (update)

#### TASK-GD-013: Implement save flow for Drive files
- **Description**: Ctrl+S flow for Drive files
- **Acceptance Criteria**:
  - [ ] Detect file is from Drive
  - [ ] Save immediately (no commit modal needed)
  - [ ] Show progress/spinner
  - [ ] On success: update version, mark as saved
  - [ ] On conflict: show resolution
- **Files**: `src/hooks/useGoogleDriveSave.ts`

#### TASK-GD-014: Handle save conflicts
- **Description**: Handle when file changed on Drive
- **Acceptance Criteria**:
  - [ ] Detect version mismatch
  - [ ] Show conflict modal
  - [ ] Options: Overwrite, View remote, Cancel
  - [ ] Diff view (optional)
- **Files**: `src/components/modals/DriveConflictModal.tsx`

---

### 6B.5 File Operations - Create

#### TASK-GD-015: Implement create new file
- **Description**: Create new .md file in Drive
- **Acceptance Criteria**:
  - [ ] POST multipart to create file
  - [ ] Set mimeType: text/markdown
  - [ ] Set parent folder
  - [ ] Return fileId on success
- **Files**: `src/services/google-drive/files.ts` (update)

#### TASK-GD-016: Create new file modal
- **Description**: Modal to create file in Drive
- **Acceptance Criteria**:
  - [ ] Filename input (auto-add .md if missing)
  - [ ] Folder picker
  - [ ] Create in current folder option
  - [ ] Validation: valid filename
  - [ ] Create / Cancel buttons
- **Files**: `src/components/modals/CreateDriveFileModal.tsx`

#### TASK-GD-017: Implement "New File" in Drive section
- **Description**: Create file from explorer
- **Acceptance Criteria**:
  - [ ] "New File" button in section header
  - [ ] Right-click folder > "New File Here"
  - [ ] Opens create modal with folder pre-selected
  - [ ] After create: open file in editor
- **Files**: `src/components/sidebar/GoogleDriveExplorer.tsx` (update)

---

### 6B.6 File Operations - Delete/Rename

#### TASK-GD-018: Implement delete file
- **Description**: Move file to Drive trash
- **Acceptance Criteria**:
  - [ ] PATCH file with trashed: true
  - [ ] NOT permanent delete
  - [ ] Return success/failure
- **Files**: `src/services/google-drive/files.ts` (update)

#### TASK-GD-019: Create delete confirmation modal
- **Description**: Confirm before deleting
- **Acceptance Criteria**:
  - [ ] Warning: "Move to Google Drive trash"
  - [ ] Show file name
  - [ ] "Can be restored from Drive trash"
  - [ ] Delete / Cancel buttons
- **Files**: `src/components/modals/DeleteDriveFileModal.tsx`

#### TASK-GD-020: Implement rename file
- **Description**: Rename file in Drive
- **Acceptance Criteria**:
  - [ ] PATCH file with new name
  - [ ] Validate: valid filename, .md/.mdx
  - [ ] Update local cache
  - [ ] Update open tab
- **Files**: `src/services/google-drive/files.ts` (update)

#### TASK-GD-021: Implement move file
- **Description**: Move file to different folder
- **Acceptance Criteria**:
  - [ ] PATCH file with new parent
  - [ ] Folder picker for destination
  - [ ] Update cache
- **Files**: `src/services/google-drive/files.ts` (update)

---

### 6B.7 Google Drive Store

#### TASK-GD-022: Create Google Drive Zustand store
- **Description**: State management for Drive
- **Acceptance Criteria**:
  - [ ] Connection status (from auth)
  - [ ] User info (from Better Auth account)
  - [ ] Current folder path
  - [ ] Folder contents cache
  - [ ] Loading states
  - [ ] Error states
- **Files**: `src/stores/googleDriveStore.ts`

#### TASK-GD-023: Implement cache management
- **Description**: Cache Drive data
- **Acceptance Criteria**:
  - [ ] Cache folder contents (5 min TTL)
  - [ ] Cache file contents (until version changes)
  - [ ] Manual refresh button
  - [ ] Clear cache on logout
- **Files**: `src/stores/googleDriveStore.ts` (update)

---

### 6B.8 Settings and Configuration

#### TASK-GD-024: Add Google Drive settings
- **Description**: Drive-specific settings
- **Acceptance Criteria**:
  - [ ] File visibility: "All files" / "Only Markdown"
  - [ ] Show shared files: yes/no
  - [ ] Auto-refresh interval
- **Files**: `src/stores/settingsStore.ts` (update)

#### TASK-GD-025: Create Google Drive settings section
- **Description**: Settings UI for Drive
- **Acceptance Criteria**:
  - [ ] Section in Settings modal
  - [ ] Connection status
  - [ ] Disconnect button
  - [ ] File visibility toggle
  - [ ] Storage quota display
- **Files**: `src/components/modals/settings/GoogleDriveSettings.tsx`

---

### 6B.9 Error Handling and UI

#### TASK-GD-026: Handle API errors
- **Description**: Graceful error handling
- **Acceptance Criteria**:
  - [ ] 401: Re-auth prompt
  - [ ] 403: Permission denied
  - [ ] 404: File not found
  - [ ] 429: Rate limit
  - [ ] Quota exceeded handling
  - [ ] Network errors: offline indicator
- **Files**: `src/services/google-drive/errors.ts`

#### TASK-GD-027: Create connection UI
- **Description**: Connect/disconnect experience
- **Acceptance Criteria**:
  - [ ] "Connect Google Drive" button if not connected
  - [ ] Shows user email when connected
  - [ ] Storage quota display
  - [ ] Quick disconnect option
- **Files**: `src/components/sidebar/GoogleDriveConnection.tsx`

#### TASK-GD-028: Create empty states
- **Description**: UI for empty/loading states
- **Acceptance Criteria**:
  - [ ] "Connect Google Drive to see your files"
  - [ ] "No Markdown files found"
  - [ ] "This folder is empty"
  - [ ] Loading skeletons
- **Files**: `src/components/sidebar/GoogleDriveEmptyState.tsx`

---

### 6B.10 Backend Endpoints

#### TASK-GD-029: Create Google proxy endpoint
- **Description**: Backend proxy for Google API
- **Acceptance Criteria**:
  - [ ] `POST /api/google/proxy`
  - [ ] Accepts: endpoint, method, body
  - [ ] Injects user's Google token
  - [ ] Auto-refresh token if expired
  - [ ] Returns Google response
- **Files**: `api/google/proxy.ts`

#### TASK-GD-030: Create file operations endpoint
- **Description**: Dedicated file ops endpoint
- **Acceptance Criteria**:
  - [ ] `POST /api/google/files`
  - [ ] Operations: create, update, delete, rename, move
  - [ ] Validates inputs
  - [ ] Handles multipart for create
  - [ ] Audit logging
- **Files**: `api/google/files.ts`

#### TASK-GD-031: Create token refresh endpoint
- **Description**: Handle Google token refresh
- **Acceptance Criteria**:
  - [ ] Auto-refresh before expiry
  - [ ] Use refresh token
  - [ ] Update stored access token
  - [ ] Handle refresh failure
- **Files**: `api/google/refresh.ts`

#### TASK-GD-032: Create quota endpoint
- **Description**: Get user's Drive quota
- **Acceptance Criteria**:
  - [ ] `GET /api/google/quota`
  - [ ] Returns: used, limit, percentage
  - [ ] Cache for 1 hour
- **Files**: `api/google/quota.ts`

---

## File Visibility Logic

```typescript
// When "Show all files" is enabled:
files.map(file => ({
  ...file,
  disabled: !isMarkdownFile(file.name), // .md, .mdx
  tooltip: disabled ? "Only Markdown files can be edited" : null
}))

// When "Only Markdown" is enabled:
files.filter(file =>
  isMarkdownFile(file.name) ||
  file.mimeType === 'application/vnd.google-apps.folder'
)
// Then filter out folders with no markdown descendants
```

---

## Completion Checklist

- [ ] All 32 tasks completed
- [ ] Can browse Google Drive
- [ ] Can navigate folders
- [ ] File filtering works (all/markdown only)
- [ ] Can open .md/.mdx files
- [ ] Can save files
- [ ] Can create new files
- [ ] Can delete files (trash)
- [ ] Can rename files
- [ ] Error handling complete
- [ ] Settings configurable
- [ ] Ready for production

---

## Testing Notes

- Test with Drive containing many files
- Test with deeply nested folders
- Test file conflicts
- Test quota limits
- Test shared files
- Test large files
- Test offline scenarios

---

## Google Drive MIME Types

```
text/markdown          - .md files
text/x-markdown        - .md files (alternative)
text/mdx               - .mdx files (may not exist, use filename)
application/vnd.google-apps.folder - folders
```

---

*Phase 06B - Google Drive Integration*
*MarkView Development Plan*
