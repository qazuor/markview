import type {
    SSEConnectedEvent,
    SSEConnectionState,
    SSEDocumentDeletedEvent,
    SSEDocumentUpdatedEvent,
    SSEEventType,
    SSEFolderDeletedEvent,
    SSEFolderUpdatedEvent,
    SSEHeartbeatEvent,
    SSESessionUpdatedEvent,
    SSESettingsUpdatedEvent
} from '@/types/sse';

// ============================================================================
// Types
// ============================================================================

type SSEEventHandler<T = unknown> = (data: T) => void;

type SSEEventDataMap = {
    connected: SSEConnectedEvent;
    'document:updated': SSEDocumentUpdatedEvent;
    'document:deleted': SSEDocumentDeletedEvent;
    'folder:updated': SSEFolderUpdatedEvent;
    'folder:deleted': SSEFolderDeletedEvent;
    'settings:updated': SSESettingsUpdatedEvent;
    'session:updated': SSESessionUpdatedEvent;
    heartbeat: SSEHeartbeatEvent;
};

// ============================================================================
// SSE Service
// ============================================================================

class SSEService {
    private eventSource: EventSource | null = null;
    private deviceId: string;
    private handlers: Map<SSEEventType, Set<SSEEventHandler>> = new Map();
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private connectionId: string | null = null;
    private state: SSEConnectionState = 'disconnected';
    private stateListeners: Set<(state: SSEConnectionState) => void> = new Set();
    private lastHeartbeat: number | null = null;

    constructor() {
        this.deviceId = this.getOrCreateDeviceId();

        // Listen for online/offline events
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline);
            window.addEventListener('offline', this.handleOffline);
        }
    }

    // ========================================================================
    // Device ID Management
    // ========================================================================

    private getOrCreateDeviceId(): string {
        if (typeof window === 'undefined') {
            return 'server';
        }

        // Use sessionStorage so each tab has its own device ID
        let id = sessionStorage.getItem('markview:deviceId');
        if (!id) {
            id = crypto.randomUUID();
            sessionStorage.setItem('markview:deviceId', id);
        }
        return id;
    }

    getDeviceId(): string {
        return this.deviceId;
    }

    // ========================================================================
    // Connection Management
    // ========================================================================

    connect(): void {
        if (this.eventSource || this.state === 'connecting') {
            return;
        }

        if (typeof window === 'undefined' || !navigator.onLine) {
            return;
        }

        this.setState('connecting');

        const url = `/api/sync/sse?deviceId=${encodeURIComponent(this.deviceId)}`;

        try {
            this.eventSource = new EventSource(url, { withCredentials: true });

            this.eventSource.onopen = () => {
                console.log('[SSE] Connection opened');
                this.setState('connected');
                this.reconnectAttempts = 0;
            };

            this.eventSource.onerror = (error) => {
                console.error('[SSE] Connection error:', error);
                this.handleDisconnect();
            };

            // Register event listeners for all event types
            this.registerEventListener('connected');
            this.registerEventListener('document:updated');
            this.registerEventListener('document:deleted');
            this.registerEventListener('folder:updated');
            this.registerEventListener('folder:deleted');
            this.registerEventListener('settings:updated');
            this.registerEventListener('session:updated');
            this.registerEventListener('heartbeat');
        } catch (error) {
            console.error('[SSE] Failed to create EventSource:', error);
            this.handleDisconnect();
        }
    }

    private registerEventListener(eventType: SSEEventType): void {
        if (!this.eventSource) return;

        this.eventSource.addEventListener(eventType, (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);

                // Handle special events
                if (eventType === 'connected') {
                    this.connectionId = data.connectionId;
                    console.log('[SSE] Connected with ID:', this.connectionId);
                }

                if (eventType === 'heartbeat') {
                    this.lastHeartbeat = Date.now();
                }

                // Emit to handlers
                this.emit(eventType, data);
            } catch (error) {
                console.error(`[SSE] Failed to parse ${eventType} event:`, error);
            }
        });
    }

    disconnect(): void {
        this.clearReconnectTimeout();

        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        this.connectionId = null;
        this.setState('disconnected');
        console.log('[SSE] Disconnected');
    }

    private handleDisconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        this.connectionId = null;

        if (!navigator.onLine) {
            this.setState('disconnected');
            return;
        }

        // Schedule reconnection with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.setState('reconnecting');
            const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
            console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

            this.reconnectTimeout = setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        } else {
            console.error('[SSE] Max reconnect attempts reached');
            this.setState('disconnected');
        }
    }

    private clearReconnectTimeout(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    // ========================================================================
    // Online/Offline Handlers
    // ========================================================================

    private handleOnline = (): void => {
        console.log('[SSE] Online, reconnecting...');
        this.reconnectAttempts = 0;
        this.connect();
    };

    private handleOffline = (): void => {
        console.log('[SSE] Offline, disconnecting...');
        this.clearReconnectTimeout();
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.setState('disconnected');
    };

    // ========================================================================
    // State Management
    // ========================================================================

    private setState(state: SSEConnectionState): void {
        if (this.state !== state) {
            this.state = state;
            for (const listener of this.stateListeners) {
                listener(state);
            }
        }
    }

    getState(): SSEConnectionState {
        return this.state;
    }

    onStateChange(listener: (state: SSEConnectionState) => void): () => void {
        this.stateListeners.add(listener);
        return () => this.stateListeners.delete(listener);
    }

    isConnected(): boolean {
        return this.state === 'connected';
    }

    getConnectionId(): string | null {
        return this.connectionId;
    }

    getLastHeartbeat(): number | null {
        return this.lastHeartbeat;
    }

    getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }

    // ========================================================================
    // Event Handling
    // ========================================================================

    onEvent<K extends SSEEventType>(eventType: K, handler: SSEEventHandler<SSEEventDataMap[K]>): () => void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        this.handlers.get(eventType)?.add(handler as SSEEventHandler);

        // Return unsubscribe function
        return () => {
            const typeHandlers = this.handlers.get(eventType);
            if (typeHandlers) {
                typeHandlers.delete(handler as SSEEventHandler);
            }
        };
    }

    private emit<K extends SSEEventType>(eventType: K, data: SSEEventDataMap[K]): void {
        const typeHandlers = this.handlers.get(eventType);
        if (typeHandlers) {
            for (const handler of typeHandlers) {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`[SSE] Handler error for ${eventType}:`, error);
                }
            }
        }
    }

    // ========================================================================
    // Cleanup
    // ========================================================================

    destroy(): void {
        this.disconnect();
        this.handlers.clear();
        this.stateListeners.clear();

        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnline);
            window.removeEventListener('offline', this.handleOffline);
        }
    }
}

// Export singleton instance
export const sseService = new SSEService();
