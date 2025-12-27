import { useDocumentStore } from '@/stores/documentStore';
import { useCallback } from 'react';

const SUPPORTED_EXTENSIONS = ['.md', '.markdown', '.txt', '.mdx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileImportResult {
    success: boolean;
    documentId?: string;
    error?: string;
}

export function useFileImport() {
    const createDocument = useDocumentStore((s) => s.createDocument);
    const updateContent = useDocumentStore((s) => s.updateContent);
    const renameDocument = useDocumentStore((s) => s.renameDocument);

    const isValidFile = useCallback((file: File): boolean => {
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return SUPPORTED_EXTENSIONS.includes(extension);
    }, []);

    const readFileContent = useCallback(async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }, []);

    const importFile = useCallback(
        async (file: File): Promise<FileImportResult> => {
            if (!isValidFile(file)) {
                return {
                    success: false,
                    error: `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`
                };
            }

            if (file.size > MAX_FILE_SIZE) {
                return {
                    success: false,
                    error: 'File is too large (max 10MB)'
                };
            }

            try {
                const content = await readFileContent(file);
                const documentId = createDocument();

                // Update the content
                updateContent(documentId, content);

                // Set the filename (without extension)
                const name = file.name.replace(/\.[^.]+$/, '');
                renameDocument(documentId, name, true);

                return { success: true, documentId };
            } catch (error) {
                console.error('Import failed:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Import failed'
                };
            }
        },
        [isValidFile, readFileContent, createDocument, updateContent, renameDocument]
    );

    const importFiles = useCallback(
        async (files: FileList | File[]): Promise<FileImportResult[]> => {
            const fileArray = Array.from(files);
            return Promise.all(fileArray.map(importFile));
        },
        [importFile]
    );

    return {
        importFile,
        importFiles,
        isValidFile,
        supportedExtensions: SUPPORTED_EXTENSIONS
    };
}
