import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'robots.txt', 'sitemap.xml'],
            manifest: {
                name: 'MarkView - Modern Markdown Editor',
                short_name: 'MarkView',
                description:
                    'A powerful, modern Markdown editor with live preview. Features syntax highlighting, Mermaid diagrams, KaTeX math formulas, and export to PDF, HTML, and images.',
                theme_color: '#0ea5e9',
                background_color: '#1a1a1a',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                orientation: 'any',
                lang: 'en',
                dir: 'ltr',
                categories: ['productivity', 'utilities', 'developer tools'],
                iarc_rating_id: '',
                prefer_related_applications: false,
                icons: [
                    {
                        src: '/favicon.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: '/favicon.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: '/favicon.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'maskable'
                    }
                ],
                shortcuts: [
                    {
                        name: 'New Document',
                        short_name: 'New',
                        description: 'Create a new Markdown document',
                        url: '/?action=new',
                        icons: [{ src: '/favicon.svg', sizes: '192x192' }]
                    }
                ],
                screenshots: [
                    {
                        src: '/og-image.png',
                        sizes: '1200x630',
                        type: 'image/png',
                        label: 'MarkView Editor Interface'
                    }
                ]
            },
            workbox: {
                // Increase file size limit (main bundle is large due to CodeMirror, Mermaid, KaTeX)
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
                // Cache static assets
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                // Navigation fallback configuration
                // CRITICAL: Exclude /api/ routes from being intercepted by the service worker
                // This prevents the SW from serving index.html for API navigation requests
                // (e.g., OAuth callbacks like /api/auth/callback/github)
                navigateFallback: 'index.html',
                navigateFallbackDenylist: [/^\/api\//],
                // Runtime caching strategies
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:js|css)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-resources'
                        }
                    }
                ],
                // Clean up old caches
                cleanupOutdatedCaches: true,
                // Skip waiting to activate new service worker immediately
                skipWaiting: true,
                clientsClaim: true
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3017',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
});
