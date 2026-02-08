# Phase 18 Research: PWA & Offline Capability

## Standard Stack

- `vite-plugin-pwa` - Zero-config PWA plugin for Vite
- `workbox-precaching` - Asset caching (already included with vite-plugin-pwa)
- React hooks from `virtual:pwa-register/react` - Service worker registration

## Architecture Patterns

1. **Auto Update Registration**: Using `registerType: 'autoUpdate'` for seamless updates
2. **Asset Caching**: Pre-caching all static assets with Workbox
3. **Runtime Caching**: Network-first strategy for API calls (if any in future)
4. **Manifest Configuration**: Proper PWA manifest with icons and display settings
5. **UI Integration**: React hooks for handling install prompts and update notifications

## Implementation Plan

1. Configure vite-plugin-pwa in vite.config.ts with manifest and workbox settings
2. Create service worker registration with React hooks
3. Implement UI for install prompts and update notifications
4. Generate required assets (icons) and configure manifest properly
5. Test offline functionality and update mechanisms

## Don't Hand Roll

- Service worker logic - use Workbox via vite-plugin-pwa
- Manifest generation - use vite-plugin-pwa configuration
- Update/install prompt UI - use provided React hooks

## Common Pitfalls to Avoid

1. Not configuring proper caching strategies for different asset types
2. Missing required manifest fields for installability
3. Not handling update notifications properly
4. Forgetting to include all necessary assets in precache
5. Incorrect service worker registration that breaks functionality
