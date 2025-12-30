import { zValidator } from '@hono/zod-validator';
import type { Session, User } from 'better-auth';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db, userSettings } from '../../db';
import { getAuthUser } from '../middleware/auth';

type Variables = {
    user: User | null;
    session: Session | null;
};

const userRoutes = new Hono<{ Variables: Variables }>();

// ============================================================================
// Schemas
// ============================================================================

const settingsSchema = z.object({
    settings: z.record(z.string(), z.unknown())
});

// ============================================================================
// Routes
// ============================================================================

// GET /api/user/me - Get current user info
userRoutes.get('/me', async (c) => {
    const user = getAuthUser(c);

    return c.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
        }
    });
});

// GET /api/user/settings - Get user settings
userRoutes.get('/settings', async (c) => {
    const user = getAuthUser(c);

    const settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, user.id)
    });

    return c.json({
        settings: settings?.settings || {}
    });
});

// PUT /api/user/settings - Update user settings
userRoutes.put('/settings', zValidator('json', settingsSchema), async (c) => {
    const user = getAuthUser(c);
    const { settings } = c.req.valid('json');

    // Check if settings exist
    const existing = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, user.id)
    });

    if (existing) {
        // Merge settings
        const merged = { ...existing.settings, ...settings };

        await db
            .update(userSettings)
            .set({
                settings: merged,
                updatedAt: new Date()
            })
            .where(eq(userSettings.userId, user.id));

        return c.json({ settings: merged });
    }

    // Create new settings
    const id = crypto.randomUUID();
    await db.insert(userSettings).values({
        id,
        userId: user.id,
        settings
    });

    return c.json({ settings }, 201);
});

// DELETE /api/user/settings - Reset settings to defaults
userRoutes.delete('/settings', async (c) => {
    const user = getAuthUser(c);

    await db.delete(userSettings).where(eq(userSettings.userId, user.id));

    return c.json({ success: true, settings: {} });
});

export default userRoutes;
