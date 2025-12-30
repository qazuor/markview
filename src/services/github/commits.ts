/**
 * GitHub Commit Operations
 */

import type { CommitRequest, CommitResponse, DeleteRequest } from '@/types/github';
import { commitFile, deleteFile } from './api';
import { clearTreeCache, updateContentCache } from './files';

/**
 * Create or update a file in a repository
 */
export async function saveFile(request: CommitRequest): Promise<CommitResponse> {
    const result = await commitFile(request);

    if (result.success && result.sha) {
        // Update content cache with new sha
        updateContentCache(request.repo, request.path, request.content, result.sha, request.branch || 'main');

        // Invalidate tree cache to refresh file list
        clearTreeCache(request.repo);
    }

    return result;
}

/**
 * Create a new file in a repository
 */
export async function createFile(repo: string, path: string, content: string, message: string, branch?: string): Promise<CommitResponse> {
    return saveFile({
        repo,
        path,
        content,
        message,
        branch
        // No sha = create new file
    });
}

/**
 * Update an existing file in a repository
 */
export async function updateFile(
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string,
    branch?: string
): Promise<CommitResponse> {
    return saveFile({
        repo,
        path,
        content,
        message,
        sha,
        branch
    });
}

/**
 * Delete a file from a repository
 */
export async function removeFile(request: DeleteRequest): Promise<{ success: boolean }> {
    const result = await deleteFile(request);

    if (result.success) {
        // Invalidate tree cache
        clearTreeCache(request.repo);
    }

    return result;
}

/**
 * Rename a file (delete old + create new)
 */
export async function renameFile(
    repo: string,
    oldPath: string,
    newPath: string,
    content: string,
    sha: string,
    message: string,
    branch?: string
): Promise<CommitResponse> {
    // First, create the new file
    const createResult = await createFile(repo, newPath, content, message, branch);

    if (!createResult.success) {
        return createResult;
    }

    // Then delete the old file
    try {
        await removeFile({
            repo,
            path: oldPath,
            sha,
            message: `Delete ${oldPath} (renamed to ${newPath})`,
            branch
        });
    } catch (error) {
        // If delete fails, we still have the new file
        console.error('Failed to delete old file after rename:', error);
    }

    return createResult;
}

/**
 * Generate a default commit message
 */
export function generateCommitMessage(action: 'create' | 'update' | 'delete' | 'rename', filename: string, customMessage?: string): string {
    if (customMessage) return customMessage;

    switch (action) {
        case 'create':
            return `Create ${filename}`;
        case 'update':
            return `Update ${filename}`;
        case 'delete':
            return `Delete ${filename}`;
        case 'rename':
            return `Rename ${filename}`;
        default:
            return `Update ${filename}`;
    }
}

export const commitsService = {
    save: saveFile,
    create: createFile,
    update: updateFile,
    delete: removeFile,
    rename: renameFile,
    generateMessage: generateCommitMessage
};
