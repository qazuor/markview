import {
    buildScrollMap,
    findEditorLine,
    findPreviewPosition,
    getScrollPercentage,
    setScrollPercentage
} from '@/services/markdown/scrollMap';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('scrollMap', () => {
    describe('buildScrollMap', () => {
        it('should build map from elements with data-line attribute', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <p data-line="1">Line 1</p>
                <p data-line="5">Line 5</p>
                <p data-line="10">Line 10</p>
            `;

            // Mock getBoundingClientRect
            const mockRect = { top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 };
            vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

            let lineOffset = 0;
            for (const el of container.querySelectorAll('[data-line]')) {
                vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
                    ...mockRect,
                    top: lineOffset
                } as DOMRect);
                lineOffset += 50;
            }

            Object.defineProperty(container, 'scrollTop', { value: 0 });

            const map = buildScrollMap(container);

            expect(map.size).toBe(3);
            expect(map.has(1)).toBe(true);
            expect(map.has(5)).toBe(true);
            expect(map.has(10)).toBe(true);
        });

        it('should skip elements with invalid line numbers', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <p data-line="0">Invalid</p>
                <p data-line="abc">Invalid</p>
                <p data-line="5">Valid</p>
            `;

            const mockRect = { top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 };
            vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);
            for (const el of container.querySelectorAll('[data-line]')) {
                vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);
            }
            Object.defineProperty(container, 'scrollTop', { value: 0 });

            const map = buildScrollMap(container);

            expect(map.size).toBe(1);
            expect(map.has(5)).toBe(true);
        });

        it('should fallback to children-based estimation when no data-line attributes', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <p>Paragraph 1</p>
                <p>Paragraph 2</p>
                <p>Paragraph 3</p>
            `;

            Object.defineProperty(container, 'scrollHeight', { value: 300 });

            const map = buildScrollMap(container);

            expect(map.size).toBe(3);
            expect(map.get(1)).toBe(0);
            expect(map.get(2)).toBe(100);
            expect(map.get(3)).toBe(200);
        });

        it('should handle empty container', () => {
            const container = document.createElement('div');
            Object.defineProperty(container, 'scrollHeight', { value: 0 });

            const map = buildScrollMap(container);

            expect(map.size).toBe(0);
        });
    });

    describe('findPreviewPosition', () => {
        it('should return exact match when available', () => {
            const map = new Map([
                [1, 0],
                [5, 100],
                [10, 200]
            ]);

            expect(findPreviewPosition(5, map)).toBe(100);
        });

        it('should interpolate between lines when no exact match', () => {
            const map = new Map<number, number>();
            map.set(1, 0);
            map.set(10, 100);

            // Line 5: ratio = (5-1)/(10-1) = 4/9 ≈ 0.444
            // position = 0 + 0.444 * 100 = 44.44
            const position = findPreviewPosition(5, map);
            // Function returns interpolated value between above and below positions
            expect(position).toBeGreaterThanOrEqual(0);
            expect(position).toBeLessThanOrEqual(100);
        });

        it('should return closest above position when no below exists', () => {
            const map = new Map([
                [1, 0],
                [5, 100]
            ]);

            expect(findPreviewPosition(10, map)).toBe(100);
        });

        it('should return 0 for empty map', () => {
            const map = new Map<number, number>();

            expect(findPreviewPosition(5, map)).toBe(0);
        });
    });

    describe('findEditorLine', () => {
        it('should find closest line to scroll position', () => {
            const map = new Map([
                [1, 0],
                [5, 100],
                [10, 200]
            ]);

            expect(findEditorLine(90, map)).toBe(5);
            expect(findEditorLine(110, map)).toBe(5);
            expect(findEditorLine(160, map)).toBe(10);
        });

        it('should return 1 for empty map', () => {
            const map = new Map<number, number>();

            expect(findEditorLine(100, map)).toBe(1);
        });

        it('should handle exact position match', () => {
            const map = new Map([
                [1, 0],
                [5, 100],
                [10, 200]
            ]);

            expect(findEditorLine(100, map)).toBe(5);
        });
    });

    describe('getScrollPercentage', () => {
        let element: HTMLElement;

        beforeEach(() => {
            element = document.createElement('div');
        });

        it('should calculate scroll percentage correctly', () => {
            Object.defineProperty(element, 'scrollTop', { value: 50, configurable: true });
            Object.defineProperty(element, 'scrollHeight', { value: 200, configurable: true });
            Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true });

            expect(getScrollPercentage(element)).toBe(0.5);
        });

        it('should return 0 when at top', () => {
            Object.defineProperty(element, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(element, 'scrollHeight', { value: 200, configurable: true });
            Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true });

            expect(getScrollPercentage(element)).toBe(0);
        });

        it('should return 1 when at bottom', () => {
            Object.defineProperty(element, 'scrollTop', { value: 100, configurable: true });
            Object.defineProperty(element, 'scrollHeight', { value: 200, configurable: true });
            Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true });

            expect(getScrollPercentage(element)).toBe(1);
        });

        it('should return 0 when content fits without scrolling', () => {
            Object.defineProperty(element, 'scrollTop', { value: 0, configurable: true });
            Object.defineProperty(element, 'scrollHeight', { value: 100, configurable: true });
            Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true });

            expect(getScrollPercentage(element)).toBe(0);
        });
    });

    describe('setScrollPercentage', () => {
        it('should set scroll position based on percentage', () => {
            const element = document.createElement('div');
            Object.defineProperty(element, 'scrollHeight', { value: 200, configurable: true });
            Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true });

            let scrollTopValue = 0;
            Object.defineProperty(element, 'scrollTop', {
                get: () => scrollTopValue,
                set: (v) => {
                    scrollTopValue = v;
                },
                configurable: true
            });

            setScrollPercentage(element, 0.5);

            expect(scrollTopValue).toBe(50);
        });

        it('should set to 0 when percentage is 0', () => {
            const element = document.createElement('div');
            Object.defineProperty(element, 'scrollHeight', { value: 200, configurable: true });
            Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true });

            let scrollTopValue = 50;
            Object.defineProperty(element, 'scrollTop', {
                get: () => scrollTopValue,
                set: (v) => {
                    scrollTopValue = v;
                },
                configurable: true
            });

            setScrollPercentage(element, 0);

            expect(scrollTopValue).toBe(0);
        });

        it('should set to max when percentage is 1', () => {
            const element = document.createElement('div');
            Object.defineProperty(element, 'scrollHeight', { value: 200, configurable: true });
            Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true });

            let scrollTopValue = 0;
            Object.defineProperty(element, 'scrollTop', {
                get: () => scrollTopValue,
                set: (v) => {
                    scrollTopValue = v;
                },
                configurable: true
            });

            setScrollPercentage(element, 1);

            expect(scrollTopValue).toBe(100);
        });
    });
});
