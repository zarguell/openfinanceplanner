/**
 * Roth Conversion Strategy Unit Tests
 */

import {
  calculateConversionTax,
  calculateBracketFillConversion,
  calculateFixedConversion,
  calculatePercentageConversion,
  calculateBackdoorRothConversion,
  calculateProRataBasis,
  isPenaltyFree,
  optimizeConversionsAcrossYears,
  analyzeConversion,
} from '../../../src/calculations/roth-conversions.js';
import { Plan } from '../../../src/core/models/Plan.js';
import { Account } from '../../../src/core/models/Account.js';

export function testCalculateConversionTax() {
  console.log('Testing calculateConversionTax...');

  const result = calculateConversionTax(
    1000000, // $10,000 conversion
    5000000, // $50,000 taxable income
    0.22, // 22% marginal rate
    0.3 // 30% total tax rate
  );

  if (result.conversionAmount !== 1000000) {
    throw new Error('Expected conversionAmount to be 1000000');
  }
  if (result.taxOnConversion !== 220000) {
    throw new Error(`Expected taxOnConversion to be 220000, got ${result.taxOnConversion}`);
  }
  if (result.effectiveTaxRate !== 0.22) {
    throw new Error('Expected effectiveTaxRate to be 0.22');
  }
  if (result.afterTaxCost !== 1220000) {
    throw new Error('Expected afterTaxCost to be 1220000');
  }

  console.log('✓ testCalculateConversionTax passed');
}

export function testCalculateBracketFillConversion() {
  console.log('Testing calculateBracketFillConversion...');

  // Test filling up bracket
  const result1 = calculateBracketFillConversion(
    5000000, // $50,000 income
    8945000, // $89,450 bracket top (12% bracket)
    5000000 // $50,000 traditional balance
  );

  if (result1 !== 3945000) {
    throw new Error(`Expected conversion of $39,450, got ${result1 / 100}`);
  }

  // Test limited by balance
  const result2 = calculateBracketFillConversion(
    5000000, // $50,000 income
    8945000, // $89,450 bracket top
    2000000 // Only $20,000 available
  );

  if (result2 !== 2000000) {
    throw new Error(`Expected conversion of $20,000, got ${result2 / 100}`);
  }

  console.log('✓ testCalculateBracketFillConversion passed');
}

export function testCalculateFixedConversion() {
  console.log('Testing calculateFixedConversion...');

  // Test normal case
  const result1 = calculateFixedConversion(
    1000000, // $10,000 target
    5000000, // $50,000 available
    50, // Age 50
    false // No RMD
  );

  if (result1 !== 1000000) {
    throw new Error(`Expected $10,000 conversion, got ${result1 / 100}`);
  }

  // Test limited by balance
  const result2 = calculateFixedConversion(
    1000000, // $10,000 target
    500000, // Only $5,000 available
    50,
    false
  );

  if (result2 !== 500000) {
    throw new Error(`Expected $5,000 conversion, got ${result2 / 100}`);
  }

  // Test with RMD
  const result3 = calculateFixedConversion(1000000, 5000000, 73, true);

  if (result3 !== 1000000) {
    throw new Error(`Expected $10,000 conversion with RMD, got ${result3 / 100}`);
  }

  console.log('✓ testCalculateFixedConversion passed');
}

export function testCalculatePercentageConversion() {
  console.log('Testing calculatePercentageConversion...');

  const result = calculatePercentageConversion(
    0.1, // 10%
    5000000, // $50,000 balance
    6000000 // $60,000 max
  );

  if (result !== 500000) {
    throw new Error(`Expected $5,000 conversion (10%), got ${result / 100}`);
  }

  // Test with max limit
  const result2 = calculatePercentageConversion(
    0.2, // 20%
    5000000, // $50,000 balance
    800000 // $8,000 max
  );

  if (result2 !== 800000) {
    throw new Error(`Expected $8,000 conversion (max limit), got ${result2 / 100}`);
  }

  console.log('✓ testCalculatePercentageConversion passed');
}

export function testCalculateBackdoorRothConversion() {
  console.log('Testing calculateBackdoorRothConversion...');

  // Test full after-tax basis conversion
  const result1 = calculateBackdoorRothConversion(
    7000000, // $7,000 after-tax basis (2024 IRA limit)
    50000000 // $50,000 total balance
  );

  if (result1 !== 7000000) {
    throw new Error(`Expected $7,000 conversion, got ${result1 / 100}`);
  }

  // Test limited by balance
  const result2 = calculateBackdoorRothConversion(
    7000000, // $7,000 basis
    5000000 // Only $5,000 total balance
  );

  if (result2 !== 5000000) {
    throw new Error(`Expected $5,000 conversion, got ${result2 / 100}`);
  }

  console.log('✓ testCalculateBackdoorRothConversion passed');
}

export function testCalculateProRataBasis() {
  console.log('Testing calculateProRataBasis...');

  // Test mixed traditional IRA
  const result = calculateProRataBasis(
    1000000, // $10,000 after-tax basis
    5000000, // $50,000 total balance
    1000000 // Convert $10,000
  );

  if (result.basisRatio !== 0.2) {
    throw new Error(`Expected basis ratio of 0.20, got ${result.basisRatio}`);
  }
  if (result.nonTaxableAmount !== 200000) {
    throw new Error(`Expected $2,000 non-taxable, got ${result.nonTaxableAmount / 100}`);
  }
  if (result.taxableAmount !== 800000) {
    throw new Error(`Expected $8,000 taxable, got ${result.taxableAmount / 100}`);
  }

  // Test zero balance
  const result2 = calculateProRataBasis(1000000, 0, 1000000);

  if (result2.taxableAmount !== 0) {
    throw new Error('Expected zero taxable amount for zero balance');
  }

  console.log('✓ testCalculateProRataBasis passed');
}

export function testIsPenaltyFree() {
  console.log('Testing isPenaltyFree...');

  // Test 5-year rule satisfied, age satisfied
  const result1 = isPenaltyFree(2020, 2025, 60);
  if (result1 !== true) {
    throw new Error('Expected penalty-free (5 years + age 60)');
  }

  // Test 5-year rule not satisfied
  const result2 = isPenaltyFree(2022, 2025, 60);
  if (result2 !== false) {
    throw new Error('Expected NOT penalty-free (only 3 years)');
  }

  // Test age not satisfied
  const result3 = isPenaltyFree(2018, 2025, 55);
  if (result3 !== false) {
    throw new Error('Expected NOT penalty-free (age 55)');
  }

  // Test both satisfied
  const result4 = isPenaltyFree(2019, 2025, 62);
  if (result4 !== true) {
    throw new Error('Expected penalty-free (6 years + age 62)');
  }

  console.log('✓ testIsPenaltyFree passed');
}

export function testOptimizeConversionsAcrossYears() {
  console.log('Testing optimizeConversionsAcrossYears...');

  const plan = new Plan('Test Plan', 50, 65);
  plan.addAccount(new Account('Traditional IRA', 'IRA', 5000000)); // $50,000

  const conversions = optimizeConversionsAcrossYears(plan, 5, 'fixed');

  if (conversions.length !== 5) {
    throw new Error(`Expected 5 years of conversions, got ${conversions.length}`);
  }
  if (conversions[0].year !== new Date().getFullYear()) {
    throw new Error(`Expected year ${new Date().getFullYear()}, got ${conversions[0].year}`);
  }
  if (conversions[0].age !== 50) {
    throw new Error(`Expected age 50, got ${conversions[0].age}`);
  }
  if (conversions[0].conversionAmount !== 1000000) {
    throw new Error(`Expected $10,000 conversion, got ${conversions[0].conversionAmount / 100}`);
  }

  console.log('✓ testOptimizeConversionsAcrossYears passed');
}

export function testAnalyzeConversion() {
  console.log('Testing analyzeConversion...');

  const conversionPlan = {
    conversionAmount: 1000000, // $10,000
    yearsInRoth: 30,
  };

  const taxContext = {
    currentTaxableIncome: 5000000, // $50,000
    marginalTaxRate: 0.22,
    totalTaxRate: 0.3,
    assumedGrowthRate: 0.07,
    futureTaxRate: 0.3,
  };

  const analysis = analyzeConversion(conversionPlan, taxContext);

  if (analysis.conversionAmount !== 1000000) {
    throw new Error('Expected conversionAmount of 1000000');
  }
  if (analysis.taxOnConversion !== 220000) {
    throw new Error(`Expected tax of $2,200, got ${analysis.taxOnConversion / 100}`);
  }
  if (analysis.rothFinalValue <= 0) {
    throw new Error('Expected positive Roth final value');
  }
  if (!analysis.recommendation) {
    throw new Error('Expected recommendation');
  }

  console.log('✓ testAnalyzeConversion passed');
}

export function testBracketFillStrategyEdgeCases() {
  console.log('Testing bracket-fill strategy edge cases...');

  // Test already in bracket
  const result1 = calculateBracketFillConversion(
    9000000, // $90,000 income (above bracket)
    8945000, // $89,450 bracket top
    10000000 // $100,000 balance
  );

  if (result1 !== 0) {
    throw new Error('Expected zero conversion when income exceeds bracket');
  }

  // Test exact bracket top
  const result2 = calculateBracketFillConversion(
    8945000, // Exactly at bracket top
    8945000,
    10000000
  );

  if (result2 !== 0) {
    throw new Error('Expected zero conversion when already at bracket top');
  }

  console.log('✓ testBracketFillStrategyEdgeCases passed');
}

export function testProRataBasisEdgeCases() {
  console.log('Testing pro-rata basis edge cases...');

  // Test 100% after-tax (should be tax-free)
  const result1 = calculateProRataBasis(
    5000000, // $50,000 basis
    5000000, // $50,000 balance (100% basis)
    1000000 // Convert $10,000
  );

  if (result1.nonTaxableAmount !== 1000000) {
    throw new Error('Expected 100% non-taxable');
  }
  if (result1.taxableAmount !== 0) {
    throw new Error('Expected 0% taxable');
  }

  // Test 0% after-tax (fully taxable)
  const result2 = calculateProRataBasis(
    0, // $0 basis
    5000000, // $50,000 balance (0% basis)
    1000000 // Convert $10,000
  );

  if (result2.nonTaxableAmount !== 0) {
    throw new Error('Expected 0% non-taxable');
  }
  if (result2.taxableAmount !== 1000000) {
    throw new Error('Expected 100% taxable');
  }

  console.log('✓ testProRataBasisEdgeCases passed');
}

// Run all tests
export function runAllTests() {
  console.log('=== Running Roth Conversion Strategy Tests ===\n');

  testCalculateConversionTax();
  testCalculateBracketFillConversion();
  testCalculateFixedConversion();
  testCalculatePercentageConversion();
  testCalculateBackdoorRothConversion();
  testCalculateProRataBasis();
  testIsPenaltyFree();
  testOptimizeConversionsAcrossYears();
  testAnalyzeConversion();
  testBracketFillStrategyEdgeCases();
  testProRataBasisEdgeCases();

  console.log('\n=== All Roth Conversion Strategy Tests Passed ===');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}
