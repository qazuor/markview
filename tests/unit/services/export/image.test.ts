import { copyImageToClipboard, exportToImage, generateImageBlob } from '@/services/export/image';
import { saveAs } from 'file-saver';
import * as htmlToImage from 'html-to-image';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock external dependencies
vi.mock('html-to-image', () => ({
    toBlob: vi.fn(),
    toJpeg: vi.fn(),
    toSvg: vi.fn()
}));

vi.mock('file-saver', () => ({
    saveAs: vi.fn()
}));

// Mock ClipboardItem for jsdom
class MockClipboardItem {
    constructor(public items: Record<string, Blob>) {}
}
// @ts-expect-error - Mock global ClipboardItem
global.ClipboardItem = MockClipboardItem;

describe('image export', () => {
    let mockPreviewElement: HTMLElement;
    let mockBlob: Blob;

    beforeEach(() => {
        // Create mock preview element
        mockPreviewElement = document.createElement('div');
        mockPreviewElement.setAttribute('data-preview-content', '');
        document.body.appendChild(mockPreviewElement);

        // Create mock blob
        mockBlob = new Blob(['test'], { type: 'image/png' });

        // Reset mocks
        vi.clearAllMocks();

        // Setup default mock implementations
        vi.mocked(htmlToImage.toBlob).mockResolvedValue(mockBlob);
        vi.mocked(htmlToImage.toJpeg).mockResolvedValue('data:image/jpeg;base64,dGVzdA==');
        vi.mocked(htmlToImage.toSvg).mockResolvedValue('data:image/svg+xml,%3Csvg%3E%3C/svg%3E');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('exportToImage', () => {
        it('should export as PNG by default', async () => {
            await exportToImage({ filename: 'test' });

            expect(htmlToImage.toBlob).toHaveBeenCalledWith(
                mockPreviewElement,
                expect.objectContaining({
                    pixelRatio: 2,
                    cacheBust: true
                })
            );
            expect(saveAs).toHaveBeenCalledWith(mockBlob, 'test.png');
        });

        it('should export as JPEG', async () => {
            // Mock fetch for JPEG conversion
            const mockJpegBlob = new Blob(['jpeg'], { type: 'image/jpeg' });
            global.fetch = vi.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockJpegBlob)
            });

            await exportToImage({ filename: 'test', format: 'jpeg' });

            expect(htmlToImage.toJpeg).toHaveBeenCalled();
            expect(saveAs).toHaveBeenCalledWith(mockJpegBlob, 'test.jpg');
        });

        it('should export as SVG', async () => {
            await exportToImage({ filename: 'test', format: 'svg' });

            expect(htmlToImage.toSvg).toHaveBeenCalled();
            expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'test.svg');
        });

        it('should use custom quality for JPEG', async () => {
            const mockJpegBlob = new Blob(['jpeg'], { type: 'image/jpeg' });
            global.fetch = vi.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockJpegBlob)
            });

            await exportToImage({ format: 'jpeg', quality: 0.8 });

            expect(htmlToImage.toJpeg).toHaveBeenCalledWith(
                mockPreviewElement,
                expect.objectContaining({
                    quality: 0.8
                })
            );
        });

        it('should use custom scale', async () => {
            await exportToImage({ scale: 3 });

            expect(htmlToImage.toBlob).toHaveBeenCalledWith(
                mockPreviewElement,
                expect.objectContaining({
                    pixelRatio: 3
                })
            );
        });

        it('should use custom background color', async () => {
            await exportToImage({ backgroundColor: '#ff0000' });

            expect(htmlToImage.toBlob).toHaveBeenCalledWith(
                mockPreviewElement,
                expect.objectContaining({
                    backgroundColor: '#ff0000'
                })
            );
        });

        it('should call onProgress callback', async () => {
            const onProgress = vi.fn();

            await exportToImage({ onProgress });

            expect(onProgress).toHaveBeenCalledWith('Preparing...');
            expect(onProgress).toHaveBeenCalledWith('Rendering...');
            expect(onProgress).toHaveBeenCalledWith('Downloading...');
        });

        it('should throw error when preview element not found', async () => {
            document.body.innerHTML = '';

            await expect(exportToImage()).rejects.toThrow('Preview element not found');
        });

        it('should throw error on unsupported format', async () => {
            // @ts-expect-error Testing invalid format
            await expect(exportToImage({ format: 'gif' })).rejects.toThrow('Unsupported format: gif');
        });

        it('should throw error when blob is null', async () => {
            vi.mocked(htmlToImage.toBlob).mockResolvedValue(null);

            await expect(exportToImage()).rejects.toThrow('Failed to generate image');
        });

        it('should find element by fallback class', async () => {
            document.body.innerHTML = '';
            const fallbackElement = document.createElement('div');
            fallbackElement.className = 'markdown-body';
            document.body.appendChild(fallbackElement);

            await exportToImage();

            expect(htmlToImage.toBlob).toHaveBeenCalledWith(fallbackElement, expect.any(Object));
        });
    });

    describe('generateImageBlob', () => {
        it('should generate PNG blob by default', async () => {
            const result = await generateImageBlob();

            expect(result).toBe(mockBlob);
            expect(htmlToImage.toBlob).toHaveBeenCalled();
        });

        it('should generate JPEG blob', async () => {
            const mockJpegBlob = new Blob(['jpeg'], { type: 'image/jpeg' });
            global.fetch = vi.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockJpegBlob)
            });

            const result = await generateImageBlob({ format: 'jpeg' });

            expect(result).toBe(mockJpegBlob);
            expect(htmlToImage.toJpeg).toHaveBeenCalled();
        });

        it('should generate SVG blob', async () => {
            const result = await generateImageBlob({ format: 'svg' });

            expect(result).toBeInstanceOf(Blob);
            expect(htmlToImage.toSvg).toHaveBeenCalled();
        });

        it('should throw error when preview element not found', async () => {
            document.body.innerHTML = '';

            await expect(generateImageBlob()).rejects.toThrow('Preview element not found');
        });

        it('should throw error on unsupported format', async () => {
            // @ts-expect-error Testing invalid format
            await expect(generateImageBlob({ format: 'bmp' })).rejects.toThrow('Unsupported format: bmp');
        });
    });

    describe('copyImageToClipboard', () => {
        it('should copy image to clipboard', async () => {
            const mockClipboardWrite = vi.fn().mockResolvedValue(undefined);
            Object.assign(navigator, {
                clipboard: {
                    write: mockClipboardWrite
                }
            });

            await copyImageToClipboard();

            expect(htmlToImage.toBlob).toHaveBeenCalledWith(
                mockPreviewElement,
                expect.objectContaining({
                    pixelRatio: 2,
                    cacheBust: true
                })
            );
            expect(mockClipboardWrite).toHaveBeenCalledWith([expect.any(ClipboardItem)]);
        });

        it('should throw error when preview element not found', async () => {
            document.body.innerHTML = '';

            await expect(copyImageToClipboard()).rejects.toThrow('Preview element not found');
        });

        it('should throw error when blob is null', async () => {
            vi.mocked(htmlToImage.toBlob).mockResolvedValue(null);

            await expect(copyImageToClipboard()).rejects.toThrow('Failed to generate image');
        });

        it('should throw error when clipboard write fails', async () => {
            Object.assign(navigator, {
                clipboard: {
                    write: vi.fn().mockRejectedValue(new Error('Clipboard access denied'))
                }
            });

            await expect(copyImageToClipboard()).rejects.toThrow('Clipboard access denied');
        });
    });
});
