import { cn } from '@/utils/cn';
import { Check, Circle, Loader2 } from 'lucide-react';

interface SaveStatusProps {
    isModified: boolean;
    isSaving?: boolean;
    className?: string;
}

/**
 * Display save status indicator
 */
export function SaveStatus({ isModified, isSaving = false, className }: SaveStatusProps) {
    if (isSaving) {
        return (
            <span className={cn('flex items-center gap-1 text-text-muted', className)}>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
            </span>
        );
    }

    if (isModified) {
        return (
            <span className={cn('flex items-center gap-1 text-amber-500', className)}>
                <Circle className="h-2 w-2 fill-current" />
                <span>Modified</span>
            </span>
        );
    }

    return (
        <span className={cn('flex items-center gap-1 text-green-500', className)}>
            <Check className="h-3 w-3" />
            <span>Saved</span>
        </span>
    );
}
