/**
 * Google Drive Types
 * TypeScript types for Google Drive API entities
 */

// ============================================================================
// User Types
// ============================================================================

export interface GoogleDriveUser {
    email: string;
    name: string | null;
    picture: string | null;
}

export interface GoogleDriveConnectionStatus {
    connected: boolean;
    user?: GoogleDriveUser;
    error?: string;
}

// ============================================================================
// File Types
// ============================================================================

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    size?: string;
    parents?: string[];
    trashed?: boolean;
    starred?: boolean;
    webViewLink?: string;
    iconLink?: string;
}

export interface DriveFileList {
    files: DriveFile[];
    nextPageToken?: string;
}

export interface DriveFileTreeNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    mimeType: string;
    modifiedTime: string;
    size?: string;
    isMarkdown: boolean;
    children?: DriveFileTreeNode[];
    disabled?: boolean;
}

// ============================================================================
// File Content Types
// ============================================================================

export interface DriveFileContent {
    id: string;
    name: string;
    content: string;
    mimeType: string;
    modifiedTime: string;
}

// ============================================================================
// File Operations
// ============================================================================

export type FileOperation = 'create' | 'update' | 'delete' | 'rename' | 'move';

export interface FileOperationRequest {
    operation: FileOperation;
    fileId?: string;
    name?: string;
    content?: string;
    parentId?: string;
    mimeType?: string;
}

export interface FileOperationResponse {
    success: boolean;
    file?: DriveFile;
    error?: string;
}

// ============================================================================
// Quota Types
// ============================================================================

export interface DriveQuota {
    used: number;
    limit: number;
    usedInDrive: number;
    usedInTrash: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface GoogleProxyRequest {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    isUpload?: boolean;
}

export interface GoogleProxyResponse<T> {
    data?: T;
    content?: string;
    error?: string;
    status?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export type GoogleDriveErrorCode =
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'QUOTA_EXCEEDED'
    | 'RATE_LIMITED'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';

export class GoogleDriveError extends Error {
    constructor(
        message: string,
        public code: GoogleDriveErrorCode,
        public status?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'GoogleDriveError';
    }
}

// ============================================================================
// Document Source Types
// ============================================================================

export interface GoogleDriveDocumentSource {
    type: 'google-drive';
    fileId: string;
    name: string;
    modifiedTime: string;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CachedData<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export const CACHE_TTL = {
    FILES: 5 * 60 * 1000, // 5 minutes
    CONTENT: 60 * 60 * 1000, // 1 hour
    QUOTA: 10 * 60 * 1000 // 10 minutes
} as const;

export function isCacheValid<T>(cached: CachedData<T> | null): cached is CachedData<T> {
    if (!cached) return false;
    return Date.now() - cached.timestamp < cached.ttl;
}

// ============================================================================
// Filter Types
// ============================================================================

export type DriveVisibilityFilter = 'all' | 'markdown' | 'starred';
export type DriveSortBy = 'name' | 'modified' | 'size';
export type DriveSortOrder = 'asc' | 'desc';

export interface DriveFilterOptions {
    search: string;
    visibility: DriveVisibilityFilter;
    sortBy: DriveSortBy;
    sortOrder: DriveSortOrder;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function isMarkdownFile(file: DriveFile): boolean {
    const name = file.name.toLowerCase();
    return name.endsWith('.md') || name.endsWith('.mdx');
}

export function isFolder(file: DriveFile): boolean {
    return file.mimeType === 'application/vnd.google-apps.folder';
}

export function formatFileSize(bytes: string | undefined): string {
    if (!bytes) return '';
    const size = Number.parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
