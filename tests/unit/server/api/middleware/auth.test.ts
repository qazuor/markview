import { getAuthUser, getOptionalUser, optionalAuth, requireAuth } from '@/server/api/middleware/auth';
import { createMockContext, createMockNext, createMockUser } from '@test/helpers/server';
import { HTTPException } from 'hono/http-exception';
import { describe, expect, it, vi } from 'vitest';

describe('auth middleware', () => {
    describe('requireAuth', () => {
        it('should call next when user is authenticated', async () => {
            const mockUser = createMockUser();
            const mockContext = createMockContext({ user: mockUser });
            const mockNext = createMockNext();

            await requireAuth(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should throw 401 when user is not authenticated', async () => {
            const mockContext = createMockContext({ user: null });
            const mockNext = createMockNext();

            await expect(requireAuth(mockContext, mockNext)).rejects.toThrow(HTTPException);

            try {
                await requireAuth(mockContext, mockNext);
            } catch (error) {
                expect((error as HTTPException).status).toBe(401);
                expect((error as HTTPException).message).toBe('Authentication required');
            }
        });

        it('should not call next when user is not authenticated', async () => {
            const mockContext = createMockContext({ user: null });
            const mockNext = createMockNext();

            try {
                await requireAuth(mockContext, mockNext);
            } catch {
                // Expected error
            }

            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('optionalAuth', () => {
        it('should call next when user is authenticated', async () => {
            const mockUser = createMockUser();
            const mockContext = createMockContext({ user: mockUser });
            const mockNext = createMockNext();

            await optionalAuth(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should call next when user is not authenticated', async () => {
            const mockContext = createMockContext({ user: null });
            const mockNext = createMockNext();

            await optionalAuth(mockContext, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('getAuthUser', () => {
        it('should return user when authenticated', () => {
            const mockUser = createMockUser({ id: 'test-user-id', email: 'user@test.com' });
            const mockContext = createMockContext({ user: mockUser });

            const result = getAuthUser(mockContext);

            expect(result).toBe(mockUser);
            expect(result.id).toBe('test-user-id');
            expect(result.email).toBe('user@test.com');
        });

        it('should throw 401 when user is not authenticated', () => {
            const mockContext = createMockContext({ user: null });

            expect(() => getAuthUser(mockContext)).toThrow(HTTPException);

            try {
                getAuthUser(mockContext);
            } catch (error) {
                expect((error as HTTPException).status).toBe(401);
                expect((error as HTTPException).message).toBe('Authentication required');
            }
        });
    });

    describe('getOptionalUser', () => {
        it('should return user when authenticated', () => {
            const mockUser = createMockUser({ id: 'optional-user' });
            const mockContext = createMockContext({ user: mockUser });

            const result = getOptionalUser(mockContext);

            expect(result).toBe(mockUser);
            expect(result?.id).toBe('optional-user');
        });

        it('should return null when user is not authenticated', () => {
            const mockContext = createMockContext({ user: null });

            const result = getOptionalUser(mockContext);

            expect(result).toBeNull();
        });
    });
});
