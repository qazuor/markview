# PWA Implementation

MarkView is a Progressive Web App (PWA) that provides an app-like experience with offline capabilities.

## Features

### 1. Installable
- Users can install MarkView on their devices
- Works on desktop and mobile
- App-like experience with standalone mode

### 2. Offline Support
- Service Worker caches static assets
- App works offline after first visit
- Automatic cache updates

### 3. Performance
- Fast loading with precached assets
- Smart caching strategies for different resource types
- Background sync capabilities

## Implementation Details

### Service Worker Configuration

Located in `vite.config.ts`, the PWA is configured with:

```typescript
VitePWA({
    registerType: 'autoUpdate',
    workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
            // Fonts: Cache-first strategy
            // Images: Cache-first with expiration
            // JS/CSS: Stale-while-revalidate
        ]
    }
})
```

### Caching Strategies

| Resource Type | Strategy | Cache Duration |
|--------------|----------|----------------|
| Fonts (Google) | CacheFirst | 365 days |
| Images | CacheFirst | 30 days |
| JS/CSS | StaleWhileRevalidate | Until invalidated |
| Static Assets | Precached | Until version change |

### Components

#### 1. InstallPrompt (`src/components/pwa/InstallPrompt.tsx`)
- Detects when app can be installed
- Shows install banner
- Handles user acceptance/dismissal
- Stores dismissal preference

#### 2. OfflineIndicator (`src/components/pwa/OfflineIndicator.tsx`)
- Monitors online/offline status
- Shows subtle notification when offline
- Shows reconnection message

#### 3. UpdatePrompt (`src/components/pwa/UpdatePrompt.tsx`)
- Detects when new version is available
- Prompts user to update
- Handles service worker update

### Hook: usePWA

The `usePWA` hook provides a unified interface for PWA functionality:

```typescript
const {
    isInstallable,  // Can the app be installed?
    isInstalled,    // Is the app installed?
    isOnline,       // Is the user online?
    hasUpdate,      // Is there an update available?
    promptInstall,  // Show install prompt
    dismissInstall, // Dismiss install prompt
    updateServiceWorker // Update to new version
} = usePWA();
```

## Manifest

The Web App Manifest is auto-generated with:

```json
{
    "name": "MarkView",
    "short_name": "MarkView",
    "description": "Markdown editor and previewer - Markdown, visualized",
    "theme_color": "#1a1a1a",
    "background_color": "#1a1a1a",
    "display": "standalone",
    "start_url": "/"
}
```

## Testing PWA

### Development
```bash
pnpm dev
```
The service worker is enabled in development mode for testing.

### Production Build
```bash
pnpm build
pnpm preview
```

### Chrome DevTools
1. Open DevTools
2. Go to "Application" tab
3. Check:
   - Manifest
   - Service Workers
   - Cache Storage
   - Offline mode

### Lighthouse
Run Lighthouse audit to verify PWA compliance:
1. Open DevTools
2. Go to "Lighthouse" tab
3. Check "Progressive Web App"
4. Click "Generate report"

## Browser Support

| Browser | Install | Offline | Notifications |
|---------|---------|---------|---------------|
| Chrome 80+ | ✅ | ✅ | ✅ |
| Edge 80+ | ✅ | ✅ | ✅ |
| Firefox 90+ | ⚠️ | ✅ | ✅ |
| Safari 15+ | ⚠️ | ✅ | ⚠️ |

- ✅ Fully supported
- ⚠️ Partial support

## Known Limitations

1. **Large Bundle Size**: The main bundle (2.8MB) includes CodeMirror, Mermaid, and KaTeX, which are large libraries. Consider implementing code-splitting for better performance.

2. **Icon Format**: Currently using SVG icons. For better compatibility, generate PNG icons (see `public/ICONS.md`).

3. **iOS Limitations**:
   - No install prompt on iOS Safari
   - Users must manually "Add to Home Screen"
   - Limited notification support

## Future Improvements

- [ ] Implement code-splitting to reduce main bundle size
- [ ] Add background sync for saving documents
- [ ] Implement push notifications
- [ ] Add offline editing queue
- [ ] Generate optimized PNG icons
- [ ] Add share target API support
- [ ] Implement file handling API

## Resources

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
