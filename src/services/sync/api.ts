/**
 * Sync API client
 * Handles all API calls to the sync endpoints
 */

import type {
    DocumentUpsertPayload,
    FolderUpsertPayload,
    SyncConflictResponse,
    SyncDeleteResponse,
    SyncDocument,
    SyncDocumentResponse,
    SyncDocumentsResponse,
    SyncFolderResponse,
    SyncFoldersResponse,
    SyncStatus
} from '@/types/sync';

const API_BASE = import.meta.env.VITE_API_URL || '';

class SyncApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'SyncApiError';
    }
}

class SyncConflictError extends Error {
    constructor(
        message: string,
        public serverVersion: number,
        public serverDocument: SyncDocument
    ) {
        super(message);
        this.name = 'SyncConflictError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 409) {
        const data = (await response.json()) as SyncConflictResponse;
        throw new SyncConflictError(data.message, data.serverVersion, data.serverDocument);
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new SyncApiError(errorData.error || errorData.message || 'Request failed', response.status, errorData.code);
    }

    return response.json();
}

// ============================================================================
// Documents API
// ============================================================================

/**
 * Fetch all documents for the authenticated user
 * @param since - Optional ISO date string for delta sync
 */
export async function fetchDocuments(since?: string): Promise<SyncDocumentsResponse> {
    const url = new URL(`${API_BASE}/api/sync/documents`, window.location.origin);
    if (since) {
        url.searchParams.set('since', since);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse<SyncDocumentsResponse>(response);
}

/**
 * Create or update a document
 * @throws SyncConflictError if there's a version conflict
 */
export async function upsertDocument(payload: DocumentUpsertPayload): Promise<SyncDocumentResponse> {
    const response = await fetch(`${API_BASE}/api/sync/documents/${payload.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    return handleResponse<SyncDocumentResponse>(response);
}

/**
 * Soft delete a document
 */
export async function deleteDocument(id: string): Promise<SyncDeleteResponse> {
    const response = await fetch(`${API_BASE}/api/sync/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse<SyncDeleteResponse>(response);
}

// ============================================================================
// Folders API
// ============================================================================

/**
 * Fetch all folders for the authenticated user
 * @param since - Optional ISO date string for delta sync
 */
export async function fetchFolders(since?: string): Promise<SyncFoldersResponse> {
    const url = new URL(`${API_BASE}/api/sync/folders`, window.location.origin);
    if (since) {
        url.searchParams.set('since', since);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse<SyncFoldersResponse>(response);
}

/**
 * Create or update a folder
 */
export async function upsertFolder(payload: FolderUpsertPayload): Promise<SyncFolderResponse> {
    const response = await fetch(`${API_BASE}/api/sync/folders/${payload.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    return handleResponse<SyncFolderResponse>(response);
}

/**
 * Soft delete a folder
 */
export async function deleteFolder(id: string): Promise<SyncDeleteResponse> {
    const response = await fetch(`${API_BASE}/api/sync/folders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse<SyncDeleteResponse>(response);
}

// ============================================================================
// Status API
// ============================================================================

/**
 * Get current sync status
 */
export async function fetchSyncStatus(): Promise<SyncStatus> {
    const response = await fetch(`${API_BASE}/api/sync/status`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse<SyncStatus>(response);
}

// ============================================================================
// Exports
// ============================================================================

export { SyncApiError, SyncConflictError };

export const syncApi = {
    documents: {
        fetch: fetchDocuments,
        upsert: upsertDocument,
        delete: deleteDocument
    },
    folders: {
        fetch: fetchFolders,
        upsert: upsertFolder,
        delete: deleteFolder
    },
    status: fetchSyncStatus
};
