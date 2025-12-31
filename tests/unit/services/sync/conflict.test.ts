import {
    calculateDiff,
    compareDocuments,
    createConflict,
    detectConflict,
    generateConflictCopyName,
    resolveWithBoth,
    resolveWithLocal,
    resolveWithServer
} from '@/services/sync/conflict';
import type { SyncDocument } from '@/types/sync';
import { describe, expect, it, vi } from 'vitest';

describe('conflict', () => {
    const createMockDocument = (overrides: Partial<SyncDocument> = {}): SyncDocument => ({
        id: 'doc-1',
        userId: 'user-1',
        name: 'Test Document',
        content: 'Test content',
        folderId: null,
        isManuallyNamed: false,
        cursor: null,
        scroll: null,
        syncVersion: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        syncedAt: null,
        deletedAt: null,
        ...overrides
    });

    describe('detectConflict', () => {
        it('should return false when versions are equal', () => {
            const localDoc = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };
            const serverDoc = createMockDocument({ syncVersion: 1 });

            expect(detectConflict(localDoc, serverDoc)).toBe(false);
        });

        it('should return false when local version is ahead', () => {
            const localDoc = { syncVersion: 2, updatedAt: '2024-01-15T10:00:00Z' };
            const serverDoc = createMockDocument({ syncVersion: 1 });

            expect(detectConflict(localDoc, serverDoc)).toBe(false);
        });

        it('should return true when local is behind and has newer changes', () => {
            const localDoc = { syncVersion: 1, updatedAt: '2024-01-15T12:00:00Z' };
            const serverDoc = createMockDocument({
                syncVersion: 2,
                updatedAt: '2024-01-15T11:00:00Z'
            });

            expect(detectConflict(localDoc, serverDoc)).toBe(true);
        });

        it('should return false when local is behind but no newer changes', () => {
            const localDoc = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };
            const serverDoc = createMockDocument({
                syncVersion: 2,
                updatedAt: '2024-01-15T11:00:00Z'
            });

            expect(detectConflict(localDoc, serverDoc)).toBe(false);
        });

        it('should handle missing syncVersion as 0', () => {
            const localDoc = { updatedAt: '2024-01-15T12:00:00Z' };
            const serverDoc = createMockDocument({
                syncVersion: 1,
                updatedAt: '2024-01-15T10:00:00Z'
            });

            expect(detectConflict(localDoc, serverDoc)).toBe(true);
        });

        it('should handle Date objects', () => {
            const localDoc = { syncVersion: 1, updatedAt: new Date('2024-01-15T12:00:00Z') };
            const serverDoc = createMockDocument({
                syncVersion: 2,
                updatedAt: '2024-01-15T11:00:00Z'
            });

            expect(detectConflict(localDoc, serverDoc)).toBe(true);
        });
    });

    describe('createConflict', () => {
        it('should create a conflict object', () => {
            const localDoc = createMockDocument({ content: 'local content' });
            const serverDoc = createMockDocument({ content: 'server content' });

            const conflict = createConflict(localDoc, serverDoc);

            expect(conflict.documentId).toBe('doc-1');
            expect(conflict.localDocument).toBe(localDoc);
            expect(conflict.serverDocument).toBe(serverDoc);
        });
    });

    describe('resolveWithLocal', () => {
        it('should return local document with incremented version', () => {
            const localDoc = createMockDocument({ content: 'local content', syncVersion: 1 });
            const serverDoc = createMockDocument({ content: 'server content', syncVersion: 2 });

            const result = resolveWithLocal(localDoc, serverDoc);

            expect(result.resolution).toBe('local');
            expect(result.resolvedDocument.content).toBe('local content');
            expect(result.resolvedDocument.syncVersion).toBe(3);
        });
    });

    describe('resolveWithServer', () => {
        it('should return server document', () => {
            const serverDoc = createMockDocument({ content: 'server content', syncVersion: 2 });

            const result = resolveWithServer(serverDoc);

            expect(result.resolution).toBe('server');
            expect(result.resolvedDocument).toBe(serverDoc);
        });
    });

    describe('resolveWithBoth', () => {
        it('should return both resolution with server document', () => {
            const localDoc = createMockDocument({ content: 'local content' });
            const serverDoc = createMockDocument({ content: 'server content' });

            const result = resolveWithBoth(localDoc, serverDoc);

            expect(result.resolution).toBe('both');
            expect(result.resolvedDocument).toBe(serverDoc);
        });
    });

    describe('generateConflictCopyName', () => {
        it('should add conflict suffix with date', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-01-15'));

            const name = generateConflictCopyName('My Document');

            expect(name).toBe('My Document (conflict 2024-01-15)');

            vi.useRealTimers();
        });

        it('should replace existing conflict suffix', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-01-20'));

            const name = generateConflictCopyName('My Document (conflict 2024-01-15)');

            expect(name).toBe('My Document (conflict 2024-01-20)');

            vi.useRealTimers();
        });

        it('should handle documents with no existing suffix', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-06-01'));

            const name = generateConflictCopyName('Notes');

            expect(name).toBe('Notes (conflict 2024-06-01)');

            vi.useRealTimers();
        });
    });

    describe('compareDocuments', () => {
        it('should return first when first has higher version', () => {
            const doc1 = { syncVersion: 2, updatedAt: '2024-01-15T10:00:00Z' };
            const doc2 = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };

            expect(compareDocuments(doc1, doc2)).toBe('first');
        });

        it('should return second when second has higher version', () => {
            const doc1 = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };
            const doc2 = { syncVersion: 2, updatedAt: '2024-01-15T10:00:00Z' };

            expect(compareDocuments(doc1, doc2)).toBe('second');
        });

        it('should compare by time when versions are equal', () => {
            const doc1 = { syncVersion: 1, updatedAt: '2024-01-15T12:00:00Z' };
            const doc2 = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };

            expect(compareDocuments(doc1, doc2)).toBe('first');
        });

        it('should return equal when both version and time match', () => {
            const doc1 = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };
            const doc2 = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };

            expect(compareDocuments(doc1, doc2)).toBe('equal');
        });

        it('should handle missing syncVersion', () => {
            const doc1 = { updatedAt: '2024-01-15T10:00:00Z' };
            const doc2 = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };

            expect(compareDocuments(doc1, doc2)).toBe('second');
        });

        it('should handle Date objects', () => {
            const doc1 = { syncVersion: 1, updatedAt: new Date('2024-01-15T12:00:00Z') };
            const doc2 = { syncVersion: 1, updatedAt: '2024-01-15T10:00:00Z' };

            expect(compareDocuments(doc1, doc2)).toBe('first');
        });
    });

    describe('calculateDiff', () => {
        it('should calculate diff for identical content', () => {
            const content = 'line1\nline2\nline3';

            const diff = calculateDiff(content, content);

            expect(diff.localLines).toBe(3);
            expect(diff.serverLines).toBe(3);
            expect(diff.addedLines).toBe(0);
            expect(diff.removedLines).toBe(0);
            expect(diff.changedPercentage).toBe(0);
        });

        it('should detect added lines', () => {
            const local = 'line1\nline2\nline3';
            const server = 'line1\nline2';

            const diff = calculateDiff(local, server);

            expect(diff.localLines).toBe(3);
            expect(diff.serverLines).toBe(2);
            expect(diff.addedLines).toBe(1);
            expect(diff.removedLines).toBe(0);
        });

        it('should detect removed lines', () => {
            const local = 'line1\nline2';
            const server = 'line1\nline2\nline3';

            const diff = calculateDiff(local, server);

            expect(diff.localLines).toBe(2);
            expect(diff.serverLines).toBe(3);
            expect(diff.addedLines).toBe(0);
            expect(diff.removedLines).toBe(1);
        });

        it('should detect changed lines', () => {
            const local = 'line1\nchanged line\nline3';
            const server = 'line1\noriginal line\nline3';

            const diff = calculateDiff(local, server);

            expect(diff.addedLines).toBe(1);
            expect(diff.removedLines).toBe(1);
        });

        it('should calculate changed percentage', () => {
            const local = 'a\nb\nc\nd';
            const server = 'a\nx\ny\nd';

            const diff = calculateDiff(local, server);

            // 2 added (b, c not in server) + 2 removed (x, y not in local) = 4 changes
            // 4 / 4 lines = 100%
            expect(diff.changedPercentage).toBe(100);
        });

        it('should handle empty content', () => {
            const diff = calculateDiff('', '');

            expect(diff.localLines).toBe(1);
            expect(diff.serverLines).toBe(1);
            expect(diff.changedPercentage).toBe(0);
        });

        it('should handle one empty content', () => {
            const diff = calculateDiff('line1\nline2', '');

            expect(diff.localLines).toBe(2);
            expect(diff.serverLines).toBe(1);
            expect(diff.addedLines).toBe(2);
        });
    });
});
