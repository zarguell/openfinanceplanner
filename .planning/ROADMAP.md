# Roadmap: OFP Maintainability Overhaul

## Overview

Transform the codebase from monolithic files and manual processes into a maintainable, well-structured codebase with modern tooling. The journey starts by establishing quality tooling (ESLint, Prettier, Vitest), then systematically breaks down monolithic files (tax.js, AppController.js), centralizes configuration, and migrates tests. Each phase preserves backward compatibility and architectural strengths.

## Domain Expertise

None

## Phases

- [x] **Phase 1: Quality Tooling Foundation** - Add ESLint, Prettier, Vitest ✅
- [x] **Phase 2: Tax Module Refactor** - Break down 2,300-line tax.js ✅
- [x] **Phase 3: UI Controller Refactor** - Break down 1,444-line AppController.js ✅ (2026-01-15)
- [ ] **Phase 4: Configuration Centralization** - Extract 1,018+ magic numbers
- [ ] **Phase 5: Test Migration** - Migrate custom tests to Vitest
- [ ] **Phase 6: Validation & Polish** - Verify functionality, fix issues

## Phase Details

### Phase 1: Quality Tooling Foundation

**Goal**: Establish modern development tooling for code quality and testing

**Depends on**: Nothing (first phase)

**Research**: Unlikely (standard tooling setup with established patterns)

**Plans**: 3 plans

Plans:

- [x] 01-01: Install and configure ESLint ✅
- [x] 01-02: Install and configure Prettier ✅
- [x] 01-03: Install and configure Vitest ✅

### Phase 2: Tax Module Refactor

**Goal**: Split 2,296-line tax.js into focused modules by domain

**Depends on**: Phase 1 (quality tooling in place)

**Research**: Unlikely (internal refactoring, patterns exist in codebase)

**Plans**: 4 plans

Plans:

- [x] 02-01: Extract federal tax calculations to separate module ✅
- [x] 02-02: Extract state tax calculations by region ✅
- [x] 02-03: Extract tax bracket data to JSON config ✅
- [x] 02-04: Final validation and test verification ✅

### Phase 3: UI Controller Refactor

**Goal**: Split 1,347-line AppController.js into focused components

**Depends on**: Phase 2 (tax refactor complete, patterns established)

**Research**: Unlikely (internal refactoring following established conventions)

**Plans**: 4 plans

Plans:

- [x] 03-01: Extract plan management logic to PlanController ✅
- [x] 03-02: Extract account management to AccountController ✅
- [x] 03-03: Extract expense and income management to ExpenseIncomeController ✅
- [x] 03-04: Refactor main AppController as coordinator (final coordinator pattern) ✅

### Phase 4: Configuration Centralization

**Goal**: Extract 1,018+ hardcoded magic numbers to centralized config

**Depends on**: Phase 2 & 3 (refactored modules make extraction easier)

**Research**: Unlikely (config extraction is straightforward refactoring)

**Plans**: 4 plans

Plans:

- [ ] 04-01: Extract tax bracket constants to config/tax-brackets.json
- [ ] 04-02: Extract contribution limits to config/limits.json
- [ ] 04-03: Extract default rates to config/defaults.json
- [ ] 04-04: Create config loader module and update imports

### Phase 5: Test Migration

**Goal**: Migrate custom test runner to Vitest framework

**Depends on**: Phase 1 (Vitest installed), Phase 2-4 (refactored code easier to test)

**Research**: Likely (Vitest migration patterns, ES6 module testing)

**Research topics**: Vitest configuration for ES6 modules without bundler, migration patterns from custom assertions

**Plans**: 3 plans

Plans:

- [ ] 05-01: Migrate unit tests to Vitest format
- [ ] 05-02: Migrate integration tests to Vitest
- [ ] 05-03: Add coverage reporting and CI hooks

### Phase 6: Validation & Polish

**Goal**: Verify all functionality works and fix issues

**Depends on**: Phase 5 (all refactoring and migration complete)

**Research**: Unlikely (verification and bug fixes using established patterns)

**Plans**: 3 plans

Plans:

- [ ] 06-01: Run full test suite and fix failures
- [ ] 06-02: Manual testing of UI workflows
- [ ] 06-03: Update documentation and clean up

## Progress

| Phase                           | Plans Complete | Status      | Completed     |
| ------------------------------- | -------------- | ----------- | ------------- |
| 1. Quality Tooling Foundation   | 3/3            | Complete    | ✅            |
| 2. Tax Module Refactor          | 4/4            | Complete    | ✅            |
| 3. UI Controller Refactor       | 4/4            | Complete    | ✅ 2026-01-15 |
| 4. Configuration Centralization | 0/4            | Not started | -             |
| 5. Test Migration               | 0/3            | Not started | -             |
| 6. Validation & Polish          | 0/3            | Not started | -             |
