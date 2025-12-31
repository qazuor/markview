import { useGitHubSave } from '@/hooks/useGitHubSave';
import type { Document } from '@/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock GitHub service
const mockSaveFile = vi.fn();
vi.mock('@/services/github', () => ({
    saveFile: (params: unknown) => mockSaveFile(params)
}));

// Mock document store
const mockDocumentStore = new Map<string, Document>();
vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: {
        getState: () => ({
            documents: mockDocumentStore
        }),
        setState: vi.fn()
    }
}));

describe('useGitHubSave', () => {
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();
    const mockOnConflict = vi.fn();

    const createGitHubDocument = (overrides: Partial<Document> = {}): Document => ({
        id: 'doc-1',
        name: 'test.md',
        content: '# Test',
        source: 'github',
        syncStatus: 'synced',
        createdAt: '2024-01-01T00:00:00Z',
        modifiedAt: '2024-01-01T00:00:00Z',
        githubInfo: {
            owner: 'testuser',
            repo: 'testrepo',
            path: 'docs/test.md',
            sha: 'abc123',
            branch: 'main'
        },
        ...overrides
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockDocumentStore.clear();
    });

    describe('initial state', () => {
        it('should return initial state', () => {
            const { result } = renderHook(() => useGitHubSave());

            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.showCommitModal).toBe(false);
            expect(result.current.pendingDocument).toBeNull();
        });

        it('should expose all required methods', () => {
            const { result } = renderHook(() => useGitHubSave());

            expect(typeof result.current.saveToGitHub).toBe('function');
            expect(typeof result.current.openCommitModal).toBe('function');
            expect(typeof result.current.closeCommitModal).toBe('function');
            expect(typeof result.current.confirmCommit).toBe('function');
        });
    });

    describe('saveToGitHub', () => {
        it('should fail if document has no githubInfo', async () => {
            const { result } = renderHook(() => useGitHubSave({ onError: mockOnError }));

            const document = createGitHubDocument({ githubInfo: undefined });

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGitHub(document, 'commit message');
            });

            expect(success).toBe(false);
            expect(result.current.error?.message).toBe('Document is not from GitHub');
        });

        it('should call saveFile with correct parameters', async () => {
            mockSaveFile.mockResolvedValue({ success: true, sha: 'newsha123' });
            const document = createGitHubDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGitHubSave({ onSuccess: mockOnSuccess }));

            await act(async () => {
                await result.current.saveToGitHub(document, 'Update test.md');
            });

            expect(mockSaveFile).toHaveBeenCalledWith({
                repo: 'testuser/testrepo',
                path: 'docs/test.md',
                content: '# Test',
                message: 'Update test.md',
                sha: 'abc123',
                branch: 'main'
            });
        });

        it('should call onSuccess with new SHA on success', async () => {
            mockSaveFile.mockResolvedValue({ success: true, sha: 'newsha123' });
            const document = createGitHubDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGitHubSave({ onSuccess: mockOnSuccess }));

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGitHub(document, 'Update test.md');
            });

            expect(success).toBe(true);
            expect(mockOnSuccess).toHaveBeenCalledWith('newsha123');
        });

        it('should set isSaving to true during save', async () => {
            let resolvePromise: () => void;
            const savePromise = new Promise<void>((resolve) => {
                resolvePromise = resolve;
            });
            mockSaveFile.mockReturnValue(savePromise.then(() => ({ success: true, sha: 'newsha' })));

            const document = createGitHubDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGitHubSave());

            let saveResultPromise: Promise<boolean> | undefined;
            act(() => {
                saveResultPromise = result.current.saveToGitHub(document, 'message');
            });

            // Should be saving
            await waitFor(() => {
                expect(result.current.isSaving).toBe(true);
            });

            // Resolve the save
            await act(async () => {
                resolvePromise();
                await saveResultPromise;
            });

            expect(result.current.isSaving).toBe(false);
        });

        it('should call onError when save fails', async () => {
            mockSaveFile.mockRejectedValue(new Error('Network error'));
            const document = createGitHubDocument();

            const { result } = renderHook(() => useGitHubSave({ onError: mockOnError }));

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGitHub(document, 'message');
            });

            expect(success).toBe(false);
            expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
            expect(result.current.error?.message).toBe('Network error');
        });

        it('should call onConflict when conflict is detected', async () => {
            mockSaveFile.mockRejectedValue(new Error('Conflict: file was modified'));
            const document = createGitHubDocument();

            const { result } = renderHook(() => useGitHubSave({ onConflict: mockOnConflict }));

            await act(async () => {
                await result.current.saveToGitHub(document, 'message');
            });

            expect(mockOnConflict).toHaveBeenCalled();
            expect(mockOnError).not.toHaveBeenCalled();
        });

        it('should call onConflict for 409 errors', async () => {
            mockSaveFile.mockRejectedValue(new Error('409: Conflict'));
            const document = createGitHubDocument();

            const { result } = renderHook(() => useGitHubSave({ onConflict: mockOnConflict }));

            await act(async () => {
                await result.current.saveToGitHub(document, 'message');
            });

            expect(mockOnConflict).toHaveBeenCalled();
        });

        it('should handle result with success false', async () => {
            mockSaveFile.mockResolvedValue({ success: false, error: 'Custom error' });
            const document = createGitHubDocument();

            const { result } = renderHook(() => useGitHubSave({ onError: mockOnError }));

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGitHub(document, 'message');
            });

            expect(success).toBe(false);
            expect(result.current.error?.message).toBe('Custom error');
        });
    });

    describe('commit modal', () => {
        it('should open commit modal with document', () => {
            const document = createGitHubDocument();
            const { result } = renderHook(() => useGitHubSave());

            act(() => {
                result.current.openCommitModal(document);
            });

            expect(result.current.showCommitModal).toBe(true);
            expect(result.current.pendingDocument).toEqual(document);
        });

        it('should clear error when opening modal', () => {
            const document = createGitHubDocument();
            const { result } = renderHook(() => useGitHubSave());

            // First set an error
            act(() => {
                result.current.openCommitModal(createGitHubDocument({ githubInfo: undefined }));
            });

            // Now open with valid document
            act(() => {
                result.current.openCommitModal(document);
            });

            expect(result.current.error).toBeNull();
        });

        it('should close commit modal and clear state', () => {
            const document = createGitHubDocument();
            const { result } = renderHook(() => useGitHubSave());

            act(() => {
                result.current.openCommitModal(document);
            });

            act(() => {
                result.current.closeCommitModal();
            });

            expect(result.current.showCommitModal).toBe(false);
            expect(result.current.pendingDocument).toBeNull();
            expect(result.current.error).toBeNull();
        });
    });

    describe('confirmCommit', () => {
        it('should save pending document with provided message', async () => {
            mockSaveFile.mockResolvedValue({ success: true, sha: 'newsha' });
            const document = createGitHubDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGitHubSave({ onSuccess: mockOnSuccess }));

            act(() => {
                result.current.openCommitModal(document);
            });

            await act(async () => {
                await result.current.confirmCommit('My commit message');
            });

            expect(mockSaveFile).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'My commit message'
                })
            );
        });

        it('should close modal on successful commit', async () => {
            mockSaveFile.mockResolvedValue({ success: true, sha: 'newsha' });
            const document = createGitHubDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGitHubSave());

            act(() => {
                result.current.openCommitModal(document);
            });

            await act(async () => {
                await result.current.confirmCommit('message');
            });

            expect(result.current.showCommitModal).toBe(false);
            expect(result.current.pendingDocument).toBeNull();
        });

        it('should keep modal open on failed commit', async () => {
            mockSaveFile.mockRejectedValue(new Error('Failed'));
            const document = createGitHubDocument();

            const { result } = renderHook(() => useGitHubSave());

            act(() => {
                result.current.openCommitModal(document);
            });

            await act(async () => {
                await result.current.confirmCommit('message');
            });

            expect(result.current.showCommitModal).toBe(true);
            expect(result.current.error).not.toBeNull();
        });

        it('should do nothing if no pending document', async () => {
            const { result } = renderHook(() => useGitHubSave());

            await act(async () => {
                await result.current.confirmCommit('message');
            });

            expect(mockSaveFile).not.toHaveBeenCalled();
        });
    });
});
