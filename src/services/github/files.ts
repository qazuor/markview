/**
 * GitHub File Operations
 */

import type { CachedData, FileContent, FileTreeNode, GitHubFileContent, GitHubTree, GitHubTreeItem, Repository } from '@/types/github';
import { CACHE_TTL, isCacheValid, isMarkdownFile } from '@/types/github';
import { githubProxy } from './api';

// File tree cache: repo fullName -> cached tree
const treeCache = new Map<string, CachedData<FileTreeNode[]>>();

// File content cache: repo/path -> cached content
const contentCache = new Map<string, CachedData<FileContent>>();

/**
 * Fetch repository file tree
 */
export async function fetchFileTree(repo: Repository, forceRefresh = false): Promise<FileTreeNode[]> {
    const cacheKey = repo.fullName;

    // Check cache
    if (!forceRefresh) {
        const cached = treeCache.get(cacheKey) ?? null;
        if (isCacheValid(cached)) {
            return cached.data;
        }
    }

    // Fetch tree from GitHub
    const tree = await githubProxy<GitHubTree>(`/repos/${repo.fullName}/git/trees/${repo.defaultBranch}?recursive=1`);

    // Transform to FileTreeNode format
    const nodes = buildFileTree(tree.tree);

    // Update cache
    treeCache.set(cacheKey, {
        data: nodes,
        timestamp: Date.now(),
        ttl: CACHE_TTL.TREE
    });

    return nodes;
}

/**
 * Build a hierarchical file tree from flat GitHub tree
 */
function buildFileTree(items: GitHubTreeItem[]): FileTreeNode[] {
    const root: FileTreeNode[] = [];
    const nodeMap = new Map<string, FileTreeNode>();

    // Sort items so directories come first, then files
    const sortedItems = [...items].sort((a, b) => {
        if (a.type === b.type) return a.path.localeCompare(b.path);
        return a.type === 'tree' ? -1 : 1;
    });

    for (const item of sortedItems) {
        const pathParts = item.path.split('/');
        const name = pathParts[pathParts.length - 1] ?? '';
        const isDir = item.type === 'tree';
        const isMd = !isDir && isMarkdownFile(name);

        const node: FileTreeNode = {
            name,
            path: item.path,
            type: isDir ? 'directory' : 'file',
            sha: item.sha,
            size: item.size,
            isMarkdown: isMd,
            children: isDir ? [] : undefined,
            disabled: !isDir && !isMd
        };

        nodeMap.set(item.path, node);

        if (pathParts.length === 1) {
            // Root level
            root.push(node);
        } else {
            // Find parent
            const parentPath = pathParts.slice(0, -1).join('/');
            const parent = nodeMap.get(parentPath);
            if (parent?.children) {
                parent.children.push(node);
            }
        }
    }

    return root;
}

/**
 * Filter tree to show only markdown files
 * Also removes empty directories
 */
export function filterMarkdownOnly(nodes: FileTreeNode[]): FileTreeNode[] {
    return nodes
        .map((node) => {
            if (node.type === 'directory') {
                const filteredChildren = filterMarkdownOnly(node.children || []);
                // Only include directory if it has markdown descendants
                if (filteredChildren.length > 0) {
                    return { ...node, children: filteredChildren };
                }
                return null;
            }
            // Include only markdown files
            return node.isMarkdown ? node : null;
        })
        .filter((node): node is FileTreeNode => node !== null);
}

/**
 * Fetch file content
 */
export async function fetchFileContent(repo: string, path: string, branch: string, forceRefresh = false): Promise<FileContent> {
    const cacheKey = `${repo}/${path}`;

    // Check cache
    if (!forceRefresh) {
        const cached = contentCache.get(cacheKey) ?? null;
        if (isCacheValid(cached)) {
            return cached.data;
        }
    }

    // Fetch from GitHub
    const file = await githubProxy<GitHubFileContent>(`/repos/${repo}/contents/${path}?ref=${branch}`);

    // Decode base64 content
    const content = decodeBase64(file.content);

    const fileContent: FileContent = {
        path: file.path,
        sha: file.sha,
        content,
        size: file.size,
        repo,
        branch
    };

    // Update cache
    contentCache.set(cacheKey, {
        data: fileContent,
        timestamp: Date.now(),
        ttl: CACHE_TTL.FILE
    });

    return fileContent;
}

/**
 * Decode base64 content (handles Unicode properly)
 */
function decodeBase64(base64: string): string {
    // Remove any whitespace/newlines from base64 string
    const cleaned = base64.replace(/\s/g, '');

    // Decode base64 to binary string
    const binaryString = atob(cleaned);

    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode as UTF-8
    return new TextDecoder().decode(bytes);
}

/**
 * Update file content cache after successful commit
 */
export function updateContentCache(repo: string, path: string, content: string, sha: string, branch: string): void {
    const cacheKey = `${repo}/${path}`;
    contentCache.set(cacheKey, {
        data: {
            path,
            sha,
            content,
            size: new Blob([content]).size,
            repo,
            branch
        },
        timestamp: Date.now(),
        ttl: CACHE_TTL.FILE
    });
}

/**
 * Clear file tree cache for a repo
 */
export function clearTreeCache(repoFullName?: string): void {
    if (repoFullName) {
        treeCache.delete(repoFullName);
    } else {
        treeCache.clear();
    }
}

/**
 * Clear file content cache
 */
export function clearContentCache(cacheKey?: string): void {
    if (cacheKey) {
        contentCache.delete(cacheKey);
    } else {
        contentCache.clear();
    }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
    treeCache.clear();
    contentCache.clear();
}

export const filesService = {
    fetchTree: fetchFileTree,
    fetchContent: fetchFileContent,
    filterMarkdownOnly,
    updateContentCache,
    clearTreeCache,
    clearContentCache,
    clearAllCaches
};
