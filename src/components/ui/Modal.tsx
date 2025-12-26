import { cn } from '@/utils/cn';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type React from 'react';

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Modal dialog component using Radix UI
 */
export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
                <Dialog.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                        'w-full max-w-lg max-h-[85vh] overflow-auto',
                        'bg-bg-primary rounded-lg shadow-xl',
                        'border border-border',
                        'animate-in fade-in zoom-in-95 duration-200',
                        'focus:outline-none',
                        className
                    )}
                >
                    {title && <Dialog.Title className="text-lg font-semibold text-text-primary px-6 pt-6 pb-2">{title}</Dialog.Title>}
                    {description && (
                        <Dialog.Description className="text-sm text-text-secondary px-6 pb-4">{description}</Dialog.Description>
                    )}

                    <div className={cn(!title && 'pt-6', 'px-6 pb-6')}>{children}</div>

                    <Dialog.Close asChild>
                        <button
                            type="button"
                            className={cn(
                                'absolute top-4 right-4',
                                'p-1 rounded-md',
                                'text-text-muted hover:text-text-primary',
                                'hover:bg-bg-tertiary',
                                'transition-colors',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                            )}
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

interface ModalTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

/**
 * Modal trigger button
 */
export function ModalTrigger({ children, asChild }: ModalTriggerProps) {
    return <Dialog.Trigger asChild={asChild}>{children}</Dialog.Trigger>;
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Modal footer for action buttons
 */
export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div className={cn('flex items-center justify-end gap-2 pt-4 border-t border-border mt-4 -mx-6 px-6', className)}>{children}</div>
    );
}
