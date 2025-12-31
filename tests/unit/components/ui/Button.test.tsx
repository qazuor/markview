import { Button, IconButton } from '@/components/ui/Button';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('Button', () => {
    describe('rendering', () => {
        it('should render children', () => {
            render(<Button>Click me</Button>);

            expect(screen.getByText('Click me')).toBeInTheDocument();
        });

        it('should render as button element', () => {
            render(<Button>Test</Button>);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should have type="button" by default', () => {
            render(<Button>Test</Button>);

            expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
        });
    });

    describe('variants', () => {
        it('should apply default variant styles', () => {
            render(<Button variant="default">Default</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-bg-tertiary');
        });

        it('should apply primary variant styles', () => {
            render(<Button variant="primary">Primary</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-primary-500');
        });

        it('should apply secondary variant styles', () => {
            render(<Button variant="secondary">Secondary</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-secondary-500');
        });

        it('should apply ghost variant styles', () => {
            render(<Button variant="ghost">Ghost</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-transparent');
        });

        it('should apply outline variant styles', () => {
            render(<Button variant="outline">Outline</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('border');
        });

        it('should apply destructive variant styles', () => {
            render(<Button variant="destructive">Delete</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-red-500');
        });
    });

    describe('sizes', () => {
        it('should apply small size styles', () => {
            render(<Button size="sm">Small</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-7');
        });

        it('should apply medium size styles by default', () => {
            render(<Button>Medium</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-9');
        });

        it('should apply large size styles', () => {
            render(<Button size="lg">Large</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-11');
        });

        it('should apply icon size styles', () => {
            render(<Button size="icon">Icon</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-8', 'w-8');
        });
    });

    describe('disabled state', () => {
        it('should be disabled when disabled prop is true', () => {
            render(<Button disabled>Disabled</Button>);

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should not be disabled by default', () => {
            render(<Button>Enabled</Button>);

            expect(screen.getByRole('button')).not.toBeDisabled();
        });
    });

    describe('click handling', () => {
        it('should call onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click me</Button>);

            fireEvent.click(screen.getByRole('button'));

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not call onClick when disabled', () => {
            const handleClick = vi.fn();
            render(
                <Button disabled onClick={handleClick}>
                    Disabled
                </Button>
            );

            fireEvent.click(screen.getByRole('button'));

            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('custom className', () => {
        it('should merge custom className', () => {
            render(<Button className="custom-class">Custom</Button>);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
        });
    });

    describe('additional props', () => {
        it('should pass through additional props', () => {
            render(<Button data-testid="test-button">Test</Button>);

            expect(screen.getByTestId('test-button')).toBeInTheDocument();
        });
    });
});

describe('IconButton', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;

    describe('rendering', () => {
        it('should render the icon', () => {
            render(<IconButton icon={<TestIcon />} label="Test" />);

            expect(screen.getByTestId('test-icon')).toBeInTheDocument();
        });

        it('should have accessible label', () => {
            render(<IconButton icon={<TestIcon />} label="Close menu" />);

            expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close menu');
        });

        it('should have type="button"', () => {
            render(<IconButton icon={<TestIcon />} label="Test" />);

            expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
        });
    });

    describe('variants', () => {
        it('should apply ghost variant by default', () => {
            render(<IconButton icon={<TestIcon />} label="Test" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-transparent');
        });

        it('should apply primary variant', () => {
            render(<IconButton icon={<TestIcon />} label="Test" variant="primary" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-primary-500');
        });
    });

    describe('sizes', () => {
        it('should apply small size', () => {
            render(<IconButton icon={<TestIcon />} label="Test" size="sm" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-7', 'w-7');
        });

        it('should apply medium size by default', () => {
            render(<IconButton icon={<TestIcon />} label="Test" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-8', 'w-8');
        });

        it('should apply large size', () => {
            render(<IconButton icon={<TestIcon />} label="Test" size="lg" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-10', 'w-10');
        });
    });

    describe('click handling', () => {
        it('should call onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<IconButton icon={<TestIcon />} label="Test" onClick={handleClick} />);

            fireEvent.click(screen.getByRole('button'));

            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('ref forwarding', () => {
        it('should forward ref', () => {
            const ref = { current: null };
            render(<IconButton ref={ref} icon={<TestIcon />} label="Test" />);

            expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        });
    });

    describe('displayName', () => {
        it('should have displayName', () => {
            expect(IconButton.displayName).toBe('IconButton');
        });
    });
});
