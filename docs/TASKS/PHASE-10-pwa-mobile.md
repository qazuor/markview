# Phase 10: PWA and Mobile Optimization

## Overview

This phase implements Progressive Web App functionality for offline support and installability, along with mobile-specific UI optimizations.

**Prerequisites**: Phase 09 completed
**Estimated Tasks**: 22
**Dependencies**: vite-plugin-pwa, workbox

---

## Tasks

### 10.1 PWA Configuration

#### TASK-256: Install PWA plugin
- **Description**: Set up Vite PWA plugin
- **Acceptance Criteria**:
  - [ ] vite-plugin-pwa installed
  - [ ] Plugin added to Vite config
  - [ ] Basic configuration working
- **Files**: `package.json`, `vite.config.ts`

#### TASK-257: Configure Web App Manifest
- **Description**: Create manifest.json for PWA
- **Acceptance Criteria**:
  - [ ] App name and short_name
  - [ ] Icons for all sizes (192, 512)
  - [ ] Theme color and background color
  - [ ] Display mode: standalone
  - [ ] Start URL configured
- **Files**: `public/manifest.json`, `vite.config.ts`

#### TASK-258: Create app icons
- **Description**: Design and export PWA icons
- **Acceptance Criteria**:
  - [ ] Icon design created
  - [ ] 192x192 PNG
  - [ ] 512x512 PNG
  - [ ] Maskable icon variant
  - [ ] Apple touch icon
  - [ ] Favicon.ico
- **Files**: `public/icons/`

#### TASK-259: Configure splash screens
- **Description**: Set up splash screens for iOS
- **Acceptance Criteria**:
  - [ ] Apple splash images for various sizes
  - [ ] Meta tags for apple-mobile-web-app
  - [ ] Proper orientation handling
- **Files**: `index.html`, `public/splash/`

---

### 10.2 Service Worker

#### TASK-260: Configure Workbox
- **Description**: Set up service worker with Workbox
- **Acceptance Criteria**:
  - [ ] Workbox configured in Vite PWA
  - [ ] Precache static assets
  - [ ] Cache strategies defined
  - [ ] Offline fallback page
- **Files**: `vite.config.ts`

#### TASK-261: Implement asset caching
- **Description**: Cache app assets for offline
- **Acceptance Criteria**:
  - [ ] JavaScript and CSS cached
  - [ ] Fonts cached
  - [ ] Images cached
  - [ ] HTML cached with network-first
- **Files**: `vite.config.ts` (update)

#### TASK-262: Implement API caching
- **Description**: Cache API responses
- **Acceptance Criteria**:
  - [ ] GitHub API responses cached
  - [ ] Stale-while-revalidate strategy
  - [ ] Cache expiration (1 hour)
  - [ ] Offline indicator when no cache
- **Files**: `vite.config.ts` (update)

#### TASK-263: Implement offline page
- **Description**: Show offline status
- **Acceptance Criteria**:
  - [ ] Detect offline status
  - [ ] Show offline indicator in UI
  - [ ] Still allow editing local docs
  - [ ] Queue GitHub actions for later
- **Files**: `src/components/OfflineIndicator.tsx`

---

### 10.3 Install Prompt

#### TASK-264: Implement install prompt
- **Description**: Prompt user to install PWA
- **Acceptance Criteria**:
  - [ ] Detect beforeinstallprompt event
  - [ ] Show custom install banner
  - [ ] Handle install button click
  - [ ] Track installation status
  - [ ] Don't show if already installed
- **Files**: `src/components/InstallPrompt.tsx`, `src/hooks/usePWAInstall.ts`

#### TASK-265: Implement install success handling
- **Description**: Handle post-install behavior
- **Acceptance Criteria**:
  - [ ] Detect app installed
  - [ ] Hide install prompt
  - [ ] Show welcome message (optional)
  - [ ] Track analytics (optional)
- **Files**: `src/hooks/usePWAInstall.ts` (update)

---

### 10.4 Mobile Layout

#### TASK-266: Implement responsive breakpoints
- **Description**: Define and apply breakpoints
- **Acceptance Criteria**:
  - [ ] Mobile: <768px
  - [ ] Tablet: 768-1024px
  - [ ] Desktop: >1024px
  - [ ] Tailwind breakpoints configured
- **Files**: `tailwind.config.ts`

#### TASK-267: Implement mobile header
- **Description**: Simplified header for mobile
- **Acceptance Criteria**:
  - [ ] Hamburger menu button
  - [ ] Compact logo
  - [ ] Essential actions only
  - [ ] Drawer for navigation
- **Files**: `src/components/layout/MobileHeader.tsx`

#### TASK-268: Implement mobile navigation drawer
- **Description**: Slide-out navigation menu
- **Acceptance Criteria**:
  - [ ] Drawer slides from left
  - [ ] Contains sidebar content
  - [ ] Overlay to close
  - [ ] Gesture to close (swipe)
- **Files**: `src/components/layout/MobileDrawer.tsx`

#### TASK-269: Implement editor/preview tabs
- **Description**: Tab switching for mobile
- **Acceptance Criteria**:
  - [ ] Tabs at bottom or top
  - [ ] Switch between Editor and Preview
  - [ ] Only one visible at a time
  - [ ] State preserved when switching
- **Files**: `src/components/layout/MobileEditorPreview.tsx`

#### TASK-270: Optimize toolbar for mobile
- **Description**: Compact toolbar for small screens
- **Acceptance Criteria**:
  - [ ] Essential buttons only
  - [ ] Overflow menu for rest
  - [ ] Touch-friendly sizing
  - [ ] Fixed at top or bottom
- **Files**: `src/components/toolbar/MobileToolbar.tsx`

---

### 10.5 Touch Optimizations

#### TASK-271: Implement touch-friendly controls
- **Description**: Optimize for touch input
- **Acceptance Criteria**:
  - [ ] Larger touch targets (44px min)
  - [ ] No hover-dependent features
  - [ ] Touch gestures where appropriate
  - [ ] No accidental taps
- **Files**: Various component updates

#### TASK-272: Implement swipe gestures
- **Description**: Swipe navigation
- **Acceptance Criteria**:
  - [ ] Swipe left/right between editor/preview
  - [ ] Swipe to open/close drawer
  - [ ] Smooth animations
  - [ ] Disable when scrolling
- **Files**: `src/hooks/useSwipeGesture.ts`

#### TASK-273: Optimize virtual keyboard handling
- **Description**: Handle mobile keyboard
- **Acceptance Criteria**:
  - [ ] Detect keyboard open/close
  - [ ] Adjust layout when keyboard visible
  - [ ] Keep toolbar accessible
  - [ ] Scroll to cursor when typing
- **Files**: `src/hooks/useVirtualKeyboard.ts`

---

### 10.6 Performance Optimization

#### TASK-274: Implement code splitting
- **Description**: Split code for faster loading
- **Acceptance Criteria**:
  - [ ] Lazy load modals
  - [ ] Lazy load settings
  - [ ] Lazy load advanced features
  - [ ] Core editor loads immediately
- **Files**: `src/app/routes.tsx`, various components

#### TASK-275: Optimize bundle size
- **Description**: Reduce JavaScript bundle
- **Acceptance Criteria**:
  - [ ] Analyze bundle with visualizer
  - [ ] Remove unused dependencies
  - [ ] Tree-shake imports
  - [ ] Target: <500KB gzipped
- **Files**: `vite.config.ts`, `package.json`

#### TASK-276: Implement critical CSS
- **Description**: Inline critical styles
- **Acceptance Criteria**:
  - [ ] Critical CSS inlined
  - [ ] Non-critical CSS deferred
  - [ ] No layout shift on load
- **Files**: `vite.config.ts`

#### TASK-277: Test performance metrics
- **Description**: Verify PWA performance
- **Acceptance Criteria**:
  - [ ] Lighthouse score >90
  - [ ] First Contentful Paint <1.5s
  - [ ] Time to Interactive <3s
  - [ ] Works offline
- **Commands**: Lighthouse audit

---

## Completion Checklist

- [ ] All 22 tasks completed
- [ ] PWA installable on all platforms
- [ ] Offline mode works
- [ ] Mobile layout responsive
- [ ] Touch gestures work
- [ ] Performance targets met
- [ ] Ready for Phase 11

---

## Testing Notes

- Test on iOS Safari
- Test on Android Chrome
- Test install on iOS (Add to Home Screen)
- Test install on Android
- Test offline mode thoroughly
- Test on various screen sizes
- Test with slow network (3G simulation)

---

## Device Testing Matrix

| Device | Browser | Install | Offline | Touch |
|--------|---------|---------|---------|-------|
| iPhone 14 | Safari | Test | Test | Test |
| iPhone SE | Safari | Test | Test | Test |
| Pixel 7 | Chrome | Test | Test | Test |
| Samsung S23 | Chrome | Test | Test | Test |
| iPad | Safari | Test | Test | Test |
| Android Tablet | Chrome | Test | Test | Test |

---

*Phase 10 - PWA and Mobile*
*MarkView Development Plan*
