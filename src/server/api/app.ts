import type { Session, User } from 'better-auth';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from '../auth';

import githubRoutes from './routes/github';
import googleRoutes from './routes/google';
// Import routes
import syncRoutes from './routes/sync';
import userRoutes from './routes/user';

// Define context variables type
type Variables = {
    user: User | null;
    session: Session | null;
};

// Create Hono app
export const app = new Hono<{ Variables: Variables }>();

// ============================================================================
// Middleware
// ============================================================================

app.use('*', logger());
app.use('*', secureHeaders());
app.use(
    '*',
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://qazuor-markview.vercel.app',
            process.env.NEXT_PUBLIC_APP_URL || ''
        ].filter(Boolean),
        credentials: true,
        allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        exposeHeaders: ['Set-Cookie']
    })
);

// Auth middleware - sets user and session in context
app.use('*', async (c, next) => {
    try {
        const session = await auth.api.getSession({
            headers: c.req.raw.headers
        });

        c.set('user', session?.user || null);
        c.set('session', session?.session || null);
    } catch {
        c.set('user', null);
        c.set('session', null);
    }

    await next();
});

// ============================================================================
// Error Handler
// ============================================================================

app.onError((err, c) => {
    console.error('API Error:', err);

    if (err instanceof HTTPException) {
        return c.json(
            {
                error: err.message,
                status: err.status
            },
            err.status
        );
    }

    return c.json(
        {
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? err.message : undefined
        },
        500
    );
});

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

// Auth routes - Better Auth handler
app.on(['GET', 'POST'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});

// Mount route groups
app.route('/api/sync', syncRoutes);
app.route('/api/github', githubRoutes);
app.route('/api/google', googleRoutes);
app.route('/api/user', userRoutes);

// ============================================================================
// Export
// ============================================================================

export default app;
