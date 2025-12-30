import type { Session, User } from 'better-auth';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

type AuthVariables = {
    user: User | null;
    session: Session | null;
};

/**
 * Middleware that requires authentication
 * Throws 401 if user is not authenticated
 */
export async function requireAuth(c: Context<{ Variables: AuthVariables }>, next: Next) {
    const user = c.get('user');

    if (!user) {
        throw new HTTPException(401, {
            message: 'Authentication required'
        });
    }

    await next();
}

/**
 * Middleware that optionally sets user (doesn't require auth)
 * Useful for routes that work for both authenticated and anonymous users
 */
export async function optionalAuth(_c: Context<{ Variables: AuthVariables }>, next: Next) {
    // User is already set by the main auth middleware
    await next();
}

/**
 * Helper to get authenticated user from context
 * Throws if user is not authenticated
 */
export function getAuthUser(c: Context<{ Variables: AuthVariables }>): User {
    const user = c.get('user');

    if (!user) {
        throw new HTTPException(401, {
            message: 'Authentication required'
        });
    }

    return user;
}

/**
 * Helper to get user from context (may be null)
 */
export function getOptionalUser(c: Context<{ Variables: AuthVariables }>): User | null {
    return c.get('user');
}
