/**
 * Google Drive Service
 * Exports all Google Drive-related services
 */

export { gdriveApi, checkConnection, getQuota, fileOperation, fetchFileContent } from './api';
export { filesService, fetchFiles, fetchFileTree, filterMarkdownOnly, filterFiles, clearAllCaches } from './files';

// Re-export common types
export type {
    DriveFile,
    DriveFileTreeNode,
    DriveFileContent,
    DriveQuota,
    FileOperationRequest,
    FileOperationResponse,
    GoogleDriveConnectionStatus
} from '@/types/gdrive';
