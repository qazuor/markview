/**
 * Google Drive API Client
 * Handles communication with backend Google Drive proxy
 */

import type {
    DriveFileContent,
    DriveQuota,
    FileOperationRequest,
    FileOperationResponse,
    GoogleDriveConnectionStatus,
    GoogleProxyResponse
} from '@/types/gdrive';
import { GoogleDriveError } from '@/types/gdrive';

const API_BASE = '/api/google';

/**
 * Make a request to the Google Drive proxy endpoint
 */
export async function googleProxy<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown
): Promise<T> {
    const response = await fetch(`${API_BASE}/proxy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ endpoint, method, body })
    });

    const result: GoogleProxyResponse<T> = await response.json();

    if (!response.ok || result.error) {
        throw new GoogleDriveError(result.error || 'Request failed', mapErrorCode(response.status), response.status);
    }

    if (result.data !== undefined) {
        return result.data;
    }

    // For file content requests that return content directly
    if (result.content !== undefined) {
        return result.content as unknown as T;
    }

    throw new GoogleDriveError('Invalid response', 'UNKNOWN');
}

/**
 * Map HTTP status to error code
 */
function mapErrorCode(status: number): import('@/types/gdrive').GoogleDriveErrorCode {
    switch (status) {
        case 401:
            return 'UNAUTHORIZED';
        case 403:
            return 'FORBIDDEN';
        case 404:
            return 'NOT_FOUND';
        case 429:
            return 'RATE_LIMITED';
        default:
            return 'UNKNOWN';
    }
}

/**
 * Check Google Drive connection status
 */
export async function checkConnection(): Promise<GoogleDriveConnectionStatus> {
    try {
        const response = await fetch(`${API_BASE}/connection`, {
            credentials: 'include'
        });

        if (!response.ok) {
            return { connected: false, error: 'Failed to check connection' };
        }

        return await response.json();
    } catch (error) {
        console.error('Google Drive connection check failed:', error);
        return { connected: false, error: 'Network error' };
    }
}

/**
 * Get storage quota information
 */
export async function getQuota(): Promise<DriveQuota | null> {
    try {
        const response = await fetch(`${API_BASE}/quota`, {
            credentials: 'include'
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to get quota:', error);
        return null;
    }
}

/**
 * Perform file operation (create, update, delete, rename, move)
 */
export async function fileOperation(request: FileOperationRequest): Promise<FileOperationResponse> {
    try {
        const response = await fetch(`${API_BASE}/files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(request)
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Operation failed' };
        }

        return result;
    } catch (error) {
        console.error('File operation failed:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Fetch file content by ID
 */
export async function fetchFileContent(fileId: string): Promise<DriveFileContent | null> {
    try {
        // First get file metadata
        const metadata = await googleProxy<{ id: string; name: string; mimeType: string; modifiedTime: string }>(
            `/drive/v3/files/${fileId}?fields=id,name,mimeType,modifiedTime`
        );

        // Then get content
        const content = await googleProxy<string>(`/drive/v3/files/${fileId}?alt=media`);

        return {
            id: metadata.id,
            name: metadata.name,
            content,
            mimeType: metadata.mimeType,
            modifiedTime: metadata.modifiedTime
        };
    } catch (error) {
        console.error('Failed to fetch file content:', error);
        return null;
    }
}

export const gdriveApi = {
    proxy: googleProxy,
    checkConnection,
    getQuota,
    fileOperation,
    fetchFileContent
};
