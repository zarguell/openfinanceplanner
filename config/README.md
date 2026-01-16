# Configuration Files

This directory contains centralized configuration for the Open Finance Planner.

## Files

- `limits.json` - Retirement account contribution limits (401k, IRA, catch-up, QCD)
- `ages.json` - Age-related thresholds (RMD age, Full Retirement Age table, life expectancy)
- `defaults.json` - Default rates for growth, inflation, tax, and strategies
- `loader.js` - ES6 module with accessor functions for all config data

## Usage

Import from loader.js to access config values:

```javascript
import { getContributionLimit, getDefaultInflationRate } from './config/loader.js';

const limit = getContributionLimit('401k', 2025);
const inflation = getDefaultInflationRate();
```

## Design Notes

- Config data is embedded in loader.js for ES6 module compatibility
- JSON files serve as documentation and can be used with a build system
- Values in JSON are in readable format (dollars, decimals)
- Loader functions convert to cents for monetary values
- Pattern follows Phase 2 tax bracket extraction approach

## Updates

When updating config values:
1. Update the JSON file (documentation)
2. Update the embedded data in loader.js (runtime)
3. Keep both in sync
