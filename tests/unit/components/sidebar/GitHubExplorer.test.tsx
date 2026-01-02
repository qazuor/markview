import { GitHubExplorer } from '@/components/sidebar/GitHubExplorer';
import type { FileTreeNode, Repository } from '@/types/github';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
        i18n: { language: 'en' }
    })
}));

// Mock GitHub services
const mockCheckConnection = vi.fn();
const mockFetchRepositories = vi.fn();
const mockFetchFileTree = vi.fn();
const mockFetchFileContent = vi.fn();
const mockFilterMarkdownOnly = vi.fn((nodes: FileTreeNode[]) => nodes.filter((n) => n.isMarkdown || n.type === 'directory'));
const mockFilterRepositories = vi.fn((repos: Repository[]) => repos);

vi.mock('@/services/github', () => ({
    checkConnection: () => mockCheckConnection(),
    fetchRepositories: (...args: unknown[]) => mockFetchRepositories(...args),
    fetchFileTree: (...args: unknown[]) => mockFetchFileTree(...args),
    fetchFileContent: (...args: unknown[]) => mockFetchFileContent(...args),
    filterMarkdownOnly: (nodes: FileTreeNode[]) => mockFilterMarkdownOnly(nodes),
    filterRepositories: (repos: Repository[], options: unknown) => mockFilterRepositories(repos)
}));

// Mock parseRepoFullName
vi.mock('@/types/github', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/types/github')>();
    return {
        ...actual,
        parseRepoFullName: (fullName: string) => {
            const [owner, repo] = fullName.split('/');
            return { owner, repo };
        }
    };
});

// Mock modals
vi.mock('@/components/modals', () => ({
    CreateGitHubFileModal: ({
        isOpen,
        onClose,
        onSuccess
    }: { isOpen: boolean; onClose: () => void; onSuccess: (sha: string, path: string) => void }) =>
        isOpen ? (
            <div data-testid="create-file-modal">
                <button type="button" data-testid="close-create-modal" onClick={onClose}>
                    Close
                </button>
                <button type="button" data-testid="create-file-success" onClick={() => onSuccess('sha123', 'test.md')}>
                    Create
                </button>
            </div>
        ) : null,
    DeleteGitHubFileModal: ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) =>
        isOpen ? (
            <div data-testid="delete-file-modal">
                <button type="button" data-testid="close-delete-modal" onClick={onClose}>
                    Close
                </button>
                <button type="button" data-testid="delete-file-success" onClick={onSuccess}>
                    Delete
                </button>
            </div>
        ) : null
}));

// Mock context menus
vi.mock('@/components/sidebar/GitHubContextMenus', () => ({
    GitHubEmptyContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-context-menu">{children}</div>,
    GitHubFileContextMenu: ({
        children,
        onOpen,
        onDelete,
        node
    }: { children: React.ReactNode; onOpen: (node: FileTreeNode) => void; onDelete: (node: FileTreeNode) => void; node: FileTreeNode }) => (
        <div data-testid="file-context-menu" onClick={() => onDelete(node)} onKeyDown={() => {}}>
            {children}
        </div>
    ),
    GitHubFolderContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="folder-context-menu">{children}</div>
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ChevronDown: () => <span data-testid="icon-chevron-down" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />,
    File: () => <span data-testid="icon-file" />,
    FilePlus: () => <span data-testid="icon-file-plus" />,
    FileText: () => <span data-testid="icon-file-text" />,
    Folder: () => <span data-testid="icon-folder" />,
    FolderOpen: () => <span data-testid="icon-folder-open" />,
    GitBranch: () => <span data-testid="icon-git-branch" />,
    Loader2: () => <span data-testid="icon-loader" />,
    Lock: () => <span data-testid="icon-lock" />,
    Plus: () => <span data-testid="icon-plus" />,
    RefreshCw: () => <span data-testid="icon-refresh" />,
    Search: () => <span data-testid="icon-search" />,
    Trash2: () => <span data-testid="icon-trash" />
}));

// Store mocks
const mockIsConnected = vi.fn<[], boolean>().mockReturnValue(false);
const mockIsLoading = vi.fn<[], boolean>().mockReturnValue(false);
const mockError = vi.fn<[], string | null>().mockReturnValue(null);
const mockUser = vi.fn<[], { login: string; avatarUrl: string } | null>().mockReturnValue(null);
const mockRepositories = vi.fn<[], Repository[]>().mockReturnValue([]);
const mockSelectedRepo = vi.fn<[], Repository | null>().mockReturnValue(null);
const mockReposLoading = vi.fn<[], boolean>().mockReturnValue(false);
const mockSetConnected = vi.fn();
const mockSetLoading = vi.fn();
const mockSetError = vi.fn();
const mockSetRepositories = vi.fn();
const mockSetReposLoading = vi.fn();
const mockSelectRepo = vi.fn();
const mockSetFileTree = vi.fn();
const mockFileTree = new Map<string, FileTreeNode[]>();
const mockTreeLoading = vi.fn<[], boolean>().mockReturnValue(false);
const mockExpandedPaths = new Set<string>();
const mockSetTreeLoading = vi.fn();
const mockToggleExpanded = vi.fn();

vi.mock('@/stores/githubStore', () => ({
    useGitHubStore: () => ({
        isConnected: mockIsConnected(),
        isLoading: mockIsLoading(),
        error: mockError(),
        user: mockUser(),
        repositories: mockRepositories(),
        selectedRepo: mockSelectedRepo(),
        reposLoading: mockReposLoading(),
        setConnected: mockSetConnected,
        setLoading: mockSetLoading,
        setError: mockSetError,
        setRepositories: mockSetRepositories,
        setReposLoading: mockSetReposLoading,
        selectRepo: mockSelectRepo,
        setFileTree: mockSetFileTree,
        fileTree: mockFileTree,
        treeLoading: mockTreeLoading(),
        expandedPaths: mockExpandedPaths,
        setTreeLoading: mockSetTreeLoading,
        toggleExpanded: mockToggleExpanded
    })
}));

const mockCreateDocument = vi.fn();
const mockFindDocumentByGitHub = vi.fn();
const mockOpenDocument = vi.fn();

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: () => ({
        createDocument: mockCreateDocument,
        findDocumentByGitHub: mockFindDocumentByGitHub,
        openDocument: mockOpenDocument
    })
}));

// Test data
const mockRepo: Repository = {
    id: 1,
    name: 'test-repo',
    fullName: 'user/test-repo',
    private: false,
    defaultBranch: 'main',
    description: 'Test repository',
    language: 'TypeScript',
    stargazersCount: 10,
    forksCount: 5,
    updatedAt: '2024-01-01T00:00:00Z'
};

const mockPrivateRepo: Repository = {
    ...mockRepo,
    id: 2,
    name: 'private-repo',
    fullName: 'user/private-repo',
    private: true
};

const mockFileTreeNodes: FileTreeNode[] = [
    {
        name: 'src',
        path: 'src',
        type: 'directory',
        sha: 'abc123',
        isMarkdown: false,
        children: [
            {
                name: 'readme.md',
                path: 'src/readme.md',
                type: 'file',
                sha: 'def456',
                isMarkdown: true
            }
        ]
    },
    {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        sha: 'ghi789',
        isMarkdown: true
    }
];

describe('GitHubExplorer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsConnected.mockReturnValue(false);
        mockIsLoading.mockReturnValue(false);
        mockError.mockReturnValue(null);
        mockUser.mockReturnValue(null);
        mockRepositories.mockReturnValue([]);
        mockSelectedRepo.mockReturnValue(null);
        mockReposLoading.mockReturnValue(false);
        mockTreeLoading.mockReturnValue(false);
        mockFileTree.clear();

        mockCheckConnection.mockResolvedValue({ connected: false });
        mockFetchRepositories.mockResolvedValue([]);
        mockFetchFileTree.mockResolvedValue([]);
        mockFetchFileContent.mockResolvedValue({ content: '# Test', sha: 'sha123' });
        mockFilterRepositories.mockImplementation((repos) => repos);
    });

    describe('loading state', () => {
        it('should show loading spinner when checking connection', () => {
            mockIsLoading.mockReturnValue(true);

            render(<GitHubExplorer />);

            expect(screen.getByText('Connecting to GitHub...')).toBeInTheDocument();
        });
    });

    describe('not connected state', () => {
        it('should show connect button when not connected', () => {
            mockIsConnected.mockReturnValue(false);

            render(<GitHubExplorer />);

            expect(screen.getByText('Not connected to GitHub')).toBeInTheDocument();
            expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
        });

        it('should show error message if connection failed', () => {
            mockIsConnected.mockReturnValue(false);
            mockError.mockReturnValue('Authentication failed');

            render(<GitHubExplorer />);

            expect(screen.getByText('Authentication failed')).toBeInTheDocument();
        });

        it('should have connect link pointing to GitHub auth', () => {
            mockIsConnected.mockReturnValue(false);

            render(<GitHubExplorer />);

            const connectLink = screen.getByText('Connect GitHub');
            expect(connectLink).toHaveAttribute('href', '/api/auth/github');
        });
    });

    describe('connected state - repository list', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockUser.mockReturnValue({ login: 'testuser', avatarUrl: 'https://example.com/avatar.png' });
        });

        it('should show user info in header', () => {
            render(<GitHubExplorer />);

            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.getByAltText('testuser')).toHaveAttribute('src', 'https://example.com/avatar.png');
        });

        it('should show search input', () => {
            render(<GitHubExplorer />);

            expect(screen.getByPlaceholderText('Search repositories...')).toBeInTheDocument();
        });

        it('should show refresh button', () => {
            render(<GitHubExplorer />);

            expect(screen.getByTitle('Refresh')).toBeInTheDocument();
        });

        it('should show loading when fetching repos', () => {
            mockReposLoading.mockReturnValue(true);

            render(<GitHubExplorer />);

            // Loading spinner should be present
            const container = document.querySelector('.animate-spin');
            expect(container).toBeInTheDocument();
        });

        it('should show repository list', () => {
            mockRepositories.mockReturnValue([mockRepo, mockPrivateRepo]);
            mockFilterRepositories.mockReturnValue([mockRepo, mockPrivateRepo]);

            render(<GitHubExplorer />);

            expect(screen.getByText('test-repo')).toBeInTheDocument();
            expect(screen.getByText('private-repo')).toBeInTheDocument();
        });

        it('should show lock icon for private repos', () => {
            mockRepositories.mockReturnValue([mockPrivateRepo]);
            mockFilterRepositories.mockReturnValue([mockPrivateRepo]);

            render(<GitHubExplorer />);

            expect(screen.getByTestId('icon-lock')).toBeInTheDocument();
        });

        it('should show no repos message when empty', () => {
            mockRepositories.mockReturnValue([]);

            render(<GitHubExplorer />);

            expect(screen.getByText('No repositories')).toBeInTheDocument();
        });

        it('should show no repos found message when search has no results', () => {
            mockRepositories.mockReturnValue([mockRepo]);
            mockFilterRepositories.mockReturnValue([]);

            render(<GitHubExplorer />);

            const searchInput = screen.getByPlaceholderText('Search repositories...');
            fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

            expect(screen.getByText('No repositories found')).toBeInTheDocument();
        });

        it('should filter repositories on search', () => {
            mockRepositories.mockReturnValue([mockRepo]);

            render(<GitHubExplorer />);

            const searchInput = screen.getByPlaceholderText('Search repositories...');
            fireEvent.change(searchInput, { target: { value: 'test' } });

            expect(mockFilterRepositories).toHaveBeenCalled();
        });

        it('should select repository when clicked', () => {
            mockRepositories.mockReturnValue([mockRepo]);
            mockFilterRepositories.mockReturnValue([mockRepo]);

            render(<GitHubExplorer />);

            fireEvent.click(screen.getByText('test-repo'));

            expect(mockSelectRepo).toHaveBeenCalledWith(mockRepo);
        });

        it('should call refresh when refresh button clicked', async () => {
            mockFetchRepositories.mockResolvedValue([mockRepo]);

            render(<GitHubExplorer />);

            fireEvent.click(screen.getByTitle('Refresh'));

            await waitFor(() => {
                expect(mockFetchRepositories).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('connected state - file tree', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockUser.mockReturnValue({ login: 'testuser', avatarUrl: 'https://example.com/avatar.png' });
            mockSelectedRepo.mockReturnValue(mockRepo);
            mockFileTree.set('user/test-repo', mockFileTreeNodes);
        });

        it('should show back button when repo is selected', () => {
            render(<GitHubExplorer />);

            expect(screen.getByTitle('Back to repositories')).toBeInTheDocument();
        });

        it('should show repo name in header', () => {
            render(<GitHubExplorer />);

            expect(screen.getByText('test-repo')).toBeInTheDocument();
        });

        it('should show create file button', () => {
            render(<GitHubExplorer />);

            expect(screen.getByTitle('github.createFile.title')).toBeInTheDocument();
        });

        it('should go back to repo list when back button clicked', () => {
            render(<GitHubExplorer />);

            fireEvent.click(screen.getByTitle('Back to repositories'));

            expect(mockSelectRepo).toHaveBeenCalledWith(null);
        });

        it('should show markdown only checkbox', () => {
            render(<GitHubExplorer />);

            expect(screen.getByText('Markdown only')).toBeInTheDocument();
        });

        it('should toggle markdown filter when checkbox clicked', () => {
            render(<GitHubExplorer />);

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeChecked();

            fireEvent.click(checkbox);
            expect(checkbox).not.toBeChecked();
        });

        it('should show file tree loading state', () => {
            mockTreeLoading.mockReturnValue(true);

            render(<GitHubExplorer />);

            expect(screen.getByText('Loading files...')).toBeInTheDocument();
        });

        it('should show no markdown files message when filtered tree is empty', () => {
            mockFileTree.set('user/test-repo', []);

            render(<GitHubExplorer />);

            expect(screen.getByText('No markdown files found')).toBeInTheDocument();
        });

        it('should render file tree nodes', () => {
            render(<GitHubExplorer />);

            expect(screen.getByText('src')).toBeInTheDocument();
            expect(screen.getByText('README.md')).toBeInTheDocument();
        });

        it('should show folder icons for directories', () => {
            render(<GitHubExplorer />);

            expect(screen.getByTestId('icon-folder')).toBeInTheDocument();
        });

        it('should show file text icons for markdown files', () => {
            render(<GitHubExplorer />);

            expect(screen.getAllByTestId('icon-file-text').length).toBeGreaterThan(0);
        });

        it('should toggle directory expansion when clicked', () => {
            render(<GitHubExplorer />);

            fireEvent.click(screen.getByText('src'));

            expect(mockToggleExpanded).toHaveBeenCalledWith('src');
        });

        it('should open create file modal when plus button clicked', () => {
            render(<GitHubExplorer />);

            fireEvent.click(screen.getByTitle('github.createFile.title'));

            expect(screen.getByTestId('create-file-modal')).toBeInTheDocument();
        });

        it('should close create file modal', () => {
            render(<GitHubExplorer />);

            fireEvent.click(screen.getByTitle('github.createFile.title'));
            fireEvent.click(screen.getByTestId('close-create-modal'));

            expect(screen.queryByTestId('create-file-modal')).not.toBeInTheDocument();
        });

        it('should handle file creation success', async () => {
            mockFetchFileTree.mockResolvedValue(mockFileTreeNodes);

            render(<GitHubExplorer />);

            fireEvent.click(screen.getByTitle('github.createFile.title'));
            fireEvent.click(screen.getByTestId('create-file-success'));

            await waitFor(() => {
                expect(mockCreateDocument).toHaveBeenCalled();
            });
        });
    });

    describe('file selection', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockSelectedRepo.mockReturnValue(mockRepo);
            mockFileTree.set('user/test-repo', mockFileTreeNodes);
            mockFindDocumentByGitHub.mockReturnValue(null);
        });

        it('should load and open file when markdown file clicked', async () => {
            const onFileOpened = vi.fn();
            mockFetchFileContent.mockResolvedValue({ content: '# Test', sha: 'sha123' });

            render(<GitHubExplorer onFileOpened={onFileOpened} />);

            fireEvent.click(screen.getByText('README.md'));

            await waitFor(() => {
                expect(mockFetchFileContent).toHaveBeenCalledWith('user/test-repo', 'README.md', 'main');
                expect(mockCreateDocument).toHaveBeenCalled();
                expect(onFileOpened).toHaveBeenCalled();
            });
        });

        it('should open existing document if already loaded', async () => {
            const existingDoc = { id: 'doc-1', name: 'README.md' };
            mockFindDocumentByGitHub.mockReturnValue(existingDoc);
            const onFileOpened = vi.fn();

            render(<GitHubExplorer onFileOpened={onFileOpened} />);

            fireEvent.click(screen.getByText('README.md'));

            await waitFor(() => {
                expect(mockOpenDocument).toHaveBeenCalledWith('doc-1');
                expect(onFileOpened).toHaveBeenCalled();
            });
        });

        it('should call onFileSelect callback when file is selected', async () => {
            const onFileSelect = vi.fn();
            mockFetchFileContent.mockResolvedValue({ content: '# Test', sha: 'sha123' });

            render(<GitHubExplorer onFileSelect={onFileSelect} />);

            fireEvent.click(screen.getByText('README.md'));

            await waitFor(() => {
                expect(onFileSelect).toHaveBeenCalledWith(mockRepo, expect.objectContaining({ name: 'README.md' }));
            });
        });
    });

    describe('file deletion', () => {
        beforeEach(() => {
            mockIsConnected.mockReturnValue(true);
            mockSelectedRepo.mockReturnValue(mockRepo);
            mockFileTree.set('user/test-repo', mockFileTreeNodes);
        });

        it('should open delete modal when delete is triggered', () => {
            render(<GitHubExplorer />);

            // Trigger delete through context menu mock - get the last one (README.md)
            const fileContextMenus = screen.getAllByTestId('file-context-menu');
            const lastMenu = fileContextMenus[fileContextMenus.length - 1];
            fireEvent.click(lastMenu);

            expect(screen.getByTestId('delete-file-modal')).toBeInTheDocument();
        });

        it('should close delete modal when cancel clicked', () => {
            render(<GitHubExplorer />);

            const fileContextMenus = screen.getAllByTestId('file-context-menu');
            const lastMenu = fileContextMenus[fileContextMenus.length - 1];
            fireEvent.click(lastMenu);

            fireEvent.click(screen.getByTestId('close-delete-modal'));

            expect(screen.queryByTestId('delete-file-modal')).not.toBeInTheDocument();
        });

        it('should refresh file tree after successful deletion', async () => {
            mockFetchFileTree.mockResolvedValue([]);

            render(<GitHubExplorer />);

            const fileContextMenus = screen.getAllByTestId('file-context-menu');
            const lastMenu = fileContextMenus[fileContextMenus.length - 1];
            fireEvent.click(lastMenu);

            fireEvent.click(screen.getByTestId('delete-file-success'));

            await waitFor(() => {
                expect(mockFetchFileTree).toHaveBeenCalled();
                expect(mockSetFileTree).toHaveBeenCalled();
            });
        });
    });

    describe('connection check on mount', () => {
        it('should check connection on mount', async () => {
            mockCheckConnection.mockResolvedValue({
                connected: true,
                user: { login: 'testuser', name: 'Test User', avatar: 'https://example.com/avatar.png' }
            });

            render(<GitHubExplorer />);

            await waitFor(() => {
                expect(mockCheckConnection).toHaveBeenCalled();
            });
        });

        it('should set connected state when connection succeeds', async () => {
            mockCheckConnection.mockResolvedValue({
                connected: true,
                user: { login: 'testuser', name: 'Test User', avatar: 'https://example.com/avatar.png' }
            });

            render(<GitHubExplorer />);

            await waitFor(() => {
                expect(mockSetConnected).toHaveBeenCalledWith(true, expect.objectContaining({ login: 'testuser' }));
            });
        });

        it('should handle connection error', async () => {
            mockCheckConnection.mockRejectedValue(new Error('Network error'));

            render(<GitHubExplorer />);

            await waitFor(() => {
                expect(mockSetConnected).toHaveBeenCalledWith(false);
                expect(mockSetError).toHaveBeenCalledWith('Network error');
            });
        });
    });

    describe('repository fetching', () => {
        it('should fetch repositories when connected', async () => {
            mockIsConnected.mockReturnValue(true);
            mockFetchRepositories.mockResolvedValue([mockRepo]);

            render(<GitHubExplorer />);

            await waitFor(() => {
                expect(mockFetchRepositories).toHaveBeenCalled();
            });
        });

        it('should handle repository fetch error', async () => {
            mockIsConnected.mockReturnValue(true);
            mockFetchRepositories.mockRejectedValue(new Error('API error'));

            render(<GitHubExplorer />);

            await waitFor(() => {
                expect(mockSetError).toHaveBeenCalledWith('API error');
            });
        });
    });
});
