import type { FileImportResult } from '@/hooks/useFileImport';
import { useFileImport } from '@/hooks/useFileImport';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Create mocks
const mockCreateDocument = vi.fn().mockReturnValue('new-doc-id');
const mockUpdateContent = vi.fn();
const mockRenameDocument = vi.fn();

// Mock the document store module
vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: (selector: (state: unknown) => unknown) => {
        const state = {
            createDocument: mockCreateDocument,
            updateContent: mockUpdateContent,
            renameDocument: mockRenameDocument
        };
        return selector(state);
    }
}));

describe('useFileImport', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Reset mocks
        mockCreateDocument.mockClear().mockReturnValue('new-doc-id');
        mockUpdateContent.mockClear();
        mockRenameDocument.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('isValidFile', () => {
        it('should accept .md files', () => {
            const { result } = renderHook(() => useFileImport());

            const file = new File(['content'], 'test.md', { type: 'text/markdown' });
            expect(result.current.isValidFile(file)).toBe(true);
        });

        it('should accept .markdown files', () => {
            const { result } = renderHook(() => useFileImport());

            const file = new File(['content'], 'test.markdown', { type: 'text/markdown' });
            expect(result.current.isValidFile(file)).toBe(true);
        });

        it('should accept .txt files', () => {
            const { result } = renderHook(() => useFileImport());

            const file = new File(['content'], 'test.txt', { type: 'text/plain' });
            expect(result.current.isValidFile(file)).toBe(true);
        });

        it('should accept .mdx files', () => {
            const { result } = renderHook(() => useFileImport());

            const file = new File(['content'], 'test.mdx', { type: 'text/mdx' });
            expect(result.current.isValidFile(file)).toBe(true);
        });

        it('should reject unsupported extensions', () => {
            const { result } = renderHook(() => useFileImport());

            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            expect(result.current.isValidFile(file)).toBe(false);
        });

        it('should be case insensitive', () => {
            const { result } = renderHook(() => useFileImport());

            const file = new File(['content'], 'test.MD', { type: 'text/markdown' });
            expect(result.current.isValidFile(file)).toBe(true);
        });
    });

    describe('importFile', () => {
        it('should import a valid markdown file', async () => {
            const { result } = renderHook(() => useFileImport());

            const file = new File(['# Hello World'], 'document.md', { type: 'text/markdown' });

            let importResult: FileImportResult | undefined;
            await act(async () => {
                importResult = await result.current.importFile(file);
            });

            expect(importResult).toEqual({ success: true, documentId: 'new-doc-id' });
            expect(mockCreateDocument).toHaveBeenCalled();
            expect(mockUpdateContent).toHaveBeenCalledWith('new-doc-id', '# Hello World');
            expect(mockRenameDocument).toHaveBeenCalledWith('new-doc-id', 'document', true);
        });

        it('should reject unsupported file types', async () => {
            const { result } = renderHook(() => useFileImport());

            const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });

            let importResult: FileImportResult | undefined;
            await act(async () => {
                importResult = await result.current.importFile(file);
            });

            expect(importResult?.success).toBe(false);
            expect(importResult?.error).toContain('Unsupported file type');
        });

        it('should reject files that are too large', async () => {
            const { result } = renderHook(() => useFileImport());

            // Create a mock file with size > 10MB
            const largeContent = 'x'.repeat(11 * 1024 * 1024);
            const file = new File([largeContent], 'large.md', { type: 'text/markdown' });

            let importResult: FileImportResult | undefined;
            await act(async () => {
                importResult = await result.current.importFile(file);
            });

            expect(importResult?.success).toBe(false);
            expect(importResult?.error).toContain('too large');
        });

        it('should handle file read errors', async () => {
            const { result } = renderHook(() => useFileImport());

            // Mock FileReader to fail
            const mockReader = {
                readAsText: vi.fn(),
                onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
                onerror: null as (() => void) | null
            };

            vi.spyOn(global, 'FileReader').mockImplementation(() => {
                setTimeout(() => {
                    mockReader.onerror?.();
                }, 0);
                return mockReader as unknown as FileReader;
            });

            const file = new File(['content'], 'test.md', { type: 'text/markdown' });

            let importResult: FileImportResult | undefined;
            await act(async () => {
                importResult = await result.current.importFile(file);
            });

            expect(importResult?.success).toBe(false);
            expect(importResult?.error).toBe('Failed to read file');
        });
    });

    describe('importFiles', () => {
        it('should import multiple files', async () => {
            const { result } = renderHook(() => useFileImport());

            const files = [
                new File(['# Doc 1'], 'doc1.md', { type: 'text/markdown' }),
                new File(['# Doc 2'], 'doc2.md', { type: 'text/markdown' })
            ];

            let results: FileImportResult[] | undefined;
            await act(async () => {
                results = await result.current.importFiles(files);
            });

            expect(results).toHaveLength(2);
            expect(results?.[0]?.success).toBe(true);
            expect(results?.[1]?.success).toBe(true);
        });

        it('should handle mixed valid and invalid files', async () => {
            const { result } = renderHook(() => useFileImport());

            const files = [
                new File(['# Valid'], 'valid.md', { type: 'text/markdown' }),
                new File(['Invalid'], 'invalid.pdf', { type: 'application/pdf' })
            ];

            let results: FileImportResult[] | undefined;
            await act(async () => {
                results = await result.current.importFiles(files);
            });

            expect(results).toHaveLength(2);
            expect(results?.[0]?.success).toBe(true);
            expect(results?.[1]?.success).toBe(false);
        });
    });

    describe('supportedExtensions', () => {
        it('should expose supported extensions', () => {
            const { result } = renderHook(() => useFileImport());

            expect(result.current.supportedExtensions).toEqual(['.md', '.markdown', '.txt', '.mdx']);
        });
    });

    describe('openFileDialog', () => {
        it('should create and click file input', () => {
            const { result } = renderHook(() => useFileImport());

            const mockInput = {
                type: '',
                accept: '',
                multiple: false,
                onchange: null as ((e: Event) => void) | null,
                click: vi.fn()
            };

            vi.spyOn(document, 'createElement').mockReturnValue(mockInput as unknown as HTMLInputElement);

            act(() => {
                result.current.openFileDialog();
            });

            expect(mockInput.type).toBe('file');
            expect(mockInput.accept).toContain('.md');
            expect(mockInput.multiple).toBe(true);
            expect(mockInput.click).toHaveBeenCalled();
        });
    });
});
