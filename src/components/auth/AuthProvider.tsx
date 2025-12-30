import { type AuthSession, type AuthUser, useSession } from '@/lib/auth-client';
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
    user: AuthUser | null;
    session: AuthSession | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
});

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { data: session, isPending } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isPending) {
            setIsLoading(false);
        }
    }, [isPending]);

    const value: AuthContextValue = {
        user: session?.user || null,
        session: session || null,
        isLoading,
        isAuthenticated: !!session?.user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
