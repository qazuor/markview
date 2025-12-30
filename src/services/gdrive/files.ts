/**
 * Google Drive File Operations
 */

import type { CachedData, DriveFile, DriveFileList, DriveFileTreeNode, DriveFilterOptions } from '@/types/gdrive';
import { CACHE_TTL, isCacheValid, isFolder, isMarkdownFile } from '@/types/gdrive';
import { googleProxy } from './api';

// File list cache: folderId -> cached files
const filesCache = new Map<string, CachedData<DriveFile[]>>();

// File tree cache
let treeCache: CachedData<DriveFileTreeNode[]> | null = null;

/**
 * Fetch files from a folder (or root)
 */
export async function fetchFiles(folderId = 'root', forceRefresh = false): Promise<DriveFile[]> {
    const cacheKey = folderId;

    // Check cache
    if (!forceRefresh) {
        const cached = filesCache.get(cacheKey) ?? null;
        if (isCacheValid(cached)) {
            return cached.data;
        }
    }

    // Build query for markdown files and folders
    const query = `'${folderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.folder' or name contains '.md' or name contains '.mdx')`;

    const result = await googleProxy<DriveFileList>(
        `/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,size,parents,starred)&orderBy=folder,name&pageSize=1000`
    );

    // Update cache
    filesCache.set(cacheKey, {
        data: result.files,
        timestamp: Date.now(),
        ttl: CACHE_TTL.FILES
    });

    return result.files;
}

/**
 * Build a hierarchical file tree from Google Drive
 */
export async function fetchFileTree(forceRefresh = false): Promise<DriveFileTreeNode[]> {
    // Check cache
    if (!forceRefresh && isCacheValid(treeCache)) {
        return treeCache.data;
    }

    // Fetch all markdown files and folders
    const query = `trashed = false and (mimeType = 'application/vnd.google-apps.folder' or name contains '.md' or name contains '.mdx')`;

    const allFiles: DriveFile[] = [];
    let pageToken: string | undefined;

    // Paginate through all files
    do {
        const url = `/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,size,parents,starred),nextPageToken&orderBy=folder,name&pageSize=1000${pageToken ? `&pageToken=${pageToken}` : ''}`;

        const result = await googleProxy<DriveFileList>(url);
        allFiles.push(...result.files);
        pageToken = result.nextPageToken;
    } while (pageToken);

    // Build tree structure
    const tree = buildTree(allFiles);

    // Update cache
    treeCache = {
        data: tree,
        timestamp: Date.now(),
        ttl: CACHE_TTL.FILES
    };

    return tree;
}

/**
 * Build tree structure from flat file list
 */
function buildTree(files: DriveFile[]): DriveFileTreeNode[] {
    const nodeMap = new Map<string, DriveFileTreeNode>();
    const rootNodes: DriveFileTreeNode[] = [];

    // First pass: create all nodes
    for (const file of files) {
        const isFolderType = isFolder(file);
        const isMd = !isFolderType && isMarkdownFile(file);

        const node: DriveFileTreeNode = {
            id: file.id,
            name: file.name,
            type: isFolderType ? 'folder' : 'file',
            mimeType: file.mimeType,
            modifiedTime: file.modifiedTime,
            size: file.size,
            isMarkdown: isMd,
            children: isFolderType ? [] : undefined,
            disabled: !isFolderType && !isMd
        };

        nodeMap.set(file.id, node);
    }

    // Second pass: build parent-child relationships
    for (const file of files) {
        const node = nodeMap.get(file.id);
        if (!node) continue;

        const parentId = file.parents?.[0];
        if (parentId && nodeMap.has(parentId)) {
            const parent = nodeMap.get(parentId);
            parent?.children?.push(node);
        } else {
            // No parent in our list, so it's a root node
            rootNodes.push(node);
        }
    }

    // Sort: folders first, then alphabetically
    const sortNodes = (nodes: DriveFileTreeNode[]): DriveFileTreeNode[] => {
        return nodes.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });
    };

    // Sort recursively
    const sortRecursive = (nodes: DriveFileTreeNode[]): DriveFileTreeNode[] => {
        const sorted = sortNodes(nodes);
        for (const node of sorted) {
            if (node.children) {
                node.children = sortRecursive(node.children);
            }
        }
        return sorted;
    };

    return sortRecursive(rootNodes);
}

/**
 * Filter tree to show only markdown files
 */
export function filterMarkdownOnly(nodes: DriveFileTreeNode[]): DriveFileTreeNode[] {
    return nodes
        .map((node) => {
            if (node.type === 'folder') {
                const filteredChildren = filterMarkdownOnly(node.children || []);
                if (filteredChildren.length > 0) {
                    return { ...node, children: filteredChildren };
                }
                return null;
            }
            return node.isMarkdown ? node : null;
        })
        .filter((node): node is DriveFileTreeNode => node !== null);
}

/**
 * Filter files based on options
 */
export function filterFiles(files: DriveFile[], options: DriveFilterOptions): DriveFile[] {
    let filtered = [...files];

    // Search filter
    if (options.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter((file) => file.name.toLowerCase().includes(searchLower));
    }

    // Visibility filter
    if (options.visibility === 'markdown') {
        filtered = filtered.filter((file) => isMarkdownFile(file) || isFolder(file));
    } else if (options.visibility === 'starred') {
        filtered = filtered.filter((file) => file.starred || isFolder(file));
    }

    // Sort
    filtered = sortFiles(filtered, options.sortBy, options.sortOrder);

    return filtered;
}

/**
 * Sort files
 */
function sortFiles(files: DriveFile[], sortBy: DriveFilterOptions['sortBy'], sortOrder: DriveFilterOptions['sortOrder']): DriveFile[] {
    return [...files].sort((a, b) => {
        // Folders always first
        const aIsFolder = isFolder(a);
        const bIsFolder = isFolder(b);
        if (aIsFolder !== bIsFolder) {
            return aIsFolder ? -1 : 1;
        }

        let comparison = 0;

        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'modified':
                comparison = new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
                break;
            case 'size':
                comparison = Number.parseInt(b.size || '0') - Number.parseInt(a.size || '0');
                break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });
}

/**
 * Clear file cache
 */
export function clearFilesCache(folderId?: string): void {
    if (folderId) {
        filesCache.delete(folderId);
    } else {
        filesCache.clear();
    }
}

/**
 * Clear tree cache
 */
export function clearTreeCache(): void {
    treeCache = null;
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
    filesCache.clear();
    treeCache = null;
}

export const filesService = {
    fetchFiles,
    fetchFileTree,
    filterMarkdownOnly,
    filterFiles,
    clearFilesCache,
    clearTreeCache,
    clearAllCaches
};
