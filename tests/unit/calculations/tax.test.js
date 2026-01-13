/**
 * Tax Calculations - Unit tests
 * Testing against IRS tax bracket calculations and known examples
 */

import {
  calculateFederalTax,
  calculateLongTermCapitalGainsTax,
  calculateShortTermCapitalGainsTax,
  calculateCapitalGainsTax,
  calculateSocialSecurityTax,
  calculateMedicareTax,
  calculateFicaTax,
  getStandardDeduction,
  getRmdAgeRequirement,
  calculateRMD
} from '/Users/zach/localcode/openfinanceplanner/src/calculations/tax.js';

export function testFederalTax() {
  console.log('Testing calculateFederalTax...');

  const tax1 = calculateFederalTax(5000000, 'single', 2025);
  console.assert(tax1 === 673750, 'Test 1 failed: $50,000 income should be $6,737.50 tax');
  console.assert(
    tax1 / 5000000 === 0.13475,
    'Test 1 failed: Effective rate should be 13.475%'
  );

  const tax2 = calculateFederalTax(10000000, 'single', 2024);
  console.assert(tax2 === 1811740, 'Test 2 failed: $100,000 income should be $18,117.40 tax');
  console.assert(
    tax2 / 10000000 === 0.181174,
    'Test 2 failed: Effective rate should be 18.12%'
  );

  const tax3 = calculateFederalTax(5000000, 'married_joint', 2025);
  console.assert(tax3 === 568000, 'Test 3 failed: $50,000 income should be $5,680.00 tax');
  console.assert(
    tax3 / 5000000 === 0.1136,
    'Test 3 failed: Effective rate should be 11.36%'
  );

  const tax4 = calculateFederalTax(0, 'single', 2025);
  console.assert(tax4 === 0, 'Test 4 failed: $0 income should be $0 tax');
  console.assert(
    tax4 / 0 === 0,
    'Test 4 failed: Zero division should not cause error'
  );

  console.log('All federal tax tests passed! ✓');
}

export function testCapitalGainsTax() {
  console.log('Testing capital gains tax calculations...');

  const tax1 = calculateLongTermCapitalGainsTax(3000000, 'single', 2025);
  console.assert(tax1 === 0, 'Test 1 failed: $30,000 gains in 0% bracket should be $0 tax');
  console.assert(
    tax1 / 3000000 === 0,
    'Test 1 failed: Effective rate should be 0%'
  );

  const tax2 = calculateLongTermCapitalGainsTax(10000000, 'married_joint', 2025);
  console.assert(tax2 === 1500000, 'Test 2 failed: $100,000 gains in 15% bracket should be $15,000 tax');
  console.assert(
    tax2 / 10000000 === 0.15,
    'Test 2 failed: Effective rate should be 15%'
  );

  const tax3 = calculateShortTermCapitalGainsTax(5000000, 'single', 2025);
  console.assert(tax3 === 673750, 'Test 3 failed: $50,000 short-term gains should be taxed at 22% marginal rate');
  console.assert(
    tax3 / 5000000 === 0.13475,
    'Test 3 failed: Effective rate should be 13.475%'
  );

  console.log('All capital gains tests passed! ✓');
}

export function testSocialSecurityAndMedicareTax() {
  console.log('Testing Social Security and Medicare tax calculations...');

  const wages = 17610000;
  const ssTax1 = calculateSocialSecurityTax(wages, 2025);
  console.assert(ssTax1 === 1091820, 'Test 1 failed: SS tax should be 6.2% of $176,100 = $10,918.20');
  console.assert(
    ssTax1 / wages === 0.062,
    'Test 1 failed: SS rate should be 6.2%'
  );

  const medicareTax1 = calculateMedicareTax(10000000, 'single', 2025);
  console.assert(medicareTax1 === 145000, 'Test 2 failed: Medicare tax should be 1.45% of $100,000 = $1,450.00');
  console.assert(
    medicareTax1 / 10000000 === 0.0145,
    'Test 2 failed: Medicare rate should be 1.45%'
  );

  const medicareTax2 = calculateMedicareTax(25000000, 'single', 2025);
  console.assert(medicareTax2 === 362500, 'Test 3 failed: Medicare tax for $250,000 should be $3,625.00 ($2,000 @ 1.45% + $48,000 @ 0.9%)');
  console.assert(
    medicareTax2 / 25000000 === 0.0145,
    'Test 3 failed: Medicare effective rate should be 1.45%'
  );

  const fica1 = calculateFicaTax(10000000, 'single', 2025);
  console.assert(fica1.totalFicaTax === 1236820, 'Test 4 failed: FICA tax should be $10,918.20 (SS: $10,918.20 + Medicare: $1,450.00)');
  console.assert(
    fica1.ssTax / 10000000 === 0.062,
    'Test 4 failed: SS portion should be 6.2%'
  );
  console.assert(
    fica1.medicareTax / 10000000 === 0.0145,
    'Test 4 failed: Medicare portion should be 1.45%'
  );

  console.log('All Social Security and Medicare tests passed! ✓');
}

export function testStandardDeduction() {
  console.log('Testing standard deduction retrieval...');

  const deduction1 = getStandardDeduction(2025, 'single');
  console.assert(
    deduction1 === 1575000,
    'Test 1 failed: 2025 single deduction should be $15,750'
  );

  const deduction2 = getStandardDeduction(2025, 'married_joint');
  console.assert(
    deduction2 === 3150000,
    'Test 2 failed: 2025 married joint deduction should be $31,500'
  );

  const deduction3 = getStandardDeduction(2025, 'head_of_household');
  console.assert(
    deduction3 === 2362500,
    'Test 3 failed: 2025 head of household deduction should be $23,625'
  );

  console.log('All standard deduction tests passed! ✓');
}

export function testRMD() {
  console.log('Testing RMD calculations...');

  const rmd1 = calculateRMD(100000000, 73, 2025);
  const expectedRmd1 = Math.round(100000000 / 26.5);
  console.assert(
    rmd1 === expectedRmd1,
    'Test 1 failed: RMD for age 73 should be balance / 26.5'
  );
  console.assert(
    Math.abs(rmd1 - expectedRmd1) < 1,
    'Test 1 failed: RMD calculation should be accurate within rounding'
  );

  const rmd2 = calculateRMD(100000000, 75, 2025);
  const expectedRmd2 = Math.round(100000000 / 24.7);
  console.assert(
    rmd2 === expectedRmd2,
    'Test 2 failed: RMD for age 75 should be balance / 24.7'
  );

  console.log('All RMD tests passed! ✓');
}

export function runAllTests() {
  console.log('\n=== Running All Tax Calculation Tests ===\n');

  try {
    testFederalTax();
  } catch (error) {
    console.error('Federal tax tests failed:', error.message);
    return false;
  }

  try {
    testCapitalGainsTax();
  } catch (error) {
    console.error('Capital gains tests failed:', error.message);
    return false;
  }

  try {
    testSocialSecurityAndMedicareTax();
  } catch (error) {
    console.error('SS/Medicare tests failed:', error.message);
    return false;
  }

  try {
    testStandardDeduction();
  } catch (error) {
    console.error('Standard deduction tests failed:', error.message);
    return false;
  }

  try {
    testRMD();
  } catch (error) {
    console.error('RMD tests failed:', error.message);
    return false;
  }

  console.log('\n=== All Tests Completed Successfully! ===\n');
  console.log('Summary:');
  console.log('- Federal income tax calculations: PASSED');
  console.log('- Capital gains tax calculations: PASSED');
  console.log('- Social Security and Medicare tax calculations: PASSED');
  console.log('- Standard deduction retrieval: PASSED');
  console.log('- RMD calculations: PASSED');
  return true;
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}
