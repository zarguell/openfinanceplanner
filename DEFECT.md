# DEFECT.md - E2E Quality Assurance Test Report

## Test Summary

**Date:** 2026-02-09  
**Tester:** Senior Application QC Engineer  
**Test Environment:** http://localhost:5174/ (Vite development server)  
**Browser:** Chrome DevTools  
**Test Type:** End-to-End Quality and Validation Testing

---

## CRITICAL DEFECTS

### DEF-001: Projection Calculations Return NaN Values

**Severity:** CRITICAL  
**Status:** COMPLETED ✅  
**Component:** Projection Engine

**Resolution:**
Fixed the NumericInput component to be properly controlled by the form. The component was maintaining its own local state instead of using the form's value prop, causing form values to become empty strings or invalid numbers when submitted. Added useEffect to sync display value with prop changes, ensuring proper synchronization between form state and user input.

**Description:**
After saving a valid financial profile (Age: 35, Current Savings: $50,000, Annual Spending: $40,000, Annual Growth Rate: 7%), the Year-by-Year Projection table displays "$NaN" and "$NAN" for all financial values including:

- Start Balance
- Growth
- End Balance

**Steps to Reproduce:**

1. Navigate to http://localhost:5174/
2. Fill in valid profile data:
   - Age: 35
   - Current Savings: 50000
   - Annual Spending: 40000
   - Annual Growth Rate: 7
   - Country: United States
   - State/Province: California
   - City: San Francisco
3. Click "Save Profile" button
4. Observe the Year-by-Year Projection table

**Expected Result:**
Projection calculations should display valid numerical values for each year based on the entered profile data

**Actual Result:**
All financial columns show "$NaN" or "$NAN" values across all 65 years of projection

**Impact:**
Users cannot perform any financial planning as the core calculation engine is non-functional

**Affected Files (Potential):**

- `src/core/projection/index.ts`
- `src/hooks/useProjectionCalculator.ts`
- `src/components/tables/ProjectionTable.tsx`

**Console Evidence:**
No runtime errors logged to console, suggesting the issue is in calculation logic rather than JavaScript execution

---

## HIGH SEVERITY DEFECTS

### DEF-002: Navigation Icons Non-Functional

**Severity:** HIGH  
**Status:** NEW  
**Component:** Navigation/Layout

**Description:**
The navigation icons in the header (Calculator, Trending Up, Wallet, Settings) do not respond to clicks and do not navigate to different sections of the application. This prevents users from accessing different modules and features.

**Steps to Reproduce:**

1. Navigate to http://localhost:5174/
2. Click on any navigation icon (Calculator, Trending Up, Wallet, or Settings)
3. Observe page behavior

**Expected Result:**
Clicking navigation icons should:

- Navigate to different sections/views
- Show appropriate content (Accounts, Milestones, Income/Expense, Goals, Tax, Monte Carlo, Analytics, Scenarios)
- Update URL or show visual indication of section change

**Actual Result:**
Clicking navigation icons does nothing - no navigation, no page update, no URL change

**Impact:**
Users cannot access any features beyond the basic profile form, severely limiting application functionality. According to project.md, these icons should provide access to:

- Accounts management (Wallet icon)
- Milestones and events (Calculator icon)
- Analytics and projections (Trending Up icon)
- Settings and configuration (Settings icon)

**Affected Files:**

- `src/App.tsx` (Main application layout)
- `src/components/layout/` (Navigation components)

**Relevant Project Requirements:**

- Task U.1: Implement sidebar navigation for different modules
- Task 1.2: Account Management System
- Task 2.1: Milestones and Life Events System
- Task 2.6: Advanced Analytics and Visualization

---

### DEF-003: Chart Container Has Negative Dimensions

**Severity:** HIGH  
**Status:** NEW  
**Component:** Charts/Visualization

**Description:**
The Net Worth Projection chart container has negative dimensions (-1 width, -1 height), causing Recharts to log warnings and potentially preventing proper chart rendering.

**Steps to Reproduce:**

1. Navigate to http://localhost:5174/
2. Open browser console
3. Observe console warnings

**Console Output:**

```
[warn] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width.
```

**Expected Result:**
Chart should have positive dimensions and render correctly without console warnings

**Actual Result:**
Chart container has width=-1 and height=-1, triggering console warnings

**Impact:**
Charts may not render properly or at all, preventing users from visualizing their financial projections

**Affected Files:**

- `src/components/charts/ResponsiveChartWrapper.tsx`
- `src/components/charts/NetWorthChart.tsx`
- `src/components/charts/InteractiveChartWrapper.tsx`

---

### DEF-004: Controlled/Uncontrolled Input Conflict

**Severity:** HIGH  
**Status:** NEW  
**Component:** Forms

**Description:**
Mantine input elements have both `value` and `defaultValue` props, causing React to throw errors about controlled vs uncontrolled components.

**Console Output:**

```
[error] %s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://react.dev/link/controlled-components @mantine/core/Box text (3 args)
```

**Expected Result:**
Input elements should be consistently either controlled or uncontrolled, not both

**Actual Result:**
Mantine Box components contain inputs with conflicting control props

**Impact:**

- React runtime errors pollute console
- May cause unpredictable form behavior
- Violates React best practices
- Could lead to form state issues

**Affected Files:**

- `src/components/forms/ProfileForm.tsx`
- `src/components/forms/NumericInput.tsx`
- Any other form components using Mantine inputs

---

## MEDIUM SEVERITY DEFECTS

### DEF-005: Data Persistence Not Working

**Severity:** MEDIUM  
**Status:** NEW  
**Component:** State Management/Storage

**Description:**
After saving a user profile and reloading the page, the form fields are empty and do not display the previously saved values. The application uses IndexedDB for persistence (Task T.2), but data is not being retrieved or restored properly.

**Steps to Reproduce:**

1. Navigate to http://localhost:5174/
2. Fill in profile data:
   - Age: 35
   - Current Savings: 50000
   - Annual Spending: 40000
   - Annual Growth Rate: 7
3. Click "Save Profile" button
4. Refresh/reload the page
5. Observe form fields

**Expected Result:**
Form fields should retain the previously saved values after page reload

**Actual Result:**
All form fields are empty after page reload, indicating data was not persisted or not restored

**Impact:**
Users must re-enter all data on every visit, severely degrading user experience and making the application impractical for ongoing financial planning

**Affected Files:**

- `src/store/middleware/indexeddb.ts`
- `src/store/middleware/enhanced-storage.ts`
- `src/store/index.ts`
- `src/components/forms/ProfileForm.tsx`

**Relevant Project Requirements:**

- Task T.2: Data Persistence Improvements - Enhance IndexedDB storage with better schema management and add backup/restore functionality

---

### DEF-006: Chart X-Axis Labels Incorrect

**Severity:** MEDIUM  
**Status:** NEW  
**Component:** Charts

**Description:**
The Net Worth Projection chart displays currency symbols ($) on the x-axis labels instead of year or age labels. Labels show "$0", "$1", "$2", "$3", "$4" instead of "Year 0", "Year 1", etc., or age values.

**Steps to Reproduce:**

1. Navigate to http://localhost:5174/
2. Observe the Net Worth Projection chart
3. Check x-axis labels

**Expected Result:**
X-axis should display year numbers or ages to represent the timeline (e.g., "Year 0", "Year 1", "Year 2"... or "Age 35", "Age 36", "Age 37"...)

**Actual Result:**
X-axis displays "$0", "$1", "$2", "$3", "$4", "$5" which appear to be currency-formatted values instead of timeline markers

**Impact:**
Users cannot properly interpret the chart timeline, making the visualization confusing and less useful

**Affected Files:**

- `src/components/charts/NetWorthChart.tsx`
- `src/hooks/useChartData.ts`

---

## LOW SEVERITY DEFECTS

### DEF-007: Advanced Features Not Accessible

**Severity:** LOW  
**Status:** NEW  
**Component:** Navigation/Feature Discovery

**Description:**
Multiple features listed as "COMPLETED" in project.md are not accessible or visible in the application UI. Users cannot access:

- Account Management System (401k, IRA, Roth, HSA, Real Assets, Liabilities)
- Milestones and Life Events System
- Income and Expense Modeling
- Cash Flow Priorities and Goals Engine
- Tax Engine
- Monte Carlo and Chance of Success
- Advanced Analytics (Sankey diagrams, heatmaps)
- Scenario Management

**Expected Result:**
According to project.md, these features are completed and should be accessible through navigation

**Actual Result:**
Only the basic profile form and projection table are visible. No UI elements or navigation paths exist to access the advanced features

**Impact:**
The application is missing the majority of its intended functionality, making it impossible to perform comprehensive financial planning as described in the project requirements

**Affected Modules:**

- `src/components/forms/PlanForm.tsx` (exists but not accessible)
- `src/core/milestones/` (not accessible)
- `src/core/income-expense/` (not accessible)
- `src/components/goals/` (not accessible)
- `src/components/tax/` (not accessible)
- `src/components/monte-carlo/` (not accessible)
- `src/components/scenario/` (not accessible)

---

### DEF-008: Age Validation Shows Only Minimum Constraint

**Severity:** LOW  
**Status:** NEW  
**Component:** Forms/Validation

**Description:**
When entering an invalid age (e.g., -5), the validation message only shows "Must be at least 18" but does not indicate a maximum age constraint. Financial planning applications should define reasonable upper bounds (e.g., 100 or 120).

**Steps to Reproduce:**

1. Navigate to http://localhost:5174/
2. Enter "-5" in the Age field
3. Click "Save Profile" button
4. Observe validation message

**Expected Result:**
Validation should show both minimum and maximum age constraints (e.g., "Age must be between 18 and 100")

**Actual Result:**
Validation only shows "Must be at least 18" with no indication of maximum age

**Impact:**
Minor UX improvement needed for better form validation messaging

**Affected Files:**

- `src/components/forms/validation.ts`
- `src/components/forms/ProfileForm.tsx`

---

## Summary Statistics

| Severity  | Count | Percentage |
| --------- | ----- | ---------- |
| CRITICAL  | 1     | 12.5%      |
| HIGH      | 3     | 37.5%      |
| MEDIUM    | 2     | 25.0%      |
| LOW       | 2     | 25.0%      |
| **TOTAL** | **8** | **100%**   |

## Test Coverage Notes

**Features Tested:**

- ✅ Profile form data entry
- ✅ Profile form validation
- ✅ Save Profile functionality
- ✅ Projection results display
- ✅ Navigation interactions
- ✅ Data persistence (page reload)
- ✅ Console error/warning monitoring
- ❌ Account Management (not accessible)
- ❌ Milestones and Events (not accessible)
- ❌ Income/Expense Modeling (not accessible)
- ❌ Goals and Priorities (not accessible)
- ❌ Tax Engine (not accessible)
- ❌ Monte Carlo (not accessible)
- ❌ Analytics (not accessible)
- ❌ Scenario Management (not accessible)

**Missing Features:** 7 major feature modules are not accessible despite being marked "COMPLETED" in project.md

## Recommendations

1. **Immediate Priority (Critical):** Fix DEF-001 to restore projection calculation functionality
2. **High Priority:** Implement navigation routing (DEF-002) to make advanced features accessible
3. **High Priority:** Resolve chart dimension issues (DEF-003) for proper visualization
4. **High Priority:** Fix controlled/uncontrolled input conflict (DEF-004) for clean React execution
5. **Medium Priority:** Implement proper data persistence (DEF-005) for usable application
6. **Medium Priority:** Correct chart x-axis labels (DEF-006) for accurate timeline representation
7. **Low Priority:** Connect advanced feature modules to navigation (DEF-007)
8. **Low Priority:** Enhance validation messages (DEF-008) for better UX

## Additional Observations

- PWA (Progressive Web App) functionality appears to be working correctly based on console messages
- Network requests show all assets loading successfully without 404 errors
- Application loads quickly and is responsive to user input
- Form validation works for negative values but could be more comprehensive
- The codebase appears well-organized with proper separation of concerns

---

## Test Environment Details

- **Browser:** Chrome (DevTools)
- **URL:** http://localhost:5174/
- **Page Load Time:** ~154ms (fast)
- **Network Status:** All requests successful (200 status codes)
- **Console Errors:** 1 (controlled/uncontrolled input)
- **Console Warnings:** 2 (chart dimensions)
- **Mobile Responsiveness:** Not tested in this session

---

**Report Generated:** 2026-02-09  
**QA Engineer:** Senior Application QC Engineer  
**Test Duration:** E2E session with comprehensive feature exploration
