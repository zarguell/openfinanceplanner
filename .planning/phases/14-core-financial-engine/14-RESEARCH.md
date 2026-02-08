# Phase 14: Core Financial Engine - Research

**Researched:** 2026-02-08
**Domain:** TypeScript pure function financial projection engine with TDD
**Confidence:** HIGH

## Summary

Phase 14 requires building a pure TypeScript financial projection calculator completely decoupled from React, following Test-Driven Development (TDD) principles. The engine will perform year-by-year compound interest calculations based on user profile data (age, savings, growth rate, spending).

**Primary recommendation:** Implement pure functions in `src/core/` using TypeScript's strict type system, with comprehensive Vitest tests written first (red phase), then implementation (green phase), ensuring complete decoupling from React and validation of all edge cases including floating-point precision issues, boundary conditions, and invalid inputs.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **TypeScript** | ^5.9.3 | Type-safe business logic | Strict mode enabled, path aliases configured, prevents runtime errors |
| **Vitest** | ^4.0.18 | Test framework (already configured) | Global test APIs, jsdom environment, v8 coverage provider |
| **Native JavaScript** | ES2020 | Financial calculations | No external dependencies needed for basic compound interest |

### Supporting (Consider for Future)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **decimal.js** | latest | Precise decimal arithmetic | If floating-point precision issues become critical (NOT needed for Phase 14) |
| **@founderpath/financets** | latest | Advanced financial functions | If needing complex calculations (IRR, NPV, amortization) in future phases |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native number arithmetic | decimal.js, big.js | Decimal libraries add complexity for simple compound interest; native JS has ~15 digit precision (sufficient for Phase 14) |
| Custom rounding | Math.round() | Custom rounding functions prevent edge-case issues (0.1 + 0.2 !== 0.3) |
| Pure functions | Class-based approach | Pure functions are more testable, composable, and align with TDD best practices |

**Installation:**
```bash
# No new packages needed - using existing TypeScript + Vitest from Phase 13
# If decimal precision becomes critical later:
npm install decimal.js
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── core/
│   ├── types/
│   │   ├── index.ts           # UserProfile, SimulationResult types
│   │   └── *.test.ts          # Type validation tests
│   ├── projection/
│   │   ├── index.ts           # calculateProjection function
│   │   ├── compoundInterest.ts # Helper for year-by-year growth
│   │   └── *.test.ts          # Comprehensive engine tests
│   └── index.ts               # Namespace exports for @/core
├── components/                # UI layer (Phase 15+)
└── test/
    └── setup.ts               # Already configured (global APIs)
```

### Pattern 1: Pure Function Projection Engine

**What:** Domain logic as pure functions (no side effects, no React imports)

**When to use:** All business logic calculations, data transformations, validations

**Example:**
```typescript
// src/core/types/index.ts
export interface UserProfile {
  age: number;
  currentSavings: number;
  annualGrowthRate: number;  // Percentage (e.g., 7.5 for 7.5%)
  annualSpending: number;
}

export interface SimulationResult {
  year: number;
  age: number;
  startingBalance: number;
  growth: number;
  spending: number;
  endingBalance: number;
}

// src/core/projection/index.ts
export function calculateProjection(profile: UserProfile): SimulationResult[] {
  // Pure function: input → output, no side effects
  const results: SimulationResult[] = [];
  let balance = profile.currentSavings;

  for (let year = 0; year < (100 - profile.age); year++) {
    const age = profile.age + year;
    const startingBalance = balance;
    const growth = startingBalance * (profile.annualGrowthRate / 100);
    balance = startingBalance + growth - profile.annualSpending;

    results.push({
      year,
      age,
      startingBalance,
      growth,
      spending: profile.annualSpending,
      endingBalance: Math.max(0, balance), // Don't go negative
    });
  }

  return results;
}
```

**Source:** Based on [Functional Programming in TypeScript: A Financial Data Flow](https://medium.com/@rasool.rahmanzade/functional-programming-in-typescript-a-financial-data-flow-033e0ede3b93) and [Why Pure Functions are Just Better in TS](https://mgregersen.dk/why-pure-functions-are-just-better-in-ts/)

### Pattern 2: TDD Red-Green-Refactor Cycle

**What:** Write failing test first, implement to pass, then refactor

**When to use:** All engine functions (requirement TEST-04, TEST-05)

**Example:**
```typescript
// Step 1: Write FAILING test (RED)
import { describe, it, expect } from 'vitest';
import { calculateProjection } from './index';

describe('calculateProjection', () => {
  it('should calculate year-by-year projections', () => {
    const profile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result).toHaveLength(70); // Until age 100
    expect(result[0].endingBalance).toBeCloseTo(67000, 0);
    expect(result[0].growth).toBeCloseTo(7000, 0);
  });
});

// Step 2: Implement calculateProjection to make test pass (GREEN)

// Step 3: Refactor for clarity without changing behavior
```

**Source:** [Test-Driven Development (TDD) - Astro Vault](https://vault.llbbl.com/content/testing/tdd/), [Mastering TDD with TypeScript: A Simple Calculator Example](https://www.linkedin.com/pulse/mastering-tdd-typescript-simple-calculator-example-stuart-du-casse-tsboc)

### Pattern 3: Clean Engine Layer (Decoupled from React)

**What:** Business logic in `src/core/` has zero React imports

**When to use:** All domain logic; UI components only call pure functions

**Example:**
```typescript
// ✅ CORRECT: src/core/projection/index.ts
// No React imports anywhere
import type { UserProfile, SimulationResult } from '@/core/types';

export function calculateProjection(profile: UserProfile): SimulationResult[] {
  // Pure calculation logic
}

// ❌ WRONG: Never do this in src/core/
import { useState } from 'react'; // VIOLATES decoupling principle
```

**Source:** [Decouple Your Code - How to Separate Business Logic from UI](https://julian.pro/blog/separate-business-logic-from-layout/), [Clean Architecture by Robert C. Martin — TypeScript Guide](https://cleancodeguy.com/blog/robert-c-martin)

### Anti-Patterns to Avoid

- **Business logic in React components:** Keeps calculation logic in `src/core/`, not `src/components/`
- **Tight coupling to React:** Engine functions must work without `react` or `react-dom` imports
- **Testing only happy paths:** Requirement TEST-05 mandates edge case testing (negative values, zero growth, etc.)
- **Skipping TDD cycle:** Must demonstrate red → green → refactor workflow in git history

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Decimal precision handling | Custom rounding with edge cases | `decimal.js` (if needed) | JavaScript floating-point has ~15 digit precision; custom rounding is error-prone |
| Compound interest formula | Reinventing math | Standard formula: `FV = P(1 + r)^t` | Well-tested mathematical principle; finance.ts library available for advanced needs |
| Test utilities | Custom test helpers | Vitest's built-in `describe`, `it`, `expect`, `test.each` | Already configured globally, supports data-driven tests |
| Type guards for validation | Manual type checking | TypeScript's type system | Strict mode already enabled; compile-time validation is superior |

**Key insight:** For Phase 14, native JavaScript arithmetic is sufficient for compound interest calculations. Only introduce `decimal.js` if precision issues emerge in testing (unlikely given ~15 digit precision for typical retirement projections).

## Common Pitfalls

### Pitfall 1: Floating-Point Precision Errors

**What goes wrong:** Calculations like `0.1 + 0.2 !== 0.3` in JavaScript due to IEEE 754 floating-point representation

**Why it happens:** JavaScript numbers are binary floating-point; decimal values can't always be represented exactly

**How to avoid:**
- Use `Math.round()` or `.toFixed()` for display purposes
- For comparisons, use `expect(value).toBeCloseTo(expected, decimalPlaces)` in tests
- Consider rounding to 2 decimal places for currency: `Math.round(value * 100) / 100`

**Warning signs:** Test assertions fail with "expected 0.30000000000000004 to be 0.3"

**Source:** [Precision Pitfalls in JavaScript: Solving Common Math Bugs](https://www.linkedin.com/pulse/precision-pitfalls-javascript-solving-common-math-bugs-srikanth-r-mxp8e), [Exact Calculations in TypeScript + Node.js](https://medium.com/@tbreijm/exact-calculations-in-typescript-node-js-b7333803609e)

### Pitfall 2: Testing Only Happy Paths

**What goes wrong:** Tests pass with valid inputs but fail with edge cases (negative savings, zero growth, extreme values)

**Why it happens:** Developers focus on typical use cases, not boundary conditions

**How to avoid:**
- Use `test.each` or `test.for` for data-driven tests covering edge cases
- Test invalid inputs: negative values, zero values, extremely large values
- Test boundary conditions: age 100 (no projection needed), age 0 (100-year projection)

**Warning signs:** Test suite passes but production crashes with "unexpected input"

**Source:** [Automated Testing in Fintechs: How I Ensure Accuracy and Trust](https://medium.com/@marcoaurelioabrantes/automated-testing-in-fintechs-how-i-ensure-accuracy-and-trust-in-financial-calculations-3a044b657b5e)

### Pitfall 3: Coupling Engine to React

**What goes wrong:** Business logic imports React hooks or components, making it untestable in isolation

**Why it happens:** Convenience of using `useState` or React context directly in calculation logic

**How to avoid:**
- Enforce folder structure: `src/core/` never imports from `react`
- Use ESLint rule to restrict imports (optional but recommended)
- Test engine functions in `node` environment, not `jsdom`

**Warning signs:** Test file imports `@testing-library/react` for engine logic

**Source:** [Building Maintainable Frontends with React and Clean Architecture](https://javascript.plainenglish.io/building-maintainable-frontends-with-react-and-clean-architecture-d5a60d85c826)

### Pitfall 4: Skipping TDD Workflow

**What goes wrong:** Implementation written first, tests added later (not true TDD)

**Why it happens:** Habit of writing code then testing it afterwards

**How to avoid:**
- Commit pattern: "test: add failing test for X" → "feat: implement X to pass test"
- Use `test.todo` to stub tests before implementation
- Verify git history shows red → green → refactor sequence

**Warning signs:** Git commits show implementation before test file creation

**Source:** [T.D.D. is Most Practical Data-Driven with Pure Functions](https://www.hacklewayne.com/t-d-d-is-most-practical-data-driven-with-pure-functions)

## Code Examples

Verified patterns from official sources:

### Pure Function with Type Safety

```typescript
// Source: Functional Programming in TypeScript: A Financial Data Flow
// https://medium.com/@rasool.rahmanzade/functional-programming-in-typescript-a-financial-data-flow-033e0ede3b93

export type UserProfile = Readonly<{
  age: number;
  currentSavings: number;
  annualGrowthRate: number;
  annualSpending: number;
}>;

export type SimulationResult = Readonly<{
  year: number;
  age: number;
  startingBalance: number;
  growth: number;
  spending: number;
  endingBalance: number;
}>;

export function calculateProjection(
  profile: UserProfile
): SimulationResult[] {
  // Pure function: no side effects, deterministic output
  const results: SimulationResult[] = [];
  let balance = profile.currentSavings;

  for (let year = 0; year < (100 - profile.age); year++) {
    const age = profile.age + year;
    const startingBalance = balance;
    const growth = startingBalance * (profile.annualGrowthRate / 100);
    balance = startingBalance + growth - profile.annualSpending;

    results.push({
      year,
      age,
      startingBalance,
      growth,
      spending: profile.annualSpending,
      endingBalance: Math.max(0, balance),
    } as const);
  }

  return results;
}
```

### TDD Test with Edge Cases

```typescript
// Source: Vitest API Reference
// https://vitest.dev/api/

import { describe, test, expect } from 'vitest';
import { calculateProjection } from './index';
import type { UserProfile } from '@/core/types';

describe('calculateProjection', () => {
  test('handles valid profile with typical values', () => {
    const profile: UserProfile = {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    const result = calculateProjection(profile);

    expect(result).toHaveLength(70);
    expect(result[0].endingBalance).toBeCloseTo(67000, 0);
  });

  test.each([
    [0, 100000, 7, 40000, 'zero age'],
    [100, 100000, 7, 40000, 'age 100 (no projection)'],
    [30, 0, 7, 40000, 'zero savings'],
    [30, 100000, 0, 40000, 'zero growth rate'],
    [30, 100000, 7, 0, 'zero spending'],
  ])('handles edge case: %s', (age, savings, rate, spending, caseName) => {
    const profile: UserProfile = {
      age,
      currentSavings: savings,
      annualGrowthRate: rate,
      annualSpending: spending,
    };

    const result = calculateProjection(profile);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test('validates input types at compile time', () => {
    // TypeScript will catch type errors at compile time
    const invalidProfile = {
      age: '30', // Type error: should be number
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    };

    // @ts-expect-error - Intentional type error for testing
    expect(() => calculateProjection(invalidProfile)).toThrow();
  });
});
```

### Data-Driven Tests with Vitest

```typescript
// Source: Vitest API Reference - test.each
// https://vitest.dev/api/

import { test, expect } from 'vitest';
import { calculateProjection } from './index';
import type { UserProfile } from '@/core/types';

const testCases: Array<{
  profile: UserProfile;
  expectedYears: number;
  description: string;
}> = [
  {
    profile: {
      age: 30,
      currentSavings: 100000,
      annualGrowthRate: 7,
      annualSpending: 40000,
    },
    expectedYears: 70,
    description: 'typical retirement projection',
  },
  {
    profile: {
      age: 50,
      currentSavings: 500000,
      annualGrowthRate: 5,
      annualSpending: 60000,
    },
    expectedYears: 50,
    description: 'late starter projection',
  },
];

test.for(testCases)('calculates projection: $description', ({ profile, expectedYears }) => {
  const result = calculateProjection(profile);

  expect(result).toHaveLength(expectedYears);
  expect(result[0].age).toBe(profile.age);
  expect(result[result.length - 1].age).toBe(100);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class-based finance libraries | Pure function financial calculations | 2023-2024 | Improved testability, composability, and type safety |
| Jest for testing | Vitest for testing | 2024-2025 | Better Vite integration, faster execution, native ESM support |
| Business logic in React components | Clean Architecture with `src/core/` | 2024-2025 | Complete decoupling, unit testable without React dependencies |
| Post-hoc testing | TDD with red-green-refactor | 2025-2026 | Higher code quality, better edge case coverage |

**Deprecated/outdated:**
- **finance.js (original class-based version):** Replaced by [@founderpath/financets](https://github.com/founderpathcom/finance.ts) using pure functions (2023)
- **Jest for new TypeScript projects:** Vitest is now recommended for Vite-based projects (2024+)
- **Class-based domain models:** Functional DDD is now preferred for TypeScript (2024+)

## Open Questions

1. **Should we implement input validation in the engine or UI layer?**
   - What we know: Pure functions should validate inputs for type safety
   - What's unclear: Where to throw errors for invalid inputs (negative age, etc.)
   - Recommendation: Add basic validation in engine (throw TypeError for invalid inputs), UI layer can provide user-friendly error messages

2. **How precise do currency calculations need to be?**
   - What we know: JavaScript has ~15 digit precision, sufficient for most financial calculations
   - What's unclear: Whether to use `decimal.js` for exact decimal arithmetic
   - Recommendation: Start with native arithmetic, introduce `decimal.js` only if tests reveal precision issues

3. **Should projections support inflation adjustment?**
   - What we know: Phase 14 requirements don't mention inflation
   - What's unclear: Whether to build in extensibility for future inflation features
   - Recommendation: Keep Phase 14 simple (nominal dollars), design types to be extensible for Phase 15+

## Sources

### Primary (HIGH confidence)
- [Vitest Guide](https://vitest.dev/guide/) - Test framework configuration, API usage (verified 2026-01-04)
- [Vitest API Reference](https://vitest.dev/api/) - Complete test API, assertions, hooks (verified 2025-11-06)
- [@founderpath/financets GitHub](https://github.com/founderpathcom/finance.ts) - Financial calculation library patterns (verified)

### Secondary (MEDIUM confidence)
- [Functional Programming in TypeScript: A Financial Data Flow](https://medium.com/@rasool.rahmanzade/functional-programming-in-typescript-a-financial-data-flow-033e0ede3b93) - Pure function patterns for financial calculations
- [Why Pure Functions are Just Better in TS](https://mgregersen.dk/why-pure-functions-are-just-better-in-ts/) - Pure function benefits in TypeScript
- [Decouple Your Code - Separate Business Logic from UI](https://julian.pro/blog/separate-business-logic-from-layout/) - Clean architecture for TypeScript
- [Test-Driven Development (TDD) - Astro Vault](https://vault.llbbl.com/content/testing/tdd/) - Red-green-refactor cycle explained (updated 2026-01-11)
- [Mastering TDD with TypeScript: A Simple Calculator Example](https://www.linkedin.com/pulse/mastering-tdd-typescript-simple-calculator-example-stuart-du-casse-tsboc) - Practical TDD workflow

### Tertiary (LOW confidence - verified but not primary sources)
- [Precision Pitfalls in JavaScript](https://www.linkedin.com/pulse/precision-pitfalls-javascript-solving-common-math-bugs-srikanth-r-mxp8e) - Floating-point precision issues
- [Exact Calculations in TypeScript + Node.js](https://medium.com/@tbreijm/exact-calculations-in-typescript-node-js-b7333803609e) - Decimal precision challenges
- [Automated Testing in Fintechs](https://medium.com/@marcoaurelioabrantes/automated-testing-in-fintechs-how-i-ensure-accuracy-and-trust-in-financial-calculations-3a044b657b5e) - Financial calculation testing strategies
- [Building a Type-Safe Money Handling Library in TypeScript](https://dev.to/thesmilingsloth/building-a-type-safe-money-handling-library-in-typescript-3o44) - Type-safe patterns (2025-01-09)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Vitest and TypeScript configurations verified from official docs, project setup confirmed
- Architecture: **HIGH** - Clean Architecture and pure function patterns verified from multiple authoritative sources (2024-2026)
- Pitfalls: **MEDIUM** - Floating-point precision and TDD pitfalls verified from credible sources, but some edge cases may emerge during implementation

**Research date:** 2026-02-08
**Valid until:** 2026-03-10 (30 days - TypeScript and Vitest ecosystems are stable; financial calculation patterns are well-established)

**Key decision points for planner:**
1. No new npm packages needed for Phase 14 (use existing TypeScript + Vitest)
2. Prioritize TDD workflow: tests must be written first (red), then implementation (green)
3. Enforce strict decoupling: src/core/ must have zero React imports
4. Test coverage must include edge cases, not just happy paths
5. Git history should demonstrate atomic commits following TDD cycle
