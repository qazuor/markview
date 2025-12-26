# Phase 06: GitHub Integration

## Overview

This phase implements GitHub OAuth authentication, repository browsing, and file access. Users can connect their GitHub account and open Markdown files from their repositories.

**Prerequisites**: Phase 05 completed
**Estimated Tasks**: 22
**Dependencies**: @octokit/rest, GitHub OAuth App

---

## Tasks

### 6.1 OAuth Setup

#### TASK-156: Create GitHub OAuth App
- **Description**: Register OAuth application on GitHub
- **Acceptance Criteria**:
  - [ ] OAuth App created on GitHub Developer Settings
  - [ ] Client ID obtained
  - [ ] Client Secret secured
  - [ ] Callback URL configured for dev and prod
  - [ ] Required scopes documented (repo, read:user)
- **Files**: Documentation, `.env.example` update

#### TASK-157: Install Octokit
- **Description**: Install GitHub API client
- **Acceptance Criteria**:
  - [ ] @octokit/rest installed
  - [ ] @octokit/auth-oauth-app installed (if needed)
  - [ ] Types available
- **Files**: `package.json`

#### TASK-158: Create GitHub service structure
- **Description**: Set up GitHub service folder
- **Acceptance Criteria**:
  - [ ] `src/services/github/` folder
  - [ ] `src/services/github/auth.ts` - Authentication
  - [ ] `src/services/github/api.ts` - API client
  - [ ] `src/services/github/repos.ts` - Repository operations
  - [ ] `src/services/github/files.ts` - File operations
- **Files**: Multiple files in `src/services/github/`

---

### 6.2 Authentication

#### TASK-159: Implement OAuth flow initiation
- **Description**: Start GitHub OAuth flow
- **Acceptance Criteria**:
  - [ ] Generate state parameter
  - [ ] Store state in sessionStorage
  - [ ] Redirect to GitHub authorize URL
  - [ ] Include required scopes
- **Files**: `src/services/github/auth.ts`

#### TASK-160: Create OAuth callback handler
- **Description**: Handle OAuth callback
- **Acceptance Criteria**:
  - [ ] Route for callback URL (/auth/callback)
  - [ ] Verify state parameter
  - [ ] Exchange code for token
  - [ ] Handle errors gracefully
- **Files**: `src/app/routes.tsx`, `src/pages/AuthCallback.tsx`

#### TASK-161: Implement token exchange
- **Description**: Exchange authorization code for access token
- **Acceptance Criteria**:
  - [ ] Server-side exchange (security)
  - [ ] Or use PKCE flow for client-side
  - [ ] Return access token
  - [ ] Handle expiration
- **Files**: `src/services/github/auth.ts` (update)
- **Note**: May need serverless function for token exchange

#### TASK-162: Implement token storage
- **Description**: Securely store access token
- **Acceptance Criteria**:
  - [ ] Store in localStorage (encrypted if possible)
  - [ ] Token refresh handling
  - [ ] Clear on logout
  - [ ] Validate token on app load
- **Files**: `src/services/github/auth.ts` (update)

#### TASK-163: Implement logout
- **Description**: Disconnect GitHub account
- **Acceptance Criteria**:
  - [ ] Clear stored token
  - [ ] Clear user data
  - [ ] Reset GitHub store
  - [ ] Revoke token on GitHub (optional)
- **Files**: `src/services/github/auth.ts` (update)

---

### 6.3 User Profile

#### TASK-164: Fetch authenticated user
- **Description**: Get user profile from GitHub
- **Acceptance Criteria**:
  - [ ] Fetch user on successful auth
  - [ ] Store: username, avatar, email
  - [ ] Handle API errors
- **Files**: `src/services/github/api.ts`

#### TASK-165: Display user in header
- **Description**: Show connected user
- **Acceptance Criteria**:
  - [ ] Avatar image
  - [ ] Username on hover
  - [ ] Dropdown with: profile link, logout
  - [ ] Shows "Connect GitHub" if not connected
- **Files**: `src/components/header/GitHubUser.tsx`

---

### 6.4 Repository Browsing

#### TASK-166: Fetch user repositories
- **Description**: List user's repositories
- **Acceptance Criteria**:
  - [ ] Fetch all accessible repos
  - [ ] Include public and private
  - [ ] Paginate if >100 repos
  - [ ] Cache results
- **Files**: `src/services/github/repos.ts`

#### TASK-167: Display repositories in sidebar
- **Description**: Show repo list in file explorer
- **Acceptance Criteria**:
  - [ ] GitHub section in file explorer
  - [ ] List repositories
  - [ ] Show public/private badge
  - [ ] Search/filter repos
  - [ ] Sort by last updated
- **Files**: `src/components/sidebar/GitHubRepos.tsx`

#### TASK-168: Implement repository navigation
- **Description**: Browse folders in repository
- **Acceptance Criteria**:
  - [ ] Click repo to expand
  - [ ] Show folder structure
  - [ ] Lazy load folders on expand
  - [ ] Breadcrumb navigation
- **Files**: `src/components/sidebar/RepoExplorer.tsx`

#### TASK-169: Filter for Markdown files
- **Description**: Only show .md files
- **Acceptance Criteria**:
  - [ ] Hide non-.md files
  - [ ] Show folders that contain .md files
  - [ ] Option to show all files (future)
- **Files**: `src/services/github/files.ts`

---

### 6.5 File Operations

#### TASK-170: Fetch file content
- **Description**: Get Markdown file from repo
- **Acceptance Criteria**:
  - [ ] Fetch file by path
  - [ ] Decode base64 content
  - [ ] Handle large files
  - [ ] Cache file content
- **Files**: `src/services/github/files.ts` (update)

#### TASK-171: Open file in editor
- **Description**: Load GitHub file into editor
- **Acceptance Criteria**:
  - [ ] Click file to open
  - [ ] Create new document with content
  - [ ] Store GitHub metadata (repo, path, sha)
  - [ ] Mark as GitHub source
- **Files**: `src/components/sidebar/RepoExplorer.tsx` (update)

#### TASK-172: Display GitHub file indicator
- **Description**: Show file is from GitHub
- **Acceptance Criteria**:
  - [ ] GitHub icon in tab
  - [ ] Tooltip with repo/path
  - [ ] Different styling
- **Files**: `src/components/tabs/Tab.tsx` (update)

---

### 6.6 Error Handling

#### TASK-173: Handle authentication errors
- **Description**: Graceful auth error handling
- **Acceptance Criteria**:
  - [ ] Token expired: prompt re-auth
  - [ ] Scope insufficient: show message
  - [ ] Network error: retry option
  - [ ] Rate limit: show wait message
- **Files**: `src/services/github/errors.ts`

#### TASK-174: Handle API errors
- **Description**: Handle GitHub API errors
- **Acceptance Criteria**:
  - [ ] 404: File not found message
  - [ ] 403: Permission denied message
  - [ ] 500: Server error message
  - [ ] Offline: Queue for later (future)
- **Files**: `src/services/github/errors.ts` (update)

---

### 6.7 GitHub Store

#### TASK-175: Implement GitHub Zustand store
- **Description**: State management for GitHub
- **Acceptance Criteria**:
  - [ ] Auth state (token, user)
  - [ ] Repos list
  - [ ] Current repo/path
  - [ ] Loading states
  - [ ] Error states
- **Files**: `src/stores/githubStore.ts`

#### TASK-176: Persist GitHub auth state
- **Description**: Remember GitHub connection
- **Acceptance Criteria**:
  - [ ] Token persists across sessions
  - [ ] User info persists
  - [ ] Validate token on restore
  - [ ] Clear if invalid
- **Files**: `src/stores/githubStore.ts` (update)

#### TASK-177: Implement connection status
- **Description**: Show GitHub connection state
- **Acceptance Criteria**:
  - [ ] Status in sidebar or status bar
  - [ ] Connected/Disconnected indicator
  - [ ] Last sync time
  - [ ] Sync errors shown
- **Files**: `src/components/statusbar/GitHubStatus.tsx`

---

## Completion Checklist

- [ ] All 22 tasks completed
- [ ] OAuth flow works end-to-end
- [ ] User can browse their repos
- [ ] Can open .md files from GitHub
- [ ] Auth persists across sessions
- [ ] Error handling complete
- [ ] Ready for Phase 07

---

## Testing Notes

- Test with GitHub account with many repos
- Test with private repos
- Test token expiration
- Test rate limiting
- Test network disconnection
- Test with repos containing many .md files

---

## Security Notes

- Never log tokens
- Use state parameter for CSRF protection
- Validate all GitHub responses
- Sanitize file paths
- Consider token encryption in localStorage

---

*Phase 06 - GitHub Integration*
*MarkView Development Plan*
