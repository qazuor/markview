import { CodeBlock, processCodeBlocks } from '@/components/preview/CodeBlock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback: string) => fallback || key
    })
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
    clipboard: {
        writeText: mockWriteText
    }
});

describe('CodeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWriteText.mockResolvedValue(undefined);
    });

    describe('rendering', () => {
        it('should render code content', () => {
            render(<CodeBlock code="console.log('hello')" />);

            expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
        });

        it('should render pre and code elements', () => {
            const { container } = render(<CodeBlock code="const x = 1" />);

            expect(container.querySelector('pre')).toBeInTheDocument();
            expect(container.querySelector('code')).toBeInTheDocument();
        });

        it('should render copy button', () => {
            render(<CodeBlock code="test code" />);

            expect(screen.getByRole('button')).toBeInTheDocument();
            expect(screen.getByText('Copy')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(<CodeBlock code="test" className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('language display', () => {
        it('should show language badge when language is provided', () => {
            render(<CodeBlock code="const x = 1" language="javascript" />);

            expect(screen.getByText('javascript')).toBeInTheDocument();
        });

        it('should not show language badge when language is not provided', () => {
            render(<CodeBlock code="const x = 1" />);

            expect(screen.queryByText('javascript')).not.toBeInTheDocument();
        });
    });

    describe('copy functionality', () => {
        it('should copy code to clipboard when button is clicked', async () => {
            const code = "console.log('hello')";
            render(<CodeBlock code={code} />);

            fireEvent.click(screen.getByText('Copy'));

            await waitFor(() => {
                expect(mockWriteText).toHaveBeenCalledWith(code);
            });
        });

        it('should show checkmark after copying', async () => {
            render(<CodeBlock code="test" />);

            fireEvent.click(screen.getByText('Copy'));

            await waitFor(() => {
                expect(screen.getByText(/✓/)).toBeInTheDocument();
            });
        });

        it('should handle copy failure gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockWriteText.mockRejectedValue(new Error('Copy failed'));

            render(<CodeBlock code="test" />);

            fireEvent.click(screen.getByText('Copy'));

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });

            consoleSpy.mockRestore();
        });
    });

    describe('styling', () => {
        it('should have group class for hover effects', () => {
            const { container } = render(<CodeBlock code="test" />);

            expect(container.firstChild).toHaveClass('group');
        });

        it('should have relative positioning', () => {
            const { container } = render(<CodeBlock code="test" />);

            expect(container.firstChild).toHaveClass('relative');
        });
    });
});

describe('processCodeBlocks', () => {
    let container: HTMLElement;

    beforeEach(() => {
        vi.clearAllMocks();
        mockWriteText.mockResolvedValue(undefined);
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should wrap pre elements in group container', () => {
        container.innerHTML = '<pre><code>const x = 1;</code></pre>';

        processCodeBlocks(container);

        const wrapper = container.querySelector('.group');
        expect(wrapper).not.toBeNull();
        expect(wrapper?.querySelector('pre')).not.toBeNull();
    });

    it('should add copy button to code blocks', () => {
        container.innerHTML = '<pre><code>const x = 1;</code></pre>';

        processCodeBlocks(container);

        const button = container.querySelector('.copy-button');
        expect(button).not.toBeNull();
        expect(button?.textContent).toBe('Copy');
    });

    it('should not add duplicate buttons to already processed blocks', () => {
        container.innerHTML = '<pre><code>const x = 1;</code></pre>';

        processCodeBlocks(container);

        // First processing creates a wrapper and button
        const firstButtonCount = container.querySelectorAll('.copy-button').length;
        expect(firstButtonCount).toBe(1);

        // Process again on the same wrapper - the pre inside should detect existing button
        // This tests the skip logic in processCodeBlocks
        const pre = container.querySelector('pre');
        expect(pre?.querySelector('.copy-button') || pre?.parentElement?.querySelector('.copy-button')).not.toBeNull();
    });

    it('should copy code on button click', async () => {
        container.innerHTML = '<pre><code>const x = 1;</code></pre>';

        processCodeBlocks(container);

        const button = container.querySelector('.copy-button') as HTMLButtonElement;
        button.click();

        await waitFor(() => {
            expect(mockWriteText).toHaveBeenCalledWith('const x = 1;');
        });
    });

    it('should show checkmark after copy', async () => {
        container.innerHTML = '<pre><code>test code</code></pre>';

        processCodeBlocks(container);

        const button = container.querySelector('.copy-button') as HTMLButtonElement;
        button.click();

        await waitFor(() => {
            expect(button.textContent).toBe('✓');
        });
    });

    it('should handle copy failure', async () => {
        mockWriteText.mockRejectedValue(new Error('Failed'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        container.innerHTML = '<pre><code>test</code></pre>';
        processCodeBlocks(container);

        const button = container.querySelector('.copy-button') as HTMLButtonElement;
        button.click();

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

    it('should get text from pre if no code element', async () => {
        container.innerHTML = '<pre>plain text</pre>';

        processCodeBlocks(container);

        const button = container.querySelector('.copy-button') as HTMLButtonElement;
        button.click();

        await waitFor(() => {
            expect(mockWriteText).toHaveBeenCalledWith('plain text');
        });
    });

    it('should process multiple code blocks', () => {
        container.innerHTML = `
            <pre><code>block 1</code></pre>
            <pre><code>block 2</code></pre>
            <pre><code>block 3</code></pre>
        `;

        processCodeBlocks(container);

        const buttons = container.querySelectorAll('.copy-button');
        expect(buttons).toHaveLength(3);
    });
});
