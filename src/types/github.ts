export interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    avatarUrl: string;
    email: string | null;
}

export interface Repository {
    id: number;
    name: string;
    fullName: string;
    description: string | null;
    private: boolean;
    defaultBranch: string;
    updatedAt: string;
    owner: {
        login: string;
        avatarUrl: string;
    };
}

export interface GitHubFile {
    name: string;
    path: string;
    sha: string;
    size: number;
    type: 'file' | 'dir';
    downloadUrl?: string;
}

export interface GitHubState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    user: GitHubUser | null;
    token: string | null;
    repos: Repository[];
    selectedRepo: Repository | null;
    currentPath: string[];
    files: GitHubFile[];
}
