# Open Finance Planner

## What This Is

An open-source, static, offline-first retirement projection application (similar to ProjectionLab). Built as a progressive web app that runs entirely in the browser, with zero backend dependencies. Users can model their financial life, run deterministic and Monte Carlo simulations, and visualize outcomes through rich interactive charts—all while keeping their data private and local.

## Core Value

**Privacy-first financial clarity.** Users own their data, get accurate projections, and can plan their financial future without creating accounts or linking real bank accounts.

## Requirements

### Validated

(None yet — this is a TypeScript rewrite; validated requirements will emerge from user testing)

### Active

**v0.1.0 Initial Beta - High-Performance MVP:**

- [ ] **Core Engine Pattern**: Pure TypeScript math in `src/core`, decoupled from React components, unit-testable in isolation
- [ ] **Tech Stack Implementation**: React + Vite + TypeScript (strict), Zustand for state, IndexedDB persistence (idb-keyval)
- [ ] **UI Framework**: Mantine (Core + Hooks + Dates) for responsive, accessible components
- [ ] **Charting**: Recharts with `ResponsiveContainer` for mobile-first visualizations
- [ ] **PWA Capability**: Offline-first with `vite-plugin-pwa`, installable on mobile devices
- [ ] **Data Strategy**: Zustand store with IndexedDB middleware, JSON export/import for backup
- [ ] **Mobile Experience**: Responsive tables (card view on mobile), numeric masking, proper mobile keyboard triggers
- [ ] **Core Calculator**: Age-based projection engine (savings, growth rate, spending → year-by-year results)

### Out of Scope

- **Account aggregation** — No bank connections, users input abstractions of their finances (privacy-first design)
- **Backend/Auth** — Runs entirely client-side, no user accounts or cloud sync in v0.1.0
- **Advanced tax modeling** — Start with basic tax calculations, multi-jurisdiction support in later versions
- **Monte Carlo simulations** — v0.1.0 focuses on deterministic projections; stochastic analysis planned for v0.2.0
- **Advisor/Pro features** — Single-user individual planner only in initial release

## Context

**Technical Context:**
- TypeScript rewrite of previous JavaScript implementation
- Research completed: ProjectionLab feature analysis documented in RESEARCH.md
- Draft phases outlined in DRAFT_PHASES.md (comprehensive feature roadmap)
- Phase 12 (retirement readiness report) verification exists from previous implementation

**Architectural Decisions:**
- **Clean Architecture / Engine Pattern**: Math logic (`src/core`) isolated from UI layer
- **State Management**: Zustand chosen for simplicity and performance
- **Persistence**: IndexedDB via `idb-keyval` to handle large datasets (multiple scenarios, simulations)
- **Deployment**: Static hosting (GitHub Pages/Netlify) — zero server costs
- **Mobile-First**: PWA with offline capability, responsive patterns throughout

**Domain Complexity:**
- Financial projections require accurate tax modeling, account-type rules, withdrawal logic
- Multi-decade simulations with yearly (potentially monthly) resolution
- Rich visualizations (net worth, cash flow, taxes, Sankey diagrams)
- Scenario comparison and what-if analysis

## Constraints

- **Technology**: Must use specified stack (React, Vite, TypeScript, Zustand, Mantine, Recharts) — no substitutions
- **Performance**: Handle multi-decade simulations quickly; incremental recomputation on changes
- **Privacy**: No external API calls for financial data; all computation local
- **Deployment**: Must be static-site deployable (no server-side rendering, no build-time server requirements)
- **Data**: No forced cloud sync; localStorage-only option in addition to IndexedDB
- **Mobile**: Must work offline and be installable as PWA on mobile devices

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TypeScript strict mode | Catch errors at compile time, better IDE support | ✓ Good |
| Zustand over Redux | Simpler API, less boilerplate, better performance | — Pending |
| IndexedDB over localStorage | Handle larger datasets (multiple scenarios, simulations) | — Pending |
| Pure functions in `src/core` | Testability, reusability, clear separation of concerns | — Pending |
| Recharts over D3.js | Easier React integration, sufficient for financial charts | — Pending |
| Mantine UI library | Comprehensive component library, accessible, themeable | — Pending |

---
*Last updated: 2025-02-08 after Initial Beta milestone planning*
