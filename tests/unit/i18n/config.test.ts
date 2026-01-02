import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to create mocks that can be used in vi.mock
const { mockInit, mockUse, mockI18n } = vi.hoisted(() => {
    const mockInit = vi.fn().mockResolvedValue(undefined);
    const mockUse = vi.fn();

    const mockI18n = {
        use: mockUse,
        init: mockInit,
        changeLanguage: vi.fn(),
        t: vi.fn((key: string) => key),
        language: 'en'
    };

    // Make use() return the same object for chaining
    mockUse.mockReturnValue(mockI18n);

    return { mockInit, mockUse, mockI18n };
});

vi.mock('i18next', () => ({
    default: mockI18n
}));

vi.mock('i18next-browser-languagedetector', () => ({
    default: class LanguageDetector {}
}));

vi.mock('react-i18next', () => ({
    initReactI18next: { type: '3rdParty', init: vi.fn() }
}));

// Import the module once at the top level to trigger initialization
import i18n from '@/i18n/config';

describe('i18n config', () => {
    it('should use LanguageDetector', () => {
        expect(mockUse).toHaveBeenCalled();
    });

    it('should use initReactI18next', () => {
        // Called twice: once for LanguageDetector, once for initReactI18next
        expect(mockUse).toHaveBeenCalledTimes(2);
    });

    it('should initialize with correct fallback language', () => {
        expect(mockInit).toHaveBeenCalledWith(
            expect.objectContaining({
                fallbackLng: 'en'
            })
        );
    });

    it('should initialize with supported languages', () => {
        expect(mockInit).toHaveBeenCalledWith(
            expect.objectContaining({
                supportedLngs: ['en', 'es']
            })
        );
    });

    it('should disable escape value for interpolation', () => {
        expect(mockInit).toHaveBeenCalledWith(
            expect.objectContaining({
                interpolation: { escapeValue: false }
            })
        );
    });

    it('should configure language detection', () => {
        expect(mockInit).toHaveBeenCalledWith(
            expect.objectContaining({
                detection: {
                    order: ['localStorage', 'navigator'],
                    caches: ['localStorage']
                }
            })
        );
    });

    it('should include English and Spanish resources', () => {
        expect(mockInit).toHaveBeenCalledWith(
            expect.objectContaining({
                resources: expect.objectContaining({
                    en: expect.objectContaining({ translation: expect.any(Object) }),
                    es: expect.objectContaining({ translation: expect.any(Object) })
                })
            })
        );
    });

    it('should export default i18n instance', () => {
        expect(i18n).toBeDefined();
        expect(i18n).toBe(mockI18n);
    });
});
