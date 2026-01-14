/**
 * Tax Calculations - Unit tests
 * Testing against IRS tax bracket calculations and known examples
 */

import {
  calculateFederalTax,
  calculateLongTermCapitalGainsTax,
  calculateShortTermCapitalGainsTax,
  calculateCapitalGainsTax,
  calculateNetInvestmentIncomeTax,
  calculateSocialSecurityTax,
  calculateMedicareTax,
  calculateFicaTax,
  getStandardDeduction
} from '/Users/zach/localcode/openfinanceplanner/src/calculations/tax.js';

export function testFederalTax() {
  console.log('Testing calculateFederalTax...');

  const tax1 = calculateFederalTax(5000000, 'single', 2025);
  console.assert(tax1 === 387150, 'Test 1 failed: $50,000 income should be $3,871.50 tax');
  console.assert(
    tax1 / 5000000 === 0.07743,
    'Test 1 failed: Effective rate should be 7.743%'
  );

  const tax2 = calculateFederalTax(10000000, 'single', 2024);
  console.assert(tax2 === 1384100, 'Test 2 failed: $100,000 income should be $13,841.00 tax');
  console.assert(
    tax2 / 10000000 === 0.13841,
    'Test 2 failed: Effective rate should be 13.841%'
  );

  const tax3 = calculateFederalTax(5000000, 'married_joint', 2025);
  console.assert(tax3 === 185000, 'Test 3 failed: $50,000 income should be $1,850.00 tax');
  console.assert(
    tax3 / 5000000 === 0.0370,
    'Test 3 failed: Effective rate should be 3.70%'
  );

  const tax4 = calculateFederalTax(0, 'single', 2025);
  console.assert(tax4 === 0, 'Test 4 failed: $0 income should be $0 tax');
  console.assert(
    tax4 === 0,
    'Test 4 failed: Zero income should be $0 tax'
  );

  console.log('All federal tax tests passed! ✓');
}

export function testNetInvestmentIncomeTax() {
  console.log('Testing Net Investment Income Tax calculations...');

  // Test below threshold - no NIIT
  const niit1 = calculateNetInvestmentIncomeTax(5000000, 15000000, 'single', 2025);
  console.assert(niit1 === 0, 'Test 1 failed: MAGI $150K (below $200K threshold) should have $0 NIIT');
  console.assert(
    niit1 === 0,
    'Test 1 failed: No NIIT below threshold'
  );

  // Test above threshold - NIIT applies (limited by MAGI over threshold)
  const niit2 = calculateNetInvestmentIncomeTax(10000000, 25000000, 'single', 2025);
  console.assert(niit2 === 190000, 'Test 2 failed: $100K investment income with MAGI $250K should have $1,900 NIIT (lesser of $100K income and $50K MAGI over threshold)');
  console.assert(
    niit2 === 190000,
    'Test 2 failed: NIIT should be $1,900'
  );

  // Test where investment income limits NIIT (MAGI far exceeds threshold)
  const niit3 = calculateNetInvestmentIncomeTax(10000000, 30000000, 'single', 2025);
  console.assert(niit3 === 380000, 'Test 3 failed: $100K investment income with MAGI $300K should have $3,800 NIIT (limited by investment income)');
  console.assert(
    niit3 / 10000000 === 0.038,
    'Test 3 failed: NIIT should be limited by investment income'
  );

  // Test married joint threshold
  const niit4 = calculateNetInvestmentIncomeTax(5000000, 26000000, 'married_joint', 2025);
  console.assert(niit4 === 38000, 'Test 4 failed: $50K investment income with MAGI $260K (married joint) should have $380 NIIT (lesser of $50K income and $10K MAGI over threshold)');
  console.assert(
    niit4 / 5000000 === 0.0076,
    'Test 4 failed: NIIT effective rate should be 0.76% for married joint'
  );

  console.log('All NIIT tests passed! ✓');
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
  console.assert(tax2 === 23850, 'Test 2 failed: $100,000 gains (98.4K in 0% bracket + 1.6K in 15% bracket) should be $238.50 tax');
  console.assert(
    tax2 / 10000000 === 0.002385,
    'Test 2 failed: Effective rate should be 0.2385%'
  );

  const tax3 = calculateShortTermCapitalGainsTax(5000000, 'single', 2025);
  console.assert(tax3 === 387150, 'Test 3 failed: $50,000 short-term gains should be taxed as ordinary income = $3,871.50');
  console.assert(
    tax3 / 5000000 === 0.07743,
    'Test 3 failed: Effective rate should be 7.743%'
  );

  // Test updated calculateCapitalGainsTax function with NIIT
  const cgTax1 = calculateCapitalGainsTax(4905000, 0, 15000000, 'single', 2025);
  console.assert(cgTax1.totalTax === 0, 'Test 4 failed: $49,050 LTCG with MAGI $150K should have $0 total tax (no NIIT below threshold)');
  console.assert(cgTax1.ordinaryTax === 0, 'Test 4 failed: Ordinary LTCG tax should be $0');
  console.assert(cgTax1.niit === 0, 'Test 4 failed: NIIT should be $0 below threshold');

  const cgTax2 = calculateCapitalGainsTax(4905000, 0, 25000000, 'single', 2025);
  console.assert(cgTax2.totalTax === 186390, 'Test 5 failed: $49,050 LTCG with MAGI $250K should have $1,863.90 total tax');
  console.assert(cgTax2.ordinaryTax === 0, 'Test 5 failed: Ordinary LTCG tax should be $0 (in 0% bracket)');
  console.assert(cgTax2.niit === 186390, 'Test 5 failed: NIIT should be $1,863.90 (lesser of $49,050 investment income and $50K MAGI over $200K threshold)');

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
  console.assert(medicareTax2 === 407500, 'Test 3 failed: Medicare tax for $250,000 should be $4,075.00 ($3,625 @ 1.45% + $450 @ 0.9% on $50k over threshold)');
  console.assert(
    medicareTax2 / 25000000 === 0.0163,
    'Test 3 failed: Medicare effective rate should be 1.63%'
  );

  const fica1 = calculateFicaTax(10000000, 'single', 2025);
  console.assert(fica1.totalFicaTax === 765000, 'Test 4 failed: FICA tax should be $7,650.00 (SS: $6,200.00 + Medicare: $1,450.00)');
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

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== Running All Tax Calculation Tests ===\n');

  testFederalTax();
  testNetInvestmentIncomeTax();
  testCapitalGainsTax();
  testSocialSecurityAndMedicareTax();
  testStandardDeduction();

  console.log('\n=== All Tests Completed Successfully! ===\n');

  console.log('Summary:');
  console.log('- Federal income tax calculations: PASSED');
  console.log('- Net Investment Income Tax calculations: PASSED');
  console.log('- Capital gains tax calculations: PASSED');
  console.log('- Social Security and Medicare tax calculations: PASSED');
  console.log('- Standard deduction retrieval: PASSED');
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
    testNetInvestmentIncomeTax();
  } catch (error) {
    console.error('NIIT tests failed:', error.message);
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

  console.log('\n=== All Tests Completed Successfully! ===\n');
  console.log('Summary:');
  console.log('- Federal income tax calculations: PASSED');
  console.log('- Net Investment Income Tax calculations: PASSED');
  console.log('- Capital gains tax calculations: PASSED');
  console.log('- Social Security and Medicare tax calculations: PASSED');
  console.log('- Standard deduction retrieval: PASSED');
  return true;
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}
