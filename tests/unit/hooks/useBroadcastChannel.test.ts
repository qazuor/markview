import { useBroadcastChannel, usePreviewSync } from '@/hooks/useBroadcastChannel';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useBroadcastChannel', () => {
    let mockChannel: {
        postMessage: ReturnType<typeof vi.fn>;
        close: ReturnType<typeof vi.fn>;
        onmessage: ((event: MessageEvent) => void) | null;
        onmessageerror: (() => void) | null;
    };

    beforeEach(() => {
        mockChannel = {
            postMessage: vi.fn(),
            close: vi.fn(),
            onmessage: null,
            onmessageerror: null
        };

        // @ts-expect-error - Mock BroadcastChannel
        global.BroadcastChannel = vi.fn(() => mockChannel);

        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('useBroadcastChannel hook', () => {
        it('should initialize and connect', () => {
            const { result } = renderHook(() => useBroadcastChannel({ channelName: 'test-channel' }));

            expect(global.BroadcastChannel).toHaveBeenCalledWith('test-channel');
            expect(result.current.isConnected).toBe(true);
            expect(result.current.lastMessage).toBeNull();
        });

        it('should post messages', () => {
            const { result } = renderHook(() => useBroadcastChannel<{ type: string }>({ channelName: 'test-channel' }));

            act(() => {
                result.current.postMessage({ type: 'test' });
            });

            expect(mockChannel.postMessage).toHaveBeenCalledWith({ type: 'test' });
        });

        it('should receive messages', () => {
            const onMessage = vi.fn();
            const { result } = renderHook(() =>
                useBroadcastChannel<{ data: string }>({
                    channelName: 'test-channel',
                    onMessage
                })
            );

            // Simulate incoming message
            act(() => {
                mockChannel.onmessage?.({ data: { data: 'hello' } } as MessageEvent);
            });

            expect(onMessage).toHaveBeenCalledWith({ data: 'hello' });
            expect(result.current.lastMessage).toEqual({ data: 'hello' });
        });

        it('should close channel on unmount', () => {
            const { unmount } = renderHook(() => useBroadcastChannel({ channelName: 'test-channel' }));

            unmount();

            expect(mockChannel.close).toHaveBeenCalled();
        });

        it('should handle message errors', () => {
            renderHook(() => useBroadcastChannel({ channelName: 'test-channel' }));

            act(() => {
                mockChannel.onmessageerror?.();
            });

            expect(console.error).toHaveBeenCalledWith('BroadcastChannel message error');
        });

        it('should warn when BroadcastChannel is not supported', () => {
            // @ts-expect-error - Remove BroadcastChannel
            global.BroadcastChannel = undefined;

            const { result } = renderHook(() => useBroadcastChannel({ channelName: 'test-channel' }));

            expect(console.warn).toHaveBeenCalledWith('BroadcastChannel is not supported in this browser');
            expect(result.current.isConnected).toBe(false);
        });
    });
});

describe('usePreviewSync', () => {
    let mockChannel: {
        postMessage: ReturnType<typeof vi.fn>;
        close: ReturnType<typeof vi.fn>;
        onmessage: ((event: MessageEvent) => void) | null;
        onmessageerror: (() => void) | null;
    };

    beforeEach(() => {
        mockChannel = {
            postMessage: vi.fn(),
            close: vi.fn(),
            onmessage: null,
            onmessageerror: null
        };

        // @ts-expect-error - Mock BroadcastChannel
        global.BroadcastChannel = vi.fn(() => mockChannel);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('main window', () => {
        it('should sync content', () => {
            const { result } = renderHook(() => usePreviewSync(true));

            act(() => {
                result.current.syncContent('# Hello', 'dark');
            });

            expect(mockChannel.postMessage).toHaveBeenCalledWith({
                type: 'content',
                payload: { content: '# Hello', theme: 'dark' }
            });
        });

        it('should send disconnect on unload', () => {
            const { result } = renderHook(() => usePreviewSync(true));

            expect(result.current.isEditorConnected).toBe(true);

            act(() => {
                window.dispatchEvent(new Event('beforeunload'));
            });

            expect(mockChannel.postMessage).toHaveBeenCalledWith({
                type: 'disconnect',
                payload: {}
            });
        });

        it('should handle content request', () => {
            const onContentRequest = vi.fn();
            renderHook(() => usePreviewSync(true, onContentRequest));

            act(() => {
                mockChannel.onmessage?.({ data: { type: 'request', payload: {} } } as MessageEvent);
            });

            expect(onContentRequest).toHaveBeenCalled();
        });
    });

    describe('preview window', () => {
        it('should request content on connect', () => {
            renderHook(() => usePreviewSync(false));

            expect(mockChannel.postMessage).toHaveBeenCalledWith({
                type: 'request',
                payload: {}
            });
        });

        it('should receive content updates', () => {
            const { result } = renderHook(() => usePreviewSync(false));

            act(() => {
                mockChannel.onmessage?.({
                    data: {
                        type: 'content',
                        payload: { content: '# Title', theme: 'dark' }
                    }
                } as MessageEvent);
            });

            expect(result.current.content).toBe('# Title');
            expect(result.current.theme).toBe('dark');
            expect(result.current.isEditorConnected).toBe(true);
        });

        it('should receive theme updates', () => {
            const { result } = renderHook(() => usePreviewSync(false));

            act(() => {
                mockChannel.onmessage?.({
                    data: {
                        type: 'theme',
                        payload: { theme: 'dark' }
                    }
                } as MessageEvent);
            });

            expect(result.current.theme).toBe('dark');
        });

        it('should handle disconnect', () => {
            const { result } = renderHook(() => usePreviewSync(false));

            // First connect
            act(() => {
                mockChannel.onmessage?.({
                    data: { type: 'content', payload: { content: 'test' } }
                } as MessageEvent);
            });

            expect(result.current.isEditorConnected).toBe(true);

            // Then disconnect
            act(() => {
                mockChannel.onmessage?.({
                    data: { type: 'disconnect', payload: {} }
                } as MessageEvent);
            });

            expect(result.current.isEditorConnected).toBe(false);
        });

        it('should not sync content from preview window', () => {
            const { result } = renderHook(() => usePreviewSync(false));

            mockChannel.postMessage.mockClear();

            act(() => {
                result.current.syncContent('# Test', 'light');
            });

            // Should not post content from preview window
            expect(mockChannel.postMessage).not.toHaveBeenCalledWith({
                type: 'content',
                payload: expect.anything()
            });
        });
    });
});
