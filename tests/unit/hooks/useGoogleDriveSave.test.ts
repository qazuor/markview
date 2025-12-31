import { useGoogleDriveSave } from '@/hooks/useGoogleDriveSave';
import type { Document } from '@/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Google Drive service
const mockFileOperation = vi.fn();
const mockClearAllCaches = vi.fn();
vi.mock('@/services/gdrive', () => ({
    fileOperation: (params: unknown) => mockFileOperation(params),
    clearAllCaches: () => mockClearAllCaches()
}));

// Mock document store
const mockDocumentStore = new Map<string, Document>();
const mockSetSyncStatus = vi.fn();
vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: {
        getState: () => ({
            documents: mockDocumentStore,
            setSyncStatus: mockSetSyncStatus
        }),
        setState: vi.fn(),
        subscribe: vi.fn(() => vi.fn())
    }
}));

describe('useGoogleDriveSave', () => {
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    const createDriveDocument = (overrides: Partial<Document> = {}): Document => ({
        id: 'doc-1',
        name: 'test.md',
        content: '# Test',
        source: 'gdrive',
        syncStatus: 'synced',
        createdAt: '2024-01-01T00:00:00Z',
        modifiedAt: '2024-01-01T00:00:00Z',
        driveInfo: {
            fileId: 'file123',
            mimeType: 'text/markdown',
            parentId: 'folder456'
        },
        ...overrides
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockDocumentStore.clear();
    });

    describe('initial state', () => {
        it('should return initial state', () => {
            const { result } = renderHook(() => useGoogleDriveSave());

            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should expose saveToGoogleDrive method', () => {
            const { result } = renderHook(() => useGoogleDriveSave());

            expect(typeof result.current.saveToGoogleDrive).toBe('function');
        });
    });

    describe('saveToGoogleDrive', () => {
        it('should fail if document has no driveInfo', async () => {
            const { result } = renderHook(() => useGoogleDriveSave({ onError: mockOnError }));

            const document = createDriveDocument({ driveInfo: undefined });

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGoogleDrive(document);
            });

            expect(success).toBe(false);
            expect(result.current.error?.message).toBe('Document is not from Google Drive');
            expect(mockOnError).toHaveBeenCalled();
        });

        it('should call fileOperation with update operation', async () => {
            mockFileOperation.mockResolvedValue({ success: true });
            const document = createDriveDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGoogleDriveSave({ onSuccess: mockOnSuccess }));

            await act(async () => {
                await result.current.saveToGoogleDrive(document);
            });

            expect(mockFileOperation).toHaveBeenCalledWith({
                operation: 'update',
                fileId: 'file123',
                content: '# Test'
            });
        });

        it('should set sync status to syncing before save', async () => {
            mockFileOperation.mockResolvedValue({ success: true });
            const document = createDriveDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGoogleDriveSave());

            await act(async () => {
                await result.current.saveToGoogleDrive(document);
            });

            expect(mockSetSyncStatus).toHaveBeenCalledWith('doc-1', 'syncing');
        });

        it('should call onSuccess with fileId on success', async () => {
            mockFileOperation.mockResolvedValue({ success: true });
            const document = createDriveDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGoogleDriveSave({ onSuccess: mockOnSuccess }));

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGoogleDrive(document);
            });

            expect(success).toBe(true);
            expect(mockOnSuccess).toHaveBeenCalledWith('file123');
        });

        it('should clear caches on success', async () => {
            mockFileOperation.mockResolvedValue({ success: true });
            const document = createDriveDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGoogleDriveSave());

            await act(async () => {
                await result.current.saveToGoogleDrive(document);
            });

            expect(mockClearAllCaches).toHaveBeenCalled();
        });

        it('should set isSaving to true during save', async () => {
            let resolvePromise: () => void;
            const savePromise = new Promise<void>((resolve) => {
                resolvePromise = resolve;
            });
            mockFileOperation.mockReturnValue(savePromise.then(() => ({ success: true })));

            const document = createDriveDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGoogleDriveSave());

            let saveResultPromise: Promise<boolean> | undefined;
            act(() => {
                saveResultPromise = result.current.saveToGoogleDrive(document);
            });

            await waitFor(() => {
                expect(result.current.isSaving).toBe(true);
            });

            await act(async () => {
                resolvePromise();
                await saveResultPromise;
            });

            expect(result.current.isSaving).toBe(false);
        });

        it('should prevent concurrent saves', async () => {
            let resolveFirst: () => void;
            const firstPromise = new Promise<void>((resolve) => {
                resolveFirst = resolve;
            });
            mockFileOperation.mockReturnValueOnce(firstPromise.then(() => ({ success: true })));

            const document = createDriveDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGoogleDriveSave());

            let firstResult: Promise<boolean> | undefined;
            act(() => {
                firstResult = result.current.saveToGoogleDrive(document);
            });

            // Wait for first save to start
            await waitFor(() => {
                expect(result.current.isSaving).toBe(true);
            });

            // Try second save while first is in progress
            let secondResult: boolean | undefined;
            await act(async () => {
                secondResult = await result.current.saveToGoogleDrive(document);
            });

            expect(secondResult).toBe(false);
            expect(mockFileOperation).toHaveBeenCalledTimes(1);

            // Cleanup
            await act(async () => {
                resolveFirst();
                await firstResult;
            });
        });

        it('should call onError when save fails', async () => {
            mockFileOperation.mockRejectedValue(new Error('Network error'));
            const document = createDriveDocument();

            const { result } = renderHook(() => useGoogleDriveSave({ onError: mockOnError }));

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGoogleDrive(document);
            });

            expect(success).toBe(false);
            expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
            expect(result.current.error?.message).toBe('Network error');
        });

        it('should set sync status to error on failure', async () => {
            mockFileOperation.mockRejectedValue(new Error('Failed'));
            const document = createDriveDocument();

            const { result } = renderHook(() => useGoogleDriveSave());

            await act(async () => {
                await result.current.saveToGoogleDrive(document);
            });

            expect(mockSetSyncStatus).toHaveBeenCalledWith('doc-1', 'error');
        });

        it('should handle result with success false', async () => {
            mockFileOperation.mockResolvedValue({ success: false, error: 'Custom error' });
            const document = createDriveDocument();

            const { result } = renderHook(() => useGoogleDriveSave({ onError: mockOnError }));

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGoogleDrive(document);
            });

            expect(success).toBe(false);
            expect(result.current.error?.message).toBe('Custom error');
        });
    });

    describe('callback options', () => {
        it('should work without callbacks', async () => {
            mockFileOperation.mockResolvedValue({ success: true });
            const document = createDriveDocument();
            mockDocumentStore.set(document.id, document);

            const { result } = renderHook(() => useGoogleDriveSave());

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGoogleDrive(document);
            });

            expect(success).toBe(true);
        });

        it('should handle error without onError callback', async () => {
            mockFileOperation.mockRejectedValue(new Error('Failed'));
            const document = createDriveDocument();

            const { result } = renderHook(() => useGoogleDriveSave());

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.saveToGoogleDrive(document);
            });

            expect(success).toBe(false);
            expect(result.current.error).not.toBeNull();
        });
    });
});
