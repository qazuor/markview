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
        env: process.env.NODE_ENV,
        url: c.req.url,
        path: c.req.path
    });
});

// Debug endpoint to test DB connection
app.get('/api/debug/db', async (c) => {
    const start = Date.now();
    try {
        // Just test if auth can get session (no session expected, but tests DB)
        await auth.api.getSession({ headers: c.req.raw.headers });
        return c.json({
            status: 'ok',
            dbTime: Date.now() - start,
            message: 'Database connection successful'
        });
    } catch (error) {
        return c.json({
            status: 'error',
            dbTime: Date.now() - start,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});

// Debug endpoint to check auth configuration (no secrets exposed)
app.get('/api/debug/auth-config', (c) => {
    return c.json({
        baseURL: process.env.BETTER_AUTH_URL || 'NOT SET',
        secret: process.env.BETTER_AUTH_SECRET ? 'SET' : 'NOT SET',
        github: {
            clientId: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
            clientSecret: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET'
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET'
        },
        trustedOrigins: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://qazuor-markview.vercel.app',
            process.env.NEXT_PUBLIC_APP_URL || ''
        ].filter(Boolean)
    });
});

// Debug: Test if auth routes are reachable
app.get('/api/auth/test', (c) => {
    return c.json({ status: 'auth routes reachable', timestamp: new Date().toISOString() });
});

// Debug: Test social sign-in without the full flow
app.get('/api/debug/test-social-signin', async (c) => {
    const steps: { step: string; time: number; error?: string }[] = [];
    const start = Date.now();

    try {
        steps.push({ step: '1. Start', time: Date.now() - start });

        // Create a mock request for social sign-in
        const mockBody = JSON.stringify({
            provider: 'github',
            callbackURL: 'https://qazuor-markview.vercel.app/'
        });
        steps.push({ step: '2. Body created', time: Date.now() - start });

        const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:5173';
        const mockRequest = new Request(`${baseUrl}/api/auth/sign-in/social`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Host': new URL(baseUrl).host
            },
            body: mockBody
        });
        steps.push({ step: '3. Request created', time: Date.now() - start });

        // Try to call auth.handler with a timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Auth handler timeout after 10s')), 10000);
        });

        const authPromise = auth.handler(mockRequest);
        steps.push({ step: '4. Auth handler called', time: Date.now() - start });

        const response = await Promise.race([authPromise, timeoutPromise]);
        steps.push({ step: '5. Response received', time: Date.now() - start });

        const responseText = await response.text();
        steps.push({ step: '6. Response body read', time: Date.now() - start });

        return c.json({
            success: true,
            status: response.status,
            responsePreview: responseText.substring(0, 500),
            steps,
            totalTime: Date.now() - start
        });
    } catch (error) {
        steps.push({
            step: 'ERROR',
            time: Date.now() - start,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return c.json({
            success: false,
            steps,
            totalTime: Date.now() - start
        }, 500);
    }
});

// Auth routes - Better Auth handler (with rate limiting)
app.use('/api/auth/*', createRateLimiter('auth'));
app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
    const rawReq = c.req.raw;
    console.log('[AUTH] Raw request URL:', rawReq.url);
    console.log('[AUTH] Raw request method:', rawReq.method);
    console.log('[AUTH] c.req.path:', c.req.path);
    console.log('[AUTH] c.req.url:', c.req.url);

    // If the URL doesn't include the full path, reconstruct it
    const requestUrl = new URL(rawReq.url);
    console.log('[AUTH] Parsed URL pathname:', requestUrl.pathname);

    // If path is just '/' or '/api', we need to use Hono's path
    if (requestUrl.pathname === '/' || requestUrl.pathname === '/api') {
        const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:5173';
        const fullUrl = `${baseUrl}${c.req.path}`;
        console.log('[AUTH] Reconstructing request with URL:', fullUrl);

        // Clone body if present
        let body = null;
        if (rawReq.method === 'POST' || rawReq.method === 'PUT' || rawReq.method === 'PATCH') {
            body = await rawReq.clone().text();
        }

        const newRequest = new Request(fullUrl, {
            method: rawReq.method,
            headers: rawReq.headers,
            body: body
        });

        const start = Date.now();
        const response = await auth.handler(newRequest);
        console.log('[AUTH] Response received in', Date.now() - start, 'ms');
        return response;
    }

    const start = Date.now();
    const response = await auth.handler(rawReq);
    console.log('[AUTH] Response received in', Date.now() - start, 'ms');
    return response;
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
