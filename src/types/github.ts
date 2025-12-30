/**
 * GitHub Types
 * TypeScript types for GitHub API entities
 */

// ============================================================================
// User Types
// ============================================================================

export interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    avatarUrl: string;
    email: string | null;
}

export interface GitHubConnectionStatus {
    connected: boolean;
    user?: {
        login: string;
        name: string | null;
        avatar: string;
    };
    error?: string;
}

// ============================================================================
// Repository Types
// ============================================================================

export interface Repository {
    id: number;
    name: string;
    fullName: string; // owner/repo
    description: string | null;
    private: boolean;
    defaultBranch: string;
    updatedAt: string;
    pushedAt?: string;
    language?: string | null;
    owner: {
        login: string;
        avatarUrl: string;
    };
}

export type RepoVisibilityFilter = 'all' | 'public' | 'private';
export type RepoSortBy = 'name' | 'updated' | 'created';
export type RepoSortOrder = 'asc' | 'desc';

export interface RepoFilterOptions {
    search: string;
    visibility: RepoVisibilityFilter;
    sortBy: RepoSortBy;
    sortOrder: RepoSortOrder;
}

// ============================================================================
// File Types
// ============================================================================

export interface GitHubFile {
    name: string;
    path: string;
    sha: string;
    size: number;
    type: 'file' | 'dir';
    downloadUrl?: string;
}

export interface GitHubTreeItem {
    path: string;
    mode: string;
    type: 'blob' | 'tree'; // blob = file, tree = directory
    sha: string;
    size?: number;
    url: string;
}

export interface GitHubTree {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

export interface FileTreeNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    sha: string;
    size?: number;
    children?: FileTreeNode[];
    isMarkdown: boolean;
    disabled?: boolean;
}

// ============================================================================
// File Content Types
// ============================================================================

export interface GitHubFileContent {
    name: string;
    path: string;
    sha: string;
    size: number;
    type: 'file';
    content: string; // Base64 encoded
    encoding: 'base64';
    html_url: string;
    download_url: string;
}

export interface FileContent {
    path: string;
    sha: string;
    content: string; // Decoded content
    size: number;
    repo: string;
    branch: string;
}

// ============================================================================
// Commit Types
// ============================================================================

export interface CommitRequest {
    repo: string; // owner/repo
    path: string;
    content: string;
    message: string;
    sha?: string; // Required for updates
    branch?: string;
}

export interface CommitResponse {
    success: boolean;
    sha?: string;
    commit?: {
        sha: string;
        url: string;
    };
    error?: string;
}

export interface DeleteRequest {
    repo: string;
    path: string;
    message: string;
    sha: string;
    branch?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface GitHubProxyRequest {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
}

export interface GitHubProxyResponse<T> {
    data?: T;
    rateLimit?: RateLimitInfo;
    error?: string;
    status?: number;
}

export interface RateLimitInfo {
    limit: string | null;
    remaining: string | null;
    reset: string | null;
}

// ============================================================================
// Error Types
// ============================================================================

export type GitHubErrorCode =
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'RATE_LIMITED'
    | 'VALIDATION_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';

export class GitHubError extends Error {
    constructor(
        message: string,
        public code: GitHubErrorCode,
        public status?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'GitHubError';
    }
}

// ============================================================================
// Document Source Types
// ============================================================================

export interface GitHubDocumentSource {
    type: 'github';
    repo: string; // owner/repo
    path: string;
    sha: string;
    branch: string;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CachedData<T> {
    data: T;
    timestamp: number;
    ttl: number; // milliseconds
}

export const CACHE_TTL = {
    REPOS: 5 * 60 * 1000, // 5 minutes
    TREE: 5 * 60 * 1000, // 5 minutes
    FILE: 60 * 60 * 1000 // 1 hour (until sha changes)
} as const;

export function isCacheValid<T>(cached: CachedData<T> | null): cached is CachedData<T> {
    if (!cached) return false;
    return Date.now() - cached.timestamp < cached.ttl;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function isMarkdownFile(filename: string): boolean {
    const ext = filename.toLowerCase().split('.').pop();
    return ext === 'md' || ext === 'mdx';
}

export function parseRepoFullName(fullName: string): { owner: string; repo: string } {
    const parts = fullName.split('/');
    return { owner: parts[0] ?? '', repo: parts[1] ?? '' };
}
