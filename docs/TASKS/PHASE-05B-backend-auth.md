# Phase 05B: Backend & Authentication

## Overview

This phase implements the backend infrastructure on Vercel with PostgreSQL database and Better Auth for user authentication via OAuth providers (GitHub and Google).

**Prerequisites**: Phase 05 completed
**Estimated Tasks**: 34
**Dependencies**: Vercel, Vercel Postgres, Better Auth, Hono

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Edge/Serverless                   │
├─────────────────────────────────────────────────────────────┤
│  /api/auth/*        → Better Auth handlers                  │
│  /api/github/*      → GitHub OAuth proxy + API              │
│  /api/google/*      → Google OAuth proxy + API              │
│  /api/sync/*        → Document sync endpoints               │
│  /api/user/*        → User preferences                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Postgres                           │
├─────────────────────────────────────────────────────────────┤
│  users              → User accounts                         │
│  sessions           → Auth sessions                         │
│  accounts           → OAuth connections                     │
│  documents          → Synced documents                      │
│  folders            → Virtual folder structure              │
│  user_settings      → User preferences                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Tasks

### 5B.1 Vercel Project Setup

#### TASK-BA-001: Configure Vercel project
- **Description**: Set up Vercel project with required settings
- **Acceptance Criteria**:
  - [ ] Vercel project created and linked
  - [ ] Environment variables configured
  - [ ] Build settings optimized
  - [ ] Preview deployments enabled
- **Files**: `vercel.json`

#### TASK-BA-002: Set up Vercel Postgres
- **Description**: Create and configure PostgreSQL database
- **Acceptance Criteria**:
  - [ ] Vercel Postgres database created
  - [ ] Connection string in environment variables
  - [ ] Connection pooling configured
  - [ ] Development database for local dev
- **Files**: `.env.example`, `.env.local`

#### TASK-BA-003: Install backend dependencies
- **Description**: Install required packages for API
- **Acceptance Criteria**:
  - [ ] `hono` installed (lightweight API framework)
  - [ ] `@vercel/postgres` installed
  - [ ] `drizzle-orm` installed (type-safe ORM)
  - [ ] `drizzle-kit` installed (migrations)
  - [ ] `better-auth` installed
- **Files**: `package.json`

#### TASK-BA-004: Create API folder structure
- **Description**: Set up API routes structure for Vercel
- **Acceptance Criteria**:
  - [ ] `api/` folder for Vercel serverless functions
  - [ ] `src/server/` folder for shared backend code
  - [ ] `src/server/db/` for database schema and client
  - [ ] `src/server/auth/` for auth configuration
- **Files**: Multiple folders

---

### 5B.2 Database Schema

#### TASK-BA-005: Create database schema
- **Description**: Define Drizzle ORM schema
- **Acceptance Criteria**:
  - [ ] Users table (id, name, email, image, createdAt)
  - [ ] Sessions table (Better Auth managed)
  - [ ] Accounts table (OAuth connections)
  - [ ] Documents table (synced docs)
  - [ ] Folders table (virtual folders)
  - [ ] UserSettings table (preferences)
- **Files**: `src/server/db/schema.ts`

```typescript
// Schema preview
users: {
  id: text PK
  name: text
  email: text UNIQUE
  emailVerified: boolean
  image: text
  createdAt: timestamp
  updatedAt: timestamp
}

documents: {
  id: text PK
  userId: text FK -> users.id
  name: text
  content: text
  folderId: text FK -> folders.id (nullable)
  isModified: boolean
  cursor: json
  scroll: json
  createdAt: timestamp
  updatedAt: timestamp
  syncedAt: timestamp
}

folders: {
  id: text PK
  userId: text FK -> users.id
  name: text
  parentId: text FK -> folders.id (nullable)
  color: text
  createdAt: timestamp
  updatedAt: timestamp
}

user_settings: {
  id: text PK
  userId: text FK -> users.id UNIQUE
  settings: json
  updatedAt: timestamp
}
```

#### TASK-BA-006: Create database migrations
- **Description**: Set up migration system
- **Acceptance Criteria**:
  - [ ] Drizzle Kit configured
  - [ ] Initial migration created
  - [ ] Migration scripts in package.json
  - [ ] Migration runs on deploy
- **Files**: `drizzle.config.ts`, `src/server/db/migrations/`

#### TASK-BA-007: Create database client
- **Description**: Database connection and client
- **Acceptance Criteria**:
  - [ ] Drizzle client configured
  - [ ] Connection pooling
  - [ ] Type-safe queries
  - [ ] Error handling
- **Files**: `src/server/db/client.ts`

---

### 5B.3 Better Auth Setup

#### TASK-BA-008: Configure Better Auth
- **Description**: Set up Better Auth with OAuth providers
- **Acceptance Criteria**:
  - [ ] Better Auth initialized
  - [ ] Database adapter configured (Drizzle)
  - [ ] Session configuration
  - [ ] Cookie settings for production
- **Files**: `src/server/auth/config.ts`

#### TASK-BA-009: Configure GitHub OAuth provider
- **Description**: Set up GitHub as auth provider
- **Acceptance Criteria**:
  - [ ] GitHub OAuth App credentials configured
  - [ ] Scopes: `user:email`, `repo` (for later GitHub integration)
  - [ ] Callback URL configured
  - [ ] Profile mapping (name, email, avatar)
- **Files**: `src/server/auth/config.ts` (update)

#### TASK-BA-010: Configure Google OAuth provider
- **Description**: Set up Google as auth provider
- **Acceptance Criteria**:
  - [ ] Google OAuth credentials configured
  - [ ] Scopes: `profile`, `email`, plus Drive scopes for later
  - [ ] Callback URL configured
  - [ ] Profile mapping
- **Files**: `src/server/auth/config.ts` (update)

#### TASK-BA-011: Create auth API routes
- **Description**: Better Auth API handler
- **Acceptance Criteria**:
  - [ ] `/api/auth/[...all]` catch-all route
  - [ ] Handles: sign-in, sign-out, callback, session
  - [ ] CSRF protection
  - [ ] Secure cookies
- **Files**: `api/auth/[...all].ts`

#### TASK-BA-012: Create auth client
- **Description**: Frontend auth client
- **Acceptance Criteria**:
  - [ ] Better Auth client configured
  - [ ] React hooks: `useSession`, `useUser`
  - [ ] Sign in/out methods
  - [ ] Type-safe session data
- **Files**: `src/lib/auth-client.ts`

---

### 5B.4 Frontend Auth Integration

#### TASK-BA-013: Create AuthProvider component
- **Description**: Auth context provider for React
- **Acceptance Criteria**:
  - [ ] Wraps app with auth context
  - [ ] Provides user and session state
  - [ ] Handles loading state
  - [ ] Auto-refresh session
- **Files**: `src/components/auth/AuthProvider.tsx`

#### TASK-BA-014: Create login page/modal
- **Description**: UI for user authentication
- **Acceptance Criteria**:
  - [ ] "Continue with GitHub" button
  - [ ] "Continue with Google" button
  - [ ] Loading states during OAuth
  - [ ] Error handling display
  - [ ] Redirect after login
- **Files**: `src/components/auth/LoginModal.tsx`

#### TASK-BA-015: Create user menu component
- **Description**: User dropdown in header
- **Acceptance Criteria**:
  - [ ] Shows avatar and name when logged in
  - [ ] Dropdown: Account, Settings, Logout
  - [ ] Shows "Sign In" button when logged out
  - [ ] Connected services status
- **Files**: `src/components/header/UserMenu.tsx`

#### TASK-BA-016: Implement guest mode
- **Description**: Allow usage without login
- **Acceptance Criteria**:
  - [ ] App works fully without authentication
  - [ ] Local storage used for documents
  - [ ] "Sign in to sync" prompt (non-intrusive)
  - [ ] Clear indication of guest mode
- **Files**: `src/hooks/useAuthMode.ts`

#### TASK-BA-017: Create protected route wrapper
- **Description**: Wrapper for auth-required features
- **Acceptance Criteria**:
  - [ ] HOC or wrapper component
  - [ ] Redirects to login if needed
  - [ ] Shows loading while checking auth
  - [ ] Passes user to children
- **Files**: `src/components/auth/ProtectedFeature.tsx`

---

### 5B.5 User Settings Sync

#### TASK-BA-018: Create settings sync API
- **Description**: API endpoints for user settings
- **Acceptance Criteria**:
  - [ ] `GET /api/user/settings` - Fetch settings
  - [ ] `PUT /api/user/settings` - Update settings
  - [ ] Merge with defaults for new settings
  - [ ] Validation with Zod
- **Files**: `api/user/settings.ts`

#### TASK-BA-019: Implement settings sync
- **Description**: Sync local settings with server
- **Acceptance Criteria**:
  - [ ] On login: fetch and merge server settings
  - [ ] On settings change: debounced sync to server
  - [ ] Conflict resolution (server wins or merge)
  - [ ] Offline queue for changes
- **Files**: `src/hooks/useSettingsSync.ts`

#### TASK-BA-020: Update settings store for sync
- **Description**: Modify settings store for cloud sync
- **Acceptance Criteria**:
  - [ ] Add sync status to store
  - [ ] Add lastSyncedAt timestamp
  - [ ] Merge function for server/local
  - [ ] Keep working offline
- **Files**: `src/stores/settingsStore.ts` (update)

---

### 5B.6 API Infrastructure

#### TASK-BA-021: Create Hono API app
- **Description**: Set up Hono for API routes
- **Acceptance Criteria**:
  - [ ] Hono app configured
  - [ ] CORS middleware
  - [ ] Error handling middleware
  - [ ] Request logging (dev)
- **Files**: `src/server/api/app.ts`

#### TASK-BA-022: Create auth middleware
- **Description**: Middleware to verify authentication
- **Acceptance Criteria**:
  - [ ] Verify session from Better Auth
  - [ ] Attach user to request context
  - [ ] Return 401 for unauthenticated
  - [ ] Optional auth (for some routes)
- **Files**: `src/server/api/middleware/auth.ts`

#### TASK-BA-023: Create rate limiting
- **Description**: Rate limit API requests
- **Acceptance Criteria**:
  - [ ] Rate limit per user/IP
  - [ ] Different limits per endpoint
  - [ ] Return 429 with retry-after
  - [ ] Use Vercel KV or in-memory for dev
- **Files**: `src/server/api/middleware/rateLimit.ts`

#### TASK-BA-024: Create error handling
- **Description**: Consistent error responses
- **Acceptance Criteria**:
  - [ ] Standard error format
  - [ ] Error codes for frontend
  - [ ] Stack traces only in dev
  - [ ] Sentry/logging integration ready
- **Files**: `src/server/api/middleware/error.ts`

---

### 5B.7 GitHub Token Management

#### TASK-BA-025: Store GitHub tokens
- **Description**: Securely store GitHub access tokens
- **Acceptance Criteria**:
  - [ ] Token stored in accounts table (encrypted)
  - [ ] Refresh token handling
  - [ ] Token expiry tracking
  - [ ] Scope tracking
- **Files**: `src/server/db/schema.ts` (update)

#### TASK-BA-026: Create GitHub token proxy
- **Description**: API to get user's GitHub token
- **Acceptance Criteria**:
  - [ ] `GET /api/github/token` - Returns valid token
  - [ ] Auto-refresh if expired
  - [ ] Never expose to frontend localStorage
  - [ ] Use for all GitHub API calls
- **Files**: `api/github/token.ts`

#### TASK-BA-027: Create GitHub API proxy
- **Description**: Proxy GitHub API calls through backend
- **Acceptance Criteria**:
  - [ ] `POST /api/github/proxy` - Proxy any GitHub API call
  - [ ] Injects user's token
  - [ ] Rate limit tracking
  - [ ] Error normalization
- **Files**: `api/github/proxy.ts`

---

### 5B.8 Google Token Management

#### TASK-BA-028: Store Google tokens
- **Description**: Securely store Google access tokens
- **Acceptance Criteria**:
  - [ ] Token stored in accounts table (encrypted)
  - [ ] Refresh token for offline access
  - [ ] Token expiry tracking
  - [ ] Scope tracking (Drive scopes)
- **Files**: `src/server/db/schema.ts` (update)

#### TASK-BA-029: Create Google token refresh
- **Description**: Handle Google token refresh
- **Acceptance Criteria**:
  - [ ] Auto-refresh before expiry
  - [ ] Store new access token
  - [ ] Handle refresh token revocation
  - [ ] Re-auth flow if refresh fails
- **Files**: `src/server/auth/google-refresh.ts`

#### TASK-BA-030: Create Google API proxy
- **Description**: Proxy Google API calls through backend
- **Acceptance Criteria**:
  - [ ] `POST /api/google/proxy` - Proxy Google API calls
  - [ ] Injects user's token
  - [ ] Rate limit awareness
  - [ ] Error normalization
- **Files**: `api/google/proxy.ts`

---

### 5B.9 Security

#### TASK-BA-031: Implement token encryption
- **Description**: Encrypt OAuth tokens at rest
- **Acceptance Criteria**:
  - [ ] AES-256 encryption for tokens
  - [ ] Encryption key in environment
  - [ ] Key rotation support
  - [ ] Decrypt only when needed
- **Files**: `src/server/utils/encryption.ts`

#### TASK-BA-032: Configure CORS
- **Description**: Secure CORS configuration
- **Acceptance Criteria**:
  - [ ] Whitelist allowed origins
  - [ ] Credentials allowed
  - [ ] Proper headers
  - [ ] Different config for dev/prod
- **Files**: `src/server/api/middleware/cors.ts`

#### TASK-BA-033: Add security headers
- **Description**: Security headers for API
- **Acceptance Criteria**:
  - [ ] Content-Security-Policy
  - [ ] X-Content-Type-Options
  - [ ] X-Frame-Options
  - [ ] Strict-Transport-Security
- **Files**: `vercel.json` (update)

#### TASK-BA-034: Audit logging
- **Description**: Log security-relevant events
- **Acceptance Criteria**:
  - [ ] Log: login, logout, token refresh
  - [ ] Log: failed auth attempts
  - [ ] Log: sensitive operations
  - [ ] Structured logging format
- **Files**: `src/server/utils/audit.ts`

---

## Environment Variables

```env
# Vercel Postgres
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Encryption
TOKEN_ENCRYPTION_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Completion Checklist

- [ ] All 34 tasks completed
- [ ] Vercel Postgres database working
- [ ] Better Auth configured with GitHub + Google
- [ ] Users can sign in/out
- [ ] Settings sync working
- [ ] Token management secure
- [ ] API infrastructure solid
- [ ] Ready for GitHub/Google Drive integration

---

## Testing Notes

- Test OAuth flows end-to-end
- Test token refresh scenarios
- Test offline/online transitions
- Test session expiry handling
- Test rate limiting
- Load test database queries

---

*Phase 05B - Backend & Authentication*
*MarkView Development Plan*
