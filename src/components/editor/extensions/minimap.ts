import type { Extension } from '@codemirror/state';
import { showMinimap } from '@replit/codemirror-minimap';

/**
 * Create minimap extension for CodeMirror
 */
export function createMinimapExtension(enabled: boolean): Extension {
    if (!enabled) {
        return [];
    }

    return showMinimap.compute(['doc'], () => {
        return {
            create: () => {
                const dom = document.createElement('div');
                return { dom };
            },
            displayText: 'blocks',
            showOverlay: 'always'
        };
    });
}

/**
 * Empty extension when minimap is disabled
 */
export function createEmptyMinimapExtension(): Extension {
    return [];
}
