import { useMarkdown } from '@/components/preview/hooks/useMarkdown';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock markdown service with hoisted mock
const { mockRenderMarkdown } = vi.hoisted(() => ({
    mockRenderMarkdown: vi.fn()
}));

vi.mock('@/services/markdown', () => ({
    renderMarkdown: (...args: unknown[]) => mockRenderMarkdown(...args)
}));

describe('useMarkdown', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRenderMarkdown.mockResolvedValue('<p>Rendered HTML</p>');
    });

    describe('initial state', () => {
        it('should return empty html initially', () => {
            const { result } = renderHook(() => useMarkdown('# Test'));

            expect(result.current.html).toBe('');
        });

        it('should return no error initially', () => {
            const { result } = renderHook(() => useMarkdown('# Test'));

            expect(result.current.error).toBeNull();
        });
    });

    describe('markdown processing', () => {
        it('should render markdown and return html', async () => {
            mockRenderMarkdown.mockResolvedValue('<h1>Hello</h1>');

            const { result } = renderHook(() => useMarkdown('# Hello'));

            await waitFor(() => {
                expect(result.current.html).toBe('<h1>Hello</h1>');
            });
        });

        it('should call renderMarkdown with content and theme', async () => {
            renderHook(() => useMarkdown('# Test', { theme: 'dark' }));

            await waitFor(() => {
                expect(mockRenderMarkdown).toHaveBeenCalledWith('# Test', 'dark');
            });
        });

        it('should use light theme by default', async () => {
            renderHook(() => useMarkdown('# Test'));

            await waitFor(() => {
                expect(mockRenderMarkdown).toHaveBeenCalledWith('# Test', 'light');
            });
        });

        it('should set isLoading to false after processing', async () => {
            const { result } = renderHook(() => useMarkdown('# Test'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });

    describe('error handling', () => {
        it('should set error when rendering fails', async () => {
            mockRenderMarkdown.mockRejectedValue(new Error('Render failed'));

            const { result } = renderHook(() => useMarkdown('# Test'));

            await waitFor(() => {
                expect(result.current.error).toBeInstanceOf(Error);
                expect(result.current.error?.message).toBe('Render failed');
            });
        });

        it('should wrap non-Error objects in Error', async () => {
            mockRenderMarkdown.mockRejectedValue('Unknown error');

            const { result } = renderHook(() => useMarkdown('# Test'));

            await waitFor(() => {
                expect(result.current.error).toBeInstanceOf(Error);
            });
        });
    });

    describe('options', () => {
        it('should accept custom debounceMs option', () => {
            const { result } = renderHook(() => useMarkdown('# Test', { debounceMs: 500 }));

            expect(result.current.html).toBe('');
        });

        it('should accept theme option', async () => {
            renderHook(() => useMarkdown('# Test', { theme: 'dark' }));

            await waitFor(() => {
                expect(mockRenderMarkdown).toHaveBeenCalledWith('# Test', 'dark');
            });
        });
    });

    describe('empty content', () => {
        it('should process empty content', async () => {
            renderHook(() => useMarkdown(''));

            await waitFor(() => {
                expect(mockRenderMarkdown).toHaveBeenCalledWith('', 'light');
            });
        });
    });

    describe('return values', () => {
        it('should return html string', async () => {
            mockRenderMarkdown.mockResolvedValue('<p>Test</p>');

            const { result } = renderHook(() => useMarkdown('Test'));

            await waitFor(() => {
                expect(typeof result.current.html).toBe('string');
            });
        });

        it('should return isLoading boolean', () => {
            const { result } = renderHook(() => useMarkdown('# Test'));

            expect(typeof result.current.isLoading).toBe('boolean');
        });

        it('should return error or null', () => {
            const { result } = renderHook(() => useMarkdown('# Test'));

            expect(result.current.error === null || result.current.error instanceof Error).toBe(true);
        });
    });
});
