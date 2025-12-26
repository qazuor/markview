/**
 * Type-safe localStorage abstraction layer
 */

export interface StorageResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get item from localStorage with type safety
 */
export function getItem<T>(key: string): StorageResult<T> {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return { success: true, data: undefined };
        }
        const data = JSON.parse(item) as T;
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get item'
        };
    }
}

/**
 * Set item in localStorage with type safety
 */
export function setItem<T>(key: string, value: T): StorageResult<void> {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return { success: true };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            return {
                success: false,
                error: 'Storage quota exceeded'
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to set item'
        };
    }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): StorageResult<void> {
    try {
        localStorage.removeItem(key);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove item'
        };
    }
}

/**
 * Get all keys matching a prefix
 */
export function getKeysByPrefix(prefix: string): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
            keys.push(key);
        }
    }
    return keys;
}

/**
 * Remove all items with a given prefix
 */
export function removeByPrefix(prefix: string): StorageResult<number> {
    try {
        const keys = getKeysByPrefix(prefix);
        for (const key of keys) {
            localStorage.removeItem(key);
        }
        return { success: true, data: keys.length };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove items'
        };
    }
}

/**
 * Clear all app-related storage
 */
export function clearAppStorage(prefix: string): StorageResult<void> {
    try {
        const keys = getKeysByPrefix(prefix);
        for (const key of keys) {
            localStorage.removeItem(key);
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to clear storage'
        };
    }
}
