import { useDocumentStore } from '@/stores/documentStore';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock extractHeading and sanitizeFilename
vi.mock('@/utils', () => ({
    extractHeading: vi.fn((content: string) => {
        const match = content.match(/^#\s+(.+)$/m);
        return match ? match[1] : null;
    }),
    sanitizeFilename: vi.fn((name: string) => name.replace(/[^\w\s-]/g, '').trim())
}));

describe('documentStore', () => {
    beforeEach(() => {
        useDocumentStore.setState({
            documents: new Map(),
            activeDocumentId: null,
            versions: new Map()
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('createDocument', () => {
        it('should create a new document with default values', () => {
            const { createDocument } = useDocumentStore.getState();

            const id = createDocument();
            const state = useDocumentStore.getState();

            expect(id).toBeDefined();
            expect(state.documents.size).toBe(1);
            expect(state.activeDocumentId).toBe(id);

            const doc = state.documents.get(id);
            expect(doc).toMatchObject({
                id,
                name: 'Untitled',
                content: '',
                syncStatus: 'synced',
                isManuallyNamed: false,
                source: 'local'
            });
        });

        it('should set new document as active', () => {
            const { createDocument } = useDocumentStore.getState();

            const id = createDocument();
            const state = useDocumentStore.getState();

            expect(state.activeDocumentId).toBe(id);
        });
    });

    describe('openDocument', () => {
        it('should set active document', () => {
            const { createDocument, openDocument } = useDocumentStore.getState();

            const id1 = createDocument();
            createDocument(); // Create second document to ensure multiple exist

            act(() => {
                openDocument(id1);
            });

            expect(useDocumentStore.getState().activeDocumentId).toBe(id1);
        });
    });

    describe('closeDocument', () => {
        it('should remove document from store', () => {
            const { createDocument, closeDocument } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                closeDocument(id);
            });

            const state = useDocumentStore.getState();
            expect(state.documents.has(id)).toBe(false);
        });

        it('should set next document as active when closing active document', () => {
            const { createDocument, closeDocument } = useDocumentStore.getState();

            const id1 = createDocument();
            const id2 = createDocument();

            act(() => {
                closeDocument(id2);
            });

            const state = useDocumentStore.getState();
            expect(state.activeDocumentId).toBe(id1);
        });

        it('should set activeDocumentId to null when closing last document', () => {
            const { createDocument, closeDocument } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                closeDocument(id);
            });

            expect(useDocumentStore.getState().activeDocumentId).toBeNull();
        });
    });

    describe('updateContent', () => {
        it('should update document content', () => {
            const { createDocument, updateContent } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                updateContent(id, '# New Content');
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.content).toBe('# New Content');
            // Content changed, so status should be 'modified'
            expect(doc?.syncStatus).toBe('modified');
        });

        it('should auto-name document from H1 heading', () => {
            const { createDocument, updateContent } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                updateContent(id, '# My Document\n\nSome content');
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.name).toBe('My Document');
            expect(doc?.isManuallyNamed).toBe(false);
        });

        it('should not update name when manually named', () => {
            const { createDocument, updateContent, renameDocument } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                renameDocument(id, 'Manual Name', true);
                updateContent(id, '# Different Heading');
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.name).toBe('Manual Name');
        });

        it('should reset to Untitled when content is cleared', () => {
            const { createDocument, updateContent } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                updateContent(id, '# Some Title');
                updateContent(id, '');
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.name).toBe('Untitled');
        });

        it('should not update non-existent document', () => {
            const { updateContent, documents } = useDocumentStore.getState();

            act(() => {
                updateContent('non-existent-id', 'content');
            });

            expect(documents.size).toBe(0);
        });
    });

    describe('renameDocument', () => {
        it('should rename document manually', () => {
            const { createDocument, renameDocument } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                renameDocument(id, 'New Name', true);
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.name).toBe('New Name');
            expect(doc?.isManuallyNamed).toBe(true);
        });

        it('should not update non-existent document', () => {
            const { renameDocument } = useDocumentStore.getState();

            act(() => {
                renameDocument('non-existent-id', 'New Name');
            });

            expect(useDocumentStore.getState().documents.size).toBe(0);
        });
    });

    describe('deleteDocument', () => {
        it('should delete document and its versions', () => {
            const { createDocument, deleteDocument, saveVersion } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                saveVersion(id, 'Version 1');
                deleteDocument(id);
            });

            const state = useDocumentStore.getState();
            expect(state.documents.has(id)).toBe(false);
            expect(state.versions.has(id)).toBe(false);
        });

        it('should update active document when deleting active', () => {
            const { createDocument, deleteDocument } = useDocumentStore.getState();

            const id1 = createDocument();
            const id2 = createDocument();

            act(() => {
                deleteDocument(id2);
            });

            expect(useDocumentStore.getState().activeDocumentId).toBe(id1);
        });
    });

    describe('getActiveDocument', () => {
        it('should return active document', () => {
            const { createDocument, getActiveDocument } = useDocumentStore.getState();

            const id = createDocument();
            const doc = getActiveDocument();

            expect(doc?.id).toBe(id);
        });

        it('should return null when no active document', () => {
            const { getActiveDocument } = useDocumentStore.getState();

            expect(getActiveDocument()).toBeNull();
        });
    });

    describe('getDocument', () => {
        it('should return document by id', () => {
            const { createDocument, getDocument } = useDocumentStore.getState();

            const id = createDocument();
            const doc = getDocument(id);

            expect(doc?.id).toBe(id);
        });

        it('should return undefined for non-existent document', () => {
            const { getDocument } = useDocumentStore.getState();

            expect(getDocument('non-existent-id')).toBeUndefined();
        });
    });

    describe('Version History', () => {
        describe('saveVersion', () => {
            it('should save a version with label', () => {
                const { createDocument, updateContent, saveVersion, getVersions } = useDocumentStore.getState();

                const id = createDocument();

                act(() => {
                    updateContent(id, 'Version 1 content');
                    saveVersion(id, 'Version 1');
                });

                const versions = getVersions(id);
                expect(versions).toHaveLength(1);
                expect(versions[0]).toMatchObject({
                    documentId: id,
                    content: 'Version 1 content',
                    label: 'Version 1'
                });
            });

            it('should save version without label', () => {
                const { createDocument, updateContent, saveVersion, getVersions } = useDocumentStore.getState();

                const id = createDocument();

                act(() => {
                    updateContent(id, 'Content');
                    saveVersion(id);
                });

                const versions = getVersions(id);
                expect(versions).toHaveLength(1);
                expect(versions[0]?.label).toBeUndefined();
            });

            it('should limit to 10 versions', () => {
                const { createDocument, updateContent, saveVersion, getVersions } = useDocumentStore.getState();

                const id = createDocument();

                act(() => {
                    for (let i = 0; i < 15; i++) {
                        updateContent(id, `Version ${i}`);
                        saveVersion(id, `Version ${i}`);
                    }
                });

                const versions = getVersions(id);
                expect(versions).toHaveLength(10);
                expect(versions[0]?.label).toBe('Version 14');
            });

            it('should not save version for non-existent document', () => {
                const { saveVersion, getVersions } = useDocumentStore.getState();

                act(() => {
                    saveVersion('non-existent-id', 'Version');
                });

                expect(getVersions('non-existent-id')).toHaveLength(0);
            });
        });

        describe('getVersions', () => {
            it('should return empty array for document with no versions', () => {
                const { createDocument, getVersions } = useDocumentStore.getState();

                const id = createDocument();
                const versions = getVersions(id);

                expect(versions).toEqual([]);
            });
        });

        describe('restoreVersion', () => {
            it('should restore document content from version', () => {
                const { createDocument, updateContent, saveVersion, restoreVersion, getVersions } = useDocumentStore.getState();

                const id = createDocument();

                act(() => {
                    updateContent(id, 'Original content');
                    saveVersion(id, 'v1');
                    updateContent(id, 'Modified content');
                });

                const versions = getVersions(id);
                const versionId = versions[0]?.id;

                act(() => {
                    if (versionId) restoreVersion(id, versionId);
                });

                const doc = useDocumentStore.getState().documents.get(id);
                expect(doc?.content).toBe('Original content');
                // Restoring changes content, status depends on whether it matches original hash
                expect(doc?.syncStatus).toBe('modified');
            });

            it('should not restore non-existent version', () => {
                const { createDocument, updateContent, restoreVersion } = useDocumentStore.getState();

                const id = createDocument();

                act(() => {
                    updateContent(id, 'Content');
                    restoreVersion(id, 'non-existent-version');
                });

                const doc = useDocumentStore.getState().documents.get(id);
                expect(doc?.content).toBe('Content');
            });
        });

        describe('deleteVersion', () => {
            it('should delete specific version', () => {
                const { createDocument, updateContent, saveVersion, deleteVersion, getVersions } = useDocumentStore.getState();

                const id = createDocument();

                act(() => {
                    updateContent(id, 'v1');
                    saveVersion(id, 'v1');
                    updateContent(id, 'v2');
                    saveVersion(id, 'v2');
                });

                const versions = getVersions(id);
                const versionId = versions[0]?.id;

                act(() => {
                    if (versionId) deleteVersion(id, versionId);
                });

                const remainingVersions = getVersions(id);
                expect(remainingVersions).toHaveLength(1);
                expect(remainingVersions[0]?.label).toBe('v1');
            });
        });
    });

    describe('updateCursor', () => {
        it('should update cursor position', () => {
            const { createDocument, updateCursor } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                updateCursor(id, 5, 10);
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.cursor).toEqual({ line: 5, column: 10 });
        });
    });

    describe('updateScroll', () => {
        it('should update scroll position', () => {
            const { createDocument, updateScroll } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                updateScroll(id, 10, 50);
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.scroll).toEqual({ line: 10, percentage: 50 });
        });

        it('should not update scroll for non-existent document', () => {
            const { updateScroll } = useDocumentStore.getState();

            act(() => {
                updateScroll('non-existent-id', 10, 50);
            });

            expect(useDocumentStore.getState().documents.size).toBe(0);
        });
    });

    describe('updateCursor - edge cases', () => {
        it('should not update cursor for non-existent document', () => {
            const { updateCursor } = useDocumentStore.getState();

            act(() => {
                updateCursor('non-existent-id', 5, 10);
            });

            expect(useDocumentStore.getState().documents.size).toBe(0);
        });
    });

    describe('createDocument with options', () => {
        it('should create document with custom name', () => {
            const { createDocument } = useDocumentStore.getState();

            const id = createDocument({ name: 'Custom Name' });
            const doc = useDocumentStore.getState().documents.get(id);

            expect(doc?.name).toBe('Custom Name');
            expect(doc?.isManuallyNamed).toBe(true);
        });

        it('should create document with custom content', () => {
            const { createDocument } = useDocumentStore.getState();

            const id = createDocument({ content: '# Hello World' });
            const doc = useDocumentStore.getState().documents.get(id);

            expect(doc?.content).toBe('# Hello World');
        });

        it('should create document with github source', () => {
            const { createDocument } = useDocumentStore.getState();

            const githubInfo = {
                owner: 'testowner',
                repo: 'testrepo',
                path: 'docs/README.md',
                sha: 'abc123',
                branch: 'main'
            };

            const id = createDocument({
                source: 'github',
                githubInfo
            });
            const doc = useDocumentStore.getState().documents.get(id);

            expect(doc?.source).toBe('github');
            expect(doc?.githubInfo).toEqual(githubInfo);
        });

        it('should create document with gdrive source', () => {
            const { createDocument } = useDocumentStore.getState();

            const driveInfo = {
                fileId: 'file-123',
                name: 'document.md',
                mimeType: 'text/markdown'
            };

            const id = createDocument({
                source: 'gdrive',
                driveInfo
            });
            const doc = useDocumentStore.getState().documents.get(id);

            expect(doc?.source).toBe('gdrive');
            expect(doc?.driveInfo).toEqual(driveInfo);
        });
    });

    describe('findDocumentByGitHub', () => {
        it('should find document by github repo and path', () => {
            const { createDocument, findDocumentByGitHub } = useDocumentStore.getState();

            const githubInfo = {
                owner: 'testowner',
                repo: 'testrepo',
                path: 'docs/README.md',
                sha: 'abc123',
                branch: 'main'
            };

            createDocument({
                source: 'github',
                githubInfo
            });

            const found = findDocumentByGitHub('testowner/testrepo', 'docs/README.md');

            expect(found).toBeDefined();
            expect(found?.githubInfo?.path).toBe('docs/README.md');
        });

        it('should return undefined for non-existent github file', () => {
            const { findDocumentByGitHub } = useDocumentStore.getState();

            const found = findDocumentByGitHub('owner/repo', 'missing.md');

            expect(found).toBeUndefined();
        });

        it('should not find local documents', () => {
            const { createDocument, findDocumentByGitHub } = useDocumentStore.getState();

            createDocument({ name: 'Local Doc' });

            const found = findDocumentByGitHub('owner/repo', 'path.md');

            expect(found).toBeUndefined();
        });
    });

    describe('findDocumentByDrive', () => {
        it('should find document by drive file id', () => {
            const { createDocument, findDocumentByDrive } = useDocumentStore.getState();

            const driveInfo = {
                fileId: 'file-123',
                name: 'document.md',
                mimeType: 'text/markdown'
            };

            createDocument({
                source: 'gdrive',
                driveInfo
            });

            const found = findDocumentByDrive('file-123');

            expect(found).toBeDefined();
            expect(found?.driveInfo?.fileId).toBe('file-123');
        });

        it('should return undefined for non-existent drive file', () => {
            const { findDocumentByDrive } = useDocumentStore.getState();

            const found = findDocumentByDrive('non-existent-id');

            expect(found).toBeUndefined();
        });

        it('should not find local documents', () => {
            const { createDocument, findDocumentByDrive } = useDocumentStore.getState();

            createDocument({ name: 'Local Doc' });

            const found = findDocumentByDrive('file-id');

            expect(found).toBeUndefined();
        });
    });

    describe('setSyncStatus', () => {
        it('should set sync status', () => {
            const { createDocument, setSyncStatus } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                setSyncStatus(id, 'syncing');
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.syncStatus).toBe('syncing');
        });

        it('should set cloud-pending status', () => {
            const { createDocument, setSyncStatus } = useDocumentStore.getState();

            const id = createDocument();

            act(() => {
                setSyncStatus(id, 'cloud-pending');
            });

            const doc = useDocumentStore.getState().documents.get(id);
            expect(doc?.syncStatus).toBe('cloud-pending');
        });

        it('should not set status for non-existent document', () => {
            const { setSyncStatus } = useDocumentStore.getState();

            act(() => {
                setSyncStatus('non-existent-id', 'syncing');
            });

            expect(useDocumentStore.getState().documents.size).toBe(0);
        });
    });

    describe('restoreVersion edge cases', () => {
        it('should not restore version for non-existent document', () => {
            const { restoreVersion } = useDocumentStore.getState();

            act(() => {
                restoreVersion('non-existent-doc', 'version-id');
            });

            expect(useDocumentStore.getState().documents.size).toBe(0);
        });
    });
});
