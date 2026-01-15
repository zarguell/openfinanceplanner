/**
 * Social Security benefit calculations - Pure functions
 * Based on SSA formulas and rules as of 2024/2025
 */

/**
 * Calculate Full Retirement Age (FRA) based on birth year
 * @param {number} birthYear - Year of birth
 * @returns {object} { years: number, months: number } - FRA in years and months
 */
export function calculateFullRetirementAge(birthYear) {
  if (birthYear <= 1937) {
    return { years: 65, months: 0 };
  } else if (birthYear >= 1960) {
    return { years: 67, months: 0 };
  } else if (birthYear >= 1943 && birthYear <= 1954) {
    return { years: 66, months: 0 };
  } else if (birthYear === 1955) {
    return { years: 66, months: 2 };
  } else if (birthYear === 1956) {
    return { years: 66, months: 4 };
  } else if (birthYear === 1957) {
    return { years: 66, months: 6 };
  } else if (birthYear === 1958) {
    return { years: 66, months: 8 };
  } else if (birthYear === 1959) {
    return { years: 66, months: 10 };
  } else if (birthYear >= 1938 && birthYear <= 1942) {
    const months = (birthYear - 1937) * 2;
    return { years: 65, months: months };
  }

  return { years: 67, months: 0 };
}

/**
 * Convert FRA object to total months
 * @param {object} fra - FRA object with years and months
 * @returns {number} Total months
 */
function fraToMonths(fra) {
  return fra.years * 12 + fra.months;
}

/**
 * Calculate Social Security benefit for a given filing age
 * @param {number} pia - Primary Insurance Amount (monthly benefit at FRA in dollars)
 * @param {number} birthYear - Year of birth
 * @param {number} filingAge - Age at which benefits will be claimed
 * @param {number} currentYear - Current year for COLA calculations
 * @param {number} retirementYear - Year when retirement begins
 * @param {number} colaRate - Annual Cost of Living Adjustment rate (default 0.025 or 2.5%)
 * @returns {number} Monthly benefit amount in current dollars
 */
export function calculateSocialSecurityBenefit(
  pia,
  birthYear,
  filingAge,
  currentYear,
  retirementYear,
  colaRate = 0.025
) {
  const fra = calculateFullRetirementAge(birthYear);
  const fraMonths = fraToMonths(fra);
  const filingMonths = filingAge * 12;

  let benefitMultiplier = 1.0;

  if (filingMonths < fraMonths) {
    // Early filing reduction: 5/9% per month for first 36 months, 5/12% thereafter
    const monthsEarly = fraMonths - filingMonths;
    if (monthsEarly <= 36) {
      benefitMultiplier = 1 - monthsEarly * 0.055; // 5.5% per month for first 36 months
    } else {
      const first36Reduction = 36 * 0.055;
      const remainingMonths = monthsEarly - 36;
      const additionalReduction = remainingMonths * (5 / 12 / 100); // 5/12% per month thereafter
      benefitMultiplier = 1 - first36Reduction - additionalReduction;
    }
  } else if (filingMonths > fraMonths) {
    // Delayed retirement credits: 8% per year (2/3% per month)
    const monthsLate = filingMonths - fraMonths;
    const yearsLate = monthsLate / 12;
    benefitMultiplier = 1 + yearsLate * 0.08;
  }

  // Apply COLA from filing year to retirement year
  // Filing year = birthYear + filingAge
  // Years of COLA = retirementYear - filingYear
  const filingYear = birthYear + filingAge;
  const yearsOfCOLA = Math.max(0, retirementYear - filingYear);
  const colaMultiplier = Math.pow(1 + colaRate, yearsOfCOLA);

  return pia * benefitMultiplier * colaMultiplier;
}

/**
 * Calculate Social Security benefit amount for a given year in retirement
 * @param {object} socialSecurity - Social Security profile object
 * @param {number} yearOffset - Years from current year
 * @param {number} currentAge - Current age
 * @param {number} retirementAge - Retirement age
 * @param {number} inflationRate - Annual inflation rate for COLA approximation
 * @returns {number} Annual Social Security benefit in dollars
 */
export function calculateSocialSecurityForYear(
  socialSecurity,
  yearOffset,
  currentAge,
  retirementAge,
  inflationRate = 0.03
) {
  if (!socialSecurity || !socialSecurity.enabled) {
    return 0;
  }

  const age = currentAge + yearOffset;
  const retirementYearOffset = retirementAge - currentAge;

  // Only start payments at retirement or when they start claiming
  const claimingAge = socialSecurity.filingAge || retirementAge;
  if (age < claimingAge) {
    return 0;
  }

  // Calculate the benefit amount
  const benefitAmount = calculateSocialSecurityBenefit(
    socialSecurity.monthlyBenefit,
    socialSecurity.birthYear,
    claimingAge,
    new Date().getFullYear(),
    new Date().getFullYear() + retirementYearOffset,
    inflationRate // Use inflation rate as COLA approximation
  );

  // Return annual amount (12 * monthly benefit)
  return benefitAmount * 12;
}

/**
 * Estimate Primary Insurance Amount (PIA) based on Average Indexed Monthly Earnings (AIME)
 * This is a simplified estimation - in reality, PIA is calculated from actual earnings history
 * @param {number} averageIndexedEarnings - Average Indexed Monthly Earnings (AIME)
 * @returns {number} Estimated monthly PIA in current dollars
 */
export function estimatePIA(averageIndexedEarnings) {
  // 2024/2025 PIA formula (bend points updated annually)
  // First $1,174: 90% replacement
  // $1,174 to $7,078: 32% replacement
  // Over $7,078: 15% replacement

  const bendPoint1 = 1174; // First bend point
  const bendPoint2 = 7078; // Second bend point

  let pia = 0;

  if (averageIndexedEarnings <= bendPoint1) {
    pia = averageIndexedEarnings * 0.9;
  } else if (averageIndexedEarnings <= bendPoint2) {
    pia = bendPoint1 * 0.9 + (averageIndexedEarnings - bendPoint1) * 0.32;
  } else {
    pia =
      bendPoint1 * 0.9 +
      (bendPoint2 - bendPoint1) * 0.32 +
      (averageIndexedEarnings - bendPoint2) * 0.15;
  }

  return pia;
}

/**
 * Calculate taxable portion of Social Security benefits
 * @param {number} annualSSBenefit - Annual Social Security benefit amount
 * @param {number} provisionalIncome - Provisional income (AGI + tax-exempt interest + 50% of SS)
 * @param {string} filingStatus - Tax filing status
 * @returns {object} { taxableAmount: number, effectiveTaxRate: number }
 */
export function calculateTaxableSocialSecurity(annualSSBenefit, provisionalIncome, filingStatus) {
  let taxableAmount = 0;

  const thresholds =
    filingStatus === 'married_joint'
      ? { first: 32000, second: 44000 }
      : { first: 25000, second: 34000 };

  if (provisionalIncome > thresholds.second) {
    taxableAmount = Math.min(annualSSBenefit * 0.85, annualSSBenefit);
  } else if (provisionalIncome > thresholds.first) {
    taxableAmount = Math.min(
      annualSSBenefit * 0.5 + (provisionalIncome - thresholds.first) * 0.5,
      annualSSBenefit
    );
  }

  return {
    taxableAmount: Math.round(taxableAmount),
    effectiveTaxRate: annualSSBenefit > 0 ? taxableAmount / annualSSBenefit : 0,
  };
}

/**
 * Get typical Social Security claiming ages
 * @returns {object} Object with common claiming ages and their implications
 */
export function getClaimingStrategyOptions() {
  return {
    early: {
      age: 62,
      reduction: 'Up to 30% reduction from FRA benefit',
      description: 'Maximum months of benefits, but reduced amount',
    },
    fra: {
      age: 'FRA (65-67)',
      reduction: 'No reduction, full benefit amount',
      description: 'Balanced approach - full benefits when you need them',
    },
    delayed: {
      age: 70,
      reduction: 'Up to 32% increase from FRA benefit',
      description: 'Higher monthly benefit, fewer years of payments',
    },
  };
}
