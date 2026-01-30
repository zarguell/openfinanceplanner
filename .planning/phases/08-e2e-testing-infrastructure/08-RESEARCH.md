# Phase 8: E2E Testing Infrastructure - Research

**Project:** Open Finance Planner
**Phase:** 8 - E2E Testing Infrastructure
**Researched:** 2026-01-21
**Confidence:** HIGH

## Executive Summary

Phase 8 needs to establish the foundation for browser-based end-to-end testing using Vitest Browser Mode with Playwright provider. This builds on the existing Vitest unit test infrastructure (308 tests) while adding browser automation capabilities to validate critical user workflows that current tests cannot verify.

## Key Findings from Prior Research

### Recommended Stack (from research/SUMMARY.md)

- **Vitest Browser Mode (@vitest/browser-playwright)** — Unified test runner leveraging existing Vitest infrastructure
- **Playwright (@playwright/test)** — Browser automation provider with auto-waiting and parallel execution
- **Chromium only** — Focused browser testing strategy (per CONTEXT.md decision)

### Architecture Approach (from research/SUMMARY.md)

- **Page Object Models** — Encapsulate page logic in reusable classes
- **Fixtures** — Custom test setup with `test.extend()` for authenticated state
- **Test Data Builders** — Builder pattern for test data creation
- **E2E Test Organization** — `tests/e2e/` directory structure

### Critical Pitfalls to Avoid (from research/SUMMARY.md)

1. **Testing Implementation Details** — Use user-facing selectors (`getByRole()`, `getByLabelText()`) over CSS classes
2. **Race Conditions and Flaky Tests** — Use auto-waiting assertions, not hardcoded waits
3. **Test Interdependence** — Reset state in `beforeEach`, ensure test independence
4. **Over-Mocking** — Test real integrations, not fake data
5. **Poor Selector Strategies** — Hierarchy: `data-testid` → ARIA roles → text content → CSS classes

## Phase-Specific Considerations

### Browser Coverage Strategy (from 08-CONTEXT.md)

- Use Chromium only (not Firefox or WebKit) — reduces complexity and test execution time
- Skip multi-browser testing for now — can add later if cross-browser issues arise

### Smoke Test Scope (from 08-CONTEXT.md)

- Basic plan validation only: create a plan via browser automation, verify it exists in the plan list
- Not comprehensive workflow testing — that comes in Phase 10
- Goal: Prove infrastructure works end-to-end, not validate all user paths

### Test Isolation Approach (from 08-CONTEXT.md)

- Clean slate each test run: no leftover data between tests
- Mock localStorage: tests should not depend on browser's actual localStorage state
- Each smoke test run is independent — can run multiple times without manual cleanup

### CI/CD Integration (from 08-CONTEXT.md)

- Configure E2E tests to run in GitHub Actions from day one
- Ensure GitHub Actions workflow can run Playwright tests successfully

## Implementation Path

### 1. Install Dependencies

- `@vitest/browser-playwright` - Vitest Browser Mode with Playwright provider
- `playwright` - Playwright automation library
- Playwright browsers will be installed automatically

### 2. Configure Vitest for Browser Testing

- Update `vitest.config.js` to include browser project configuration
- Configure E2E test environment (browser, headless mode, etc.)
- Set up test file patterns for E2E tests

### 3. Create Test Scripts (from 08-CONTEXT.md)

- `test:e2e` - Run E2E tests in headless mode
- `test:e2e:ui` - Launch interactive test debugging UI
- `test:e2e:debug` - Run tests in debug mode with browser visible

### 4. Create Basic Smoke Test

- Simple test that creates a plan via browser automation
- Verifies the plan exists in the plan list
- Demonstrates the full pipeline: browser → app → localStorage → verification

### 5. Set Up GitHub Actions Workflow

- Configure workflow to run E2E tests on pull requests and pushes to main
- Ensure Playwright browsers install correctly in CI environment
- Set up proper headless mode configuration

## Technical Considerations

### ES6 Module Compatibility

The application uses vanilla JavaScript ES6 modules with no build process. Vitest Browser Mode and Playwright both support this setup without requiring additional configuration.

### localStorage Integration

Tests will need to interact with localStorage to verify data persistence. The application's StorageManager handles localStorage operations, so tests should validate that data created through the UI is properly stored.

### Chart.js Testing

While visualization testing is a focus for later phases, the smoke test should minimally verify that charts render (not necessarily their content).

## Risks and Mitigations

### Risk: Browser Installation in CI

Playwright browsers need to be installed in CI environments. This can be handled by using Playwright's GitHub Action which automatically installs browsers.

### Risk: Flaky Tests Due to Timing

Use Playwright's auto-waiting capabilities and Vitest's assertion retry mechanism to avoid timing issues.

### Risk: Test Data Contamination

Use clean localStorage state for each test and ensure proper test isolation.

## Sources

- Vitest Browser Mode Documentation: https://vitest.dev/guide/browser/
- Playwright Documentation: https://playwright.dev/docs/intro
- Research/SUMMARY.md (E2E Testing Implementation Research Summary)
- .planning/phases/08-e2e-testing-infrastructure/08-CONTEXT.md
