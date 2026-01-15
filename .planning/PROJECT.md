# OFP Maintainability Overhaul

## What This Is

Open Finance Planner is a client-side financial planning application that runs entirely in the browser with zero external dependencies. The codebase has solid architectural foundations with layered design, domain-driven patterns, and comprehensive financial calculations (tax, projections, Monte Carlo simulations). However, maintainability concerns have accumulated: monolithic files, hardcoded values, and lack of modern tooling (linting, formatting, testing frameworks). This project will address these maintainability gaps while preserving the core architectural strengths.

## Core Value

Make the codebase maintainable for long-term evolution - split monolithic files, centralize configuration, and add quality tooling without breaking existing functionality.

## Requirements

### Validated

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

### Active

- [ ] Split monolithic files into focused modules
- [ ] Extract hardcoded values to centralized configuration
- [ ] Add ESLint for code quality enforcement
- [ ] Add Prettier for consistent formatting
- [ ] Add Vitest testing framework
- [ ] Migrate existing custom tests to Vitest
- [ ] Maintain backward compatibility with localStorage schema

### Out of Scope

- Rewrite with modern UI framework (React/Vue) — Keep vanilla JS for now
- Full 100% test coverage — Focus on critical paths, not metrics
- Performance optimization — Maintainability focus, not speed
- Security fixes (XSS vulnerabilities) — Deferred to future phase
- Server-side functionality — Maintain client-side only architecture
- External service integrations — Keep zero-dependency approach

## Context

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

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Split files first, then tools | Breaking monolithic files enables easier tool adoption | — Pending |
| Extract config before refactoring | Centralizing values reduces duplicate work when splitting files | — Pending |
| Keep vanilla JS | Avoid framework migration complexity, focus on maintainability tooling | ✓ Good |
| Use Vitest (not Jest) | Simpler setup, works with ES6 modules without bundler | — Pending |
| Defer security fixes | Focus limited effort on maintainability priorities | ✓ Good |
| Maintain localStorage schema | No breaking data loss for existing users | — Pending |

---
*Last updated: 2026-01-15 after initialization*
