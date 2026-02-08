# Requirements: Open Finance Planner

**Defined:** 2025-02-08
**Core Value:** Privacy-first financial clarity. Users own their data, get accurate projections, and can plan their financial future without creating accounts or linking real bank accounts.

## v1 Requirements

Requirements for v0.1.0 Initial Beta. High-performance MVP with core projection engine and responsive UI.

### Architecture & Project Setup

- [ ] **ARCH-01**: Project scaffolded with Vite + React + TypeScript (strict mode enabled)
- [ ] **ARCH-02**: Folder structure implements Clean Engine Pattern (`src/core` separate from UI)
- [ ] **ARCH-03**: TypeScript configuration uses strict mode with no implicit any
- [ ] **ARCH-04**: ESLint and Prettier configured for code quality
- [ ] **ARCH-05**: Path aliases configured (e.g., `@/core`, `@/components`)
- [ ] **ARCH-06**: Zero build-time server requirements (static hosting ready)

### Core Financial Engine

- [ ] **ENGINE-01**: `UserProfile` type defined with age, savings, growth rate, spending fields
- [ ] **ENGINE-02**: `SimulationResult` type defined for year-by-year projection outputs
- [ ] **ENGINE-03**: `calculateProjection` pure function implemented (takes UserProfile, returns SimulationResult[])
- [ ] **ENGINE-04**: Engine functions completely decoupled from React (no React imports)
- [ ] **ENGINE-05**: Year-by-year projection logic calculates balances, growth, and spending
- [ ] **ENGINE-06**: Core engine has comprehensive unit tests before React integration (TDD)

### State Management & Persistence

- [ ] **STATE-01**: Zustand store created for global state management
- [ ] **STATE-02**: IndexedDB persistence configured via `idb-keyval` middleware
- [ ] **STATE-03**: State hydrates from IndexedDB on app load
- [ ] **STATE-04**: JSON export functionality implemented (state → file download)
- [ ] **STATE-05**: JSON import functionality implemented (file upload → state restore)
- [ ] **STATE-06**: Large dataset support (multiple scenarios without hitting storage limits)

### UI Framework & Components

- [ ] **UI-01**: Mantine UI integrated (Core + Hooks + Dates packages)
- [ ] **UI-02**: Responsive layout implements mobile-first design
- [ ] **UI-03**: Numeric inputs use `inputMode="numeric"` for mobile keyboard trigger
- [ ] **UI-04**: Numeric inputs implement proper masking/formatting
- [ ] **UI-05**: Input validation and error handling on all form fields
- [ ] **UI-06**: Responsive table pattern (card view on mobile, standard rows on desktop)
- [ ] **UI-07**: Accessible components using Mantine defaults

### Data Visualization

- [ ] **VIS-01**: Recharts integrated with `ResponsiveContainer` for mobile adaptation
- [ ] **VIS-02**: Line or area chart displays net worth projection over time
- [ ] **VIS-03**: Chart interactions are touch-friendly on mobile devices
- [ ] **VIS-04**: Data table displays year-by-year projection values
- [ ] **VIS-05**: Chart and table remain synchronized with state changes

### PWA & Offline Capability

- [ ] **PWA-01**: `vite-plugin-pwa` configured in Vite build
- [ ] **PWA-02**: PWA manifest generated with app name, icons, theme color
- [ ] **PWA-03**: Service worker registered for offline capability
- [ ] **PWA-04**: App is installable on supported devices (install prompts)
- [ ] **PWA-05**: App operates 100% offline after first load
- [ ] **PWA-06**: PWA updates handled gracefully (user notified of new versions)

### Testing & Quality

- [ ] **TEST-01**: Vitest configured as test runner with coverage reporting
- [ ] **TEST-02**: Test utilities and helpers set up for consistent test patterns
- [ ] **TEST-03**: Core engine pure functions have comprehensive unit tests (TDD approach)
- [ ] **TEST-04**: Tests fail first (red), then implementation makes them pass (green)
- [ ] **TEST-05**: Tests validate edge cases and error conditions, not just happy paths
- [ ] **TEST-06**: Atomic commits maintain clean git history (each commit is logically separate)
- [ ] **TEST-07**: No code committed without tests (TDD discipline)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Financial Features

- **TAX-01**: Multi-jurisdiction tax modeling (US federal + state, international presets)
- **TAX-02**: Tax-advantaged account types (401k, IRA, Roth, HSA with withdrawal rules)
- **MC-01**: Monte Carlo simulations for stochastic projections
- **MC-02**: Historical backtesting with actual market return sequences
- **GROW-01**: Variable growth rate modeling by year or age ranges

### Scenario Management

- **SCEN-01**: Multiple plans per user with clone/compare functionality
- **SCEN-02**: What-if scenario creation and comparison
- **SCEN-03**: Scenario snapshots for point-in-time comparison

### Advanced Visualizations

- **ADV-01**: Sankey diagram for cash flow visualization
- **ADV-02**: Tax analytics views (effective brackets, marginal rates)
- **ADV-03**: Goal heatmap showing completion over time
- **ADV-04**: Net worth composition by asset type

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Account aggregation | Privacy-first design; users input abstractions, no bank connections |
| Backend/Auth | Runs entirely client-side; no user accounts or cloud sync in MVP |
| Real-time sync | Offline-first PWA; sync complexity deferred to future versions |
| Social features | Individual planning tool; advisor/social features planned for v0.3.0+ |
| Advanced tax modeling | Basic projections in MVP; multi-jurisdiction support in v0.2.0+ |
| Monte Carlo | Deterministic projections only in MVP; stochastic analysis in v0.2.0+ |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Pending |
| ARCH-02 | Phase 1 | Pending |
| ARCH-03 | Phase 1 | Pending |
| ARCH-04 | Phase 1 | Pending |
| ARCH-05 | Phase 1 | Pending |
| ARCH-06 | Phase 1 | Pending |
| ENGINE-01 | Phase 2 | Pending |
| ENGINE-02 | Phase 2 | Pending |
| ENGINE-03 | Phase 2 | Pending |
| ENGINE-04 | Phase 2 | Pending |
| ENGINE-05 | Phase 2 | Pending |
| ENGINE-06 | Phase 2 | Pending |
| STATE-01 | Phase 3 | Pending |
| STATE-02 | Phase 3 | Pending |
| STATE-03 | Phase 3 | Pending |
| STATE-04 | Phase 3 | Pending |
| STATE-05 | Phase 3 | Pending |
| STATE-06 | Phase 3 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| UI-04 | Phase 4 | Pending |
| UI-05 | Phase 4 | Pending |
| UI-06 | Phase 4 | Pending |
| UI-07 | Phase 4 | Pending |
| VIS-01 | Phase 5 | Pending |
| VIS-02 | Phase 5 | Pending |
| VIS-03 | Phase 5 | Pending |
| VIS-04 | Phase 5 | Pending |
| VIS-05 | Phase 5 | Pending |
| PWA-01 | Phase 6 | Pending |
| PWA-02 | Phase 6 | Pending |
| PWA-03 | Phase 6 | Pending |
| PWA-04 | Phase 6 | Pending |
| PWA-05 | Phase 6 | Pending |
| PWA-06 | Phase 6 | Pending |
| TEST-01 | Phase 1 | Pending |
| TEST-02 | Phase 1 | Pending |
| TEST-03 | Phase 2 | Pending |
| TEST-04 | Phase 2 | Pending |
| TEST-05 | Phase 2 | Pending |
| TEST-06 | All Phases | Pending |
| TEST-07 | All Phases | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2025-02-08*
*Last updated: 2025-02-08 after initial definition*
