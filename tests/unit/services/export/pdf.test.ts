import { exportToPdf, generatePdfBlob } from '@/services/export/pdf';
import html2pdf from 'html2pdf.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock html2pdf.js
const mockSave = vi.fn().mockResolvedValue(undefined);
const mockOutputPdf = vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
const mockFrom = vi.fn().mockReturnValue({
    save: mockSave,
    outputPdf: mockOutputPdf
});
const mockSet = vi.fn().mockReturnValue({
    from: mockFrom
});

vi.mock('html2pdf.js', () => ({
    default: vi.fn(() => ({
        set: mockSet
    }))
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
    setTimeout(callback, 0);
    return 0;
});

describe('pdf export', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    describe('exportToPdf', () => {
        it('should export HTML to PDF with default options', async () => {
            const htmlContent = '<h1>Test</h1>';
            const promise = exportToPdf(htmlContent);

            // Advance timers for requestAnimationFrame and setTimeout
            await vi.advanceTimersByTimeAsync(200);

            await promise;

            expect(html2pdf).toHaveBeenCalled();
            expect(mockSet).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalled();
            expect(mockSave).toHaveBeenCalled();
        });

        it('should use custom filename', async () => {
            const promise = exportToPdf('<p>Content</p>', { filename: 'my-doc' });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    filename: 'my-doc.pdf'
                })
            );
        });

        it('should handle filename with .pdf extension', async () => {
            const promise = exportToPdf('<p>Content</p>', { filename: 'document.pdf' });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    filename: 'document.pdf'
                })
            );
        });

        it('should use custom margin', async () => {
            const promise = exportToPdf('<p>Content</p>', { margin: 20 });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    margin: 20
                })
            );
        });

        it('should use letter page size', async () => {
            const promise = exportToPdf('<p>Content</p>', { pageSize: 'letter' });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    jsPDF: expect.objectContaining({
                        format: [215.9, 279.4]
                    })
                })
            );
        });

        it('should use legal page size', async () => {
            const promise = exportToPdf('<p>Content</p>', { pageSize: 'legal' });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    jsPDF: expect.objectContaining({
                        format: [215.9, 355.6]
                    })
                })
            );
        });

        it('should use landscape orientation', async () => {
            const promise = exportToPdf('<p>Content</p>', { orientation: 'landscape' });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    jsPDF: expect.objectContaining({
                        orientation: 'landscape',
                        format: [297, 210] // Flipped for landscape
                    })
                })
            );
        });

        it('should use dark theme', async () => {
            const promise = exportToPdf('<p>Content</p>', { theme: 'dark' });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    html2canvas: expect.objectContaining({
                        backgroundColor: '#1f2937'
                    })
                })
            );
        });

        it('should use light theme', async () => {
            const promise = exportToPdf('<p>Content</p>', { theme: 'light' });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    html2canvas: expect.objectContaining({
                        backgroundColor: '#ffffff'
                    })
                })
            );
        });

        it('should call onProgress callback', async () => {
            const onProgress = vi.fn();
            const promise = exportToPdf('<p>Content</p>', { onProgress });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(onProgress).toHaveBeenCalledWith('Rendering...');
            expect(onProgress).toHaveBeenCalledWith('Generating PDF...');
            expect(onProgress).toHaveBeenCalledWith('Complete');
        });

        it('should create temporary style element', async () => {
            const promise = exportToPdf('<p>Content</p>');
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            // Style should be cleaned up after export
            const styleEl = document.getElementById('pdf-export-styles');
            expect(styleEl).toBeNull();
        });

        it('should create temporary container element', async () => {
            const promise = exportToPdf('<p>Content</p>');
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            // Container should be cleaned up after export
            const container = document.getElementById('pdf-export-container');
            expect(container).toBeNull();
        });
    });

    describe('generatePdfBlob', () => {
        it('should generate PDF blob', async () => {
            const promise = generatePdfBlob('<p>Content</p>');
            await vi.advanceTimersByTimeAsync(200);
            const blob = await promise;

            expect(blob).toBeInstanceOf(Blob);
            expect(mockOutputPdf).toHaveBeenCalledWith('blob');
        });

        it('should use custom options', async () => {
            const promise = generatePdfBlob('<p>Content</p>', {
                margin: 15,
                pageSize: 'letter',
                orientation: 'landscape',
                theme: 'dark'
            });
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    margin: 15,
                    html2canvas: expect.objectContaining({
                        backgroundColor: '#1f2937'
                    }),
                    jsPDF: expect.objectContaining({
                        orientation: 'landscape'
                    })
                })
            );
        });

        it('should clean up after generating blob', async () => {
            const promise = generatePdfBlob('<p>Content</p>');
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            const container = document.getElementById('pdf-export-container-blob');
            expect(container).toBeNull();

            const styleEl = document.getElementById('pdf-export-styles-blob');
            expect(styleEl).toBeNull();
        });

        it('should use A4 as default page size', async () => {
            const promise = generatePdfBlob('<p>Content</p>');
            await vi.advanceTimersByTimeAsync(200);
            await promise;

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    jsPDF: expect.objectContaining({
                        format: [210, 297]
                    })
                })
            );
        });
    });
});
