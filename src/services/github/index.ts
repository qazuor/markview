/**
 * GitHub Service
 * Exports all GitHub-related services
 */

export { githubApi, checkConnection, getRateLimit } from './api';
export { reposService, fetchRepositories, filterRepositories, clearReposCache } from './repos';
export {
    filesService,
    fetchFileTree,
    fetchFileContent,
    filterMarkdownOnly,
    clearAllCaches
} from './files';
export {
    commitsService,
    saveFile,
    createFile,
    updateFile,
    removeFile,
    renameFile,
    generateCommitMessage
} from './commits';

// Re-export common types
export type {
    Repository,
    FileTreeNode,
    FileContent,
    CommitRequest,
    CommitResponse,
    RateLimitInfo,
    GitHubConnectionStatus
} from '@/types/github';
