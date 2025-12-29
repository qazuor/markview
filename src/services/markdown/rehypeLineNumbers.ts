/**
 * Rehype plugin to add data-line attributes to block elements
 * for scroll synchronization between editor and preview
 */

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Block-level elements that should receive data-line attributes
 */
const BLOCK_ELEMENTS = new Set([
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'table',
    'hr',
    'div',
    'section',
    'article',
    'aside',
    'details',
    'figure',
    'figcaption'
]);

/**
 * Rehype plugin that adds data-line attributes to block elements
 * based on their source position in the markdown
 */
export const rehypeLineNumbers: Plugin<[], Root> = () => {
    return (tree: Root) => {
        visit(tree, 'element', (node: Element) => {
            // Only process block-level elements
            if (!BLOCK_ELEMENTS.has(node.tagName)) {
                return;
            }

            // Check if node has position info from the parser
            if (node.position?.start?.line) {
                // Initialize properties if needed
                node.properties = node.properties || {};

                // Add data-line attribute with the source line number
                node.properties.dataLine = node.position.start.line;
            }
        });
    };
};

export default rehypeLineNumbers;
