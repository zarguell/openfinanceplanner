# Open Finance Planner - Project Roadmap

This document outlines the detailed tasks required to implement a comprehensive financial planning application similar to ProjectionLab, based on the RESEARCH.md requirements. The implementation will leverage existing Mantine components and the current codebase structure.

## Phase 1: Enhanced Core Functionality

### Task 1.1: Expand User Profile Model ✅ COMPLETED

**Requirements:**

- Extend UserProfile type to include additional demographics (household status, location)
- Add support for multiple accounts (taxable, tax-advantaged, real assets, debts)
- Include tax region information (country, state, locality)
- Add currency preferences

**Implementation Location:**

- `src/core/types/index.ts` - Update UserProfile type
- `src/components/forms/ProfileForm.tsx` - Update form fields
- `src/store/types.ts` - Update profile slice if needed

### Task 1.2: Implement Account Management System ✅ COMPLETED

**Requirements:**

- Create Account type with tax characteristics (taxable, tax-deferred, tax-free)
- Support for different account types (401k, IRA, Roth variants, HSA, etc.)
- Real assets model (primary home, additional properties, cars, boats, precious metals)
- Liabilities model (mortgages, student loans, credit cards, other loans)
- Cost basis tracking and contribution history

**Implementation Location:**

- `src/core/types/index.ts` - Add Account, Asset, Liability types
- `src/core/accounts/` - New directory for account management logic
- `src/components/forms/` - New forms for account/asset/liability entry

### Task 1.3: Enhanced Projection Algorithm ✅ COMPLETED

**Requirements:**

- Implement more sophisticated financial projection calculations
- Add support for inflation adjustments
- Include tax-aware withdrawals and capital gains modeling
- Support for different growth assumptions per account

**Implementation Location:**

- `src/core/projection/` - Enhance existing projection logic
- `src/core/tax/` - New directory for tax calculation logic

### Task 1.4: Plan Configuration ✅ COMPLETED

**Requirements:**

- Create Plan entity with time horizon, start date, plan type ✅
- Add global assumptions (inflation, growth model, withdrawal rules) ✅
- Support for fixed-date plans vs "project from today" plans ✅

**Implementation Location:**

- `src/core/types/index.ts` - Add Plan type ✅
- `src/core/plan/` - New directory for plan management logic ✅
- `src/components/forms/PlanForm.tsx` - New form for plan configuration ✅
- `src/store/` - Add PlanSlice for state management ✅

## Phase 2: Advanced Features

### Task 2.1: Milestones and Life Events System ✅ COMPLETED

**Requirements:**

- Implement event/milestone system with flexible, typed events ✅
- Support for multi-condition milestones (decision tree nodes) ✅
- Event types: retirement date, career changes, asset purchases/sales, family changes ✅
- Integration with timeline engine ✅

**Implementation Location:**

- `src/core/types/index.ts` - Add Milestone/Event types ✅
- `src/core/milestones/` - New directory for milestone management ✅
- `src/components/forms/MilestoneForm.tsx` - Form for creating milestones ✅

### Task 2.2: Income and Expense Modeling ✅ COMPLETED

Requirements:

- Work income modeling (salaries, bonuses, part-time work) ✅
- Social Security or country-specific pensions ✅
- Business or rental income with associated expenses ✅
- Expense modeling with categories and tags ✅
- One-time and recurring non-monthly expenses ✅
- Change-over-time editor for nuanced patterns ✅

Implementation Location:

- `src/core/types/index.ts` - Add Income, Expense types ✅
- `src/core/income-expense/` - New directory for income/expense logic ✅
- `src/components/forms/IncomeForm.tsx`, `ExpenseForm.tsx` - New forms ✅

### Task 2.3: Cash Flow Priorities and Goals Engine ✅ COMPLETED

**Requirements:**

- Cash-flow priorities configuration UI ✅
- Priority ordering with drag-and-drop ✅
- Mandatory vs flexible goals ✅
- Goal status tracking with heatmap visualization ✅
- Simulation logic for priority walkthrough ✅

**Implementation Location:**

- `src/core/types/index.ts` - Add Goal, Priority types ✅
- `src/core/goals/` - New directory for goals engine ✅
- `src/components/goals/` - New directory for goals UI components ✅

### Task 2.4: Tax Engine Implementation ✅ COMPLETED

**Requirements:**

- Extensible tax config schema (jurisdictions, brackets, special rules) ✅
- Tax estimation based on location (federal, state/province, local) ✅
- Detailed tax analytics mode ✅
- Support for strategy modeling (Roth conversions, 72t/SEPP distributions) ✅

**Implementation Location:**

- `src/core/types/index.ts` - Add Tax types ✅
- `src/core/tax/` - New directory for tax engine ✅
- `src/components/tax/` - New directory for tax UI components ✅

### Task 2.5: Monte Carlo and Chance of Success ✅ COMPLETED

**Requirements:**

- Monte Carlo engine with pluggable return sequences ✅
- Chance-of-success UI with configuration panel ✅
- Percentile band charts ✅
- Historical backtesting capabilities ✅

**Implementation Location:**

- `src/core/types/index.ts` - Add MonteCarlo types ✅
- `src/core/monte-carlo/` - New directory for Monte Carlo engine ✅
- `src/components/monte-carlo/` - New directory for Monte Carlo UI ✅

### Task 2.6: Advanced Analytics and Visualization ✅ COMPLETED

**Requirements:**

- Cash flow visualization with Sankey diagrams ✅
- Net worth analysis with composition breakdown ✅
- Progress tracking with progress points ✅
- Reporting and export capabilities ✅

**Implementation Location:**

- `src/components/charts/` - Enhance existing charts, add new visualizations ✅
- `src/core/analytics/` - New directory for analytics logic ✅
- `src/components/reports/` - New directory for reports UI ✅

### Task 2.7: Scenario Management

**Requirements:**

- Multiple plans per user with cloning capability
- Compare mode for visual overlay of scenarios
- Static snapshots of plan states
- Flex Spending rules engine

**Implementation Location:**

- `src/core/scenario/` - New directory for scenario management
- `src/components/scenario/` - New directory for scenario UI components

## Technical Debt and Infrastructure Tasks

### Task T.1: State Management Enhancement

**Requirements:**

- Improve store structure to handle complex nested data
- Add proper indexing for efficient data retrieval
- Implement optimistic updates where appropriate

**Implementation Location:**

- `src/store/` - Refactor and enhance store structure

### Task T.2: Data Persistence Improvements

**Requirements:**

- Enhance IndexedDB storage with better schema management
- Add data migration capabilities
- Implement backup/restore functionality

**Implementation Location:**

- `src/store/middleware/` - Enhance persistence middleware

### Task T.3: Testing Coverage Expansion

**Requirements:**

- Add unit tests for new business logic
- Implement integration tests for complex workflows
- Add UI component tests for new features

**Implementation Location:**

- `src/**/*.test.ts` - Add new test files throughout the codebase

### Task T.4: Performance Optimization

**Requirements:**

- Implement caching for expensive calculations
- Add incremental recomputation on small changes
- Optimize chart rendering for large datasets

**Implementation Location:**

- Various components and core modules

## UI/UX Enhancement Tasks

### Task U.1: Navigation and Layout

**Requirements:**

- Implement sidebar navigation for different modules
- Create dashboard overview with key metrics
- Add responsive design improvements
- Integrate Lucide React icons for UI elements

**Implementation Location:**

- `src/App.tsx` - Update main application layout
- `src/components/layout/` - New directory for layout components

### Task U.2: Forms and Data Entry

**Requirements:**

- Create guided wizards for complex data entry
- Implement conditional form fields
- Add form validation improvements
- Use Lucide React icons for form actions and indicators

**Implementation Location:**

- `src/components/forms/` - Enhance form components

### Task U.3: Charts and Data Visualization

**Requirements:**

- Enhance existing charts with more customization options
- Add new chart types (Sankey diagrams, heatmaps)
- Implement interactive analysis features
- Use Lucide React icons for chart controls and legends

**Implementation Location:**

- `src/components/charts/` - Enhance chart components

## Implementation Priority

### High Priority (MVP)

1. Task 1.1 - Expand User Profile Model ✅ COMPLETED
2. Task 1.2 - Implement Account Management System ✅ COMPLETED
3. Task 1.3 - Enhanced Projection Algorithm ✅ COMPLETED
4. Task 1.4 - Plan Configuration ✅ COMPLETED
5. Task 2.1 - Milestones and Life Events System ✅ COMPLETED
6. Task 2.2 - Income and Expense Modeling ✅ COMPLETED

### Medium Priority

1. Task 2.2 - Income and Expense Modeling ✅ COMPLETED
2. Task 2.3 - Cash Flow Priorities and Goals Engine ✅ COMPLETED
3. Task 2.4 - Tax Engine Implementation
4. Task U.1 - Navigation and Layout
5. Task T.1 - State Management Enhancement

### Low Priority (Future Enhancements)

1. Task 2.5 - Monte Carlo and Chance of Success
2. Task 2.6 - Advanced Analytics and Visualization
3. Task 2.7 - Scenario Management
4. Task T.2 - Data Persistence Improvements
5. Task T.3 - Testing Coverage Expansion

## Dependencies and Prerequisites

1. Existing Mantine components and form handling
2. Zustand for state management
3. Recharts for data visualization
4. IndexedDB for data persistence
5. TypeScript for type safety
6. Lucide React for icons

## Success Criteria

1. Users can create comprehensive financial plans with multiple accounts
2. Projection calculations accurately reflect real-world financial scenarios
3. Tax modeling provides detailed breakdowns and strategy recommendations
4. Users can compare multiple scenarios and track progress over time
5. Application maintains high performance with large datasets
6. Data persistence works reliably across sessions
7. UI is intuitive and provides rich visual feedback
