/**
 * GitHub Repository Operations
 */

import type { CachedData, RepoFilterOptions, RepoSortBy, Repository } from '@/types/github';
import { CACHE_TTL, isCacheValid } from '@/types/github';
import { githubProxy } from './api';

// Repository cache
let reposCache: CachedData<Repository[]> | null = null;

// GitHub API response type
interface GitHubRepoResponse {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    default_branch: string;
    updated_at: string;
    pushed_at: string;
    language: string | null;
    owner: {
        login: string;
        avatar_url: string;
    };
}

/**
 * Fetch user's repositories with pagination
 */
export async function fetchRepositories(forceRefresh = false): Promise<Repository[]> {
    // Check cache
    if (!forceRefresh && isCacheValid(reposCache)) {
        return reposCache.data;
    }

    const allRepos: Repository[] = [];
    let page = 1;
    const perPage = 100;

    // Fetch all pages
    while (true) {
        const repos = await githubProxy<GitHubRepoResponse[]>(
            `/user/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc&affiliation=owner`
        );

        if (repos.length === 0) break;

        // Transform to our format
        const transformed = repos.map(transformRepo);
        allRepos.push(...transformed);

        if (repos.length < perPage) break;
        page++;
    }

    // Update cache
    reposCache = {
        data: allRepos,
        timestamp: Date.now(),
        ttl: CACHE_TTL.REPOS
    };

    return allRepos;
}

/**
 * Transform GitHub API repo to our format
 */
function transformRepo(repo: GitHubRepoResponse): Repository {
    return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        defaultBranch: repo.default_branch,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        language: repo.language,
        owner: {
            login: repo.owner.login,
            avatarUrl: repo.owner.avatar_url
        }
    };
}

/**
 * Filter and sort repositories
 */
export function filterRepositories(repos: Repository[], options: RepoFilterOptions): Repository[] {
    let filtered = [...repos];

    // Search filter
    if (options.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(
            (repo) => repo.name.toLowerCase().includes(searchLower) || repo.description?.toLowerCase().includes(searchLower)
        );
    }

    // Visibility filter
    if (options.visibility !== 'all') {
        filtered = filtered.filter((repo) => (options.visibility === 'private' ? repo.private : !repo.private));
    }

    // Sort
    filtered = sortRepositories(filtered, options.sortBy, options.sortOrder);

    return filtered;
}

/**
 * Sort repositories by field
 */
function sortRepositories(repos: Repository[], sortBy: RepoSortBy, sortOrder: 'asc' | 'desc'): Repository[] {
    const sorted = [...repos].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'updated':
                comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                break;
            case 'created':
                comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
}

/**
 * Clear repository cache
 */
export function clearReposCache(): void {
    reposCache = null;
}

/**
 * Get default filter options
 */
export function getDefaultFilterOptions(): RepoFilterOptions {
    return {
        search: '',
        visibility: 'all',
        sortBy: 'updated',
        sortOrder: 'desc'
    };
}

export const reposService = {
    fetch: fetchRepositories,
    filter: filterRepositories,
    clearCache: clearReposCache,
    getDefaultFilterOptions
};
