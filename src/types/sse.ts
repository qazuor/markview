// ============================================================================
// SSE Event Types
// ============================================================================

export type SSEEventType =
    | 'connected'
    | 'document:updated'
    | 'document:deleted'
    | 'folder:updated'
    | 'folder:deleted'
    | 'settings:updated'
    | 'session:updated'
    | 'heartbeat';

// ============================================================================
// SSE Event Data Types
// ============================================================================

export interface SSEConnectedEvent {
    connectionId: string;
    deviceId: string;
    userId: string;
}

export interface SSEDocumentUpdatedEvent {
    documentId: string;
    syncVersion: number;
    updatedAt: string;
    originDeviceId?: string;
}

export interface SSEDocumentDeletedEvent {
    documentId: string;
    originDeviceId?: string;
}

export interface SSEFolderUpdatedEvent {
    folderId: string;
    updatedAt: string;
    originDeviceId?: string;
}

export interface SSEFolderDeletedEvent {
    folderId: string;
    originDeviceId?: string;
}

export interface SSESettingsUpdatedEvent {
    updatedAt: string;
    originDeviceId?: string;
}

export interface SSESessionUpdatedEvent {
    openDocumentIds: string[];
    activeDocumentId: string | null;
    updatedAt: string;
    originDeviceId?: string;
}

export interface SSEHeartbeatEvent {
    timestamp: number;
}

// ============================================================================
// Session State Types
// ============================================================================

export interface SessionState {
    openDocumentIds: string[];
    activeDocumentId: string | null;
    updatedAt: string | null;
}

// ============================================================================
// SSE Connection State
// ============================================================================

export type SSEConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface SSEConnectionInfo {
    state: SSEConnectionState;
    connectionId: string | null;
    deviceId: string;
    reconnectAttempts: number;
    lastHeartbeat: number | null;
}
