# ROADMAP: v1.1 — Fix It, Trust It, Visualize It

**Defined:** 2026-01-20
**Starting Phase:** 7
**Depth:** Standard (from config.json)
**Coverage:** 25/25 v1 requirements mapped ✓

## Overview

v1.1 delivers a trustworthy financial planning tool through three pillars: fix blocking bugs preventing users from using the app, add comprehensive E2E testing to validate critical workflows, and implement visualizations that help users see their financial future at a glance. The milestone balances urgent fixes (broken imports, console errors) with long-term trust investments (E2E infrastructure, retirement readiness report) and user value (balance projection charts, interactive tooltips).

## Phases

### Phase 7: Critical Bug Fixes

**Goal:** Users can use the application without errors blocking workflows

**Dependencies:** None (urgent fixes first)

**Requirements:**

- BUGFIX-01: Fix broken imports in ProjectionController (getSuccessProbabilityWithConfidence doesn't exist)
- BUGFIX-02: Fix global `app` object initialization (HTML onclick handlers fail)
- BUGFIX-03: Fix all console errors visible in Chrome DevTools
- BUGFIX-04: Verify all user workflows work end-to-end (create plan, add account, run projection)

**Success Criteria:**

1. User can create a plan and see it in the plan list without console errors
2. User can add an account and verify it appears in the UI
3. User can run a projection and see results table render successfully
4. Chrome DevTools console shows zero errors during typical user workflow
5. All onclick handlers in HTML function without "app is not defined" errors

**Plans:** 3 plans in 3 waves

Plans:

- [x] 07-01-PLAN.md — Restore Monte Carlo implementation from git history (BUGFIX-01) ✓
- [x] 07-02-PLAN.md — Verify app initialization and clear console errors (BUGFIX-02, BUGFIX-03) ✓
- [x] 07-03-PLAN.md — End-to-end workflow verification (BUGFIX-04) ✓

**Status:** Phase 7 complete ✓
**Progress:** 4/4 requirements complete (100%)

---

### Phase 8: E2E Testing Infrastructure

**Goal:** E2E test environment runs in browser with one smoke test passing

**Dependencies:** Phase 7 (application must work before testing it)

**Requirements:**

- E2E-01: Install Vitest Browser Mode with Playwright provider
- E2E-02: Configure E2E test environment (vitest.config.js, playwright config)
- E2E-06: Add test scripts (test:e2e, test:e2e:ui, test:e2e:debug)

**Success Criteria:**

1. Developer can run `npm run test:e2e` and see one smoke test pass in browser
2. Vitest config includes E2E project with Playwright provider configured
3. Playwright browsers installed (chromium, firefox, webkit)
4. Smoke test creates a plan via browser automation and verifies it exists
5. `npm run test:e2e:ui` launches interactive test debugging UI

**Plans:** 3 plans in 3 waves

Plans:

- [x] 08-01-PLAN.md — Install and configure Vitest Browser Mode with Playwright (E2E-01, E2E-02) ✓
- [x] 08-02-PLAN.md — Create E2E test scripts and smoke test (E2E-06) ✓
- [x] 08-03-PLAN.md — Configure CI workflow and verify infrastructure ✓

**Status:** Phase 8 complete ✓
**Progress:** 3/3 requirements complete (100%)
**Completed:** 2026-02-03

---

### Phase 9: E2E Test Foundation (Page Objects & Fixtures)

**Goal:** Reusable E2E testing abstractions enable rapid test authoring

**Dependencies:** Phase 8 (infrastructure must exist before building abstractions)

**Requirements:**

- E2E-03: Create Page Object Model classes (AppPage, PlanPage, AccountPage, ProjectionPage)
- E2E-04: Create test fixtures and data builders (PlanBuilder, AccountBuilder)

**Success Criteria:**

1. Developer can write test using `AppPage` class to navigate and create plans
2. Custom fixture `authenticatedPage` creates test plan before each test
3. `PlanBuilder` provides fluent API for test data creation (e.g., `PlanBuilder.withName('Test').build()`)
4. Page objects use resilient selectors (data-testid, ARIA roles) not CSS classes
5. E2E test directory structure exists (tests/e2e/{fixtures,pages,scenarios})

**Progress:** 0/2 requirements complete

**Plans:** 2 plans in 2 waves

Plans:
- [ ] 09-01-PLAN.md — Create Page Object Model classes (AppPage, PlanPage, AccountPage, ProjectionPage) with resilient selectors
- [ ] 09-02-PLAN.md — Create test fixtures and data builders (PlanBuilder, AccountBuilder, StorageHelper)

---

### Phase 10: Critical User Flow E2E Tests

**Goal:** E2E tests validate core user workflows pass from UI to localStorage to calculations

**Dependencies:** Phase 9 (page objects and fixtures required for test authoring)

**Requirements:**

- E2E-05: Write E2E tests for critical user workflows (plan creation, account management, projection)
- COV-01: Add tests for monte-carlo.js (currently 0% coverage)
- COV-02: Increase storage coverage from 45% to 70%+
- COV-03: Increase UI coverage from 6.98% to 40%+ (E2E tests will help)
- COV-04: Verify all critical calculation paths have tests (tax, RMD, projections)

**Success Criteria:**

1. E2E test suite validates plan creation workflow (create, edit, delete, rename)
2. E2E test suite validates account management (add, edit, delete, type-specific validation)
3. E2E test suite validates projection calculation (run projection, verify results, check localStorage persistence)
4. Monte Carlo simulations have unit tests for key functions (runSimulation, calculateConfidenceInterval)
5. Overall test coverage increases to 65%+ from current 57.93%

**Progress:** 0/5 requirements complete

---

### Phase 11: Balance Projection Visualization

**Goal:** Users see their financial future with interactive balance projection chart

**Dependencies:** Phase 10 (E2E tests will validate chart rendering)

**Requirements:**

- VIZ-01: Create balance projection line chart (total wealth over time)
- VIZ-02: Add account-level lines to projection chart (optional breakdown by account)
- VIZ-03: Add retirement milestone marker (vertical line at retirement age)
- VIZ-04: Implement Y-axis currency formatting ($1M, $500k readable formats)
- VIZ-05: Add interactive tooltips (hover for detailed year-by-year values)
- VIZ-06: Integrate chart into results section (replace/add to existing table view)

**Success Criteria:**

1. User sees line chart showing total wealth trajectory from current age to life expectancy
2. User can hover over chart and see tooltip with detailed values for specific year
3. Chart displays vertical line at retirement age with label ("Retirement at age 65")
4. Y-axis shows readable currency formats ($1M, $500k, not $1,000,000)
5. User can toggle account-level breakdown lines on/off via legend
6. Chart renders in results section alongside existing year-by-year table
7. E2E tests validate chart renders correctly and displays data

**Progress:** 0/6 requirements complete

---

### Phase 12: Retirement Readiness Report

**Goal:** Users understand at a glance if they're on track for retirement

**Dependencies:** Phase 11 (balance projection provides data for readiness calculations)

**Requirements:**

- REPORT-01: Calculate retirement readiness metric (savings rate / withdrawal rate assessment)
- REPORT-02: Display "You're on track" / "You need $X more" / "You can retire at age Y"
- REPORT-03: Add visual gauge/meter for retirement readiness score
- REPORT-04: Show key metrics (current savings rate, projected withdrawal rate, gap amount)
- REPORT-05: Integrate report into dashboard/results section

**Success Criteria:**

1. User sees prominent retirement readiness message ("You're on track" or "You need $234,000 more")
2. Visual gauge/meter displays readiness score (0-100% with color coding: red/yellow/green)
3. Key metrics section shows current savings rate (e.g., "15% of income"), projected withdrawal rate (e.g., "3.8%"), and gap amount
4. If user has shortfall, report suggests retirement age adjustment (e.g., "Retire at age 67 to close gap")
5. Report appears at top of results section, above balance projection chart
6. E2E tests validate report displays correct values based on plan data

**Progress:** 0/5 requirements complete

---

## Progress Summary

| Phase     | Name                             | Requirements | Complete | Progress |
| --------- | -------------------------------- | ------------ | -------- | -------- |
| 7         | Critical Bug Fixes               | 4            | 4        | 100%     |
| 8         | E2E Testing Infrastructure       | 3            | 3        | 100%     |
| 9         | E2E Test Foundation              | 2            | 0        | 0%       |
| 10        | Critical User Flow E2E Tests     | 5            | 0        | 0%       |
| 11        | Balance Projection Visualization | 6            | 0        | 0%       |
| 12        | Retirement Readiness Report      | 5            | 0        | 0%       |
| **Total** | **6 phases**                     | **25**       | **7**    | **28%**  |

## Coverage Validation

**v1.1 Requirements:** 25 total
**Mapped to Phases:** 25 ✓
**Unmapped:** 0
**Duplicates:** 0

All requirements assigned to exactly one phase. No orphaned requirements.

## Traceability

See REQUIREMENTS.md traceability section for requirement-to-phase mapping.

---

_Roadmap created: 2026-01-20_
