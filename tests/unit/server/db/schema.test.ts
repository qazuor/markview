import {
    type Account,
    type Document,
    type Folder,
    type NewAccount,
    type NewDocument,
    type NewFolder,
    type NewSession,
    type NewUser,
    type NewUserSettings,
    type Session,
    type User,
    type UserSettings,
    accounts,
    accountsRelations,
    documents,
    documentsRelations,
    folders,
    foldersRelations,
    sessions,
    sessionsRelations,
    userSettings,
    userSettingsRelations,
    users,
    usersRelations,
    verifications
} from '@/server/db/schema';
import { getTableName } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

describe('server/db/schema', () => {
    describe('Auth Tables', () => {
        describe('users table', () => {
            it('should have correct table name', () => {
                expect(getTableName(users)).toBe('users');
            });

            it('should have required columns', () => {
                expect(users.id).toBeDefined();
                expect(users.name).toBeDefined();
                expect(users.email).toBeDefined();
                expect(users.emailVerified).toBeDefined();
                expect(users.image).toBeDefined();
                expect(users.createdAt).toBeDefined();
                expect(users.updatedAt).toBeDefined();
            });

            it('should have id column', () => {
                expect(users.id.name).toBe('id');
            });
        });

        describe('sessions table', () => {
            it('should have correct table name', () => {
                expect(getTableName(sessions)).toBe('sessions');
            });

            it('should have required columns', () => {
                expect(sessions.id).toBeDefined();
                expect(sessions.userId).toBeDefined();
                expect(sessions.token).toBeDefined();
                expect(sessions.expiresAt).toBeDefined();
                expect(sessions.ipAddress).toBeDefined();
                expect(sessions.userAgent).toBeDefined();
                expect(sessions.createdAt).toBeDefined();
                expect(sessions.updatedAt).toBeDefined();
            });

            it('should have userId column for user reference', () => {
                expect(sessions.userId.name).toBe('user_id');
            });
        });

        describe('accounts table', () => {
            it('should have correct table name', () => {
                expect(getTableName(accounts)).toBe('accounts');
            });

            it('should have required columns', () => {
                expect(accounts.id).toBeDefined();
                expect(accounts.userId).toBeDefined();
                expect(accounts.accountId).toBeDefined();
                expect(accounts.providerId).toBeDefined();
                expect(accounts.accessToken).toBeDefined();
                expect(accounts.refreshToken).toBeDefined();
                expect(accounts.accessTokenExpiresAt).toBeDefined();
                expect(accounts.refreshTokenExpiresAt).toBeDefined();
                expect(accounts.scope).toBeDefined();
                expect(accounts.idToken).toBeDefined();
            });
        });

        describe('verifications table', () => {
            it('should have correct table name', () => {
                expect(getTableName(verifications)).toBe('verifications');
            });

            it('should have required columns', () => {
                expect(verifications.id).toBeDefined();
                expect(verifications.identifier).toBeDefined();
                expect(verifications.value).toBeDefined();
                expect(verifications.expiresAt).toBeDefined();
                expect(verifications.createdAt).toBeDefined();
                expect(verifications.updatedAt).toBeDefined();
            });
        });
    });

    describe('Application Tables', () => {
        describe('folders table', () => {
            it('should have correct table name', () => {
                expect(getTableName(folders)).toBe('folders');
            });

            it('should have required columns', () => {
                expect(folders.id).toBeDefined();
                expect(folders.userId).toBeDefined();
                expect(folders.name).toBeDefined();
                expect(folders.parentId).toBeDefined();
                expect(folders.color).toBeDefined();
                expect(folders.sortOrder).toBeDefined();
                expect(folders.createdAt).toBeDefined();
                expect(folders.updatedAt).toBeDefined();
                expect(folders.deletedAt).toBeDefined();
            });

            it('should support soft delete via deletedAt', () => {
                expect(folders.deletedAt).toBeDefined();
                expect(folders.deletedAt.name).toBe('deleted_at');
            });

            it('should support nested folders via parentId', () => {
                expect(folders.parentId).toBeDefined();
                expect(folders.parentId.name).toBe('parent_id');
            });
        });

        describe('documents table', () => {
            it('should have correct table name', () => {
                expect(getTableName(documents)).toBe('documents');
            });

            it('should have required columns', () => {
                expect(documents.id).toBeDefined();
                expect(documents.userId).toBeDefined();
                expect(documents.name).toBeDefined();
                expect(documents.content).toBeDefined();
                expect(documents.folderId).toBeDefined();
                expect(documents.isManuallyNamed).toBeDefined();
                expect(documents.cursor).toBeDefined();
                expect(documents.scroll).toBeDefined();
                expect(documents.syncVersion).toBeDefined();
                expect(documents.createdAt).toBeDefined();
                expect(documents.updatedAt).toBeDefined();
                expect(documents.syncedAt).toBeDefined();
                expect(documents.deletedAt).toBeDefined();
            });

            it('should support soft delete via deletedAt', () => {
                expect(documents.deletedAt).toBeDefined();
            });

            it('should support sync versioning', () => {
                expect(documents.syncVersion).toBeDefined();
            });

            it('should support cursor and scroll position as JSON', () => {
                expect(documents.cursor).toBeDefined();
                expect(documents.scroll).toBeDefined();
            });
        });

        describe('userSettings table', () => {
            it('should have correct table name', () => {
                expect(getTableName(userSettings)).toBe('user_settings');
            });

            it('should have required columns', () => {
                expect(userSettings.id).toBeDefined();
                expect(userSettings.userId).toBeDefined();
                expect(userSettings.settings).toBeDefined();
                expect(userSettings.updatedAt).toBeDefined();
            });

            it('should store settings as JSON', () => {
                expect(userSettings.settings).toBeDefined();
            });
        });
    });

    describe('Relations', () => {
        it('should export usersRelations', () => {
            expect(usersRelations).toBeDefined();
        });

        it('should export sessionsRelations', () => {
            expect(sessionsRelations).toBeDefined();
        });

        it('should export accountsRelations', () => {
            expect(accountsRelations).toBeDefined();
        });

        it('should export foldersRelations', () => {
            expect(foldersRelations).toBeDefined();
        });

        it('should export documentsRelations', () => {
            expect(documentsRelations).toBeDefined();
        });

        it('should export userSettingsRelations', () => {
            expect(userSettingsRelations).toBeDefined();
        });
    });

    describe('Types', () => {
        it('should export User types', () => {
            const user: User = {
                id: 'test-id',
                name: 'Test User',
                email: 'test@example.com',
                emailVerified: true,
                image: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            expect(user.id).toBe('test-id');
            expect(user.name).toBe('Test User');
            expect(user.email).toBe('test@example.com');
        });

        it('should export NewUser type for inserts', () => {
            const newUser: NewUser = {
                id: 'new-id',
                name: 'New User',
                email: 'new@example.com'
            };

            expect(newUser.id).toBe('new-id');
            // emailVerified should be optional with default
        });

        it('should export Session types', () => {
            const session: Session = {
                id: 'session-id',
                userId: 'user-id',
                token: 'token-123',
                expiresAt: new Date(),
                ipAddress: null,
                userAgent: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            expect(session.id).toBe('session-id');
            expect(session.userId).toBe('user-id');
        });

        it('should export NewSession type for inserts', () => {
            const newSession: NewSession = {
                id: 'new-session-id',
                userId: 'user-id',
                token: 'new-token',
                expiresAt: new Date()
            };

            expect(newSession.id).toBe('new-session-id');
        });

        it('should export Account types', () => {
            const account: Account = {
                id: 'account-id',
                userId: 'user-id',
                accountId: 'github-123',
                providerId: 'github',
                accessToken: 'token',
                refreshToken: null,
                accessTokenExpiresAt: null,
                refreshTokenExpiresAt: null,
                scope: null,
                idToken: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            expect(account.providerId).toBe('github');
        });

        it('should export NewAccount type for inserts', () => {
            const newAccount: NewAccount = {
                id: 'new-account-id',
                userId: 'user-id',
                accountId: 'google-456',
                providerId: 'google'
            };

            expect(newAccount.providerId).toBe('google');
        });

        it('should export Folder types', () => {
            const folder: Folder = {
                id: 'folder-id',
                userId: 'user-id',
                name: 'My Folder',
                parentId: null,
                color: '#ff0000',
                sortOrder: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            };

            expect(folder.name).toBe('My Folder');
        });

        it('should export NewFolder type for inserts', () => {
            const newFolder: NewFolder = {
                id: 'new-folder-id',
                userId: 'user-id',
                name: 'New Folder'
            };

            expect(newFolder.name).toBe('New Folder');
        });

        it('should export Document types', () => {
            const doc: Document = {
                id: 'doc-id',
                userId: 'user-id',
                name: 'My Document',
                content: '# Hello',
                folderId: null,
                isManuallyNamed: false,
                cursor: { line: 1, column: 0 },
                scroll: { line: 1, percentage: 0 },
                syncVersion: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                syncedAt: null,
                deletedAt: null
            };

            expect(doc.name).toBe('My Document');
            expect(doc.cursor).toEqual({ line: 1, column: 0 });
        });

        it('should export NewDocument type for inserts', () => {
            const newDoc: NewDocument = {
                id: 'new-doc-id',
                userId: 'user-id',
                name: 'New Document'
            };

            expect(newDoc.name).toBe('New Document');
        });

        it('should export UserSettings types', () => {
            const settings: UserSettings = {
                id: 'settings-id',
                userId: 'user-id',
                settings: { theme: 'dark', fontSize: 14 },
                updatedAt: new Date()
            };

            expect(settings.settings).toEqual({ theme: 'dark', fontSize: 14 });
        });

        it('should export NewUserSettings type for inserts', () => {
            const newSettings: NewUserSettings = {
                id: 'new-settings-id',
                userId: 'user-id',
                settings: { theme: 'light' }
            };

            expect(newSettings.settings).toEqual({ theme: 'light' });
        });
    });
});
