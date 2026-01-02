import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock auth-client with hoisted mocks
const { mockUseSession } = vi.hoisted(() => ({
    mockUseSession: vi.fn()
}));

vi.mock('@/lib/auth-client', () => ({
    useSession: () => mockUseSession()
}));

describe('AuthProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSession.mockReturnValue({
            data: null,
            isPending: false
        });
    });

    describe('rendering', () => {
        it('should render children', () => {
            render(
                <AuthProvider>
                    <div data-testid="child">Child Content</div>
                </AuthProvider>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });

        it('should wrap multiple children', () => {
            render(
                <AuthProvider>
                    <div data-testid="child1">Child 1</div>
                    <div data-testid="child2">Child 2</div>
                </AuthProvider>
            );

            expect(screen.getByTestId('child1')).toBeInTheDocument();
            expect(screen.getByTestId('child2')).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('should set isLoading true while session is pending', () => {
            mockUseSession.mockReturnValue({
                data: null,
                isPending: true
            });

            function TestComponent() {
                const { isLoading } = useAuth();
                return <div data-testid="loading">{isLoading.toString()}</div>;
            }

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('loading')).toHaveTextContent('true');
        });

        it('should set isLoading false when session is not pending', async () => {
            mockUseSession.mockReturnValue({
                data: null,
                isPending: false
            });

            function TestComponent() {
                const { isLoading } = useAuth();
                return <div data-testid="loading">{isLoading.toString()}</div>;
            }

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });
        });
    });

    describe('authentication state', () => {
        it('should provide null user when not authenticated', () => {
            mockUseSession.mockReturnValue({
                data: null,
                isPending: false
            });

            function TestComponent() {
                const { user, isAuthenticated } = useAuth();
                return (
                    <div>
                        <span data-testid="user">{user ? user.name : 'null'}</span>
                        <span data-testid="authenticated">{isAuthenticated.toString()}</span>
                    </div>
                );
            }

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('user')).toHaveTextContent('null');
            expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        });

        it('should provide user data when authenticated', () => {
            mockUseSession.mockReturnValue({
                data: {
                    user: { id: '1', name: 'Test User', email: 'test@example.com' }
                },
                isPending: false
            });

            function TestComponent() {
                const { user, isAuthenticated } = useAuth();
                return (
                    <div>
                        <span data-testid="user">{user?.name || 'null'}</span>
                        <span data-testid="authenticated">{isAuthenticated.toString()}</span>
                    </div>
                );
            }

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('user')).toHaveTextContent('Test User');
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        });

        it('should provide session data', () => {
            const sessionData = {
                user: { id: '1', name: 'Test User', email: 'test@example.com' },
                token: 'test-token'
            };

            mockUseSession.mockReturnValue({
                data: sessionData,
                isPending: false
            });

            function TestComponent() {
                const { session } = useAuth();
                return <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>;
            }

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('session')).toHaveTextContent('has-session');
        });
    });
});

describe('useAuth', () => {
    it('should return default context values when used outside AuthProvider', () => {
        // Note: The current implementation returns default values instead of throwing
        // when used outside AuthProvider (due to the createContext default)
        const { result } = renderHook(() => useAuth());

        expect(result.current.user).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.isLoading).toBe(true);
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return context value when used inside AuthProvider', () => {
        mockUseSession.mockReturnValue({
            data: null,
            isPending: false
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current).toHaveProperty('user');
        expect(result.current).toHaveProperty('session');
        expect(result.current).toHaveProperty('isLoading');
        expect(result.current).toHaveProperty('isAuthenticated');
    });
});
