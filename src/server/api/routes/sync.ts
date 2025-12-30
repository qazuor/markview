import { zValidator } from '@hono/zod-validator';
import type { Session, User } from 'better-auth';
import { and, eq, gt, isNull, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db, documents, folders } from '../../db';
import { getAuthUser } from '../middleware/auth';

type Variables = {
    user: User | null;
    session: Session | null;
};

const syncRoutes = new Hono<{ Variables: Variables }>();

// ============================================================================
// Schemas
// ============================================================================

const documentSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    content: z.string(),
    folderId: z.string().nullable().optional(),
    isManuallyNamed: z.boolean().optional(),
    cursor: z
        .object({
            line: z.number(),
            column: z.number()
        })
        .nullable()
        .optional(),
    scroll: z
        .object({
            line: z.number(),
            percentage: z.number()
        })
        .nullable()
        .optional(),
    syncVersion: z.number().optional()
});

const folderSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    parentId: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    sortOrder: z.number().optional()
});

// ============================================================================
// Document Routes
// ============================================================================

// GET /api/sync/documents - List all documents
syncRoutes.get('/documents', async (c) => {
    const user = getAuthUser(c);
    const since = c.req.query('since');

    const sinceDate = since ? new Date(since) : null;
    const query = db.query.documents.findMany({
        where: and(
            eq(documents.userId, user.id),
            sinceDate
                ? or(gt(documents.updatedAt, sinceDate), documents.deletedAt ? gt(documents.deletedAt, sinceDate) : undefined)
                : undefined
        ),
        orderBy: (docs, { desc }) => [desc(docs.updatedAt)]
    });

    const docs = await query;

    return c.json({
        documents: docs,
        syncedAt: new Date().toISOString()
    });
});

// PUT /api/sync/documents/:id - Create or update document
syncRoutes.put('/documents/:id', zValidator('json', documentSchema), async (c) => {
    const user = getAuthUser(c);
    const docId = c.req.param('id');
    const data = c.req.valid('json');

    // Check if document exists
    const existing = await db.query.documents.findFirst({
        where: and(eq(documents.id, docId), eq(documents.userId, user.id))
    });

    if (existing) {
        // Check for conflict
        if (data.syncVersion && existing.syncVersion > data.syncVersion) {
            return c.json(
                {
                    error: 'Conflict',
                    message: 'Document has been modified on server',
                    serverVersion: existing.syncVersion,
                    serverDocument: existing
                },
                409
            );
        }

        // Update existing
        const [updated] = await db
            .update(documents)
            .set({
                name: data.name,
                content: data.content,
                folderId: data.folderId,
                isManuallyNamed: data.isManuallyNamed ?? existing.isManuallyNamed,
                cursor: data.cursor,
                scroll: data.scroll,
                syncVersion: existing.syncVersion + 1,
                updatedAt: new Date(),
                syncedAt: new Date(),
                deletedAt: null // Restore if was deleted
            })
            .where(and(eq(documents.id, docId), eq(documents.userId, user.id)))
            .returning();

        return c.json({ document: updated });
    }

    // Create new
    const [created] = await db
        .insert(documents)
        .values({
            id: docId,
            userId: user.id,
            name: data.name,
            content: data.content,
            folderId: data.folderId,
            isManuallyNamed: data.isManuallyNamed ?? false,
            cursor: data.cursor,
            scroll: data.scroll,
            syncVersion: 1,
            syncedAt: new Date()
        })
        .returning();

    return c.json({ document: created }, 201);
});

// DELETE /api/sync/documents/:id - Soft delete document
syncRoutes.delete('/documents/:id', async (c) => {
    const user = getAuthUser(c);
    const docId = c.req.param('id');

    const [deleted] = await db
        .update(documents)
        .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
            syncVersion: db
                .select({ v: documents.syncVersion })
                .from(documents)
                .where(eq(documents.id, docId))
                .limit(1) as unknown as number
        })
        .where(and(eq(documents.id, docId), eq(documents.userId, user.id), isNull(documents.deletedAt)))
        .returning();

    if (!deleted) {
        return c.json({ error: 'Document not found' }, 404);
    }

    return c.json({ success: true, document: deleted });
});

// ============================================================================
// Folder Routes
// ============================================================================

// GET /api/sync/folders - List all folders
syncRoutes.get('/folders', async (c) => {
    const user = getAuthUser(c);
    const since = c.req.query('since');

    const sinceDate = since ? new Date(since) : null;
    const flds = await db.query.folders.findMany({
        where: and(
            eq(folders.userId, user.id),
            sinceDate ? or(gt(folders.updatedAt, sinceDate), folders.deletedAt ? gt(folders.deletedAt, sinceDate) : undefined) : undefined
        ),
        orderBy: (f, { asc }) => [asc(f.sortOrder), asc(f.name)]
    });

    return c.json({
        folders: flds,
        syncedAt: new Date().toISOString()
    });
});

// PUT /api/sync/folders/:id - Create or update folder
syncRoutes.put('/folders/:id', zValidator('json', folderSchema), async (c) => {
    const user = getAuthUser(c);
    const folderId = c.req.param('id');
    const data = c.req.valid('json');

    // Check if folder exists
    const existing = await db.query.folders.findFirst({
        where: and(eq(folders.id, folderId), eq(folders.userId, user.id))
    });

    if (existing) {
        // Update existing
        const [updated] = await db
            .update(folders)
            .set({
                name: data.name,
                parentId: data.parentId,
                color: data.color,
                sortOrder: data.sortOrder ?? existing.sortOrder,
                updatedAt: new Date(),
                deletedAt: null
            })
            .where(and(eq(folders.id, folderId), eq(folders.userId, user.id)))
            .returning();

        return c.json({ folder: updated });
    }

    // Create new
    const [created] = await db
        .insert(folders)
        .values({
            id: folderId,
            userId: user.id,
            name: data.name,
            parentId: data.parentId,
            color: data.color,
            sortOrder: data.sortOrder ?? 0
        })
        .returning();

    return c.json({ folder: created }, 201);
});

// DELETE /api/sync/folders/:id - Soft delete folder
syncRoutes.delete('/folders/:id', async (c) => {
    const user = getAuthUser(c);
    const folderId = c.req.param('id');

    const [deleted] = await db
        .update(folders)
        .set({
            deletedAt: new Date(),
            updatedAt: new Date()
        })
        .where(and(eq(folders.id, folderId), eq(folders.userId, user.id), isNull(folders.deletedAt)))
        .returning();

    if (!deleted) {
        return c.json({ error: 'Folder not found' }, 404);
    }

    return c.json({ success: true, folder: deleted });
});

// ============================================================================
// Sync Status
// ============================================================================

// GET /api/sync/status - Get sync status
syncRoutes.get('/status', async (c) => {
    const user = getAuthUser(c);

    const [docCount] = await db
        .select({ count: documents.id })
        .from(documents)
        .where(and(eq(documents.userId, user.id), isNull(documents.deletedAt)));

    const [folderCount] = await db
        .select({ count: folders.id })
        .from(folders)
        .where(and(eq(folders.userId, user.id), isNull(folders.deletedAt)));

    return c.json({
        documentsCount: docCount?.count || 0,
        foldersCount: folderCount?.count || 0,
        timestamp: new Date().toISOString()
    });
});

export default syncRoutes;
