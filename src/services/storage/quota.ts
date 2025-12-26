/**
 * Storage quota management utilities
 */

export interface StorageQuotaInfo {
    used: number;
    total: number;
    available: number;
    percentUsed: number;
    isNearLimit: boolean;
    isAtLimit: boolean;
}

const WARNING_THRESHOLD = 0.8; // 80%
const LIMIT_THRESHOLD = 0.95; // 95%

/**
 * Estimate storage usage
 * Note: This is an approximation since exact quota isn't available in all browsers
 */
export function getStorageUsage(): StorageQuotaInfo {
    let used = 0;

    // Calculate current usage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const value = localStorage.getItem(key);
            if (value) {
                // Approximate size: 2 bytes per character (UTF-16)
                used += (key.length + value.length) * 2;
            }
        }
    }

    // Most browsers allow 5-10MB for localStorage
    // We'll assume 5MB to be safe
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const available = Math.max(0, total - used);
    const percentUsed = used / total;

    return {
        used,
        total,
        available,
        percentUsed,
        isNearLimit: percentUsed >= WARNING_THRESHOLD,
        isAtLimit: percentUsed >= LIMIT_THRESHOLD
    };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if we can store data of a given size
 */
export function canStore(sizeBytes: number): boolean {
    const quota = getStorageUsage();
    return quota.available >= sizeBytes;
}

/**
 * Estimate size of a value when stringified
 */
export function estimateSize(value: unknown): number {
    const json = JSON.stringify(value);
    // 2 bytes per character (UTF-16)
    return json.length * 2;
}

/**
 * Get storage usage by prefix
 */
export function getUsageByPrefix(prefix: string): number {
    let used = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
            const value = localStorage.getItem(key);
            if (value) {
                used += (key.length + value.length) * 2;
            }
        }
    }

    return used;
}

export interface CleanupSuggestion {
    key: string;
    size: number;
    type: 'version' | 'document' | 'other';
    age?: Date;
}

/**
 * Get suggestions for cleaning up storage
 */
export function getCleanupSuggestions(prefix: string): CleanupSuggestion[] {
    const suggestions: CleanupSuggestion[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(prefix)) continue;

        const value = localStorage.getItem(key);
        if (!value) continue;

        const size = (key.length + value.length) * 2;

        let type: CleanupSuggestion['type'] = 'other';
        if (key.includes(':versions:')) {
            type = 'version';
        } else if (key.includes(':doc:')) {
            type = 'document';
        }

        suggestions.push({ key, size, type });
    }

    // Sort by size descending
    return suggestions.sort((a, b) => b.size - a.size);
}
