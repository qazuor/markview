/**
 * Sync Queue Service
 * Handles offline queue with IndexedDB persistence
 */

import type { SyncQueueItem } from '@/types/sync';

const DB_NAME = 'markview-sync';
const DB_VERSION = 1;
const STORE_NAME = 'queue';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB for queue persistence
 */
async function initDB(): Promise<IDBDatabase> {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('type', 'type', { unique: false });
            }
        };
    });
}

/**
 * Add item to the persistent queue
 */
export async function addToQueue(item: SyncQueueItem): Promise<void> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(item);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Remove item from the persistent queue
 */
export async function removeFromQueue(id: string): Promise<void> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Get all items from the persistent queue
 */
export async function getQueueItems(): Promise<SyncQueueItem[]> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

/**
 * Clear all items from the persistent queue
 */
export async function clearQueue(): Promise<void> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Get queue item by ID
 */
export async function getQueueItem(id: string): Promise<SyncQueueItem | undefined> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

/**
 * Update item in the persistent queue
 */
export async function updateQueueItem(item: SyncQueueItem): Promise<void> {
    return addToQueue(item);
}

/**
 * Get count of items in the queue
 */
export async function getQueueCount(): Promise<number> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.count();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

/**
 * Get items by type (document or folder)
 */
export async function getQueueItemsByType(type: 'document' | 'folder'): Promise<SyncQueueItem[]> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('type');
        const request = index.getAll(type);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export const syncQueue = {
    init: initDB,
    add: addToQueue,
    remove: removeFromQueue,
    getAll: getQueueItems,
    get: getQueueItem,
    update: updateQueueItem,
    clear: clearQueue,
    count: getQueueCount,
    getByType: getQueueItemsByType
};
