import { rehypeLineNumbers } from '@/services/markdown/rehypeLineNumbers';
import type { Element, Properties, Root, Text } from 'hast';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

describe('rehypeLineNumbers', () => {
    const createRoot = (children: (Element | Text)[]): Root => ({
        type: 'root',
        children
    });

    const createElement = (tagName: string, line?: number, properties: Properties = {}): Element => ({
        type: 'element',
        tagName,
        properties,
        children: [],
        position: line
            ? {
                  start: { line, column: 1, offset: 0 },
                  end: { line, column: 10, offset: 10 }
              }
            : undefined
    });

    const createText = (value: string): Text => ({
        type: 'text',
        value
    });

    // Process tree using unified with the plugin
    const processTree = (tree: Root): Root => {
        const processor = unified().use(rehypeLineNumbers);
        // Run the plugin synchronously
        processor.runSync(tree);
        return tree;
    };

    describe('block elements', () => {
        it('should add data-line to paragraph', () => {
            const tree = createRoot([createElement('p', 5)]);

            processTree(tree);

            const p = tree.children[0] as Element;
            expect(p.properties?.dataLine).toBe(5);
        });

        it('should add data-line to headings', () => {
            const tree = createRoot([
                createElement('h1', 1),
                createElement('h2', 3),
                createElement('h3', 5),
                createElement('h4', 7),
                createElement('h5', 9),
                createElement('h6', 11)
            ]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(1);
            expect((tree.children[1] as Element).properties?.dataLine).toBe(3);
            expect((tree.children[2] as Element).properties?.dataLine).toBe(5);
            expect((tree.children[3] as Element).properties?.dataLine).toBe(7);
            expect((tree.children[4] as Element).properties?.dataLine).toBe(9);
            expect((tree.children[5] as Element).properties?.dataLine).toBe(11);
        });

        it('should add data-line to lists', () => {
            const tree = createRoot([createElement('ul', 2), createElement('ol', 5)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(2);
            expect((tree.children[1] as Element).properties?.dataLine).toBe(5);
        });

        it('should add data-line to list items', () => {
            const li = createElement('li', 3);
            const ul = createElement('ul', 1);
            ul.children = [li];
            const tree = createRoot([ul]);

            processTree(tree);

            expect((ul.children[0] as Element).properties?.dataLine).toBe(3);
        });

        it('should add data-line to blockquote', () => {
            const tree = createRoot([createElement('blockquote', 4)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(4);
        });

        it('should add data-line to pre', () => {
            const tree = createRoot([createElement('pre', 7)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(7);
        });

        it('should add data-line to table', () => {
            const tree = createRoot([createElement('table', 10)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(10);
        });

        it('should add data-line to hr', () => {
            const tree = createRoot([createElement('hr', 15)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(15);
        });

        it('should add data-line to div', () => {
            const tree = createRoot([createElement('div', 20)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(20);
        });

        it('should add data-line to section', () => {
            const tree = createRoot([createElement('section', 25)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(25);
        });

        it('should add data-line to figure and figcaption', () => {
            const tree = createRoot([createElement('figure', 5), createElement('figcaption', 10)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(5);
            expect((tree.children[1] as Element).properties?.dataLine).toBe(10);
        });
    });

    describe('inline elements', () => {
        it('should NOT add data-line to span', () => {
            const tree = createRoot([createElement('span', 5)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBeUndefined();
        });

        it('should NOT add data-line to anchor', () => {
            const tree = createRoot([createElement('a', 5)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBeUndefined();
        });

        it('should NOT add data-line to strong', () => {
            const tree = createRoot([createElement('strong', 5)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBeUndefined();
        });

        it('should NOT add data-line to em', () => {
            const tree = createRoot([createElement('em', 5)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBeUndefined();
        });

        it('should NOT add data-line to code (inline)', () => {
            const tree = createRoot([createElement('code', 5)]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBeUndefined();
        });
    });

    describe('elements without position', () => {
        it('should NOT add data-line when position is missing', () => {
            const tree = createRoot([createElement('p')]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBeUndefined();
        });

        it('should handle null position gracefully', () => {
            const element = createElement('p');
            element.position = undefined;
            const tree = createRoot([element]);

            expect(() => processTree(tree)).not.toThrow();
        });
    });

    describe('nested elements', () => {
        it('should add data-line to nested block elements', () => {
            const innerP = createElement('p', 5);
            const blockquote = createElement('blockquote', 3);
            blockquote.children = [innerP];
            const tree = createRoot([blockquote]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(3);
            expect(((tree.children[0] as Element).children[0] as Element).properties?.dataLine).toBe(5);
        });

        it('should handle mixed content', () => {
            const text = createText('Some text');
            const span = createElement('span', 5);
            const p = createElement('p', 3);
            p.children = [text, span];
            const tree = createRoot([p]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(3);
            // span should not have data-line
            expect(((tree.children[0] as Element).children[1] as Element).properties?.dataLine).toBeUndefined();
        });
    });

    describe('preserve existing properties', () => {
        it('should preserve existing properties', () => {
            const element = createElement('p', 5, { className: 'my-class', id: 'my-id' });
            const tree = createRoot([element]);

            processTree(tree);

            const p = tree.children[0] as Element;
            expect(p.properties?.className).toBe('my-class');
            expect(p.properties?.id).toBe('my-id');
            expect(p.properties?.dataLine).toBe(5);
        });

        it('should initialize properties if undefined', () => {
            const element: Element = {
                type: 'element',
                tagName: 'p',
                properties: {},
                children: [],
                position: {
                    start: { line: 5, column: 1, offset: 0 },
                    end: { line: 5, column: 10, offset: 10 }
                }
            };
            const tree = createRoot([element]);

            processTree(tree);

            expect((tree.children[0] as Element).properties?.dataLine).toBe(5);
        });
    });
});
