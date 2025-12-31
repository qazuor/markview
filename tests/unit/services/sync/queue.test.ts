import {
    addToQueue,
    clearQueue,
    getQueueCount,
    getQueueItem,
    getQueueItems,
    getQueueItemsByType,
    removeFromQueue,
    updateQueueItem
} from '@/services/sync/queue';
import type { SyncQueueItem } from '@/types/sync';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('syncQueue', () => {
    const createMockQueueItem = (overrides: Partial<SyncQueueItem> = {}): SyncQueueItem => ({
        id: 'item-1',
        type: 'document',
        operation: 'upsert',
        data: { id: 'doc-1', content: 'test' },
        timestamp: Date.now(),
        retries: 0,
        ...overrides
    });

    beforeEach(async () => {
        // Clear the queue before each test
        await clearQueue();
    });

    afterEach(async () => {
        await clearQueue();
    });

    describe('addToQueue', () => {
        it('should add item to queue', async () => {
            const item = createMockQueueItem();

            await addToQueue(item);

            const items = await getQueueItems();
            expect(items).toHaveLength(1);
            expect(items[0]?.id).toBe('item-1');
        });

        it('should add multiple items', async () => {
            const item1 = createMockQueueItem({ id: 'item-1' });
            const item2 = createMockQueueItem({ id: 'item-2' });

            await addToQueue(item1);
            await addToQueue(item2);

            const items = await getQueueItems();
            expect(items).toHaveLength(2);
        });

        it('should update existing item with same id', async () => {
            const item = createMockQueueItem({ id: 'item-1', retries: 0 });
            const updatedItem = createMockQueueItem({ id: 'item-1', retries: 3 });

            await addToQueue(item);
            await addToQueue(updatedItem);

            const items = await getQueueItems();
            expect(items).toHaveLength(1);
            expect(items[0]?.retries).toBe(3);
        });
    });

    describe('removeFromQueue', () => {
        it('should remove item from queue', async () => {
            const item = createMockQueueItem();

            await addToQueue(item);
            await removeFromQueue('item-1');

            const items = await getQueueItems();
            expect(items).toHaveLength(0);
        });

        it('should not error when removing non-existent item', async () => {
            await expect(removeFromQueue('non-existent')).resolves.not.toThrow();
        });

        it('should only remove specified item', async () => {
            const item1 = createMockQueueItem({ id: 'item-1' });
            const item2 = createMockQueueItem({ id: 'item-2' });

            await addToQueue(item1);
            await addToQueue(item2);
            await removeFromQueue('item-1');

            const items = await getQueueItems();
            expect(items).toHaveLength(1);
            expect(items[0]?.id).toBe('item-2');
        });
    });

    describe('getQueueItems', () => {
        it('should return empty array when queue is empty', async () => {
            const items = await getQueueItems();

            expect(items).toEqual([]);
        });

        it('should return all items sorted by timestamp', async () => {
            const item1 = createMockQueueItem({ id: 'item-1', timestamp: 1000 });
            const item2 = createMockQueueItem({ id: 'item-2', timestamp: 3000 });
            const item3 = createMockQueueItem({ id: 'item-3', timestamp: 2000 });

            await addToQueue(item1);
            await addToQueue(item2);
            await addToQueue(item3);

            const items = await getQueueItems();
            expect(items).toHaveLength(3);
            expect(items[0]?.id).toBe('item-1');
            expect(items[1]?.id).toBe('item-3');
            expect(items[2]?.id).toBe('item-2');
        });
    });

    describe('getQueueItem', () => {
        it('should return item by id', async () => {
            const item = createMockQueueItem({ id: 'item-1' });

            await addToQueue(item);

            const result = await getQueueItem('item-1');
            expect(result?.id).toBe('item-1');
        });

        it('should return undefined for non-existent id', async () => {
            const result = await getQueueItem('non-existent');

            expect(result).toBeUndefined();
        });
    });

    describe('updateQueueItem', () => {
        it('should update existing item', async () => {
            const item = createMockQueueItem({ id: 'item-1', retries: 0 });
            const updatedItem = { ...item, retries: 2 };

            await addToQueue(item);
            await updateQueueItem(updatedItem);

            const result = await getQueueItem('item-1');
            expect(result?.retries).toBe(2);
        });
    });

    describe('clearQueue', () => {
        it('should remove all items', async () => {
            await addToQueue(createMockQueueItem({ id: 'item-1' }));
            await addToQueue(createMockQueueItem({ id: 'item-2' }));
            await addToQueue(createMockQueueItem({ id: 'item-3' }));

            await clearQueue();

            const items = await getQueueItems();
            expect(items).toHaveLength(0);
        });

        it('should not error on empty queue', async () => {
            await expect(clearQueue()).resolves.not.toThrow();
        });
    });

    describe('getQueueCount', () => {
        it('should return 0 for empty queue', async () => {
            const count = await getQueueCount();

            expect(count).toBe(0);
        });

        it('should return correct count', async () => {
            await addToQueue(createMockQueueItem({ id: 'item-1' }));
            await addToQueue(createMockQueueItem({ id: 'item-2' }));
            await addToQueue(createMockQueueItem({ id: 'item-3' }));

            const count = await getQueueCount();

            expect(count).toBe(3);
        });
    });

    describe('getQueueItemsByType', () => {
        it('should return items of specified type', async () => {
            await addToQueue(createMockQueueItem({ id: 'doc-1', type: 'document' }));
            await addToQueue(createMockQueueItem({ id: 'folder-1', type: 'folder' }));
            await addToQueue(createMockQueueItem({ id: 'doc-2', type: 'document' }));

            const documents = await getQueueItemsByType('document');
            const folders = await getQueueItemsByType('folder');

            expect(documents).toHaveLength(2);
            expect(folders).toHaveLength(1);
        });

        it('should return empty array when no items of type', async () => {
            await addToQueue(createMockQueueItem({ id: 'doc-1', type: 'document' }));

            const folders = await getQueueItemsByType('folder');

            expect(folders).toHaveLength(0);
        });
    });
});
