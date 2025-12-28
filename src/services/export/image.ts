import { saveAs } from 'file-saver';
import * as htmlToImage from 'html-to-image';

export type ImageFormat = 'png' | 'jpeg' | 'svg';

export interface ImageExportOptions {
    filename?: string;
    format?: ImageFormat;
    quality?: number; // 0-1 for JPEG
    scale?: number; // Device pixel ratio scale
    backgroundColor?: string;
    onProgress?: (stage: string) => void;
}

/**
 * Get the preview container element
 */
function getPreviewElement(): HTMLElement | null {
    // Try to find the preview content container
    const preview = document.querySelector('[data-preview-content]') as HTMLElement;
    if (preview) return preview;

    // Fallback: find by class
    const fallback = document.querySelector('.preview-content, .markdown-body') as HTMLElement;
    return fallback;
}

/**
 * Export the preview as an image
 */
export async function exportToImage(options: ImageExportOptions = {}): Promise<void> {
    const { filename = 'document', format = 'png', quality = 0.95, scale = 2, backgroundColor, onProgress } = options;

    const element = getPreviewElement();
    if (!element) {
        throw new Error('Preview element not found');
    }

    onProgress?.('Preparing...');

    const config = {
        quality: format === 'jpeg' ? quality : undefined,
        pixelRatio: scale,
        backgroundColor: backgroundColor || (format === 'jpeg' ? '#ffffff' : undefined),
        cacheBust: true,
        style: {
            // Ensure consistent rendering
            transform: 'none',
            transformOrigin: 'top left'
        }
    };

    try {
        onProgress?.('Rendering...');

        let blob: Blob;

        switch (format) {
            case 'png':
                blob = (await htmlToImage.toBlob(element, config)) as Blob;
                break;
            case 'jpeg':
                blob = await htmlToImage.toJpeg(element, config).then((dataUrl) => {
                    return fetch(dataUrl).then((res) => res.blob());
                });
                break;
            case 'svg': {
                const svgDataUrl = await htmlToImage.toSvg(element, config);
                const svgPart = svgDataUrl.split(',')[1] ?? '';
                const svgContent = decodeURIComponent(svgPart);
                blob = new Blob([svgContent], { type: 'image/svg+xml' });
                break;
            }
            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        if (!blob) {
            throw new Error('Failed to generate image');
        }

        onProgress?.('Downloading...');

        const extension = format === 'jpeg' ? 'jpg' : format;
        saveAs(blob, `${filename}.${extension}`);
    } catch (error) {
        console.error('Image export failed:', error);
        throw error;
    }
}

/**
 * Generate image blob without downloading
 */
export async function generateImageBlob(options: Omit<ImageExportOptions, 'filename'> = {}): Promise<Blob> {
    const { format = 'png', quality = 0.95, scale = 2, backgroundColor } = options;

    const element = getPreviewElement();
    if (!element) {
        throw new Error('Preview element not found');
    }

    const config = {
        quality: format === 'jpeg' ? quality : undefined,
        pixelRatio: scale,
        backgroundColor: backgroundColor || (format === 'jpeg' ? '#ffffff' : undefined),
        cacheBust: true
    };

    switch (format) {
        case 'png':
            return (await htmlToImage.toBlob(element, config)) as Blob;
        case 'jpeg': {
            const jpegDataUrl = await htmlToImage.toJpeg(element, config);
            return fetch(jpegDataUrl).then((res) => res.blob());
        }
        case 'svg': {
            const svgDataUrl = await htmlToImage.toSvg(element, config);
            const svgPart = svgDataUrl.split(',')[1] ?? '';
            const svgContent = decodeURIComponent(svgPart);
            return new Blob([svgContent], { type: 'image/svg+xml' });
        }
        default:
            throw new Error(`Unsupported format: ${format}`);
    }
}

/**
 * Copy image to clipboard
 */
export async function copyImageToClipboard(): Promise<void> {
    const element = getPreviewElement();
    if (!element) {
        throw new Error('Preview element not found');
    }

    try {
        const blob = await htmlToImage.toBlob(element, {
            pixelRatio: 2,
            cacheBust: true
        });

        if (!blob) {
            throw new Error('Failed to generate image');
        }

        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob
            })
        ]);
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        throw error;
    }
}
