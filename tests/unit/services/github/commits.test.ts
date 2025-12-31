import { generateCommitMessage } from '@/services/github/commits';
import { describe, expect, it } from 'vitest';

describe('github commits', () => {
    describe('generateCommitMessage', () => {
        it('should generate create message', () => {
            const message = generateCommitMessage('create', 'README.md');

            expect(message).toBe('Create README.md');
        });

        it('should generate update message', () => {
            const message = generateCommitMessage('update', 'docs/guide.md');

            expect(message).toBe('Update docs/guide.md');
        });

        it('should generate delete message', () => {
            const message = generateCommitMessage('delete', 'old-file.md');

            expect(message).toBe('Delete old-file.md');
        });

        it('should generate rename message', () => {
            const message = generateCommitMessage('rename', 'notes.md');

            expect(message).toBe('Rename notes.md');
        });

        it('should use custom message when provided', () => {
            const customMessage = 'feat: add new documentation';
            const message = generateCommitMessage('create', 'README.md', customMessage);

            expect(message).toBe(customMessage);
        });

        it('should ignore empty custom message', () => {
            const message = generateCommitMessage('update', 'file.md', '');

            expect(message).toBe('Update file.md');
        });

        it('should handle filenames with paths', () => {
            const message = generateCommitMessage('create', 'docs/api/endpoints.md');

            expect(message).toBe('Create docs/api/endpoints.md');
        });

        it('should handle filenames with special characters', () => {
            const message = generateCommitMessage('update', 'changelog-v2.0.md');

            expect(message).toBe('Update changelog-v2.0.md');
        });
    });
});
