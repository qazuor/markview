import { RATE_LIMITS, createRateLimiter, rateLimit, userRateLimit } from '@/server/api/middleware/rateLimit';
import { createMockContext, createMockNext, createMockUser } from '@test/helpers/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('rateLimit middleware', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('rateLimit', () => {
        it('should allow requests within limit', async () => {
            const middleware = rateLimit({ limit: 5, windowSeconds: 60 });
            const mockContext = createMockContext({
                headers: { 'x-forwarded-for': '192.168.1.1' }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should set rate limit headers', async () => {
            const middleware = rateLimit({ limit: 10, windowSeconds: 60 });
            const mockContext = createMockContext({
                headers: { 'x-forwarded-for': '192.168.1.2' }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockContext.header).toHaveBeenCalledWith('X-RateLimit-Limit', '10');
            expect(mockContext.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '9');
            expect(mockContext.header).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
        });

        it('should decrement remaining count on each request', async () => {
            const middleware = rateLimit({ limit: 5, windowSeconds: 60 });
            const mockNext = createMockNext();

            // Use unique IP to avoid collisions with other tests
            const ip = `test-${Date.now()}-decrement`;

            // First request
            const ctx1 = createMockContext({ headers: { 'x-forwarded-for': ip } });
            await middleware(ctx1, mockNext);
            expect(ctx1.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');

            // Second request
            const ctx2 = createMockContext({ headers: { 'x-forwarded-for': ip } });
            await middleware(ctx2, mockNext);
            expect(ctx2.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '3');

            // Third request
            const ctx3 = createMockContext({ headers: { 'x-forwarded-for': ip } });
            await middleware(ctx3, mockNext);
            expect(ctx3.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '2');
        });

        it('should return 429 when limit exceeded', async () => {
            const middleware = rateLimit({ limit: 2, windowSeconds: 60 });
            const mockNext = createMockNext();

            const ip = `test-${Date.now()}-exceeded`;

            // First two requests should pass
            await middleware(createMockContext({ headers: { 'x-forwarded-for': ip } }), mockNext);
            await middleware(createMockContext({ headers: { 'x-forwarded-for': ip } }), mockNext);

            // Third request should be rate limited
            const ctx = createMockContext({ headers: { 'x-forwarded-for': ip } });
            const result = await middleware(ctx, mockNext);

            expect(ctx.header).toHaveBeenCalledWith('Retry-After', expect.any(String));
            expect(ctx.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Too Many Requests'
                }),
                429
            );
        });

        it('should reset after window expires', async () => {
            const middleware = rateLimit({ limit: 2, windowSeconds: 60 });
            const mockNext = createMockNext();

            const ip = `test-${Date.now()}-reset`;

            // Use up the limit
            await middleware(createMockContext({ headers: { 'x-forwarded-for': ip } }), mockNext);
            await middleware(createMockContext({ headers: { 'x-forwarded-for': ip } }), mockNext);

            // Advance time past the window
            vi.advanceTimersByTime(61 * 1000);

            // Next request should work
            const ctx = createMockContext({ headers: { 'x-forwarded-for': ip } });
            await middleware(ctx, mockNext);

            expect(ctx.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '1');
        });

        it('should skip authenticated users when skipAuthenticated is true', async () => {
            const middleware = rateLimit({ limit: 1, windowSeconds: 60, skipAuthenticated: true });
            const mockNext = createMockNext();
            const mockUser = createMockUser();

            const ip = `test-${Date.now()}-skip`;

            // Use up limit for unauthenticated
            await middleware(createMockContext({ headers: { 'x-forwarded-for': ip } }), mockNext);

            // Authenticated user should bypass
            const ctx = createMockContext({
                user: mockUser,
                headers: { 'x-forwarded-for': ip }
            });
            await middleware(ctx, mockNext);

            // Should have called next twice (not been rate limited)
            expect(mockNext).toHaveBeenCalledTimes(2);
        });

        it('should use custom key generator when provided', async () => {
            const customKeyGenerator = vi.fn().mockReturnValue('custom-key');
            const middleware = rateLimit({
                limit: 5,
                windowSeconds: 60,
                keyGenerator: customKeyGenerator
            });
            const mockContext = createMockContext();
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(customKeyGenerator).toHaveBeenCalledWith(mockContext);
        });

        it('should extract IP from x-real-ip header', async () => {
            const middleware = rateLimit({ limit: 5, windowSeconds: 60 });
            const mockContext = createMockContext({
                headers: { 'x-real-ip': '10.0.0.1' }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should extract IP from cf-connecting-ip header', async () => {
            const middleware = rateLimit({ limit: 5, windowSeconds: 60 });
            const mockContext = createMockContext({
                headers: { 'cf-connecting-ip': '8.8.8.8' }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should use unknown when no IP headers present', async () => {
            const middleware = rateLimit({ limit: 5, windowSeconds: 60 });
            const mockContext = createMockContext({ headers: {} });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('RATE_LIMITS', () => {
        it('should have standard config', () => {
            expect(RATE_LIMITS.standard).toEqual({ limit: 100, windowSeconds: 60 });
        });

        it('should have auth config', () => {
            expect(RATE_LIMITS.auth).toEqual({ limit: 10, windowSeconds: 60 });
        });

        it('should have sync config', () => {
            expect(RATE_LIMITS.sync).toEqual({ limit: 60, windowSeconds: 60 });
        });

        it('should have externalProxy config', () => {
            expect(RATE_LIMITS.externalProxy).toEqual({ limit: 30, windowSeconds: 60 });
        });

        it('should have heavy config', () => {
            expect(RATE_LIMITS.heavy).toEqual({ limit: 10, windowSeconds: 60 });
        });
    });

    describe('createRateLimiter', () => {
        it('should create middleware with standard limits', async () => {
            const middleware = createRateLimiter('standard');
            const mockContext = createMockContext({
                headers: { 'x-forwarded-for': `create-std-${Date.now()}` }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockContext.header).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
        });

        it('should create middleware with auth limits', async () => {
            const middleware = createRateLimiter('auth');
            const mockContext = createMockContext({
                headers: { 'x-forwarded-for': `create-auth-${Date.now()}` }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockContext.header).toHaveBeenCalledWith('X-RateLimit-Limit', '10');
        });

        it('should allow overriding options', async () => {
            const middleware = createRateLimiter('standard', { limit: 50 });
            const mockContext = createMockContext({
                headers: { 'x-forwarded-for': `create-override-${Date.now()}` }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockContext.header).toHaveBeenCalledWith('X-RateLimit-Limit', '50');
        });
    });

    describe('userRateLimit', () => {
        it('should use user ID for authenticated users', async () => {
            const mockUser = createMockUser({ id: 'user-rate-limit-test' });
            const middleware = userRateLimit({ limit: 5, windowSeconds: 60 });
            const mockContext = createMockContext({
                user: mockUser,
                headers: { 'x-forwarded-for': '192.168.1.1' }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should use IP for anonymous users', async () => {
            const middleware = userRateLimit({ limit: 5, windowSeconds: 60 });
            const mockContext = createMockContext({
                user: null,
                headers: { 'x-forwarded-for': `anon-${Date.now()}` }
            });
            const mockNext = createMockNext();

            await middleware(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should separate limits between users', async () => {
            const middleware = userRateLimit({ limit: 2, windowSeconds: 60 });
            const mockNext = createMockNext();

            const user1 = createMockUser({ id: `user-sep-1-${Date.now()}` });
            const user2 = createMockUser({ id: `user-sep-2-${Date.now()}` });

            // User 1 uses their limit
            await middleware(createMockContext({ user: user1 }), mockNext);
            await middleware(createMockContext({ user: user1 }), mockNext);

            // User 2 should still have their own limit
            const ctx = createMockContext({ user: user2 });
            await middleware(ctx, mockNext);

            expect(ctx.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '1');
        });
    });
});
