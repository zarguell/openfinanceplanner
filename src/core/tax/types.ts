import type { TaxRegion } from '@/core/types';

export type TaxJurisdictionType = 'federal' | 'state' | 'local';

export type FilingStatus =
  | 'single'
  | 'married-filing-jointly'
  | 'married-filing-separately'
  | 'head-of-household';

export type TaxStrategyType =
  | 'roth-conversion'
  | 'sepp-distribution'
  | 'tax-loss-harvesting'
  | 'location-based';

export interface TaxBracket {
  min: number;
  max?: number;
  rate: number;
}

export interface TaxJurisdiction {
  type: TaxJurisdictionType;
  countryCode: string;
  name: string;
  stateCode?: string;
  locality?: string;
}

export interface TaxConfig {
  year: number;
  filingStatus: FilingStatus;
  jurisdiction: TaxJurisdiction;
  ordinaryIncomeBrackets: readonly TaxBracket[];
  longTermCapitalGainsBrackets: readonly TaxBracket[];
  shortTermCapitalGainsRate: number;
  standardDeduction: number;
  personalExemption: number;
  specialRules: readonly TaxSpecialRule[];
}

export interface TaxSpecialRule {
  type: string;
  description: string;
  applicableYears: readonly number[];
  condition?: (income: number, context: unknown) => boolean;
}

export interface TaxCalculationResult {
  federalTax: number;
  ordinaryIncomeTax: number;
  capitalGainsTax: number;
  marginalRate: number;
  effectiveRate: number;
  stateTax?: number;
}

export interface TaxAnalytics {
  yearlyBreakdown: readonly TaxCalculationResult[];
  totalFederalTax: number;
  totalStateTax: number;
  totalTax: number;
  averageEffectiveRate: number;
  taxBurdenTrend: readonly number[];
  optimizationOpportunities: readonly TaxOptimizationOpportunity[];
}

export interface TaxOptimizationOpportunity {
  type: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
}

export interface TaxStrategy {
  type: TaxStrategyType;
  amount?: number;
  targetYear?: number;
  accountBalance?: number;
  lifeExpectancy?: number;
  description: string;
}

export interface FederalTaxParams {
  ordinaryIncome: number;
  capitalGains: number;
  deductions: number;
  year: number;
  filingStatus: FilingStatus;
  taxRegion: TaxRegion;
}

export interface StateTaxParams extends FederalTaxParams {
  stateCode?: string;
}

export interface TaxAnalyticsParams {
  ordinaryIncome: readonly number[];
  capitalGains: readonly number[];
  deductions: readonly number[];
  year: number;
  filingStatus: FilingStatus;
  taxRegion: TaxRegion;
}

function getFederalTaxConfig(
  year: number,
  filingStatus: FilingStatus
): TaxConfig {
  const standardDeductions: Record<FilingStatus, number> = {
    single: 14600,
    'married-filing-jointly': 29200,
    'married-filing-separately': 14600,
    'head-of-household': 21900,
  };

  const ordinaryBrackets: Record<FilingStatus, readonly TaxBracket[]> = {
    single: [
      { min: 0, max: 11600, rate: 10 },
      { min: 11600, max: 47150, rate: 12 },
      { min: 47150, max: 100525, rate: 22 },
      { min: 100525, max: 191950, rate: 24 },
      { min: 191950, max: 243725, rate: 32 },
      { min: 243725, max: 609350, rate: 35 },
      { min: 609350, max: undefined, rate: 37 },
    ],
    'married-filing-jointly': [
      { min: 0, max: 23200, rate: 10 },
      { min: 23200, max: 94300, rate: 12 },
      { min: 94300, max: 201050, rate: 22 },
      { min: 201050, max: 383900, rate: 24 },
      { min: 383900, max: 487450, rate: 32 },
      { min: 487450, max: 731200, rate: 35 },
      { min: 731200, max: undefined, rate: 37 },
    ],
    'married-filing-separately': [
      { min: 0, max: 11600, rate: 10 },
      { min: 11600, max: 47150, rate: 12 },
      { min: 47150, max: 100525, rate: 22 },
      { min: 100525, max: 191950, rate: 24 },
      { min: 191950, max: 243725, rate: 32 },
      { min: 243725, max: 365600, rate: 35 },
      { min: 365600, max: undefined, rate: 37 },
    ],
    'head-of-household': [
      { min: 0, max: 16550, rate: 10 },
      { min: 16550, max: 63100, rate: 12 },
      { min: 63100, max: 100500, rate: 22 },
      { min: 100500, max: 191950, rate: 24 },
      { min: 191950, max: 243700, rate: 32 },
      { min: 243700, max: 609350, rate: 35 },
      { min: 609350, max: undefined, rate: 37 },
    ],
  };

  const longTermCapGainsBrackets: Record<FilingStatus, readonly TaxBracket[]> =
    {
      single: [
        { min: 0, max: 47025, rate: 0 },
        { min: 47025, max: 518900, rate: 15 },
        { min: 518900, max: undefined, rate: 20 },
      ],
      'married-filing-jointly': [
        { min: 0, max: 94050, rate: 0 },
        { min: 94050, max: 583750, rate: 15 },
        { min: 583750, max: undefined, rate: 20 },
      ],
      'married-filing-separately': [
        { min: 0, max: 47025, rate: 0 },
        { min: 47025, max: 291875, rate: 15 },
        { min: 291875, max: undefined, rate: 20 },
      ],
      'head-of-household': [
        { min: 0, max: 63000, rate: 0 },
        { min: 63000, max: 551350, rate: 15 },
        { min: 551350, max: undefined, rate: 20 },
      ],
    };

  return {
    year,
    filingStatus,
    jurisdiction: {
      type: 'federal',
      countryCode: 'US',
      name: 'Federal',
    },
    ordinaryIncomeBrackets: ordinaryBrackets[filingStatus],
    longTermCapitalGainsBrackets: longTermCapGainsBrackets[filingStatus],
    shortTermCapitalGainsRate: 0,
    standardDeduction: standardDeductions[filingStatus],
    personalExemption: 0,
    specialRules: [],
  };
}

function getStateTaxConfig(
  year: number,
  filingStatus: FilingStatus,
  stateCode: string
): TaxConfig | null {
  const noTaxStates = ['TX', 'FL', 'NV', 'WA', 'WY', 'SD', 'AK', 'TN', 'NH'];

  if (noTaxStates.includes(stateCode)) {
    return null;
  }

  const stateConfigs: Record<string, Partial<TaxConfig>> = {
    CA: {
      ordinaryIncomeBrackets: [
        { min: 0, max: 10412, rate: 1 },
        { min: 10412, max: 24684, rate: 2 },
        { min: 24684, max: 38959, rate: 4 },
        { min: 38959, max: 54081, rate: 6 },
        { min: 54081, max: 68350, rate: 8 },
        { min: 68350, max: 349137, rate: 9.3 },
        { min: 349137, max: 418961, rate: 10.3 },
        { min: 418961, max: 698271, rate: 11.3 },
        { min: 698271, max: 1000000, rate: 12.3 },
        { min: 1000000, max: undefined, rate: 13.3 },
      ],
      longTermCapitalGainsBrackets: [],
      shortTermCapitalGainsRate: 13.3,
      standardDeduction: 0,
      personalExemption: 0,
      specialRules: [],
    },
    NY: {
      ordinaryIncomeBrackets: [
        { min: 0, max: 8500, rate: 4 },
        { min: 8500, max: 11700, rate: 4.5 },
        { min: 11700, max: 13900, rate: 5.25 },
        { min: 13900, max: 80650, rate: 5.5 },
        { min: 80650, max: 215400, rate: 6 },
        { min: 215400, max: 1077650, rate: 6.85 },
        { min: 1077650, max: 5000000, rate: 9.65 },
        { min: 5000000, max: 25000000, rate: 10.3 },
        { min: 25000000, max: undefined, rate: 10.9 },
      ],
      longTermCapitalGainsBrackets: [],
      shortTermCapitalGainsRate: 10.9,
      standardDeduction: 8000,
      personalExemption: 0,
      specialRules: [],
    },
  };

  const config = stateConfigs[stateCode];

  if (!config) {
    return null;
  }

  return {
    year,
    filingStatus,
    jurisdiction: {
      type: 'state',
      countryCode: 'US',
      name: stateCode,
      stateCode,
    },
    ordinaryIncomeBrackets: config.ordinaryIncomeBrackets ?? [],
    longTermCapitalGainsBrackets: config.longTermCapitalGainsBrackets ?? [],
    shortTermCapitalGainsRate: config.shortTermCapitalGainsRate ?? 0,
    standardDeduction: config.standardDeduction ?? 0,
    personalExemption: config.personalExemption ?? 0,
    specialRules: config.specialRules ?? [],
  };
}

export function getTaxBracketsForIncome(
  income: number,
  brackets: readonly TaxBracket[]
): readonly TaxBracket[] {
  const taxableIncome = Math.max(0, income);

  const applicableBrackets: TaxBracket[] = [];

  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      applicableBrackets.push(bracket);

      if (bracket.max !== undefined && taxableIncome <= bracket.max) {
        break;
      }
    }
  }

  return applicableBrackets;
}

export function calculateMarginalRate(
  income: number,
  brackets: readonly TaxBracket[]
): number {
  const applicableBrackets = getTaxBracketsForIncome(income, brackets);

  if (applicableBrackets.length === 0) {
    return 0;
  }

  return applicableBrackets[applicableBrackets.length - 1].rate;
}

export function calculateEffectiveRate(income: number, tax: number): number {
  if (income <= 0 || tax <= 0) {
    return 0;
  }

  return (tax / income) * 100;
}

export function calculateTaxInBrackets(
  taxableIncome: number,
  brackets: readonly TaxBracket[]
): number {
  let totalTax = 0;
  let remainingIncome = Math.max(0, taxableIncome);

  for (const bracket of brackets) {
    if (remainingIncome <= 0) {
      break;
    }

    const bracketMin = bracket.min;
    const bracketMax = bracket.max ?? Infinity;
    const bracketSize = bracketMax - bracketMin;

    const taxableInBracket = Math.min(remainingIncome, bracketSize);

    if (taxableInBracket > 0) {
      totalTax += taxableInBracket * (bracket.rate / 100);
      remainingIncome -= taxableInBracket;
    }
  }

  return totalTax;
}

export function calculateFederalTax(
  params: FederalTaxParams
): TaxCalculationResult {
  const { ordinaryIncome, capitalGains, deductions, year, filingStatus } =
    params;

  void params.taxRegion;

  const config = getFederalTaxConfig(year, filingStatus);

  const taxableIncome = Math.max(
    0,
    ordinaryIncome - config.standardDeduction - deductions
  );

  const ordinaryIncomeTax = calculateTaxInBrackets(
    taxableIncome,
    config.ordinaryIncomeBrackets
  );

  const capitalGainsTax = calculateTaxInBrackets(
    capitalGains,
    config.longTermCapitalGainsBrackets
  );

  const federalTax = ordinaryIncomeTax + capitalGainsTax;

  const totalIncome = taxableIncome + capitalGains;
  const marginalRate = calculateMarginalRate(
    totalIncome,
    config.ordinaryIncomeBrackets
  );
  const effectiveRate = calculateEffectiveRate(totalIncome, federalTax);

  return {
    federalTax,
    ordinaryIncomeTax,
    capitalGainsTax,
    marginalRate,
    effectiveRate,
  };
}

export function calculateStateTax(
  params: StateTaxParams
): TaxCalculationResult {
  const {
    ordinaryIncome,
    capitalGains,
    deductions,
    year,
    filingStatus,
    taxRegion,
  } = params;

  const stateCode = taxRegion.state ?? '';

  const config = getStateTaxConfig(year, filingStatus, stateCode);

  if (!config) {
    return {
      federalTax: 0,
      stateTax: 0,
      ordinaryIncomeTax: 0,
      capitalGainsTax: 0,
      marginalRate: 0,
      effectiveRate: 0,
    };
  }

  const taxableIncome = Math.max(
    0,
    ordinaryIncome - config.standardDeduction - deductions
  );

  const ordinaryIncomeTax = calculateTaxInBrackets(
    taxableIncome,
    config.ordinaryIncomeBrackets
  );

  const capitalGainsTax =
    capitalGains * (config.shortTermCapitalGainsRate / 100);

  const stateTax = ordinaryIncomeTax + capitalGainsTax;

  const totalIncome = taxableIncome + capitalGains;
  const marginalRate = calculateMarginalRate(
    totalIncome,
    config.ordinaryIncomeBrackets
  );
  const effectiveRate = calculateEffectiveRate(totalIncome, stateTax);

  return {
    federalTax: 0,
    stateTax,
    ordinaryIncomeTax,
    capitalGainsTax,
    marginalRate,
    effectiveRate,
  };
}

export function calculateTotalTax(
  federalResult: TaxCalculationResult,
  stateResult?: TaxCalculationResult
): TaxCalculationResult & { totalTax: number } {
  const stateTax = stateResult?.stateTax ?? 0;

  return {
    federalTax: federalResult.federalTax,
    ordinaryIncomeTax:
      federalResult.ordinaryIncomeTax + (stateResult?.ordinaryIncomeTax ?? 0),
    capitalGainsTax:
      federalResult.capitalGainsTax + (stateResult?.capitalGainsTax ?? 0),
    marginalRate: federalResult.marginalRate,
    effectiveRate: federalResult.effectiveRate,
    stateTax,
    totalTax: federalResult.federalTax + stateTax,
  };
}

export function analyzeTaxImpact(params: TaxAnalyticsParams): TaxAnalytics {
  const {
    ordinaryIncome,
    capitalGains,
    deductions,
    year,
    filingStatus,
    taxRegion,
  } = params;

  const years = ordinaryIncome.length;

  const yearlyBreakdown: TaxCalculationResult[] = [];

  let totalFederalTax = 0;
  let totalStateTax = 0;
  let totalIncome = 0;
  const taxBurdenTrend: number[] = [];

  for (let i = 0; i < years; i++) {
    const federal = calculateFederalTax({
      ordinaryIncome: ordinaryIncome[i],
      capitalGains: capitalGains[i],
      deductions: deductions[i],
      year: year + i,
      filingStatus,
      taxRegion,
    });

    const state = calculateStateTax({
      ordinaryIncome: ordinaryIncome[i],
      capitalGains: capitalGains[i],
      deductions: deductions[i],
      year: year + i,
      filingStatus,
      taxRegion,
    });

    totalFederalTax += federal.federalTax;
    totalStateTax += state.stateTax ?? 0;
    totalIncome += ordinaryIncome[i] + capitalGains[i];

    const totalForYear = calculateTotalTax(federal, state);
    taxBurdenTrend.push(totalForYear.totalTax);

    yearlyBreakdown.push({
      federalTax: federal.federalTax,
      ordinaryIncomeTax: federal.ordinaryIncomeTax + state.ordinaryIncomeTax,
      capitalGainsTax: federal.capitalGainsTax + state.capitalGainsTax,
      marginalRate: federal.marginalRate,
      effectiveRate: totalForYear.effectiveRate,
      stateTax: state.stateTax,
    });
  }

  const totalTax = totalFederalTax + totalStateTax;
  const averageEffectiveRate =
    totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  const optimizationOpportunities: TaxOptimizationOpportunity[] = [];

  if (deductions.some((d) => d === 0)) {
    optimizationOpportunities.push({
      type: 'itemized-deduction',
      description:
        'Consider itemizing deductions instead of using standard deduction',
      potentialSavings: 5000,
      priority: 'medium',
    });
  }

  const avgCapitalGains =
    capitalGains.reduce((sum, g) => sum + g, 0) / capitalGains.length;

  if (avgCapitalGains > 10000) {
    optimizationOpportunities.push({
      type: 'tax-loss-harvesting',
      description: 'Consider tax-loss harvesting to offset capital gains',
      potentialSavings: avgCapitalGains * 0.15,
      priority: 'high',
    });
  }

  if (yearlyBreakdown.length > 1) {
    const effectiveRates = yearlyBreakdown.map((y) => y.effectiveRate);
    const maxRate = Math.max(...effectiveRates);
    const minRate = Math.min(...effectiveRates);

    if (maxRate - minRate > 5) {
      optimizationOpportunities.push({
        type: 'income-smoothing',
        description:
          'Consider smoothing income across years to reduce tax burden',
        potentialSavings: totalTax * 0.05,
        priority: 'medium',
      });
    }
  }

  return {
    yearlyBreakdown,
    totalFederalTax,
    totalStateTax,
    totalTax,
    averageEffectiveRate,
    taxBurdenTrend,
    optimizationOpportunities,
  };
}
