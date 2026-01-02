import { decryptToken, encryptToken, isEncrypted, safeDecryptToken, safeEncryptToken } from '@/server/utils/encryption';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('encryption utils', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        process.env.TOKEN_ENCRYPTION_KEY = 'test-encryption-key-for-testing';
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    describe('encryptToken', () => {
        it('should encrypt a plaintext string', () => {
            const plaintext = 'my-secret-token';
            const encrypted = encryptToken(plaintext);

            expect(encrypted).toBeDefined();
            expect(encrypted).not.toBe(plaintext);
            expect(typeof encrypted).toBe('string');
        });

        it('should produce different ciphertext for same plaintext (due to random IV)', () => {
            const plaintext = 'my-secret-token';
            const encrypted1 = encryptToken(plaintext);
            const encrypted2 = encryptToken(plaintext);

            expect(encrypted1).not.toBe(encrypted2);
        });

        it('should throw error for empty value', () => {
            expect(() => encryptToken('')).toThrow('Cannot encrypt empty value');
        });

        it('should produce base64-encoded output', () => {
            const plaintext = 'test-token';
            const encrypted = encryptToken(plaintext);

            // Valid base64 should not throw
            expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
        });
    });

    describe('decryptToken', () => {
        it('should decrypt an encrypted token correctly', () => {
            const plaintext = 'my-secret-token-12345';
            const encrypted = encryptToken(plaintext);
            const decrypted = decryptToken(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle unicode characters', () => {
            const plaintext = 'token-with-unicode-émojis-🔐';
            const encrypted = encryptToken(plaintext);
            const decrypted = decryptToken(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle long tokens', () => {
            const plaintext = 'a'.repeat(1000);
            const encrypted = encryptToken(plaintext);
            const decrypted = decryptToken(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should throw error for empty value', () => {
            expect(() => decryptToken('')).toThrow('Cannot decrypt empty value');
        });

        it('should throw error for invalid encrypted data', () => {
            expect(() => decryptToken('invalid-data')).toThrow();
        });

        it('should throw error for tampered data', () => {
            const plaintext = 'my-secret-token';
            const encrypted = encryptToken(plaintext);

            // Tamper with the encrypted data
            const buffer = Buffer.from(encrypted, 'base64');
            buffer[50] = buffer[50] ^ 0xff; // Flip bits
            const tampered = buffer.toString('base64');

            expect(() => decryptToken(tampered)).toThrow();
        });
    });

    describe('isEncrypted', () => {
        it('should return true for encrypted values', () => {
            const encrypted = encryptToken('test-token');
            expect(isEncrypted(encrypted)).toBe(true);
        });

        it('should return false for plaintext values', () => {
            expect(isEncrypted('plain-text-token')).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(isEncrypted('')).toBe(false);
        });

        it('should return false for short base64 strings', () => {
            expect(isEncrypted('c2hvcnQ=')).toBe(false);
        });

        it('should return false for invalid base64', () => {
            expect(isEncrypted('not-valid-base64!!!')).toBe(false);
        });
    });

    describe('safeEncryptToken', () => {
        it('should encrypt plaintext token', () => {
            const plaintext = 'my-token';
            const result = safeEncryptToken(plaintext);

            expect(result).not.toBe(plaintext);
            expect(result && isEncrypted(result)).toBe(true);
        });

        it('should return null for null input', () => {
            expect(safeEncryptToken(null)).toBeNull();
        });

        it('should return null for undefined input', () => {
            expect(safeEncryptToken(undefined)).toBeNull();
        });

        it('should return original if already encrypted', () => {
            const plaintext = 'my-token';
            const encrypted = encryptToken(plaintext);
            const result = safeEncryptToken(encrypted);

            expect(result).toBe(encrypted);
        });

        it('should return original if encryption fails', () => {
            // Remove encryption key to cause failure
            process.env.TOKEN_ENCRYPTION_KEY = undefined;
            process.env.BETTER_AUTH_SECRET = undefined;

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const plaintext = 'my-token';
            const result = safeEncryptToken(plaintext);

            expect(result).toBe(plaintext);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('safeDecryptToken', () => {
        it('should decrypt encrypted token', () => {
            const plaintext = 'my-token';
            const encrypted = encryptToken(plaintext);
            const result = safeDecryptToken(encrypted);

            expect(result).toBe(plaintext);
        });

        it('should return null for null input', () => {
            expect(safeDecryptToken(null)).toBeNull();
        });

        it('should return null for undefined input', () => {
            expect(safeDecryptToken(undefined)).toBeNull();
        });

        it('should return original if not encrypted', () => {
            const plaintext = 'plain-text-token';
            const result = safeDecryptToken(plaintext);

            expect(result).toBe(plaintext);
        });

        it('should return original if decryption fails', () => {
            const encrypted = encryptToken('my-token');

            // Tamper with encrypted data
            const buffer = Buffer.from(encrypted, 'base64');
            buffer[50] = buffer[50] ^ 0xff;
            const tampered = buffer.toString('base64');

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = safeDecryptToken(tampered);

            expect(result).toBe(tampered);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('encryption key fallback', () => {
        it('should use BETTER_AUTH_SECRET if TOKEN_ENCRYPTION_KEY is not set', () => {
            process.env.TOKEN_ENCRYPTION_KEY = undefined;
            process.env.BETTER_AUTH_SECRET = 'fallback-secret-key';

            const plaintext = 'test-token';
            const encrypted = encryptToken(plaintext);
            const decrypted = decryptToken(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should throw error if no encryption key is available', () => {
            process.env.TOKEN_ENCRYPTION_KEY = undefined;
            process.env.BETTER_AUTH_SECRET = undefined;

            expect(() => encryptToken('test')).toThrow('TOKEN_ENCRYPTION_KEY or BETTER_AUTH_SECRET must be set');
        });
    });
});
