/**
 * Loader module for contribution limit, annual limit, and age-related config files.
 * Provides functions to read retirement account contribution limits and age thresholds from config.
 */

// Embedded limit data (config/limits.json embedded for ES6 compatibility)
const limitsData = {
  2024: {
    '401k': {
      employeeDeferralLimit: 23000,
      totalContributionLimit: 69000,
      catchupLimit: 7500,
    },
    ira: {
      contributionLimit: 7000,
      catchupLimit: 1000,
    },
    qcd: {
      annualLimit: 100000,
    },
  },
  2025: {
    '401k': {
      employeeDeferralLimit: 23500,
      totalContributionLimit: 76000,
      catchupLimit: 7500,
    },
    ira: {
      contributionLimit: 7000,
      catchupLimit: 1000,
    },
    qcd: {
      annualLimit: 100000,
    },
  },
};

/**
 * Get contribution limit for an account type
 * @param {string} accountType - Account type ('401k' or 'ira')
 * @param {number} year - Tax year (2024 or 2025, default: 2025)
 * @param {boolean} includeCatchup - Whether to include catch-up contribution (default: false)
 * @returns {number} Contribution limit in cents
 */
export function getContributionLimit(accountType, year = 2025, includeCatchup = false) {
  const yearData = limitsData[year] || limitsData['2025'];
  const accountLimits = yearData[accountType];

  if (!accountLimits) {
    throw new Error(`Unknown account type: ${accountType}`);
  }

  let limit = accountLimits.employeeDeferralLimit || accountLimits.contributionLimit;

  if (includeCatchup && accountLimits.catchupLimit) {
    limit += accountLimits.catchupLimit;
  }

  return limit * 100; // Convert dollars to cents
}

/**
 * Get total contribution limit for an account type (including employer contributions)
 * @param {string} accountType - Account type ('401k')
 * @param {number} year - Tax year (2024 or 2025, default: 2025)
 * @returns {number} Total contribution limit in cents
 */
export function getTotalContributionLimit(accountType, year = 2025) {
  const yearData = limitsData[year] || limitsData['2025'];
  const accountLimits = yearData[accountType];

  if (!accountLimits || !accountLimits.totalContributionLimit) {
    throw new Error(`Total limit not available for ${accountType}`);
  }

  return accountLimits.totalContributionLimit * 100;
}

/**
 * Get QCD (Qualified Charitable Distribution) annual limit
 * @param {number} year - Tax year (2024 or 2025, default: 2025)
 * @returns {number} QCD annual limit in cents
 */
export function getQCDLimit(year = 2025) {
  const yearData = limitsData[year] || limitsData['2025'];
  return yearData.qcd.annualLimit * 100;
}

// Embedded age data (config/ages.json embedded for ES6 compatibility)
const agesData = {
  rmd: {
    startAge: 73,
    secureActTransitionAge: 72,
    secureActTransitionBirthYear: 1951
  },
  fullRetirementAge: {
    "1937": { "years": 65, "months": 0 },
    "1938": { "years": 65, "months": 2 },
    "1939": { "years": 65, "months": 4 },
    "1940": { "years": 65, "months": 6 },
    "1941": { "years": 65, "months": 8 },
    "1942": { "years": 65, "months": 10 },
    "1943": { "years": 66, "months": 0 },
    "1944": { "years": 66, "months": 0 },
    "1945": { "years": 66, "months": 0 },
    "1946": { "years": 66, "months": 0 },
    "1947": { "years": 66, "months": 0 },
    "1948": { "years": 66, "months": 0 },
    "1949": { "years": 66, "months": 0 },
    "1950": { "years": 66, "months": 0 },
    "1951": { "years": 66, "months": 0 },
    "1952": { "years": 66, "months": 2 },
    "1953": { "years": 66, "months": 4 },
    "1954": { "years": 66, "months": 0 },
    "1955": { "years": 66, "months": 2 },
    "1956": { "years": 66, "months": 4 },
    "1957": { "years": 66, "months": 6 },
    "1958": { "years": 66, "months": 8 },
    "1959": { "years": 66, "months": 10 },
    "default": { "years": 67, "months": 0 }
  },
  lifeExpectancy: {
    "72": 27.4,
    "73": 26.5,
    "74": 25.5,
    "75": 24.6,
    "76": 23.7,
    "77": 22.9,
    "78": 22.0,
    "79": 21.1,
    "80": 20.2,
    "81": 19.4,
    "82": 18.5,
    "83": 17.7,
    "84": 16.8,
    "85": 16.0,
    "86": 15.2,
    "87": 14.4,
    "88": 13.7,
    "89": 12.9,
    "90": 12.2,
    "91": 11.5,
    "92": 10.8,
    "93": 10.1,
    "94": 9.5,
    "95": 8.9,
    "96": 8.4,
    "97": 7.8,
    "98": 7.3,
    "99": 6.8,
    "100": 6.4,
    "101": 6.0,
    "102": 5.6,
    "103": 5.2,
    "104": 4.9,
    "105": 4.6,
    "106": 4.3,
    "107": 4.0,
    "108": 3.7,
    "109": 3.5,
    "110": 3.4,
    "111": 3.3,
    "112": 3.1,
    "113": 3.0,
    "114": 2.9,
    "115": 2.8,
    "116": 2.7,
    "117": 2.5,
    "118": 2.3,
    "119": 2.1,
    "120": 1.9
  }
};

/**
 * Get RMD start age based on birth year
 * @param {number} birthYear - Year of birth (optional)
 * @returns {number} RMD start age (72 or 73)
 */
export function getRMDStartAge(birthYear) {
  if (!birthYear) {
    return agesData.rmd.startAge;
  }

  if (birthYear === agesData.rmd.secureActTransitionBirthYear) {
    return agesData.rmd.secureActTransitionAge;
  }

  return agesData.rmd.startAge;
}

/**
 * Get Full Retirement Age (FRA) based on birth year
 * @param {number} birthYear - Year of birth
 * @returns {object} { years: number, months: number } - FRA in years and months
 */
export function getFullRetirementAge(birthYear) {
  if (!birthYear || birthYear >= 1960) {
    return agesData.fullRetirementAge.default;
  }

  return agesData.fullRetirementAge[birthYear] || agesData.fullRetirementAge.default;
}

/**
 * Get life expectancy factor for RMD calculations (IRS Uniform Lifetime Table)
 * @param {number} age - Current age
 * @returns {number|null} Life expectancy factor or null if age < 72
 */
export function getLifeExpectancyFactor(age) {
  if (age < 72) {
    return null;
  }

  if (age > 120) {
    age = 120;
  }

  return agesData.lifeExpectancy[age] || null;
}

// Embedded default rates (config/defaults.json embedded for ES6 compatibility)
const defaultsData = {
  growth: {
    inflationRate: 0.03,
    equityGrowthRate: 0.07,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04
  },
  tax: {
    federalRate: 0.24,
    estimatedTaxRate: 0.25,
    niitRate: 0.038,
    medicareBaseRate: 0.0145,
    medicareAdditionalRate: 0.009,
    longTermGainsRate: 0.15
  },
  strategies: {
    rothConversions: {
      defaultPercentage: 0.05,
      assumedGrowthRate: 0.07
    },
    qcd: {
      defaultPercentage: 0.1,
      marginalTaxRate: 0.24
    }
  }
};

/**
 * Get default inflation rate
 * @returns {number} Default inflation rate
 */
export function getDefaultInflationRate() {
  return defaultsData.growth.inflationRate;
}

/**
 * Get default equity growth rate
 * @returns {number} Default equity growth rate
 */
export function getDefaultEquityGrowthRate() {
  return defaultsData.growth.equityGrowthRate;
}

/**
 * Get default bond growth rate
 * @returns {number} Default bond growth rate
 */
export function getDefaultBondGrowthRate() {
  return defaultsData.growth.bondGrowthRate;
}

/**
 * Get default volatility for asset type
 * @param {string} assetType - 'equity' or 'bond'
 * @returns {number} Default volatility rate
 */
export function getDefaultVolatility(assetType) {
  if (assetType === 'equity') {
    return defaultsData.growth.equityVolatility;
  }
  if (assetType === 'bond') {
    return defaultsData.growth.bondVolatility;
  }
  throw new Error(`Unknown asset type: ${assetType}`);
}

/**
 * Get default federal tax rate
 * @returns {number} Default federal tax rate
 */
export function getDefaultTaxRate() {
  return defaultsData.tax.federalRate;
}

/**
 * Get Medicare tax rates (base + additional)
 * @returns {object} { baseRate, additionalRate }
 */
export function getMedicareRates() {
  return {
    baseRate: defaultsData.tax.medicareBaseRate,
    additionalRate: defaultsData.tax.medicareAdditionalRate
  };
}
