import { useCallback, useEffect, useRef, useState } from 'react';

interface UseBroadcastChannelOptions<T> {
    channelName: string;
    onMessage?: (message: T) => void;
}

interface UseBroadcastChannelReturn<T> {
    postMessage: (message: T) => void;
    lastMessage: T | null;
    isConnected: boolean;
}

/**
 * Hook for BroadcastChannel communication between tabs/windows
 */
export function useBroadcastChannel<T>(options: UseBroadcastChannelOptions<T>): UseBroadcastChannelReturn<T> {
    const { channelName, onMessage } = options;

    const channelRef = useRef<BroadcastChannel | null>(null);
    const [lastMessage, setLastMessage] = useState<T | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Initialize channel
    useEffect(() => {
        if (typeof BroadcastChannel === 'undefined') {
            console.warn('BroadcastChannel is not supported in this browser');
            return;
        }

        const channel = new BroadcastChannel(channelName);
        channelRef.current = channel;
        setIsConnected(true);

        channel.onmessage = (event: MessageEvent<T>) => {
            setLastMessage(event.data);
            onMessage?.(event.data);
        };

        channel.onmessageerror = () => {
            console.error('BroadcastChannel message error');
        };

        return () => {
            channel.close();
            channelRef.current = null;
            setIsConnected(false);
        };
    }, [channelName, onMessage]);

    const postMessage = useCallback((message: T) => {
        if (channelRef.current) {
            channelRef.current.postMessage(message);
        }
    }, []);

    return {
        postMessage,
        lastMessage,
        isConnected
    };
}

// Message types for preview sync
export interface PreviewSyncMessage {
    type: 'content' | 'theme' | 'disconnect';
    payload: {
        content?: string;
        theme?: 'light' | 'dark';
        previewStyle?: string;
    };
}

/**
 * Hook specifically for preview window synchronization
 */
export function usePreviewSync(isMainWindow: boolean) {
    const [content, setContent] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isEditorConnected, setIsEditorConnected] = useState(isMainWindow);

    const handleMessage = useCallback((message: PreviewSyncMessage) => {
        switch (message.type) {
            case 'content':
                if (message.payload.content !== undefined) {
                    setContent(message.payload.content);
                }
                if (message.payload.theme !== undefined) {
                    setTheme(message.payload.theme);
                }
                setIsEditorConnected(true);
                break;
            case 'theme':
                if (message.payload.theme !== undefined) {
                    setTheme(message.payload.theme);
                }
                break;
            case 'disconnect':
                setIsEditorConnected(false);
                break;
        }
    }, []);

    const { postMessage, isConnected } = useBroadcastChannel<PreviewSyncMessage>({
        channelName: 'markview-preview-sync',
        onMessage: handleMessage
    });

    // Send disconnect message when main window closes
    useEffect(() => {
        if (isMainWindow) {
            const handleUnload = () => {
                postMessage({ type: 'disconnect', payload: {} });
            };

            window.addEventListener('beforeunload', handleUnload);
            return () => {
                window.removeEventListener('beforeunload', handleUnload);
            };
        }
    }, [isMainWindow, postMessage]);

    const syncContent = useCallback(
        (newContent: string, newTheme: 'light' | 'dark') => {
            if (isMainWindow) {
                postMessage({
                    type: 'content',
                    payload: { content: newContent, theme: newTheme }
                });
            }
        },
        [isMainWindow, postMessage]
    );

    return {
        content,
        theme,
        isEditorConnected,
        isConnected,
        syncContent
    };
}
