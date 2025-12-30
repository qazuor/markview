import { relations } from 'drizzle-orm';
import { boolean, index, integer, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// ============================================================================
// Auth Tables (Better Auth)
// ============================================================================

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const sessions = pgTable(
    'sessions',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        token: text('token').notNull().unique(),
        expiresAt: timestamp('expires_at').notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow()
    },
    (table) => [index('sessions_user_id_idx').on(table.userId), index('sessions_token_idx').on(table.token)]
);

export const accounts = pgTable(
    'accounts',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id').notNull(), // 'github' | 'google'
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at'),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
        scope: text('scope'),
        idToken: text('id_token'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow()
    },
    (table) => [index('accounts_user_id_idx').on(table.userId), index('accounts_provider_idx').on(table.providerId, table.accountId)]
);

export const verifications = pgTable(
    'verifications',
    {
        id: text('id').primaryKey(),
        identifier: text('identifier').notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow()
    },
    (table) => [index('verifications_identifier_idx').on(table.identifier)]
);

// ============================================================================
// Application Tables
// ============================================================================

export const folders = pgTable(
    'folders',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        parentId: text('parent_id'),
        color: text('color'),
        sortOrder: integer('sort_order').notNull().default(0),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        deletedAt: timestamp('deleted_at')
    },
    (table) => [index('folders_user_id_idx').on(table.userId), index('folders_parent_id_idx').on(table.parentId)]
);

export const documents = pgTable(
    'documents',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        content: text('content').notNull().default(''),
        folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
        isManuallyNamed: boolean('is_manually_named').notNull().default(false),
        cursor: json('cursor').$type<{ line: number; column: number }>(),
        scroll: json('scroll').$type<{ line: number; percentage: number }>(),
        syncVersion: integer('sync_version').notNull().default(1),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        syncedAt: timestamp('synced_at'),
        deletedAt: timestamp('deleted_at')
    },
    (table) => [
        index('documents_user_id_idx').on(table.userId),
        index('documents_folder_id_idx').on(table.folderId),
        index('documents_updated_at_idx').on(table.updatedAt)
    ]
);

export const userSettings = pgTable('user_settings', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: 'cascade' }),
    settings: json('settings').$type<Record<string, unknown>>().notNull().default({}),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ many, one }) => ({
    sessions: many(sessions),
    accounts: many(accounts),
    folders: many(folders),
    documents: many(documents),
    settings: one(userSettings)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id]
    })
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id]
    })
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
    user: one(users, {
        fields: [folders.userId],
        references: [users.id]
    }),
    parent: one(folders, {
        fields: [folders.parentId],
        references: [folders.id],
        relationName: 'folderHierarchy'
    }),
    children: many(folders, { relationName: 'folderHierarchy' }),
    documents: many(documents)
}));

export const documentsRelations = relations(documents, ({ one }) => ({
    user: one(users, {
        fields: [documents.userId],
        references: [users.id]
    }),
    folder: one(folders, {
        fields: [documents.folderId],
        references: [folders.id]
    })
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
    user: one(users, {
        fields: [userSettings.userId],
        references: [users.id]
    })
}));

// ============================================================================
// Types
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
