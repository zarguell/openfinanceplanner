# Open Finance Planner

## What This Is

Open Finance Planner is a client-side financial planning application that runs entirely in the browser with zero external dependencies. The application features modular architecture with layered design, domain-driven patterns, and comprehensive financial calculations (tax, projections, Monte Carlo simulations). A maintainability overhaul in v1.0 addressed technical debt through code splitting, configuration centralization, and modern tooling adoption.

## Core Value

Make the codebase maintainable for long-term evolution - split monolithic files, centralize configuration, and add quality tooling without breaking existing functionality.

## Current Milestone: v1.1 — Fix It, Trust It, Visualize It

**Goal:** Fix blocking bugs preventing users from using the app, add comprehensive E2E testing to validate critical workflows, and implement visualizations (balance projection charts, retirement readiness report) so users can trust calculations and see their financial future at a glance.

**Target features:**

- Fix console errors and broken imports (ProjectionController, app object)
- E2E testing infrastructure (Vitest Browser Mode + Playwright)
- Page Object Model and test fixtures
- Critical user flow tests (plan creation, accounts, projections)
- Balance projection line chart (wealth trajectory, retirement milestone, interactive tooltips)
- Retirement readiness report (gauge/meter, "on track" / "need more" assessment)
- Increased test coverage (monte-carlo.js 0% → 70%, storage 45% → 70%)

## Current State

**Version:** v1.0 (Shipped 2026-01-19)

**Codebase:**

- 14,258 lines of JavaScript across modular architecture
- 27 test files, 308 tests passing, 57.93% coverage
- 0 ESLint errors (224 resolved during v1.0)
- ES6 modules with zero-build process

**Architecture:**

- Tax calculations: Modular (federal.js, states.js, config/)
- UI controllers: 5 focused controllers (App, Plan, Account, ExpenseIncome, Projection)
- Configuration: Centralized (limits.json, ages.json, defaults.json)
- Testing: Vitest with GitHub Actions CI

**Tooling:**

- ESLint 9.x with flat config
- Prettier for code formatting
- Vitest v4.0.17 with coverage reporting
- Chart.js via CDN

## Current Milestone: v1.1 — Fix It, Trust It, Visualize It

**Goal:** Fix blocking bugs preventing users from using the app, add comprehensive E2E testing to validate critical workflows, and implement visualizations (balance projection charts, retirement readiness report) so users can trust calculations and see their financial future at a glance.

**Target features:**

- Fix console errors and broken imports (ProjectionController, app object)
- E2E testing infrastructure (Vitest Browser Mode + Playwright)
- Page Object Model and test fixtures
- Critical user flow tests (plan creation, accounts, projections)
- Balance projection line chart (wealth trajectory, retirement milestone, interactive tooltips)
- Retirement readiness report (gauge/meter, "on track" / "need more" assessment)
- Increased test coverage (monte-carlo.js 0% → 70%, storage 45% → 70%)

## Requirements

### Validated (v1.0 Complete)

**Original Features:**

- ✓ Multi-account financial projections (401k, IRA, Roth IRA, HSA, Taxable) — existing
- ✓ Expense modeling with inflation adjustment — existing
- ✓ Customizable growth rates (equities, bonds) — existing
- ✓ Client-side localStorage with schema versioning — existing
- ✓ Import/export JSON for portability — existing
- ✓ Dark mode support — existing
- ✓ Comprehensive tax calculations (federal + all 50 states) — existing
- ✓ Year-by-year projection engine — existing
- ✓ Rule engine for financial strategies — existing
- ✓ Chart.js data visualization — existing

**Maintainability Improvements:**

- ✓ Split monolithic files into focused modules — v1.0
- ✓ Extract hardcoded values to centralized configuration — v1.0
- ✓ Add ESLint for code quality enforcement — v1.0
- ✓ Add Prettier for consistent formatting — v1.0
- ✓ Add Vitest testing framework — v1.0
- ✓ Migrate existing custom tests to Vitest — v1.0
- ✓ Maintain backward compatibility with localStorage schema — v1.0

### Out of Scope

- Rewrite with modern UI framework (React/Vue) — Keep vanilla JS for now
- Full 100% test coverage — Focus on critical paths, not metrics
- Performance optimization — Maintainability focus, not speed
- Security fixes (XSS vulnerabilities) — Deferred to future phase
- Server-side functionality — Maintain client-side only architecture
- External service integrations — Keep zero-dependency approach

## Context

Maintainability overhaul completed (Phase 1-6, 2026-01-17). Codebase is now modular, well-configured, and equipped with modern tooling (ESLint, Prettier, Vitest, CI/CD).

This is a brownfield project with an existing, well-architected codebase:

**Architectural Strengths:**

- Clean layered separation (UI → Application → Domain → Calculations → Infrastructure)
- Domain-driven design with rich models (Plan, Account, Expense, Income)
- Strategy pattern for extensible financial rules
- Pure calculation functions (side-effect-free, testable)
- Repository pattern for storage abstraction

**Current Technical Debt:**

- Monolithic files: `src/calculations/tax.js` (2,296 lines), `src/ui/AppController.js` (1,347 lines)
- 1,018+ hardcoded magic numbers scattered throughout codebase
- No formal testing framework (custom test runner with manual assertions)
- No linting or formatting tooling (manual consistency)
- Inconsistent error handling (no centralized error boundaries)
- Missing input validation in UI controllers

**Codebase Mapping:**

- Architecture, Structure, Stack, Conventions, Testing, Integrations, and Concerns are fully documented in `.planning/codebase/`

**User Goals:**
Focus on making the codebase more maintainable for long-term evolution.

## Constraints

- **Tech Stack**: Must maintain vanilla JavaScript ES2020+ with ES6 modules (no TypeScript migration yet)
- **Zero Dependencies**: Keep Chart.js as only external dependency (CDN), no npm packages
- **Browser Support**: Maintain Chrome 90+, Firefox 88+, Safari 14+ compatibility
- **No Breaking Changes**: Existing localStorage data must remain compatible (schema migration path required)
- **Architecture**: Preserve layered design and domain-driven patterns
- **Testing**: Add Vitest framework without disrupting existing test structure

## Key Decisions

| Decision                          | Rationale                                                              | Outcome    |
| --------------------------------- | ---------------------------------------------------------------------- | ---------- |
| Split files first, then tools     | Breaking monolithic files enables easier tool adoption                 | ✓ Complete |
| Extract config before refactoring | Centralizing values reduces duplicate work when splitting files        | ✓ Complete |
| Keep vanilla JS                   | Avoid framework migration complexity, focus on maintainability tooling | ✓ Good     |
| Use Vitest (not Jest)             | Simpler setup, works with ES6 modules without bundler                  | ✓ Complete |
| Defer security fixes              | Focus limited effort on maintainability priorities                     | ✓ Good     |
| Maintain localStorage schema      | No breaking data loss for existing users                               | ✓ Complete |

---

_Last updated: 2026-01-17 after Phase 6 completion_
