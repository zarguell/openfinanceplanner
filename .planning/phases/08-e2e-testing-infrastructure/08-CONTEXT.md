# Phase 8: E2E Testing Infrastructure - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up Vitest Browser Mode with Playwright provider to enable browser-based end-to-end testing. Install and configure test infrastructure so a single smoke test can run in an actual browser, validating that the application works end-to-end. The phase delivers the foundation (tools, configuration, test scripts) — actual test development comes in later phases.

</domain>

<decisions>
## Implementation Decisions

### Browser coverage strategy

- Use Chromium only (not Firefox or WebKit) — reduces complexity and test execution time
- Skip multi-browser testing for now — can add later if cross-browser issues arise
- Decision aligns with focusing on one working test environment before expanding

### Smoke test scope

- Basic plan validation only: create a plan via browser automation, verify it exists in the plan list
- Not comprehensive workflow testing — that comes in Phase 10 (Critical User Flow E2E Tests)
- Goal: Prove infrastructure works end-to-end, not validate all user paths

### Test isolation approach

- Clean slate each test run: no leftover data between tests
- Mock localStorage: tests should not depend on browser's actual localStorage state
- Each smoke test run is independent — can run multiple times without manual cleanup

### CI/CD integration considerations

- Configure E2E tests to run in GitHub Actions from day one
- Don't wait until later phases — infrastructure should support CI from the start
- Ensure GitHub Actions workflow can run Playwright tests successfully (browser installation, headless mode)

### OpenCode's Discretion

- Test script design (test:e2e, test:e2e:ui, test:e2e:debug) — use standard approaches
- Exact structure of vitest.config.js and playwright config files
- Whether to use Playwright Inspector for debugging or Vitest's browser UI
- Headless vs headed browser defaults for different scripts
- How to organize test files within tests/e2e/ directory

</decisions>

<specifics>
## Specific Ideas

- "Chromium only is fine — Chrome is what most users have"
- "Smoke test should prove the whole pipeline works: browser → app → localStorage → verification"
- "GitHub Actions should run these tests so we catch regressions early"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 08-e2e-testing-infrastructure_
_Context gathered: 2026-01-21_
