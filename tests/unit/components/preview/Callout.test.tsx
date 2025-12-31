import { Callout, processCallouts } from '@/components/preview/Callout';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Callout Component', () => {
    describe('rendering', () => {
        it('should render children content', () => {
            render(
                <Callout type="note">
                    <p>This is a note</p>
                </Callout>
            );

            expect(screen.getByText('This is a note')).toBeInTheDocument();
        });

        it('should render with role="alert"', () => {
            render(
                <Callout type="note">
                    <p>Content</p>
                </Callout>
            );

            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('should use default label as title', () => {
            render(
                <Callout type="note">
                    <p>Content</p>
                </Callout>
            );

            expect(screen.getByText('Note')).toBeInTheDocument();
        });

        it('should use custom title when provided', () => {
            render(
                <Callout type="note" title="Custom Title">
                    <p>Content</p>
                </Callout>
            );

            expect(screen.getByText('Custom Title')).toBeInTheDocument();
        });
    });

    describe('types', () => {
        it('should render note type with blue styles', () => {
            render(
                <Callout type="note">
                    <p>Note content</p>
                </Callout>
            );

            const alert = screen.getByRole('alert');
            expect(alert).toHaveClass('bg-blue-50');
            expect(screen.getByText('Note')).toBeInTheDocument();
        });

        it('should render tip type with green styles', () => {
            render(
                <Callout type="tip">
                    <p>Tip content</p>
                </Callout>
            );

            const alert = screen.getByRole('alert');
            expect(alert).toHaveClass('bg-green-50');
            expect(screen.getByText('Tip')).toBeInTheDocument();
        });

        it('should render important type with purple styles', () => {
            render(
                <Callout type="important">
                    <p>Important content</p>
                </Callout>
            );

            const alert = screen.getByRole('alert');
            expect(alert).toHaveClass('bg-purple-50');
            expect(screen.getByText('Important')).toBeInTheDocument();
        });

        it('should render warning type with yellow styles', () => {
            render(
                <Callout type="warning">
                    <p>Warning content</p>
                </Callout>
            );

            const alert = screen.getByRole('alert');
            expect(alert).toHaveClass('bg-yellow-50');
            expect(screen.getByText('Warning')).toBeInTheDocument();
        });

        it('should render caution type with red styles', () => {
            render(
                <Callout type="caution">
                    <p>Caution content</p>
                </Callout>
            );

            const alert = screen.getByRole('alert');
            expect(alert).toHaveClass('bg-red-50');
            expect(screen.getByText('Caution')).toBeInTheDocument();
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            render(
                <Callout type="note" className="custom-class">
                    <p>Content</p>
                </Callout>
            );

            expect(screen.getByRole('alert')).toHaveClass('custom-class');
        });

        it('should have callout base class', () => {
            render(
                <Callout type="note">
                    <p>Content</p>
                </Callout>
            );

            expect(screen.getByRole('alert')).toHaveClass('callout');
        });

        it('should have rounded corners', () => {
            render(
                <Callout type="note">
                    <p>Content</p>
                </Callout>
            );

            expect(screen.getByRole('alert')).toHaveClass('rounded-lg');
        });

        it('should have border', () => {
            render(
                <Callout type="note">
                    <p>Content</p>
                </Callout>
            );

            expect(screen.getByRole('alert')).toHaveClass('border');
        });
    });

    describe('icons', () => {
        it('should render icon for each type', () => {
            const { container } = render(
                <Callout type="note">
                    <p>Content</p>
                </Callout>
            );

            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('h-5', 'w-5');
        });
    });
});

describe('processCallouts', () => {
    const createBlockquote = (content: string) => {
        const container = document.createElement('div');
        container.innerHTML = `<blockquote><p>${content}</p></blockquote>`;
        return container;
    };

    describe('callout detection', () => {
        it('should convert [!NOTE] blockquote to callout', () => {
            const container = createBlockquote('[!NOTE] This is a note');
            processCallouts(container);

            expect(container.querySelector('.callout')).not.toBeNull();
            expect(container.querySelector('[role="alert"]')).not.toBeNull();
        });

        it('should convert [!TIP] blockquote to callout', () => {
            const container = createBlockquote('[!TIP] This is a tip');
            processCallouts(container);

            expect(container.querySelector('.callout')).not.toBeNull();
        });

        it('should convert [!IMPORTANT] blockquote to callout', () => {
            const container = createBlockquote('[!IMPORTANT] This is important');
            processCallouts(container);

            expect(container.querySelector('.callout')).not.toBeNull();
        });

        it('should convert [!WARNING] blockquote to callout', () => {
            const container = createBlockquote('[!WARNING] This is a warning');
            processCallouts(container);

            expect(container.querySelector('.callout')).not.toBeNull();
        });

        it('should convert [!CAUTION] blockquote to callout', () => {
            const container = createBlockquote('[!CAUTION] This is a caution');
            processCallouts(container);

            expect(container.querySelector('.callout')).not.toBeNull();
        });

        it('should be case insensitive', () => {
            const container = createBlockquote('[!note] This is a note');
            processCallouts(container);

            expect(container.querySelector('.callout')).not.toBeNull();
        });
    });

    describe('non-callout blockquotes', () => {
        it('should not convert regular blockquotes', () => {
            const container = createBlockquote('Just a regular quote');
            processCallouts(container);

            expect(container.querySelector('.callout')).toBeNull();
            expect(container.querySelector('blockquote')).not.toBeNull();
        });

        it('should not convert blockquotes without proper marker', () => {
            const container = createBlockquote('[NOTE] Without exclamation');
            processCallouts(container);

            expect(container.querySelector('.callout')).toBeNull();
        });
    });

    describe('processing state', () => {
        it('should not process already processed blockquotes', () => {
            const container = createBlockquote('[!NOTE] Test note');
            processCallouts(container);
            processCallouts(container); // Call again

            // Should still have only one callout
            const callouts = container.querySelectorAll('.callout');
            expect(callouts).toHaveLength(1);
        });

        it('should skip blockquote if already has callout-processed class', () => {
            const container = createBlockquote('[!NOTE] Test note');
            const blockquote = container.querySelector('blockquote');
            blockquote?.classList.add('callout-processed');

            processCallouts(container);

            // Should still be a blockquote (not converted)
            expect(container.querySelector('blockquote')).not.toBeNull();
        });
    });

    describe('styling', () => {
        it('should apply correct background class for note', () => {
            const container = createBlockquote('[!NOTE] Test note');
            processCallouts(container);

            const callout = container.querySelector('.callout');
            expect(callout).toHaveClass('bg-blue-50');
        });

        it('should apply correct background class for tip', () => {
            const container = createBlockquote('[!TIP] Test tip');
            processCallouts(container);

            const callout = container.querySelector('.callout');
            expect(callout).toHaveClass('bg-green-50');
        });

        it('should apply correct background class for warning', () => {
            const container = createBlockquote('[!WARNING] Test warning');
            processCallouts(container);

            const callout = container.querySelector('.callout');
            expect(callout).toHaveClass('bg-yellow-50');
        });
    });
});
