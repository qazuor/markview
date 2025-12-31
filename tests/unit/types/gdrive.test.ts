import { CACHE_TTL, GoogleDriveError, formatFileSize, isCacheValid, isFolder, isMarkdownFile } from '@/types/gdrive';
import type { CachedData, DriveFile } from '@/types/gdrive';
import { describe, expect, it, vi } from 'vitest';

describe('gdrive types', () => {
    const createDriveFile = (overrides: Partial<DriveFile> = {}): DriveFile => ({
        id: 'file-1',
        name: 'document.md',
        mimeType: 'text/markdown',
        modifiedTime: '2024-01-15T10:00:00Z',
        ...overrides
    });

    describe('isMarkdownFile', () => {
        it('should return true for .md files', () => {
            expect(isMarkdownFile(createDriveFile({ name: 'README.md' }))).toBe(true);
            expect(isMarkdownFile(createDriveFile({ name: 'guide.MD' }))).toBe(true);
        });

        it('should return true for .mdx files', () => {
            expect(isMarkdownFile(createDriveFile({ name: 'component.mdx' }))).toBe(true);
            expect(isMarkdownFile(createDriveFile({ name: 'page.MDX' }))).toBe(true);
        });

        it('should return false for non-markdown files', () => {
            expect(isMarkdownFile(createDriveFile({ name: 'index.ts' }))).toBe(false);
            expect(isMarkdownFile(createDriveFile({ name: 'style.css' }))).toBe(false);
            expect(isMarkdownFile(createDriveFile({ name: 'config.json' }))).toBe(false);
        });

        it('should return false for folders', () => {
            expect(
                isMarkdownFile(
                    createDriveFile({
                        name: 'folder',
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                )
            ).toBe(false);
        });
    });

    describe('isFolder', () => {
        it('should return true for folders', () => {
            expect(
                isFolder(
                    createDriveFile({
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                )
            ).toBe(true);
        });

        it('should return false for files', () => {
            expect(isFolder(createDriveFile({ mimeType: 'text/markdown' }))).toBe(false);
            expect(isFolder(createDriveFile({ mimeType: 'text/plain' }))).toBe(false);
            expect(isFolder(createDriveFile({ mimeType: 'image/png' }))).toBe(false);
        });
    });

    describe('formatFileSize', () => {
        it('should return empty string for undefined', () => {
            expect(formatFileSize(undefined)).toBe('');
        });

        it('should format bytes', () => {
            expect(formatFileSize('500')).toBe('500 B');
            expect(formatFileSize('1023')).toBe('1023 B');
        });

        it('should format kilobytes', () => {
            expect(formatFileSize('1024')).toBe('1.0 KB');
            expect(formatFileSize('1536')).toBe('1.5 KB');
            expect(formatFileSize('102400')).toBe('100.0 KB');
        });

        it('should format megabytes', () => {
            expect(formatFileSize('1048576')).toBe('1.0 MB');
            expect(formatFileSize('5242880')).toBe('5.0 MB');
        });

        it('should handle zero', () => {
            expect(formatFileSize('0')).toBe('0 B');
        });
    });

    describe('isCacheValid', () => {
        it('should return false for null cache', () => {
            expect(isCacheValid(null)).toBe(false);
        });

        it('should return true for valid cache', () => {
            const cached: CachedData<string> = {
                data: 'test',
                timestamp: Date.now(),
                ttl: 60000
            };

            expect(isCacheValid(cached)).toBe(true);
        });

        it('should return false for expired cache', () => {
            const cached: CachedData<string> = {
                data: 'test',
                timestamp: Date.now() - 120000,
                ttl: 60000
            };

            expect(isCacheValid(cached)).toBe(false);
        });

        it('should handle edge case at exact expiration', () => {
            vi.useFakeTimers();
            const now = Date.now();
            vi.setSystemTime(now);

            const cached: CachedData<string> = {
                data: 'test',
                timestamp: now - 60000,
                ttl: 60000
            };

            expect(isCacheValid(cached)).toBe(false);

            vi.useRealTimers();
        });
    });

    describe('CACHE_TTL', () => {
        it('should have expected TTL values', () => {
            expect(CACHE_TTL.FILES).toBe(5 * 60 * 1000); // 5 minutes
            expect(CACHE_TTL.CONTENT).toBe(60 * 60 * 1000); // 1 hour
            expect(CACHE_TTL.QUOTA).toBe(10 * 60 * 1000); // 10 minutes
        });
    });

    describe('GoogleDriveError', () => {
        it('should create error with message and code', () => {
            const error = new GoogleDriveError('Not found', 'NOT_FOUND');

            expect(error.message).toBe('Not found');
            expect(error.code).toBe('NOT_FOUND');
            expect(error.name).toBe('GoogleDriveError');
        });

        it('should include status code', () => {
            const error = new GoogleDriveError('Unauthorized', 'UNAUTHORIZED', 401);

            expect(error.status).toBe(401);
        });

        it('should include details', () => {
            const details = { field: 'file', reason: 'missing' };
            const error = new GoogleDriveError('Validation error', 'UNKNOWN', 400, details);

            expect(error.details).toEqual(details);
        });

        it('should be instance of Error', () => {
            const error = new GoogleDriveError('Test', 'UNKNOWN');

            expect(error).toBeInstanceOf(Error);
        });

        it('should have correct error codes', () => {
            const codes = ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'QUOTA_EXCEEDED', 'RATE_LIMITED', 'NETWORK_ERROR', 'UNKNOWN'] as const;

            for (const code of codes) {
                const error = new GoogleDriveError('Test', code);
                expect(error.code).toBe(code);
            }
        });
    });
});
