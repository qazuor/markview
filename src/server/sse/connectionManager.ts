import type { SSEStreamingApi } from 'hono/streaming';

// ============================================================================
// Types
// ============================================================================

export interface SSEConnection {
    id: string;
    userId: string;
    deviceId: string;
    stream: SSEStreamingApi;
    lastHeartbeat: number;
    createdAt: number;
}

export type SSEEventType =
    | 'connected'
    | 'document:updated'
    | 'document:deleted'
    | 'folder:updated'
    | 'folder:deleted'
    | 'settings:updated'
    | 'session:updated'
    | 'heartbeat';

export interface SSEEventData {
    [key: string]: unknown;
    originDeviceId?: string;
}

// ============================================================================
// Connection Manager
// ============================================================================

class SSEConnectionManager {
    private connections: Map<string, Set<SSEConnection>> = new Map();
    private connectionById: Map<string, SSEConnection> = new Map();
    private cleanupInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        this.startCleanup();
    }

    /**
     * Add a new SSE connection for a user
     */
    addConnection(userId: string, deviceId: string, stream: SSEStreamingApi): string {
        const connectionId = crypto.randomUUID();
        const connection: SSEConnection = {
            id: connectionId,
            userId,
            deviceId,
            stream,
            lastHeartbeat: Date.now(),
            createdAt: Date.now()
        };

        // Add to user's connection set
        if (!this.connections.has(userId)) {
            this.connections.set(userId, new Set());
        }
        this.connections.get(userId)?.add(connection);

        // Add to connectionById map for quick lookup
        this.connectionById.set(connectionId, connection);

        console.log(`[SSE] Connection added: ${connectionId} for user ${userId} (device: ${deviceId})`);
        return connectionId;
    }

    /**
     * Remove an SSE connection
     */
    removeConnection(connectionId: string): void {
        const connection = this.connectionById.get(connectionId);
        if (!connection) return;

        // Remove from user's connection set
        const userConnections = this.connections.get(connection.userId);
        if (userConnections) {
            userConnections.delete(connection);
            if (userConnections.size === 0) {
                this.connections.delete(connection.userId);
            }
        }

        // Remove from connectionById map
        this.connectionById.delete(connectionId);

        console.log(`[SSE] Connection removed: ${connectionId} for user ${connection.userId}`);
    }

    /**
     * Get all connections for a user
     */
    getConnectionsForUser(userId: string): SSEConnection[] {
        const userConnections = this.connections.get(userId);
        return userConnections ? Array.from(userConnections) : [];
    }

    /**
     * Get connection by ID
     */
    getConnection(connectionId: string): SSEConnection | undefined {
        return this.connectionById.get(connectionId);
    }

    /**
     * Update heartbeat timestamp for a connection
     */
    updateHeartbeat(connectionId: string): void {
        const connection = this.connectionById.get(connectionId);
        if (connection) {
            connection.lastHeartbeat = Date.now();
        }
    }

    /**
     * Broadcast an event to all connections of a user, optionally excluding a device
     */
    async broadcast(userId: string, event: SSEEventType, data: SSEEventData, excludeDeviceId?: string): Promise<void> {
        const userConnections = this.connections.get(userId);
        if (!userConnections || userConnections.size === 0) return;

        const eventData = JSON.stringify({
            ...data,
            originDeviceId: excludeDeviceId
        });

        const deadConnections: SSEConnection[] = [];

        for (const connection of userConnections) {
            // Skip the device that originated the change
            if (excludeDeviceId && connection.deviceId === excludeDeviceId) {
                continue;
            }

            try {
                await connection.stream.writeSSE({
                    event,
                    data: eventData
                });
            } catch (error) {
                console.error(`[SSE] Failed to send to connection ${connection.id}:`, error);
                deadConnections.push(connection);
            }
        }

        // Clean up dead connections
        for (const connection of deadConnections) {
            this.removeConnection(connection.id);
        }
    }

    /**
     * Send heartbeat to all connections
     */
    async sendHeartbeats(): Promise<void> {
        const deadConnections: SSEConnection[] = [];

        for (const [, userConnections] of this.connections) {
            for (const connection of userConnections) {
                try {
                    await connection.stream.writeSSE({
                        event: 'heartbeat',
                        data: JSON.stringify({ timestamp: Date.now() })
                    });
                    connection.lastHeartbeat = Date.now();
                } catch (error) {
                    console.error(`[SSE] Heartbeat failed for connection ${connection.id}:`, error);
                    deadConnections.push(connection);
                }
            }
        }

        // Clean up dead connections
        for (const connection of deadConnections) {
            this.removeConnection(connection.id);
        }
    }

    /**
     * Start periodic cleanup of dead connections
     */
    private startCleanup(): void {
        // Run cleanup every 60 seconds
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);
    }

    /**
     * Clean up connections that haven't received a heartbeat in 90 seconds
     */
    private cleanup(): void {
        const now = Date.now();
        const timeout = 90000; // 90 seconds
        const deadConnections: SSEConnection[] = [];

        for (const [, userConnections] of this.connections) {
            for (const connection of userConnections) {
                if (now - connection.lastHeartbeat > timeout) {
                    deadConnections.push(connection);
                }
            }
        }

        for (const connection of deadConnections) {
            console.log(`[SSE] Cleaning up stale connection ${connection.id}`);
            this.removeConnection(connection.id);
        }

        if (deadConnections.length > 0) {
            console.log(`[SSE] Cleaned up ${deadConnections.length} stale connections`);
        }
    }

    /**
     * Stop the cleanup interval (for shutdown)
     */
    stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * Get stats about current connections
     */
    getStats(): { totalConnections: number; totalUsers: number } {
        let totalConnections = 0;
        for (const [, userConnections] of this.connections) {
            totalConnections += userConnections.size;
        }
        return {
            totalConnections,
            totalUsers: this.connections.size
        };
    }
}

// Export singleton instance
export const connectionManager = new SSEConnectionManager();
