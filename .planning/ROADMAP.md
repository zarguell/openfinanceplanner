# Roadmap: Open Finance Planner

## Overview

This roadmap delivers v0.1.0 Initial Beta - a high-performance MVP retirement projection application. The journey begins with architectural foundation and test infrastructure, then builds the core financial engine in isolation (TDD approach), layers on state management with persistence, constructs a responsive mobile-first UI, adds interactive visualizations, and culminates in a full offline-first PWA experience. Each phase delivers complete, verifiable capabilities following the Clean Engine Pattern.

## Milestones

- 🚧 **v0.1.0 Initial Beta** - Phases 13-18 (in progress)

## Phases

**Phase Numbering:**

- Integer phases (13, 14, 15): Planned milestone work
- Decimal phases (13.1, 13.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 13: Architecture & Testing Foundation** - Project scaffold with Vite, TypeScript strict mode, and test infrastructure
- [x] **Phase 14: Core Financial Engine** - Pure TypeScript calculator with comprehensive unit tests
- [x] **Phase 15: State Management & Persistence** - Zustand store with IndexedDB and JSON export/import
- [ ] **Phase 16: UI Framework & Components** - Mantine integration with responsive mobile-first patterns
- [ ] **Phase 17: Data Visualization** - Recharts integration with interactive charts and tables
- [ ] **Phase 18: PWA & Offline Capability** - Full PWA features with service worker and install prompts

## Phase Details

### ✓ Phase 13: Architecture & Testing Foundation

**Milestone:** v0.1.0 Initial Beta
**Completed:** 2026-02-08

**Goal**: Project scaffolding with build tooling, TypeScript strict configuration, and test infrastructure ready for TDD workflow

**Depends on**: Nothing (first phase of TypeScript rewrite)

**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, TEST-01, TEST-02, TEST-06, TEST-07

**Success Criteria** (what must be TRUE):

1. `npm run dev` starts development server and `npm run build` completes without errors
2. TypeScript compiler enforces strict mode (no implicit any, type checking enabled)
3. Vitest runs tests with coverage reporting and test utilities are available
4. Folder structure separates `src/core` (future engine) from UI components
5. Path aliases work (imports like `@/core/types` resolve correctly)

**Plans**: 5 plans

Plans:

- [x] 13-01: Initialize Vite + React + TypeScript project with strict mode
- [x] 13-02: Configure ESLint flat config with TypeScript, React support, and Prettier integration
- [x] 13-03: Set up Vitest with jsdom environment, test utilities, and global test APIs
- [x] 13-04: Configure path aliases and create Clean Engine Pattern folder structure
- [x] 13-05: Add test scripts, create example test, and verify coverage reporting

### ✓ Phase 14: Core Financial Engine

**Milestone:** v0.1.0 Initial Beta
**Completed:** 2026-02-08

**Goal**: Pure TypeScript projection calculator completely decoupled from React, with comprehensive unit tests validating all logic

**Depends on**: Phase 13

**Requirements**: ENGINE-01, ENGINE-02, ENGINE-03, ENGINE-04, ENGINE-05, ENGINE-06, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07

**Success Criteria** (what must be TRUE):

1. `calculateProjection` function takes UserProfile and returns year-by-year SimulationResult array
2. Engine functions have zero React imports (pure TypeScript, testable in isolation)
3. All engine functions have comprehensive unit tests covering edge cases (invalid inputs, boundary conditions)
4. Tests demonstrate TDD workflow: failing tests written first, then implementation
5. Git history shows atomic commits (each logical change separated)

**Plans**: 3 plans

Plans:

- [x] 14-01: Define TypeScript types (UserProfile, SimulationResult) in `src/core/types`
- [x] 14-02: Implement `calculateProjection` pure function with year-by-year logic
- [x] 14-03: Write comprehensive unit tests covering edge cases and error conditions

### ✓ Phase 15: State Management & Persistence

**Milestone:** v0.1.0 Initial Beta
**Completed:** 2026-02-08

**Goal**: Zustand store with IndexedDB persistence, JSON export/import, and automatic hydration on app load

**Depends on**: Phase 14

**Requirements**: STATE-01, STATE-02, STATE-03, STATE-04, STATE-05, STATE-06, TEST-06, TEST-07

**Success Criteria** (what must be TRUE):

1. Zustand store holds application state (user profile, projection results)
2. State persists to IndexedDB and automatically hydrates on page load
3. User can export their data as JSON file via download button
4. User can import previously exported JSON file to restore state
5. Store can handle large datasets (multiple scenarios) without hitting storage limits

**Plans**: 3 plans

Plans:

- [x] 15-01: Install Zustand and create store structure with slice pattern
- [x] 15-02: Configure IndexedDB persistence middleware with automatic hydration
- [x] 15-03: Implement JSON export/import utilities and comprehensive tests
5. Store can handle large datasets (multiple scenarios) without hitting storage limits

**Plans**: 3 plans

Plans:

- [ ] 15-01-PLAN.md — Install Zustand and create store structure with slice pattern
- [ ] 15-02-PLAN.md — Configure IndexedDB persistence middleware with automatic hydration
- [ ] 15-03-PLAN.md — Implement JSON export/import utilities and comprehensive tests

### Phase 16: UI Framework & Components

**Milestone:** v0.1.0 Initial Beta

**Goal**: Responsive Mantine UI with mobile-first patterns, proper numeric inputs, and accessible form validation

**Depends on**: Phase 15

**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, TEST-06, TEST-07

**Success Criteria** (what must be TRUE):

1. Mantine components render correctly with theme and responsive layout
2. Numeric inputs trigger mobile number keyboard (inputMode="numeric") and display formatted values
3. Form validation shows clear error messages for invalid inputs
4. Tables display as cards on mobile (< 768px) and standard rows on desktop
5. All components meet Mantine's accessibility standards (keyboard navigation, screen readers)

**Plans**: 3 plans

Plans:

- [ ] 16-01: Integrate Mantine (Core + Hooks + Dates) with theme provider and responsive layout
- [ ] 16-02: Build input form with numeric fields, validation, and mobile keyboard triggers
- [ ] 16-03: Implement responsive table pattern (card view on mobile, table view on desktop)

### Phase 17: Data Visualization

**Milestone:** v0.1.0 Initial Beta

**Goal**: Interactive Recharts visualizations synchronized with state, showing net worth projection and year-by-year data

**Depends on**: Phase 16

**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, TEST-06, TEST-07

**Success Criteria** (what must be TRUE):

1. Line/area chart displays net worth projection over time with ResponsiveContainer
2. Chart interactions (tooltips, zoom) work smoothly on touch devices
3. Data table shows year-by-year values (age, savings, growth, spending, balance)
4. Chart and table update automatically when state changes
5. Visualizations remain readable on mobile screens (responsive sizing, legible text)

**Plans**: 3 plans

Plans:

- [ ] 17-01: Integrate Recharts with ResponsiveContainer for mobile adaptation
- [ ] 17-02: Build net worth projection line/area chart with tooltips
- [ ] 17-03: Create year-by-year data table synchronized with chart

### Phase 18: PWA & Offline Capability

**Milestone:** v0.1.0 Initial Beta

**Goal**: Full PWA experience with service worker, install prompts, offline operation, and graceful update handling

**Depends on**: Phase 17

**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06, TEST-06, TEST-07

**Success Criteria** (what must be TRUE):

1. `vite-plugin-pwa` generates service worker and registers it in the app
2. PWA manifest includes app name, icons, theme color, and display settings
3. User can install app on supported devices (install prompt appears)
4. App loads and functions 100% offline after first visit (service worker caches assets)
5. User is notified when new version is available and can update without losing data

**Plans**: 3 plans

Plans:

- [ ] 18-01: Configure vite-plugin-pwa with manifest and service worker settings
- [ ] 18-02: Implement service worker registration and offline asset caching
- [ ] 18-03: Add install prompt handling and update notification workflow

## Progress

**Execution Order:**
Phases execute in numeric order: 13 → 14 → 15 → 16 → 17 → 18

| Phase                                 | Milestone | Plans Complete | Status      | Completed    |
| ------------------------------------- | --------- | -------------- | ----------- | ------------ |
| 13. Architecture & Testing Foundation | v0.1.0    | 5/5            | ✓ Complete  | 2026-02-08   |
| 14. Core Financial Engine             | v0.1.0    | 3/3            | ✓ Complete  | 2026-02-08   |
| 15. State Management & Persistence    | v0.1.0    | 3/3            | ✓ Complete  | 2026-02-08   |
| 16. UI Framework & Components         | v0.1.0    | 0/3            | Not started | -            |
| 17. Data Visualization                | v0.1.0    | 0/3            | Not started | -            |
| 18. PWA & Offline Capability          | v0.1.0    | 0/3            | Not started | -            |

**Overall Progress:** 11/20 plans complete (55%)
