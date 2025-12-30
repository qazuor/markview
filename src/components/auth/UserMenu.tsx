import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/DropdownMenu';
import { signOut } from '@/lib/auth-client';
import { useUIStore } from '@/stores';
import { cn } from '@/utils/cn';
import { ChevronDown, Loader2, LogOut, Settings, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthProvider';
import { LoginModal } from './LoginModal';

export function UserMenu() {
    const { t } = useTranslation();
    const { user, isLoading, isAuthenticated } = useAuth();
    const openModal = useUIStore((s) => s.openModal);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
            window.location.reload();
        } catch (error) {
            console.error('Sign out failed:', error);
        } finally {
            setIsSigningOut(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-8 w-8 items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <>
                <Button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-sm" variant="secondary">
                    <User className="h-4 w-4" />
                    {t('auth.sign_in')}
                </Button>
                <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            </>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    {user.image && !imageError ? (
                        <img
                            src={user.image}
                            alt={user.name}
                            className="h-7 w-7 rounded-full"
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white font-medium text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <span className="hidden max-w-[120px] truncate md:block">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-text-muted">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openModal('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('common.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={cn('text-red-600 dark:text-red-400', 'focus:text-red-600 dark:focus:text-red-400')}
                >
                    {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    <span>{t('auth.sign_out')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
