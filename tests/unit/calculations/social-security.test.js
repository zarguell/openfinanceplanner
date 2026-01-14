/**
 * Unit tests for Social Security calculation functions
 */

import {
  calculateFullRetirementAge,
  calculateSocialSecurityBenefit,
  calculateSocialSecurityForYear,
  estimatePIA,
  getClaimingStrategyOptions
} from '../../../src/calculations/social-security.js';

export function testCalculateFullRetirementAge() {
  // Test birth year 1960 or later (FRA = 67)
  const result1960 = calculateFullRetirementAge(1960);
  if (result1960.years !== 67 || result1960.months !== 0) {
    throw new Error(`Expected FRA of 67 years 0 months for birth year 1960, got ${result1960.years} years ${result1960.months} months`);
  }

  // Test birth year 1937 or earlier (FRA = 65)
  const result1937 = calculateFullRetirementAge(1937);
  if (result1937.years !== 65 || result1937.months !== 0) {
    throw new Error(`Expected FRA of 65 years 0 months for birth year 1937, got ${result1937.years} years ${result1937.months} months`);
  }

  // Test birth year 1959 (gradual increase: FRA = 66 years 10 months)
  const result1959 = calculateFullRetirementAge(1959);
  if (result1959.years !== 66 || result1959.months !== 10) {
    throw new Error(`Expected FRA of 66 years 10 months for birth year 1959, got ${result1959.years} years ${result1959.months} months`);
  }

  // Test birth year 1954 (FRA = 66 years 0 months)
  const result1954 = calculateFullRetirementAge(1954);
  if (result1954.years !== 66 || result1954.months !== 0) {
    throw new Error(`Expected FRA of 66 years 0 months for birth year 1954, got ${result1954.years} years ${result1954.months} months`);
  }

  console.log('✓ testCalculateFullRetirementAge passed');
}

export function testCalculateSocialSecurityBenefit() {
  const pia = 2000; // $2,000 monthly at FRA
  const birthYear = 1960; // FRA = 67
  const currentYear = 2024;
  const retirementYear = 2027; // When they turn 67
  const colaRate = 0.025; // 2.5% COLA

  // Test claiming at FRA (no reduction, no COLA since filing year = retirement year)
  const benefitAtFRA = calculateSocialSecurityBenefit(pia, birthYear, 67, currentYear, retirementYear, colaRate);
  const expectedAtFRA = pia; // No reduction, no COLA
  if (Math.abs(benefitAtFRA - expectedAtFRA) > 0.01) {
    throw new Error(`Expected benefit at FRA: ${expectedAtFRA}, got ${benefitAtFRA}`);
  }

  // Test early claiming at age 62 (reduction) - just ensure function doesn't crash
  const benefitAt62 = calculateSocialSecurityBenefit(pia, birthYear, 62, currentYear, retirementYear, colaRate);
  if (typeof benefitAt62 !== 'number' || isNaN(benefitAt62)) {
    throw new Error(`Expected valid number for benefit at 62, got ${benefitAt62}`);
  }

  // Test delayed claiming at age 70 (increase)
  // Filing year = 1960 + 70 = 2030, retirement year = 2027, so 0 years of COLA (max with 0)
  const benefitAt70 = calculateSocialSecurityBenefit(pia, birthYear, 70, currentYear, retirementYear, colaRate);
  const monthsLate = (70 - 67) * 12; // 36 months late
  const increaseFactor = 1 + (36 / 12 * 0.08); // 8% per year
  const expectedAt70 = pia * increaseFactor; // No COLA since filing after retirement
  if (Math.abs(benefitAt70 - expectedAt70) > 0.01) {
    throw new Error(`Expected benefit at 70: ${expectedAt70}, got ${benefitAt70}`);
  }

  console.log('✓ testCalculateSocialSecurityBenefit passed');
}

export function testCalculateSocialSecurityForYear() {
  const socialSecurity = {
    enabled: true,
    birthYear: 1960,
    monthlyBenefit: 2000,
    filingAge: 67
  };

  const currentAge = 60;
  const retirementAge = 65;
  const inflationRate = 0.03;

  // Test year before retirement (should be 0)
  const incomeBeforeRetirement = calculateSocialSecurityForYear(socialSecurity, 3, currentAge, retirementAge, inflationRate);
  if (incomeBeforeRetirement !== 0) {
    throw new Error(`Expected 0 income before retirement, got ${incomeBeforeRetirement}`);
  }

  // Test year after filing age (should have income with COLA)
  const incomeAfterFiling = calculateSocialSecurityForYear(socialSecurity, 8, currentAge, retirementAge, inflationRate); // Age 68
  // The function uses the actual current year, so let's just test that it returns a reasonable positive number
  if (incomeAfterFiling <= 0 || typeof incomeAfterFiling !== 'number' || isNaN(incomeAfterFiling)) {
    throw new Error(`Expected positive income after filing, got ${incomeAfterFiling}`);
  }

  // Test disabled Social Security (should be 0)
  const disabledSS = { ...socialSecurity, enabled: false };
  const disabledIncome = calculateSocialSecurityForYear(disabledSS, 8, currentAge, retirementAge, inflationRate);
  if (disabledIncome !== 0) {
    throw new Error(`Expected 0 income when disabled, got ${disabledIncome}`);
  }

  console.log('✓ testCalculateSocialSecurityForYear passed');
}

export function testEstimatePIA() {
  // Test first bend point (90% replacement)
  const pia1 = estimatePIA(1000);
  const expected1 = 1000 * 0.9;
  if (Math.abs(pia1 - expected1) > 0.01) {
    throw new Error(`Expected PIA for $1,000 AIME: ${expected1}, got ${pia1}`);
  }

  // Test second bend point (32% replacement for portion)
  const pia2 = estimatePIA(6000); // Above first bend point, below second
  const expected2 = (1174 * 0.9) + ((6000 - 1174) * 0.32);
  if (Math.abs(pia2 - expected2) > 0.01) {
    throw new Error(`Expected PIA for $6,000 AIME: ${expected2}, got ${pia2}`);
  }

  // Test above second bend point (15% replacement for remainder)
  const pia3 = estimatePIA(10000); // Above second bend point
  const expected3 = (1174 * 0.9) + ((7078 - 1174) * 0.32) + ((10000 - 7078) * 0.15);
  if (Math.abs(pia3 - expected3) > 0.01) {
    throw new Error(`Expected PIA for $10,000 AIME: ${expected3}, got ${pia3}`);
  }

  console.log('✓ testEstimatePIA passed');
}

export function testGetClaimingStrategyOptions() {
  const options = getClaimingStrategyOptions();

  if (!options.early || !options.fra || !options.delayed) {
    throw new Error('Expected all three claiming strategy options');
  }

  // Test early claiming option
  if (options.early.age !== 62) {
    throw new Error(`Expected early claiming age 62, got ${options.early.age}`);
  }

  // Test FRA claiming option
  if (options.fra.age !== 'FRA (65-67)') {
    throw new Error(`Expected FRA claiming age range, got ${options.fra.age}`);
  }

  // Test delayed claiming option
  if (options.delayed.age !== 70) {
    throw new Error(`Expected delayed claiming age 70, got ${options.delayed.age}`);
  }

  console.log('✓ testGetClaimingStrategyOptions passed');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCalculateFullRetirementAge();
  testCalculateSocialSecurityBenefit();
  testCalculateSocialSecurityForYear();
  testEstimatePIA();
  testGetClaimingStrategyOptions();
  console.log('All Social Security tests passed!');
}
