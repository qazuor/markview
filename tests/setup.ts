import '@testing-library/jest-dom';
import { afterEach } from 'vitest';

// Clean up after each test
afterEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset document body
    document.body.innerHTML = '';
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
    })
});

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
    value: () => `test-uuid-${Math.random().toString(36).substring(7)}`
});
