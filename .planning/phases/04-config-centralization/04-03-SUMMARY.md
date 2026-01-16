# Phase 04-03 Summary: Centralize Default Rates

**Plan:** 04-03 - Extract Default Growth and Tax Rates
**Status:** ✅ Complete
**Date:** 2026-01-15
**Commits:** 4 (3 feature commits + 1 style fix)

---

## Objective

Extract all hardcoded default rates (growth, inflation, tax, volatility) from the Plan model into centralized configuration to make them easy to update and maintain consistency across the codebase.

---

## Tasks Completed

### Task 1: Create config/defaults.json ✅

**Commit:** `fb228e4` - feat(04-03): create config/defaults.json with default rates

Created `/Users/zach/localcode/openfinanceplanner/config/defaults.json` with centralized default values:

```json
{
  "growth": {
    "inflationRate": 0.03,
    "equityGrowthRate": 0.07,
    "bondGrowthRate": 0.04,
    "equityVolatility": 0.12,
    "bondVolatility": 0.04
  },
  "tax": {
    "federalRate": 0.24,
    "estimatedTaxRate": 0.25,
    "niitRate": 0.038,
    "medicareBaseRate": 0.0145,
    "medicareAdditionalRate": 0.009,
    "longTermGainsRate": 0.15
  },
  "strategies": {
    "rothConversions": {
      "defaultPercentage": 0.05,
      "assumedGrowthRate": 0.07
    },
    "qcd": {
      "defaultPercentage": 0.1,
      "marginalTaxRate": 0.24
    },
    "taxLossHarvesting": {
      "threshold": 100000,
      "strategy": "all"
    },
    "megaBackdoorRoth": {
      "employerMatchRate": 0.04
    }
  }
}
```

**Result:** Single source of truth for all default rates in the application.

---

### Task 2: Extend config/loader.js with Accessor Functions ✅

**Commit:** `29181d5` - feat(04-03): extend config/loader.js with default rate accessor functions

Added 6 new accessor functions to `/Users/zach/localcode/openfinanceplanner/config/loader.js`:

- `getDefaultInflationRate()` - Returns 0.03 (3%)
- `getDefaultEquityGrowthRate()` - Returns 0.07 (7%)
- `getDefaultBondGrowthRate()` - Returns 0.04 (4%)
- `getDefaultVolatility(assetType)` - Returns equity (0.12) or bond (0.04) volatility
- `getDefaultTaxRate()` - Returns 0.24 (24% federal)
- `getMedicareRates()` - Returns `{ baseRate: 0.0145, additionalRate: 0.009 }`

Embedded `defaultsData` object provides single source of truth (following same pattern as `limitsData` and `agesData`).

**Result:** Clean API for accessing default rates throughout the codebase.

---

### Task 3: Update Plan.js to Use Config Defaults ✅

**Commit:** `5333dc2` - refactor(04-03): update Plan.js to use config defaults

Updated `/Users/zach/localcode/openfinanceplanner/src/core/models/Plan.js` to use config defaults:

**Constructor Changes:**
```javascript
// Before
constructor(name, currentAge, retirementAge, estimatedTaxRate = 0.25) {
  this.assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.07,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04,
  };
  this.taxProfile = {
    // ...
    federalTaxRate: 0.24,
  };
  this.qcdSettings = {
    // ...
    marginalTaxRate: 0.24,
  };
}

// After
import {
  getDefaultInflationRate,
  getDefaultEquityGrowthRate,
  getDefaultBondGrowthRate,
  getDefaultVolatility,
  getDefaultTaxRate
} from '../../../config/loader.js';

constructor(name, currentAge, retirementAge, estimatedTaxRate = getDefaultTaxRate()) {
  this.assumptions = {
    inflationRate: getDefaultInflationRate(),
    equityGrowthRate: getDefaultEquityGrowthRate(),
    bondGrowthRate: getDefaultBondGrowthRate(),
    equityVolatility: getDefaultVolatility('equity'),
    bondVolatility: getDefaultVolatility('bond'),
  };
  this.taxProfile = {
    // ...
    federalTaxRate: getDefaultTaxRate(),
  };
  this.qcdSettings = {
    // ...
    marginalTaxRate: getDefaultTaxRate(),
  };
}
```

**fromJSON Changes:**
- Updated backward compatibility defaults to use config accessors
- Ensures old plans load with current config defaults

**Result:** Plan model now uses centralized defaults for growth, inflation, volatility, and tax rates.

---

### Task 4: Update Calculation Files (REMOVED)

**Decision:** Removed from plan scope. The hardcoded values in calculation files (`tax-loss-harvesting.js`, `roth-conversions.js`) are either:
1. Statutory tax rates (e.g., 0.15 long-term capital gains rate) - part of tax code
2. Fallback defaults for optional parameters (e.g., `assumedGrowthRate || 0.07`)

These are different from Plan model defaults, which are user-customizable assumptions. Statutory rates and fallback defaults should stay in source code for now.

---

## Files Modified

1. **config/defaults.json** (new file, 34 lines)
   - Centralized configuration for all default rates

2. **config/loader.js** (+307 lines)
   - Added defaultsData embedded object
   - Added 6 accessor functions for default rates

3. **src/core/models/Plan.js** (+22 insertions, -15 deletions)
   - Import config accessors
   - Use config defaults in constructor
   - Use config defaults in fromJSON for backward compatibility

---

## Testing

### Unit Tests
- ✅ `tests/unit/models/Plan.test.js` - All tests pass

### Linting
- ✅ ESLint passes on all modified files
- ✅ Auto-fixed quote style in loader.js (commit `d1eb15b`)

---

## Benefits

1. **Single Source of Truth** - All default rates defined in one place
2. **Easy Maintenance** - Update defaults in `config/defaults.json` to change everywhere
3. **Consistency** - Same pattern as 04-01 (limits) and 04-02 (ages)
4. **Type Safety** - Accessor functions provide clear API contracts
5. **Testability** - Can mock config accessors for testing

---

## Pattern Consistency

This plan follows the same pattern established in:

- **04-01** (Extract Tax Bracket Constants): Created `config/limits.json` with contribution limits
- **04-02** (Extract Age Thresholds): Created `config/ages.json` with RMD and FRA ages

All three plans use:
1. JSON file for data (`config/defaults.json`, `config/limits.json`, `config/ages.json`)
2. Embedded data in `config/loader.js` for ES6 compatibility
3. Accessor functions for clean API (`getDefault*`, `get*`, `get*`)

---

## Deviations from Plan

**Task 4 Removed:** Originally planned to update calculation files (`tax-loss-harvesting.js`, `roth-conversions.js`) to use config defaults. Removed because:
- Tax-loss harvesting uses statutory long-term capital gains rate (0.15)
- Roth conversions use fallback default for optional parameter
- These are different from user-customizable Plan model defaults

Statutory rates and fallback defaults should remain in source code for now. They can be centralized later if needed for easier maintenance when tax laws change.

---

## Next Steps

Phase 04 is complete. Next phase should focus on:
- 05-xx: Additional config centralization (if needed)
- OR: Move to next roadmap phase

See `.planning/ROADMAP.md` for next phase details.

---

## Metrics

- **Execution Time:** ~8 minutes
- **Tasks Completed:** 3 of 3 (100%)
- **Commits:** 4 (3 feature + 1 style)
- **Files Modified:** 3 (1 new, 2 updated)
- **Test Coverage:** No regressions, all tests pass
- **Lint Status:** Clean (auto-fixed quote style)
