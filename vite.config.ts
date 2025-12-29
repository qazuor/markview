import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'MarkView',
                short_name: 'MarkView',
                description: 'Markdown editor and previewer - Markdown, visualized',
                theme_color: '#1a1a1a',
                background_color: '#1a1a1a',
                display: 'standalone',
                start_url: '/',
                orientation: 'portrait-primary',
                icons: [
                    {
                        src: '/favicon.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/favicon.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                // Increase file size limit (main bundle is large due to CodeMirror, Mermaid, KaTeX)
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
                // Cache static assets
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
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
        open: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
});
