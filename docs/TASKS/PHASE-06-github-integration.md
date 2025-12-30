# Phase 06: GitHub Integration

## Overview

This phase implements full GitHub integration including repository browsing, file viewing, editing, and committing changes. Users can manage Markdown files (.md, .mdx) directly in their GitHub repositories.

**Prerequisites**: Phase 05B (Backend & Auth) completed
**Estimated Tasks**: 38
**Dependencies**: GitHub REST API (via backend proxy)

---

## Features

- Browse user's repositories
- Navigate folder structure
- View/filter .md and .mdx files
- Open files in editor
- Edit and save with commit messages
- Create new .md files in repos
- Delete files from repos
- Configurable file visibility (all files or only .md/.mdx)

---

## Tasks

### 6.1 GitHub Service Setup

#### TASK-GH-001: Create GitHub service structure
- **Description**: Set up GitHub service folder
- **Acceptance Criteria**:
  - [ ] `src/services/github/` folder created
  - [ ] `src/services/github/api.ts` - API client (uses backend proxy)
  - [ ] `src/services/github/repos.ts` - Repository operations
  - [ ] `src/services/github/files.ts` - File operations
  - [ ] `src/services/github/commits.ts` - Commit operations
  - [ ] `src/services/github/index.ts` - Exports
- **Files**: Multiple files in `src/services/github/`

#### TASK-GH-002: Create GitHub API client
- **Description**: Client that calls backend proxy
- **Acceptance Criteria**:
  - [ ] All calls go through `/api/github/proxy`
  - [ ] Automatic error handling
  - [ ] Type-safe request/response
  - [ ] Rate limit awareness
- **Files**: `src/services/github/api.ts`

#### TASK-GH-003: Create GitHub types
- **Description**: TypeScript types for GitHub entities
- **Acceptance Criteria**:
  - [ ] Repository type
  - [ ] File/Tree type
  - [ ] Commit type
  - [ ] User type
  - [ ] API response types
- **Files**: `src/types/github.ts`

---

### 6.2 Repository Browsing

#### TASK-GH-004: Implement fetch user repositories
- **Description**: List user's own repositories
- **Acceptance Criteria**:
  - [ ] Fetch repos where user is owner
  - [ ] Include public and private
  - [ ] Pagination support (100+ repos)
  - [ ] Return: name, description, visibility, defaultBranch, updatedAt
  - [ ] Cache with TTL (5 minutes)
- **Files**: `src/services/github/repos.ts`

#### TASK-GH-005: Implement repository search/filter
- **Description**: Filter repositories in frontend
- **Acceptance Criteria**:
  - [ ] Search by name
  - [ ] Filter: All, Public, Private
  - [ ] Sort: Name, Last updated, Created
  - [ ] Debounced search
- **Files**: `src/services/github/repos.ts` (update)

#### TASK-GH-006: Display repositories in sidebar
- **Description**: GitHub section in file explorer
- **Acceptance Criteria**:
  - [ ] "GitHub" provider section
  - [ ] Repository list with icons (public/private)
  - [ ] Search input
  - [ ] Sort dropdown
  - [ ] Click to expand repo
  - [ ] Show repo description on hover
- **Files**: `src/components/sidebar/GitHubExplorer.tsx`

---

### 6.3 File Tree Navigation

#### TASK-GH-007: Implement fetch repository tree
- **Description**: Get folder/file structure of repo
- **Acceptance Criteria**:
  - [ ] Fetch tree for default branch
  - [ ] Recursive tree (all levels)
  - [ ] Return: path, type (file/dir), sha
  - [ ] Cache tree per repo
- **Files**: `src/services/github/files.ts`

#### TASK-GH-008: Implement file filtering logic
- **Description**: Filter tree based on settings
- **Acceptance Criteria**:
  - [ ] Setting: "Show all files" or "Only Markdown"
  - [ ] If all files: show everything, disable non-.md/.mdx
  - [ ] If only Markdown: hide non-.md/.mdx files
  - [ ] Hide empty folders (no .md/.mdx descendants)
  - [ ] Cache filtered tree
- **Files**: `src/services/github/files.ts` (update)

#### TASK-GH-009: Create file tree component
- **Description**: Tree view for repo contents
- **Acceptance Criteria**:
  - [ ] Expandable folders
  - [ ] File icons (folder, markdown, other)
  - [ ] Disabled styling for non-markdown (when showing all)
  - [ ] Click disabled files shows tooltip "Only .md/.mdx can be edited"
  - [ ] Lazy load deep folders
- **Files**: `src/components/sidebar/GitHubFileTree.tsx`

#### TASK-GH-010: Implement breadcrumb navigation
- **Description**: Path breadcrumbs for current location
- **Acceptance Criteria**:
  - [ ] Show: repo > folder > folder > file
  - [ ] Click any part to navigate
  - [ ] Truncate long paths
  - [ ] Copy path option
- **Files**: `src/components/sidebar/GitHubBreadcrumb.tsx`

---

### 6.4 File Operations - Read

#### TASK-GH-011: Implement fetch file content
- **Description**: Get file content from GitHub
- **Acceptance Criteria**:
  - [ ] Fetch file by path and sha
  - [ ] Decode base64 content
  - [ ] Handle large files (>1MB warning)
  - [ ] Return content + metadata (sha, size)
- **Files**: `src/services/github/files.ts` (update)

#### TASK-GH-012: Implement open file in editor
- **Description**: Load GitHub file into editor
- **Acceptance Criteria**:
  - [ ] Click .md/.mdx file to open
  - [ ] Create document with GitHub source
  - [ ] Store: repo, path, sha, branch
  - [ ] Show loading state
  - [ ] Mark as "GitHub" source in tab
- **Files**: `src/components/sidebar/GitHubFileTree.tsx` (update)

#### TASK-GH-013: Display GitHub file indicator in tab
- **Description**: Visual indicator for GitHub files
- **Acceptance Criteria**:
  - [ ] GitHub icon in tab
  - [ ] Tooltip: "owner/repo/path"
  - [ ] Different background tint
  - [ ] Show branch name
- **Files**: `src/components/tabs/Tab.tsx` (update)

---

### 6.5 File Operations - Write (Commit)

#### TASK-GH-014: Implement file update (commit existing)
- **Description**: Save changes to existing file
- **Acceptance Criteria**:
  - [ ] PUT file content via API
  - [ ] Require commit message
  - [ ] Use file's current sha for update
  - [ ] Handle conflict (sha changed on remote)
  - [ ] Return new sha on success
- **Files**: `src/services/github/commits.ts`

#### TASK-GH-015: Create commit message modal
- **Description**: Modal to enter commit message
- **Acceptance Criteria**:
  - [ ] Textarea for commit message
  - [ ] Placeholder: "Update [filename]"
  - [ ] Character count
  - [ ] Optional extended description
  - [ ] Show: branch, file path
  - [ ] Commit / Cancel buttons
  - [ ] Remember last message pattern (optional)
- **Files**: `src/components/modals/CommitModal.tsx`

#### TASK-GH-016: Implement save flow for GitHub files
- **Description**: Ctrl+S flow for GitHub files
- **Acceptance Criteria**:
  - [ ] Detect file is from GitHub
  - [ ] Open commit modal
  - [ ] On confirm: call commit API
  - [ ] Show progress/spinner
  - [ ] On success: update local sha, mark as saved
  - [ ] On error: show error, keep content
- **Files**: `src/hooks/useGitHubSave.ts`

#### TASK-GH-017: Handle commit conflicts
- **Description**: Handle when file changed on remote
- **Acceptance Criteria**:
  - [ ] Detect 409 conflict response
  - [ ] Show conflict modal
  - [ ] Options:
    - "Overwrite" (force push with new sha)
    - "View remote version"
    - "Cancel"
  - [ ] Fetch latest sha if overwriting
- **Files**: `src/components/modals/GitHubConflictModal.tsx`

---

### 6.6 File Operations - Create

#### TASK-GH-018: Implement create new file
- **Description**: Create new .md file in repo
- **Acceptance Criteria**:
  - [ ] PUT new file via API
  - [ ] Require: filename, path, commit message
  - [ ] Validate: .md or .mdx extension
  - [ ] No sha needed (new file)
  - [ ] Return sha on success
- **Files**: `src/services/github/commits.ts` (update)

#### TASK-GH-019: Create new file modal
- **Description**: Modal to create file in GitHub
- **Acceptance Criteria**:
  - [ ] Filename input (auto-add .md if missing)
  - [ ] Folder picker (tree of repo folders)
  - [ ] Create in current folder option
  - [ ] Commit message input
  - [ ] Validation: no duplicate names
  - [ ] Create / Cancel buttons
- **Files**: `src/components/modals/CreateGitHubFileModal.tsx`

#### TASK-GH-020: Implement "New File" in GitHub section
- **Description**: Create file from explorer
- **Acceptance Criteria**:
  - [ ] "New File" button in repo header
  - [ ] Right-click folder > "New File Here"
  - [ ] Opens create modal with folder pre-selected
  - [ ] After create: open file in editor
- **Files**: `src/components/sidebar/GitHubExplorer.tsx` (update)

---

### 6.7 File Operations - Delete

#### TASK-GH-021: Implement delete file
- **Description**: Delete file from repo
- **Acceptance Criteria**:
  - [ ] DELETE file via API
  - [ ] Require commit message
  - [ ] Require current sha
  - [ ] Return success/failure
- **Files**: `src/services/github/commits.ts` (update)

#### TASK-GH-022: Create delete confirmation modal
- **Description**: Confirm before deleting
- **Acceptance Criteria**:
  - [ ] Warning: "This will delete from GitHub"
  - [ ] Show file path
  - [ ] Commit message input (default: "Delete [filename]")
  - [ ] Delete / Cancel buttons
  - [ ] Cannot undo warning
- **Files**: `src/components/modals/DeleteGitHubFileModal.tsx`

#### TASK-GH-023: Implement delete from context menu
- **Description**: Delete via right-click
- **Acceptance Criteria**:
  - [ ] Right-click file > "Delete from GitHub"
  - [ ] Opens delete modal
  - [ ] If file is open: close tab after delete
  - [ ] Refresh tree after delete
- **Files**: `src/components/sidebar/GitHubFileContextMenu.tsx`

---

### 6.8 File Operations - Rename/Move

#### TASK-GH-024: Implement rename file
- **Description**: Rename file in repo
- **Acceptance Criteria**:
  - [ ] GitHub API: delete old + create new (atomic)
  - [ ] Preserve content
  - [ ] Require commit message
  - [ ] Update local references
- **Files**: `src/services/github/commits.ts` (update)

#### TASK-GH-025: Create rename modal
- **Description**: Modal to rename GitHub file
- **Acceptance Criteria**:
  - [ ] Current name shown
  - [ ] New name input
  - [ ] Validation: valid filename, .md/.mdx
  - [ ] Commit message input
  - [ ] Rename / Cancel buttons
- **Files**: `src/components/modals/RenameGitHubFileModal.tsx`

#### TASK-GH-026: Implement move file (optional)
- **Description**: Move file to different folder
- **Acceptance Criteria**:
  - [ ] Folder picker for destination
  - [ ] Same as rename but changes path
  - [ ] Commit message
  - [ ] Update open tab if file is open
- **Files**: `src/services/github/commits.ts` (update)

---

### 6.9 GitHub Store

#### TASK-GH-027: Create GitHub Zustand store
- **Description**: State management for GitHub
- **Acceptance Criteria**:
  - [ ] Connection status (from auth)
  - [ ] User info (from Better Auth account)
  - [ ] Repositories list
  - [ ] Current repo / current path
  - [ ] File tree per repo (cached)
  - [ ] Loading states
  - [ ] Error states
- **Files**: `src/stores/githubStore.ts`

#### TASK-GH-028: Implement cache management
- **Description**: Cache GitHub data
- **Acceptance Criteria**:
  - [ ] Cache repos list (5 min TTL)
  - [ ] Cache file trees (5 min TTL)
  - [ ] Cache file contents (until sha changes)
  - [ ] Manual refresh button
  - [ ] Clear cache on logout
- **Files**: `src/stores/githubStore.ts` (update)

---

### 6.10 Settings and Configuration

#### TASK-GH-029: Add GitHub settings
- **Description**: GitHub-specific settings
- **Acceptance Criteria**:
  - [ ] File visibility: "All files" / "Only Markdown"
  - [ ] Default commit message template
  - [ ] Show private repos: yes/no
  - [ ] Auto-refresh interval
- **Files**: `src/stores/settingsStore.ts` (update)

#### TASK-GH-030: Create GitHub settings section
- **Description**: Settings UI for GitHub
- **Acceptance Criteria**:
  - [ ] Section in Settings modal
  - [ ] Connection status
  - [ ] Disconnect button
  - [ ] File visibility toggle
  - [ ] Commit message template
- **Files**: `src/components/modals/settings/GitHubSettings.tsx`

---

### 6.11 Error Handling

#### TASK-GH-031: Handle API errors
- **Description**: Graceful error handling
- **Acceptance Criteria**:
  - [ ] 401: Re-auth prompt
  - [ ] 403: Permission denied message
  - [ ] 404: File/repo not found
  - [ ] 409: Conflict handling
  - [ ] 422: Validation errors
  - [ ] 429: Rate limit (show wait time)
  - [ ] Network errors: offline indicator
- **Files**: `src/services/github/errors.ts`

#### TASK-GH-032: Show rate limit status
- **Description**: Display API rate limit
- **Acceptance Criteria**:
  - [ ] Track remaining requests
  - [ ] Show in GitHub section header
  - [ ] Warning when low (<100)
  - [ ] Block requests when exhausted
- **Files**: `src/components/sidebar/GitHubRateLimit.tsx`

---

### 6.12 UI Polish

#### TASK-GH-033: Create GitHub connection UI
- **Description**: Connect/disconnect experience
- **Acceptance Criteria**:
  - [ ] "Connect GitHub" button if not connected
  - [ ] Shows user avatar + name when connected
  - [ ] Quick disconnect option
  - [ ] Sync status indicator
- **Files**: `src/components/sidebar/GitHubConnection.tsx`

#### TASK-GH-034: Implement repository refresh
- **Description**: Manual refresh of repo data
- **Acceptance Criteria**:
  - [ ] Refresh button in GitHub section
  - [ ] Refresh specific repo tree
  - [ ] Loading spinner during refresh
  - [ ] Toast on success/failure
- **Files**: `src/components/sidebar/GitHubExplorer.tsx` (update)

#### TASK-GH-035: Create empty states
- **Description**: UI for empty/loading states
- **Acceptance Criteria**:
  - [ ] "Connect GitHub to see your repos"
  - [ ] "No repositories found"
  - [ ] "No Markdown files in this repo"
  - [ ] Loading skeletons
- **Files**: `src/components/sidebar/GitHubEmptyState.tsx`

#### TASK-GH-036: Implement keyboard shortcuts
- **Description**: Keyboard navigation for GitHub
- **Acceptance Criteria**:
  - [ ] Arrow keys to navigate tree
  - [ ] Enter to open file/expand folder
  - [ ] Escape to close modals
  - [ ] Ctrl+Shift+G to focus GitHub section
- **Files**: `src/components/sidebar/GitHubExplorer.tsx` (update)

---

### 6.13 Backend Endpoints

#### TASK-GH-037: Create GitHub proxy endpoint
- **Description**: Backend proxy for GitHub API
- **Acceptance Criteria**:
  - [ ] `POST /api/github/proxy`
  - [ ] Accepts: endpoint, method, body
  - [ ] Injects user's GitHub token
  - [ ] Returns GitHub response
  - [ ] Rate limit headers forwarded
- **Files**: `api/github/proxy.ts`

#### TASK-GH-038: Create GitHub commit endpoint
- **Description**: Dedicated commit endpoint
- **Acceptance Criteria**:
  - [ ] `POST /api/github/commit`
  - [ ] Validates: repo, path, content, message
  - [ ] Handles create/update/delete
  - [ ] Returns: sha, commit url
  - [ ] Audit logging
- **Files**: `api/github/commit.ts`

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
files.filter(file => isMarkdownFile(file.name) || file.type === 'dir')
// Then filter out empty directories recursively
```

---

## Completion Checklist

- [ ] All 38 tasks completed
- [ ] Can browse user's repositories
- [ ] Can navigate folder structure
- [ ] File filtering works (all/markdown only)
- [ ] Can open .md/.mdx files
- [ ] Can save with commit messages
- [ ] Can create new files
- [ ] Can delete files
- [ ] Can rename files
- [ ] Error handling complete
- [ ] Settings configurable
- [ ] Ready for production

---

## Testing Notes

- Test with repos containing many files
- Test with deeply nested folders
- Test commit conflicts
- Test rate limiting
- Test with private repos
- Test large files (>1MB)
- Test offline scenarios

---

*Phase 06 - GitHub Integration*
*MarkView Development Plan*
