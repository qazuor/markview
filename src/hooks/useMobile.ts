import { useCallback, useEffect, useState } from 'react';

// Breakpoints matching Tailwind defaults
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to detect mobile viewport and responsive breakpoints
 * @param breakpoint - The breakpoint to check against (default: 'md' = 768px)
 * @returns Object with isMobile boolean and current viewport width
 */
export function useMobile(breakpoint: Breakpoint = 'md') {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < BREAKPOINTS[breakpoint];
    });

    const [viewportWidth, setViewportWidth] = useState(() => {
        if (typeof window === 'undefined') return 0;
        return window.innerWidth;
    });

    const checkMobile = useCallback(() => {
        const width = window.innerWidth;
        setViewportWidth(width);
        setIsMobile(width < BREAKPOINTS[breakpoint]);
    }, [breakpoint]);

    useEffect(() => {
        checkMobile();

        // Use ResizeObserver for better performance
        const resizeObserver = new ResizeObserver(() => {
            checkMobile();
        });

        resizeObserver.observe(document.documentElement);

        // Fallback to resize event
        window.addEventListener('resize', checkMobile);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', checkMobile);
        };
    }, [checkMobile]);

    return { isMobile, viewportWidth };
}

/**
 * Hook to check if device supports touch
 */
export function useTouch() {
    const [isTouch, setIsTouch] = useState(() => {
        if (typeof window === 'undefined') return false;
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });

    useEffect(() => {
        const checkTouch = () => {
            setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };
        checkTouch();
    }, []);

    return isTouch;
}
