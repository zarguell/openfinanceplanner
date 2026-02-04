---
phase: 09-e2e-test-foundation
plan: 01
subsystem: testing
tags: [playwright, page-object-model, e2e-testing, data-testid]

# Dependency graph
requires:
  - phase: 08-e2e-testing-infrastructure
    provides: Playwright test runner, smoke test, AppPage foundation
provides:
  - Page Object Model classes for Plan, Account, and Projection CRUD operations
  - Comprehensive data-testid attributes on all UI elements for reliable test selectors
  - Reusable test abstractions to eliminate duplication in E2E tests
affects: [10-e2e-tests, 11-visualizations, 12-retirement-report]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Page Object Model pattern for E2E test maintainability
    - data-testid attribute strategy for resilient selectors
    - ARIA role selectors as fallback for interactive elements

key-files:
  created:
    - tests/e2e/pages/PlanPage.js
    - tests/e2e/pages/AccountPage.js
    - tests/e2e/pages/ProjectionPage.js
  modified:
    - index.html
    - src/ui/AccountController.js
    - src/ui/PlanController.js
    - src/ui/ProjectionController.js
    - tests/e2e/pages/AppPage.js

key-decisions:
  - "All page objects use data-testid and ARIA role selectors exclusively - no CSS classes that may change with styling updates"
  - "Page objects encapsulate all UI interactions - tests use methods like createPlan() instead of directly clicking buttons"
  - "Account and Projection operations documented as requiring plan selection first - clear dependency model"

patterns-established:
  - "Pattern: Page Object Model - each major UI section has dedicated class with methods for all interactions"
  - "Pattern: Resilient Selectors - data-testid attributes added before creating page objects to enable stable selectors"
  - "Pattern: Atomic Commits - each task committed individually for clear history and easy rollback"

# Metrics
duration: 5min
completed: 2026-02-04
---

# Phase 09 Plan 01: Page Object Model Classes Summary

**Page Object Model classes (AppPage, PlanPage, AccountPage, ProjectionPage) with data-testid selectors for maintainable E2E tests**

## Performance

- **Duration:** 5 minutes (340 seconds)
- **Started:** 2026-02-04T03:48:44Z
- **Completed:** 2026-02-04T03:54:04Z
- **Tasks:** 5/5 complete
- **Files modified:** 8

## Accomplishments

- **Added 32 data-testid attributes** to all UI elements (plan modal, account forms, tabs, projection results, charts)
- **Created 3 new page object classes** (PlanPage, AccountPage, ProjectionPage) with comprehensive CRUD methods
- **Enhanced AppPage base class** with navigation methods (switchTab, selectPlan) and shared utilities (waitForModal, closeModal, clearLocalStorage)
- **Eliminated all CSS class selectors** from page objects - now use only data-testid and ARIA roles for resilience

## Task Commits

Each task was committed atomically:

1. **Task 1: Add data-testid attributes to UI elements** - `4806af7` (feat)
2. **Task 2: Enhance AppPage base class with navigation and shared methods** - `0ba5793` (feat)
3. **Task 3: Create PlanPage class with plan CRUD operations** - `8703cd7` (feat)
4. **Task 4: Create AccountPage class with account CRUD operations** - `e6b2e8f` (feat)
5. **Task 5: Create ProjectionPage class with projection and Monte Carlo operations** - `6ac39ee` (feat)
6. **Fix: Remove CSS class selectors from page objects** - `df3a481` (fix)

**Plan metadata:** (to be committed)

## Files Created/Modified

- `index.html` - Added data-testid to plan modal inputs (name, age, retirement age, create button, settings button, delete button)
- `src/ui/AccountController.js` - Added data-testid to account form inputs, account cards, and edit form inputs
- `src/ui/PlanController.js` - Added data-testid to all plan tabs (overview, assumptions, socialsecurity, income, accounts, expenses, projection)
- `src/ui/ProjectionController.js` - Added data-testid to projection results (final balance, retirement balance, monte carlo card, success probability badge, chart canvas, year-by-year table)
- `tests/e2e/pages/AppPage.js` - Enhanced with navigation methods (switchTab, selectPlan), shared utilities (waitForModal, closeModal, clearLocalStorage), and additional plan CRUD methods (openPlanSettings, deletePlan)
- `tests/e2e/pages/PlanPage.js` - New page object with 7 methods: createPlan, selectPlan, deletePlan, isPlanVisible, getPlanCount, openPlanSettings, renamePlan
- `tests/e2e/pages/AccountPage.js` - New page object with 5 methods: addAccount, getAccountCount, isAccountVisible, editAccount, deleteAccount
- `tests/e2e/pages/ProjectionPage.js` - New page object with 8 methods: runProjection, getFinalBalance, getRetirementBalance, getSuccessProbability, isMonteCarloVisible, isChartVisible, getYearCount, hasTableCell

## Decisions Made

**Selector Strategy:** All page objects use data-testid attributes and ARIA roles exclusively, avoiding CSS class selectors like `.card`, `.btn`, `.tab`, `.badge`, `.result-value` that may change with styling updates. This ensures tests remain stable when UI styling changes.

**Page Object Model:** Each major UI section (Plan, Account, Projection) has a dedicated page object class that encapsulates all interactions. Tests call semantic methods like `createPlan()` or `addAccount()` instead of directly clicking buttons, making tests more readable and maintainable.

**Dependency Documentation:** AccountPage and ProjectionPage include JSDoc comments noting that a plan must be selected first. This clear dependency model prevents test failures from incorrect operation order.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CSS class selectors in page objects**
- **Found during:** Task 5 (Verification phase)
- **Issue:** PlanPage.js used `.btn-primary` selector and AppPage.js used `.btn-outline` selector, violating requirement to use only data-testid/ARIA selectors
- **Fix:** Replaced `.btn-primary` with `getByRole('button', { name: 'Save' })` and `.btn-outline` with `getByRole('button', { name: 'Cancel' })`
- **Files modified:** tests/e2e/pages/AppPage.js, tests/e2e/pages/PlanPage.js
- **Verification:** `grep -r "\.card\|\.btn\|\.tab\|\.badge\|\.result-value" tests/e2e/pages/*.js | grep locator` returns no results
- **Committed in:** `df3a481` (separate fix commit after all tasks complete)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix necessary to meet success criteria "All selectors use data-testid or ARIA roles, NO CSS classes". No scope creep.

## Issues Encountered

None - all tasks executed smoothly as planned.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 09 Plan 02:**
- All page objects created and verified with smoke test passing
- Data-testid attributes provide stable selectors for test fixtures
- AppPage enhanced with navigation methods for test setup/teardown

**Ready for Phase 10 (E2E Tests):**
- PlanPage, AccountPage, ProjectionPage provide comprehensive CRUD coverage
- Tests can import and use these classes directly
- No CSS class dependencies ensures tests won't break with styling changes

**Blockers/Concerns:** None identified.

---
*Phase: 09-e2e-test-foundation*
*Completed: 2026-02-04*
