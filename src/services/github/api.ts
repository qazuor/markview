/**
 * GitHub API Client
 * All requests go through the backend proxy for security
 */

import type {
    CommitRequest,
    CommitResponse,
    DeleteRequest,
    GitHubConnectionStatus,
    GitHubError,
    GitHubProxyResponse,
    RateLimitInfo
} from '@/types/github';

const API_BASE = '/api/github';

let lastRateLimit: RateLimitInfo | null = null;

/**
 * Get the last known rate limit info
 */
export function getRateLimit(): RateLimitInfo | null {
    return lastRateLimit;
}

/**
 * Make a proxied request to GitHub API
 */
export async function githubProxy<T>(
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

    const result: GitHubProxyResponse<T> = await response.json();

    // Update rate limit
    if (result.rateLimit) {
        lastRateLimit = result.rateLimit;
    }

    if (!response.ok || result.error) {
        throw createGitHubError(result.error || 'Unknown error', response.status, result);
    }

    return result.data as T;
}

/**
 * Check GitHub connection status
 */
export async function checkConnection(): Promise<GitHubConnectionStatus> {
    const response = await fetch(`${API_BASE}/connection`, {
        credentials: 'include'
    });

    return response.json();
}

/**
 * Commit a file to GitHub (create or update)
 */
export async function commitFile(request: CommitRequest): Promise<CommitResponse> {
    const response = await fetch(`${API_BASE}/commit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(request)
    });

    const result = await response.json();

    if (!response.ok) {
        throw createGitHubError(result.error || 'Failed to commit', response.status, result);
    }

    return result;
}

/**
 * Delete a file from GitHub
 */
export async function deleteFile(request: DeleteRequest): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/file`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(request)
    });

    const result = await response.json();

    if (!response.ok) {
        throw createGitHubError(result.error || 'Failed to delete', response.status, result);
    }

    return result;
}

/**
 * Create a GitHubError from an API response
 */
function createGitHubError(message: string, status: number, details?: unknown): GitHubError {
    const codeMap: Record<number, string> = {
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        422: 'VALIDATION_ERROR',
        429: 'RATE_LIMITED'
    };

    const code = codeMap[status] || 'UNKNOWN';

    const error = new Error(message) as GitHubError;
    error.name = 'GitHubError';
    error.code = code as GitHubError['code'];
    error.status = status;
    error.details = details;

    return error;
}

export const githubApi = {
    proxy: githubProxy,
    checkConnection,
    commitFile,
    deleteFile,
    getRateLimit
};
