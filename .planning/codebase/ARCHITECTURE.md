# Architecture

## Core Patterns

- **Clean Engine Pattern** - Business logic separated from UI in src/core
- **State Management** - Zustand store with IndexedDB persistence
- **Component Architecture** - Reusable UI components in src/components
- **Path Aliases** - @/core, @/components, @/\* for clean imports
- **Test-Driven Development** - Comprehensive test coverage for core logic

## PWA Architecture

- **Service Worker** - Asset caching and offline functionality via Workbox
- **Web App Manifest** - Installation metadata and appearance settings
- **React Integration** - Custom hooks for service worker registration
- **UI Components** - Install prompts and update notifications
