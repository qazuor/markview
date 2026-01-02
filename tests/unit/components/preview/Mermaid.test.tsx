import { Mermaid, processMermaidBlocks, updateMermaidTheme } from '@/components/preview/Mermaid';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock mermaid with hoisted mocks
const { mockRender, mockInitialize } = vi.hoisted(() => ({
    mockRender: vi.fn(),
    mockInitialize: vi.fn()
}));

vi.mock('mermaid', () => ({
    default: {
        initialize: (...args: unknown[]) => mockInitialize(...args),
        render: (...args: unknown[]) => mockRender(...args)
    }
}));

describe('Mermaid Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRender.mockResolvedValue({ svg: '<svg>test diagram</svg>' });
    });

    describe('rendering', () => {
        it('should render with chart content', async () => {
            const { container } = render(<Mermaid chart="graph TD\nA --> B" />);

            await waitFor(() => {
                expect(mockRender).toHaveBeenCalled();
            });

            expect(container.querySelector('div')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(<Mermaid chart="graph TD\nA --> B" className="custom-class" />);

            expect(container.querySelector('.custom-class')).toBeInTheDocument();
        });

        it('should generate unique id for each instance', () => {
            const { container: container1 } = render(<Mermaid chart="graph TD\nA --> B" />);
            const { container: container2 } = render(<Mermaid chart="graph TD\nC --> D" />);

            const div1 = container1.querySelector('div');
            const div2 = container2.querySelector('div');

            expect(div1?.id).toBeTruthy();
            expect(div2?.id).toBeTruthy();
            expect(div1?.id).not.toBe(div2?.id);
        });
    });

    describe('chart rendering', () => {
        it('should call mermaid.render with chart content', async () => {
            const chart = 'graph TD\nA --> B';
            render(<Mermaid chart={chart} />);

            await waitFor(() => {
                expect(mockRender).toHaveBeenCalledWith(expect.stringContaining('mermaid-'), chart);
            });
        });

        it('should set innerHTML with rendered SVG', async () => {
            mockRender.mockResolvedValue({ svg: '<svg data-testid="rendered-svg">rendered content</svg>' });

            const { container } = render(<Mermaid chart="graph TD\nA --> B" />);

            await waitFor(() => {
                const div = container.querySelector('div');
                expect(div?.innerHTML).toContain('rendered content');
            });
        });
    });

    describe('error handling', () => {
        it('should handle render errors gracefully', async () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockRender.mockRejectedValue(new Error('Invalid syntax'));

            const { container } = render(<Mermaid chart="invalid chart" />);

            await waitFor(() => {
                const div = container.querySelector('div');
                expect(div?.innerHTML).toContain('Mermaid Error');
                expect(div?.innerHTML).toContain('Invalid syntax');
            });

            consoleError.mockRestore();
        });

        it('should handle unknown errors', async () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockRender.mockRejectedValue('Unknown error');

            const { container } = render(<Mermaid chart="invalid chart" />);

            await waitFor(() => {
                const div = container.querySelector('div');
                expect(div?.innerHTML).toContain('Unknown error');
            });

            consoleError.mockRestore();
        });
    });

    describe('re-rendering', () => {
        it('should re-render when chart changes', async () => {
            const { rerender } = render(<Mermaid chart="graph TD\nA --> B" />);

            await waitFor(() => {
                expect(mockRender).toHaveBeenCalled();
            });

            const callCount = mockRender.mock.calls.length;
            rerender(<Mermaid chart="graph TD\nC --> D" />);

            await waitFor(() => {
                expect(mockRender.mock.calls.length).toBeGreaterThan(callCount);
            });
        });
    });
});

describe('updateMermaidTheme', () => {
    beforeEach(() => {
        mockInitialize.mockClear();
    });

    it('should initialize mermaid with dark theme', () => {
        updateMermaidTheme(true);

        expect(mockInitialize).toHaveBeenCalledWith({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'inherit'
        });
    });

    it('should initialize mermaid with default theme for light mode', () => {
        updateMermaidTheme(false);

        expect(mockInitialize).toHaveBeenCalledWith({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit'
        });
    });
});

describe('processMermaidBlocks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRender.mockResolvedValue({ svg: '<svg>diagram</svg>' });
    });

    it('should process code blocks with language-mermaid class', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code class="language-mermaid">graph TD
            A --> B</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should detect mermaid content by keywords', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code>graph TD
            A --> B</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should detect flowchart diagrams', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code>flowchart LR
            A --> B</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should detect sequenceDiagram', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code>sequenceDiagram
            Alice->>Bob: Hello</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should detect classDiagram', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code>classDiagram
            class Animal</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should detect pie charts', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code>pie title Test
            "A": 50</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should detect gantt charts', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code>gantt
            title A Gantt</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should detect gitGraph', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code>gitGraph
            commit</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should detect mindmap', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code>mindmap
            root</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).toHaveBeenCalled();
    });

    it('should skip already processed blocks', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre class="mermaid-processed"><code class="language-mermaid">graph TD
            A --> B</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).not.toHaveBeenCalled();
    });

    it('should skip empty chart content', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code class="language-mermaid">   </code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).not.toHaveBeenCalled();
    });

    it('should replace pre block with diagram container', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        container.innerHTML = `
            <pre><code class="language-mermaid">graph TD
            A --> B</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(container.querySelector('pre')).toBeNull();
        expect(container.querySelector('.mermaid-diagram')).toBeTruthy();

        document.body.removeChild(container);
    });

    it('should handle render errors', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockRender.mockRejectedValue(new Error('Parse error'));

        const container = document.createElement('div');
        document.body.appendChild(container);
        container.innerHTML = `
            <pre><code class="language-mermaid">invalid syntax</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(container.querySelector('.mermaid-diagram')).toBeTruthy();
        expect(container.innerHTML).toContain('Mermaid Diagram Error');

        consoleError.mockRestore();
        document.body.removeChild(container);
    });

    it('should update theme before processing', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code class="language-mermaid">graph TD
            A --> B</code></pre>
        `;

        await processMermaidBlocks(container, true);

        expect(mockInitialize).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));
    });

    it('should not process non-mermaid code blocks', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <pre><code class="language-javascript">console.log('hello')</code></pre>
        `;

        await processMermaidBlocks(container, false);

        expect(mockRender).not.toHaveBeenCalled();
    });

    it('should handle code without pre parent', async () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <code class="language-mermaid">graph TD
            A --> B</code>
        `;

        await processMermaidBlocks(container, false);

        // Should not throw, but also should not process without pre parent
        expect(container.innerHTML).toContain('language-mermaid');
    });
});
