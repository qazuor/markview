import type { Session, User } from 'better-auth';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from '../auth';
import { audit } from '../utils/audit';

import { createRateLimiter } from './middleware/rateLimit';
import githubRoutes from './routes/github';
import googleRoutes from './routes/google';
// Import routes
import syncRoutes from './routes/sync';
import userRoutes from './routes/user';
// Note: Export routes are NOT included here because they use Puppeteer
// which requires Node.js runtime. They are handled by separate serverless
// functions in /api/export/ directory.

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
// Skip for auth routes to avoid conflicts with better-auth handler
app.use('*', async (c, next) => {
    // Skip session check for auth routes - better-auth handles these directly
    if (c.req.path.startsWith('/api/auth/')) {
        c.set('user', null);
        c.set('session', null);
        return next();
    }

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
        // Audit security-related errors
        if (err.status === 401) {
            audit.unauthorized(c, c.req.path);
        } else if (err.status === 403) {
            audit.forbidden(c, c.req.path, err.message);
        }

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

// Auth routes - Better Auth handler (with rate limiting)
app.use('/api/auth/*', createRateLimiter('auth'));
app.on(['GET', 'POST'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});

// Mount route groups with rate limiting
app.use('/api/sync/*', createRateLimiter('sync'));
app.route('/api/sync', syncRoutes);

app.use('/api/github/*', createRateLimiter('externalProxy'));
app.route('/api/github', githubRoutes);

app.use('/api/google/*', createRateLimiter('externalProxy'));
app.route('/api/google', googleRoutes);

app.use('/api/user/*', createRateLimiter('standard'));
app.route('/api/user', userRoutes);

// ============================================================================
// Export
// ============================================================================

export default app;
