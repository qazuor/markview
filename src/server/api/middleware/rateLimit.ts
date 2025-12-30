import type { Context, MiddlewareHandler } from 'hono';

interface RateLimitConfig {
    /** Maximum requests allowed in the window */
    limit: number;
    /** Time window in seconds */
    windowSeconds: number;
    /** Optional key generator (defaults to IP-based) */
    keyGenerator?: (c: Context) => string;
    /** Whether to skip rate limiting for authenticated users */
    skipAuthenticated?: boolean;
}

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store for rate limiting (development/single-instance)
// For production with multiple instances, use Redis/Vercel KV
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
    if (cleanupInterval) return;

    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (entry.resetAt < now) {
                rateLimitStore.delete(key);
            }
        }
    }, CLEANUP_INTERVAL_MS);

    // Don't prevent process exit
    if (typeof cleanupInterval.unref === 'function') {
        cleanupInterval.unref();
    }
}

/**
 * Get client IP from request headers
 */
function getClientIP(c: Context): string {
    // Vercel/Cloudflare headers
    const xForwardedFor = c.req.header('x-forwarded-for');
    if (xForwardedFor) {
        const ip = xForwardedFor.split(',')[0];
        return ip ? ip.trim() : 'unknown';
    }

    const xRealIp = c.req.header('x-real-ip');
    if (xRealIp) {
        return xRealIp;
    }

    // Cloudflare specific
    const cfConnectingIp = c.req.header('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp;
    }

    return 'unknown';
}

/**
 * Default rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
    /** Standard API endpoints */
    standard: { limit: 100, windowSeconds: 60 },
    /** Auth endpoints (more restrictive) */
    auth: { limit: 10, windowSeconds: 60 },
    /** Sync endpoints */
    sync: { limit: 60, windowSeconds: 60 },
    /** GitHub/Google proxy (based on their limits) */
    externalProxy: { limit: 30, windowSeconds: 60 },
    /** Heavy operations */
    heavy: { limit: 10, windowSeconds: 60 }
} as const;

/**
 * Create a rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig): MiddlewareHandler {
    const { limit, windowSeconds, keyGenerator, skipAuthenticated = false } = config;

    startCleanup();

    return async (c, next) => {
        // Optionally skip for authenticated users
        if (skipAuthenticated) {
            const user = c.get('user');
            if (user) {
                return next();
            }
        }

        // Generate rate limit key
        const key = keyGenerator ? keyGenerator(c) : `ip:${getClientIP(c)}:${c.req.path}`;

        const now = Date.now();
        const windowMs = windowSeconds * 1000;

        // Get or create entry
        let entry = rateLimitStore.get(key);

        if (!entry || entry.resetAt < now) {
            // Create new window
            entry = {
                count: 1,
                resetAt: now + windowMs
            };
            rateLimitStore.set(key, entry);
        } else {
            // Increment count in current window
            entry.count++;
        }

        // Calculate remaining
        const remaining = Math.max(0, limit - entry.count);
        const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

        // Set rate limit headers
        c.header('X-RateLimit-Limit', limit.toString());
        c.header('X-RateLimit-Remaining', remaining.toString());
        c.header('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());

        // Check if rate limited
        if (entry.count > limit) {
            c.header('Retry-After', resetSeconds.toString());

            return c.json(
                {
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`,
                    retryAfter: resetSeconds
                },
                429
            );
        }

        return next();
    };
}

/**
 * Create a rate limiter for a specific endpoint pattern
 */
export function createRateLimiter(type: keyof typeof RATE_LIMITS, options?: Partial<RateLimitConfig>) {
    const baseConfig = RATE_LIMITS[type];
    return rateLimit({
        ...baseConfig,
        ...options
    });
}

/**
 * Per-user rate limiting (for authenticated endpoints)
 */
export function userRateLimit(config: Omit<RateLimitConfig, 'keyGenerator'>): MiddlewareHandler {
    return rateLimit({
        ...config,
        keyGenerator: (c) => {
            const user = c.get('user');
            if (user?.id) {
                return `user:${user.id}:${c.req.path}`;
            }
            return `ip:${getClientIP(c)}:${c.req.path}`;
        }
    });
}
