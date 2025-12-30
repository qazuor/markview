# Phase 06C: Cloud Sync for Local Documents

## Overview

This phase implements cloud synchronization for local documents, allowing users to access their documents from any device. Uses hybrid sync (automatic with debounce + manual sync option).

**Prerequisites**: Phase 05B (Backend & Auth) completed
**Estimated Tasks**: 26
**Dependencies**: Vercel Postgres, Backend API

---

## Sync Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      SYNC STRATEGY                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LOCAL CHANGE ──→ Debounce (3s) ──→ Auto-sync to cloud      │
│                                                              │
│  MANUAL SYNC ──→ Immediate sync ──→ Full bidirectional      │
│                                                              │
│  APP OPEN ──→ Fetch cloud state ──→ Merge with local        │
│                                                              │
│  CONFLICT ──→ Show resolution UI ──→ User decides           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tasks

### 6C.1 Database Schema for Documents

#### TASK-CS-001: Create documents table
- **Description**: Database schema for synced documents
- **Acceptance Criteria**:
  - [ ] documents table with all fields
  - [ ] Proper indexes for userId queries
  - [ ] updatedAt for conflict detection
  - [ ] syncVersion for optimistic locking
- **Files**: `src/server/db/schema.ts` (update)

```typescript
documents: {
  id: text PK
  userId: text FK -> users.id
  name: text
  content: text
  folderId: text FK -> folders.id (nullable)
  cursor: json { line, column }
  scroll: json { line, percentage }
  syncVersion: integer (for optimistic locking)
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (soft delete)
}
```

#### TASK-CS-002: Create folders table
- **Description**: Database schema for virtual folders
- **Acceptance Criteria**:
  - [ ] folders table with hierarchy support
  - [ ] Self-referencing parentId
  - [ ] Color field for customization
  - [ ] Proper indexes
- **Files**: `src/server/db/schema.ts` (update)

```typescript
folders: {
  id: text PK
  userId: text FK -> users.id
  name: text
  parentId: text FK -> folders.id (nullable)
  color: text
  sortOrder: integer
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (soft delete)
}
```

#### TASK-CS-003: Create sync_status table
- **Description**: Track sync state per user
- **Acceptance Criteria**:
  - [ ] Last successful sync timestamp
  - [ ] Pending changes count
  - [ ] Sync errors log
- **Files**: `src/server/db/schema.ts` (update)

---

### 6C.2 Sync API Endpoints

#### TASK-CS-004: Create document list endpoint
- **Description**: Fetch all user documents
- **Acceptance Criteria**:
  - [ ] `GET /api/sync/documents`
  - [ ] Returns documents with metadata
  - [ ] Supports `since` param for delta sync
  - [ ] Includes soft-deleted for sync
  - [ ] Pagination for large collections
- **Files**: `api/sync/documents.ts`

#### TASK-CS-005: Create document upsert endpoint
- **Description**: Create or update document
- **Acceptance Criteria**:
  - [ ] `PUT /api/sync/documents/:id`
  - [ ] Optimistic locking with syncVersion
  - [ ] Returns conflict if version mismatch
  - [ ] Updates syncVersion on success
  - [ ] Validates with Zod
- **Files**: `api/sync/documents/[id].ts`

#### TASK-CS-006: Create document delete endpoint
- **Description**: Soft delete document
- **Acceptance Criteria**:
  - [ ] `DELETE /api/sync/documents/:id`
  - [ ] Soft delete (set deletedAt)
  - [ ] Can be restored (undelete)
  - [ ] Permanently delete after 30 days
- **Files**: `api/sync/documents/[id].ts` (update)

#### TASK-CS-007: Create folders endpoints
- **Description**: CRUD for folders
- **Acceptance Criteria**:
  - [ ] `GET /api/sync/folders` - List all
  - [ ] `PUT /api/sync/folders/:id` - Create/update
  - [ ] `DELETE /api/sync/folders/:id` - Soft delete
  - [ ] Validation for hierarchy
- **Files**: `api/sync/folders/[id].ts`

#### TASK-CS-008: Create batch sync endpoint
- **Description**: Sync multiple changes at once
- **Acceptance Criteria**:
  - [ ] `POST /api/sync/batch`
  - [ ] Accepts array of operations
  - [ ] Transactional (all or nothing)
  - [ ] Returns results per operation
  - [ ] Efficient for initial sync
- **Files**: `api/sync/batch.ts`

#### TASK-CS-009: Create sync status endpoint
- **Description**: Get current sync state
- **Acceptance Criteria**:
  - [ ] `GET /api/sync/status`
  - [ ] Returns last sync time
  - [ ] Returns pending changes count (server-side)
  - [ ] Returns storage usage
- **Files**: `api/sync/status.ts`

---

### 6C.3 Sync Service (Frontend)

#### TASK-CS-010: Create sync service
- **Description**: Frontend service for sync operations
- **Acceptance Criteria**:
  - [ ] `src/services/sync/` folder
  - [ ] `sync.ts` - Main sync logic
  - [ ] `queue.ts` - Offline queue
  - [ ] `conflict.ts` - Conflict resolution
  - [ ] `index.ts` - Exports
- **Files**: `src/services/sync/`

#### TASK-CS-011: Implement auto-sync on change
- **Description**: Automatic sync after edits
- **Acceptance Criteria**:
  - [ ] Debounce: 3 seconds after last change
  - [ ] Only sync if authenticated
  - [ ] Cancel pending sync on new change
  - [ ] Batch nearby changes
  - [ ] Status indicator during sync
- **Files**: `src/services/sync/sync.ts`

#### TASK-CS-012: Implement manual sync
- **Description**: User-triggered full sync
- **Acceptance Criteria**:
  - [ ] "Sync Now" button
  - [ ] Full bidirectional sync
  - [ ] Pull remote changes first
  - [ ] Push local changes
  - [ ] Progress indicator
- **Files**: `src/services/sync/sync.ts` (update)

#### TASK-CS-013: Implement initial sync on login
- **Description**: Sync when user logs in
- **Acceptance Criteria**:
  - [ ] Fetch all cloud documents
  - [ ] Merge with any local guest documents
  - [ ] Resolve conflicts if needed
  - [ ] Update local store
  - [ ] Show progress for large syncs
- **Files**: `src/services/sync/sync.ts` (update)

#### TASK-CS-014: Implement offline queue
- **Description**: Queue changes when offline
- **Acceptance Criteria**:
  - [ ] Detect offline state
  - [ ] Queue all changes in IndexedDB
  - [ ] Process queue when back online
  - [ ] Retry failed operations
  - [ ] Show queued changes count
- **Files**: `src/services/sync/queue.ts`

---

### 6C.4 Conflict Resolution

#### TASK-CS-015: Implement conflict detection
- **Description**: Detect sync conflicts
- **Acceptance Criteria**:
  - [ ] Compare syncVersion
  - [ ] Detect: local newer, remote newer, both changed
  - [ ] Track last known server state
  - [ ] Flag conflicted documents
- **Files**: `src/services/sync/conflict.ts`

#### TASK-CS-016: Create conflict resolution modal
- **Description**: UI for resolving conflicts
- **Acceptance Criteria**:
  - [ ] Show both versions side by side
  - [ ] Highlight differences
  - [ ] Options:
    - "Keep local version"
    - "Use cloud version"
    - "Keep both (create copy)"
  - [ ] Apply to all similar conflicts option
- **Files**: `src/components/modals/SyncConflictModal.tsx`

#### TASK-CS-017: Implement merge strategies
- **Description**: Auto-merge when possible
- **Acceptance Criteria**:
  - [ ] Auto-merge if only metadata changed
  - [ ] Auto-merge if changes don't overlap
  - [ ] Manual merge for content conflicts
  - [ ] Log merge decisions
- **Files**: `src/services/sync/conflict.ts` (update)

---

### 6C.5 Sync Store

#### TASK-CS-018: Create sync Zustand store
- **Description**: State management for sync
- **Acceptance Criteria**:
  - [ ] syncStatus: 'idle' | 'syncing' | 'error' | 'offline'
  - [ ] lastSyncedAt: timestamp
  - [ ] pendingChanges: count
  - [ ] conflicts: array
  - [ ] syncProgress: percentage
- **Files**: `src/stores/syncStore.ts`

#### TASK-CS-019: Update document store for sync
- **Description**: Integrate sync with documents
- **Acceptance Criteria**:
  - [ ] Add syncVersion to documents
  - [ ] Add lastSyncedAt per document
  - [ ] Add syncStatus per document
  - [ ] Track dirty (unsynced) documents
- **Files**: `src/stores/documentStore.ts` (update)

#### TASK-CS-020: Update folders store for sync
- **Description**: Integrate sync with folders
- **Acceptance Criteria**:
  - [ ] Add sync fields to folders
  - [ ] Track folder changes
  - [ ] Handle folder hierarchy sync
- **Files**: `src/stores/foldersStore.ts` (update)

---

### 6C.6 Sync UI

#### TASK-CS-021: Create sync status indicator
- **Description**: Show sync status in UI
- **Acceptance Criteria**:
  - [ ] Icon in header/status bar
  - [ ] States: synced (✓), syncing (↻), pending (•), error (!)
  - [ ] Tooltip with details
  - [ ] Click to open sync panel
- **Files**: `src/components/statusbar/SyncStatus.tsx`

#### TASK-CS-022: Create sync panel
- **Description**: Detailed sync information
- **Acceptance Criteria**:
  - [ ] Last sync time
  - [ ] Pending changes list
  - [ ] Sync errors
  - [ ] "Sync Now" button
  - [ ] Storage usage
  - [ ] Conflict alerts
- **Files**: `src/components/modals/SyncPanel.tsx`

#### TASK-CS-023: Implement sync notifications
- **Description**: Notify user of sync events
- **Acceptance Criteria**:
  - [ ] Toast on sync complete
  - [ ] Alert on sync error
  - [ ] Alert on conflicts
  - [ ] Non-intrusive for auto-sync
- **Files**: `src/hooks/useSyncNotifications.ts`

---

### 6C.7 Guest to User Migration

#### TASK-CS-024: Implement guest document migration
- **Description**: Migrate guest docs on signup
- **Acceptance Criteria**:
  - [ ] Detect guest documents on login
  - [ ] Prompt: "Upload local documents?"
  - [ ] Upload selected documents
  - [ ] Clear local storage after
  - [ ] Handle duplicates
- **Files**: `src/services/sync/migration.ts`

#### TASK-CS-025: Create migration wizard
- **Description**: UI for migrating documents
- **Acceptance Criteria**:
  - [ ] Show list of local documents
  - [ ] Checkboxes to select
  - [ ] Select all / none
  - [ ] Progress during upload
  - [ ] Success/failure report
- **Files**: `src/components/modals/MigrationWizard.tsx`

---

### 6C.8 Settings and Preferences

#### TASK-CS-026: Add sync settings
- **Description**: Sync configuration options
- **Acceptance Criteria**:
  - [ ] Auto-sync on/off
  - [ ] Sync frequency (debounce time)
  - [ ] Sync on app open: yes/no
  - [ ] Conflict resolution default
  - [ ] Clear cloud data option
- **Files**: `src/stores/settingsStore.ts` (update)

---

## Sync Flow Diagrams

### Auto-Sync Flow
```
User edits document
        ↓
Debounce timer starts (3s)
        ↓
Timer completes (no new edits)
        ↓
Check: Is user authenticated?
    NO → Skip (guest mode)
    YES ↓
Check: Is online?
    NO → Add to offline queue
    YES ↓
Send to /api/sync/documents/:id
        ↓
Check response
    SUCCESS → Update syncVersion, show ✓
    CONFLICT → Show conflict modal
    ERROR → Retry with backoff, show !
```

### Full Sync Flow
```
User clicks "Sync Now" or App Opens
        ↓
Fetch GET /api/sync/documents?since=lastSync
        ↓
Compare remote vs local
        ↓
For each document:
    - Remote only → Add to local
    - Local only → Push to remote
    - Both exist:
        - Same version → Skip
        - Remote newer → Update local
        - Local newer → Push to remote
        - Both changed → CONFLICT
        ↓
Process offline queue (if any)
        ↓
Update lastSyncedAt
        ↓
Show sync complete
```

---

## Completion Checklist

- [ ] All 26 tasks completed
- [ ] Documents sync to cloud
- [ ] Folders sync to cloud
- [ ] Auto-sync works with debounce
- [ ] Manual sync works
- [ ] Offline queue works
- [ ] Conflicts detected and resolved
- [ ] Guest migration works
- [ ] Sync status visible
- [ ] Settings configurable
- [ ] Ready for production

---

## Testing Notes

- Test with slow network (throttle)
- Test offline → online transition
- Test concurrent edits (two devices)
- Test large documents
- Test many documents (100+)
- Test folder hierarchy sync
- Test guest → user migration
- Test sync on poor connection

---

## Performance Considerations

- Delta sync (only changes since last sync)
- Batch operations where possible
- Compress large documents
- Background sync (don't block UI)
- IndexedDB for offline queue
- Lazy load document content

---

*Phase 06C - Cloud Sync*
*MarkView Development Plan*
