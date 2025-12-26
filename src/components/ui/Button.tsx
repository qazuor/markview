import { cn } from '@/utils/cn';
import type React from 'react';

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    default: 'bg-bg-tertiary text-text-primary hover:bg-bg-secondary',
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    ghost: 'bg-transparent text-text-primary hover:bg-bg-tertiary',
    outline: 'border border-border bg-transparent text-text-primary hover:bg-bg-tertiary',
    destructive: 'bg-red-500 text-white hover:bg-red-600'
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-8 w-8 p-0'
};

/**
 * Button component with variants and sizes
 */
export function Button({ variant = 'default', size = 'md', className, children, disabled, ...props }: ButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}

interface IconButtonProps extends Omit<ButtonProps, 'size' | 'children'> {
    icon: React.ReactNode;
    label: string;
    size?: 'sm' | 'md' | 'lg';
}

const iconSizeStyles = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
};

/**
 * Icon-only button with accessible label
 */
export function IconButton({ icon, label, variant = 'ghost', size = 'md', className, ...props }: IconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            className={cn(
                'inline-flex items-center justify-center rounded-md',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                'disabled:pointer-events-none disabled:opacity-50',
                variantStyles[variant],
                iconSizeStyles[size],
                className
            )}
            {...props}
        >
            {icon}
        </button>
    );
}
