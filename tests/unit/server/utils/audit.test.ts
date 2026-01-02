import { audit, auditLog, createAuditLogger } from '@/server/utils/audit';
import { createMockContext, createMockUser } from '@test/helpers/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('audit utils', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        process.env.NODE_ENV = 'development';
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    describe('auditLog', () => {
        it('should create audit log entry with correct structure', () => {
            const entry = auditLog('auth.login', {
                userId: 'user-123',
                success: true,
                metadata: { provider: 'github' }
            });

            expect(entry).toMatchObject({
                event: 'auth.login',
                userId: 'user-123',
                success: true,
                metadata: { provider: 'github' }
            });
            expect(entry.timestamp).toBeDefined();
            expect(entry.ip).toBeNull();
            expect(entry.userAgent).toBeNull();
        });

        it('should extract user ID from context if not provided', () => {
            const mockUser = createMockUser({ id: 'context-user-123' });
            const mockContext = createMockContext({ user: mockUser });

            const entry = auditLog('document.created', { c: mockContext });

            expect(entry.userId).toBe('context-user-123');
        });

        it('should extract IP from x-forwarded-for header', () => {
            const mockContext = createMockContext({
                headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }
            });

            const entry = auditLog('auth.login', { c: mockContext });

            expect(entry.ip).toBe('192.168.1.1');
        });

        it('should extract IP from x-real-ip header', () => {
            const mockContext = createMockContext({
                headers: { 'x-real-ip': '172.16.0.1' }
            });

            const entry = auditLog('auth.login', { c: mockContext });

            expect(entry.ip).toBe('172.16.0.1');
        });

        it('should extract IP from cf-connecting-ip header', () => {
            const mockContext = createMockContext({
                headers: { 'cf-connecting-ip': '8.8.8.8' }
            });

            const entry = auditLog('auth.login', { c: mockContext });

            expect(entry.ip).toBe('8.8.8.8');
        });

        it('should extract user agent from headers', () => {
            const mockContext = createMockContext({
                headers: { 'user-agent': 'Mozilla/5.0 Test Browser' }
            });

            const entry = auditLog('auth.login', { c: mockContext });

            expect(entry.userAgent).toBe('Mozilla/5.0 Test Browser');
        });

        it('should log success events with console.log in development', async () => {
            // Reset modules to apply new env
            vi.resetModules();
            process.env.NODE_ENV = 'development';

            const { auditLog: freshAuditLog } = await import('@/server/utils/audit');
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            freshAuditLog('auth.login', { success: true });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should log failure events with console.warn in development', async () => {
            // Reset modules to apply new env
            vi.resetModules();
            process.env.NODE_ENV = 'development';

            const { auditLog: freshAuditLog } = await import('@/server/utils/audit');
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            freshAuditLog('auth.login.failed', { success: false, error: 'Invalid credentials' });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should include error message in entry', () => {
            const entry = auditLog('auth.login.failed', {
                success: false,
                error: 'Invalid credentials'
            });

            expect(entry.error).toBe('Invalid credentials');
        });

        it('should default success to true', () => {
            const entry = auditLog('document.created', {});

            expect(entry.success).toBe(true);
        });

        it('should default metadata to empty object', () => {
            const entry = auditLog('document.created', {});

            expect(entry.metadata).toEqual({});
        });
    });

    describe('createAuditLogger', () => {
        it('should create logger bound to context', () => {
            const mockContext = createMockContext({
                user: createMockUser({ id: 'bound-user' }),
                headers: { 'x-forwarded-for': '1.2.3.4' }
            });

            const logger = createAuditLogger(mockContext);
            const entry = logger.log('document.created');

            expect(entry.userId).toBe('bound-user');
            expect(entry.ip).toBe('1.2.3.4');
        });

        it('should provide success helper', () => {
            const mockContext = createMockContext();
            const logger = createAuditLogger(mockContext);

            const entry = logger.success('document.created', { documentId: 'doc-1' });

            expect(entry.success).toBe(true);
            expect(entry.metadata).toEqual({ documentId: 'doc-1' });
        });

        it('should provide failure helper', () => {
            const mockContext = createMockContext();
            const logger = createAuditLogger(mockContext);

            const entry = logger.failure('auth.login.failed', 'Bad password', { attempts: 3 });

            expect(entry.success).toBe(false);
            expect(entry.error).toBe('Bad password');
            expect(entry.metadata).toEqual({ attempts: 3 });
        });
    });

    describe('audit pre-configured helpers', () => {
        it('should log login success', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.loginSuccess(mockContext, 'github');

            expect(entry.event).toBe('auth.login');
            expect(entry.success).toBe(true);
            expect(entry.metadata).toEqual({ provider: 'github' });
        });

        it('should log login failed', () => {
            const mockContext = createMockContext();
            const entry = audit.loginFailed(mockContext, 'google', 'OAuth error');

            expect(entry.event).toBe('auth.login.failed');
            expect(entry.success).toBe(false);
            expect(entry.error).toBe('OAuth error');
            expect(entry.metadata).toEqual({ provider: 'google' });
        });

        it('should log logout', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.logout(mockContext);

            expect(entry.event).toBe('auth.logout');
            expect(entry.success).toBe(true);
        });

        it('should log token refresh', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.tokenRefresh(mockContext, 'google');

            expect(entry.event).toBe('auth.token.refresh');
            expect(entry.metadata).toEqual({ provider: 'google' });
        });

        it('should log rate limited', () => {
            const mockContext = createMockContext();
            const entry = audit.rateLimited(mockContext, '/api/sync');

            expect(entry.event).toBe('security.rate_limited');
            expect(entry.success).toBe(false);
            expect(entry.metadata).toEqual({ endpoint: '/api/sync' });
        });

        it('should log unauthorized', () => {
            const mockContext = createMockContext();
            const entry = audit.unauthorized(mockContext, '/api/user/settings');

            expect(entry.event).toBe('security.unauthorized');
            expect(entry.success).toBe(false);
            expect(entry.metadata).toEqual({ endpoint: '/api/user/settings' });
        });

        it('should log forbidden with reason', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.forbidden(mockContext, '/api/admin', 'Not an admin');

            expect(entry.event).toBe('security.forbidden');
            expect(entry.success).toBe(false);
            expect(entry.metadata).toEqual({ endpoint: '/api/admin', reason: 'Not an admin' });
        });

        it('should log document created', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.documentCreated(mockContext, 'doc-123');

            expect(entry.event).toBe('document.created');
            expect(entry.metadata).toEqual({ documentId: 'doc-123' });
        });

        it('should log document updated', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.documentUpdated(mockContext, 'doc-123');

            expect(entry.event).toBe('document.updated');
            expect(entry.metadata).toEqual({ documentId: 'doc-123' });
        });

        it('should log document deleted', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.documentDeleted(mockContext, 'doc-123');

            expect(entry.event).toBe('document.deleted');
            expect(entry.metadata).toEqual({ documentId: 'doc-123' });
        });

        it('should log settings updated', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.settingsUpdated(mockContext);

            expect(entry.event).toBe('user.settings.updated');
        });

        it('should log github file created', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.githubFileCreated(mockContext, 'owner/repo', 'docs/readme.md');

            expect(entry.event).toBe('github.file.created');
            expect(entry.metadata).toEqual({ repo: 'owner/repo', path: 'docs/readme.md' });
        });

        it('should log github file updated', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.githubFileUpdated(mockContext, 'owner/repo', 'docs/readme.md');

            expect(entry.event).toBe('github.file.updated');
            expect(entry.metadata).toEqual({ repo: 'owner/repo', path: 'docs/readme.md' });
        });

        it('should log github file deleted', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.githubFileDeleted(mockContext, 'owner/repo', 'docs/readme.md');

            expect(entry.event).toBe('github.file.deleted');
            expect(entry.metadata).toEqual({ repo: 'owner/repo', path: 'docs/readme.md' });
        });

        it('should log google file created', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.googleFileCreated(mockContext, 'file-123', 'document.md');

            expect(entry.event).toBe('google.file.created');
            expect(entry.metadata).toEqual({ fileId: 'file-123', name: 'document.md' });
        });

        it('should log google file updated', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.googleFileUpdated(mockContext, 'file-123', 'document.md');

            expect(entry.event).toBe('google.file.updated');
            expect(entry.metadata).toEqual({ fileId: 'file-123', name: 'document.md' });
        });

        it('should log google file deleted', () => {
            const mockContext = createMockContext({ user: createMockUser() });
            const entry = audit.googleFileDeleted(mockContext, 'file-123', 'document.md');

            expect(entry.event).toBe('google.file.deleted');
            expect(entry.metadata).toEqual({ fileId: 'file-123', name: 'document.md' });
        });
    });
});
