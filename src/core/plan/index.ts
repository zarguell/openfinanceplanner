import type {
  Plan,
  PlanType,
  InflationSettings,
  SocialSecuritySettings,
  RMDSettings,
  AccountGrowthRates,
  WithdrawalStrategy,
} from '../types';

// Define types for our plan assumptions structure
interface GrowthModel {
  defaultRate: number;
  accountGrowthRates?: AccountGrowthRates;
}

interface WithdrawalRules {
  strategy: WithdrawalStrategy;
  retirementAge: number;
  maxProjectionYears: number;
}

/**
 * Validates a plan configuration
 * @param plan - The plan to validate
 * @returns True if the plan is valid, false otherwise
 */
export function validatePlan(plan: Plan): boolean {
  // Validate basic properties
  if (!plan.id || plan.id.trim() === '') {
    return false;
  }

  if (!plan.name || plan.name.trim() === '') {
    return false;
  }

  if (!isValidPlanType(plan.type)) {
    return false;
  }

  if (!isValidDate(plan.startDate)) {
    return false;
  }

  if (plan.timeHorizon <= 0) {
    return false;
  }

  // Validate assumptions
  if (!validateInflationSettings(plan.assumptions.inflation)) {
    return false;
  }

  if (!validateGrowthModel(plan.assumptions.growthModel)) {
    return false;
  }

  if (!validateWithdrawalRules(plan.assumptions.withdrawalRules)) {
    return false;
  }

  // Validate optional settings if present
  if (
    plan.assumptions.socialSecurity &&
    !validateSocialSecuritySettings(plan.assumptions.socialSecurity)
  ) {
    return false;
  }

  if (
    plan.assumptions.rmdSettings &&
    !validateRMDSettings(plan.assumptions.rmdSettings)
  ) {
    return false;
  }

  return true;
}

/**
 * Checks if a plan type is valid
 * @param type - The plan type to validate
 * @returns True if the type is valid, false otherwise
 */
function isValidPlanType(type: PlanType): boolean {
  return type === 'fixed-date' || type === 'rolling';
}

/**
 * Validates a date string
 * @param date - The date string to validate
 * @returns True if the date is valid, false otherwise
 */
function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Validates inflation settings
 * @param inflation - The inflation settings to validate
 * @returns True if valid, false otherwise
 */
function validateInflationSettings(inflation: InflationSettings): boolean {
  if (typeof inflation.rate !== 'number' || inflation.rate < 0) {
    return false;
  }

  if (typeof inflation.adjustSpending !== 'boolean') {
    return false;
  }

  if (typeof inflation.adjustGrowth !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Validates growth model settings
 * @param growthModel - The growth model to validate
 * @returns True if valid, false otherwise
 */
function validateGrowthModel(growthModel: GrowthModel): boolean {
  if (
    typeof growthModel.defaultRate !== 'number' ||
    growthModel.defaultRate < 0 ||
    growthModel.defaultRate > 100
  ) {
    return false;
  }

  // Account growth rates are optional but if present, validate them
  if (growthModel.accountGrowthRates) {
    if (typeof growthModel.accountGrowthRates !== 'object') {
      return false;
    }

    for (const rate of Object.values(growthModel.accountGrowthRates)) {
      if (typeof rate !== 'number' || rate < 0 || rate > 100) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates withdrawal rules
 * @param withdrawalRules - The withdrawal rules to validate
 * @returns True if valid, false otherwise
 */
function validateWithdrawalRules(withdrawalRules: WithdrawalRules): boolean {
  const validStrategies = ['sequential', 'proportional', 'tax-efficient'];
  if (!validStrategies.includes(withdrawalRules.strategy)) {
    return false;
  }

  if (
    typeof withdrawalRules.retirementAge !== 'number' ||
    withdrawalRules.retirementAge <= 0
  ) {
    return false;
  }

  if (
    typeof withdrawalRules.maxProjectionYears !== 'number' ||
    withdrawalRules.maxProjectionYears <= 0
  ) {
    return false;
  }

  return true;
}

/**
 * Validates Social Security settings
 * @param socialSecurity - The Social Security settings to validate
 * @returns True if valid, false otherwise
 */
function validateSocialSecuritySettings(
  socialSecurity: SocialSecuritySettings
): boolean {
  if (
    typeof socialSecurity.startAge !== 'number' ||
    socialSecurity.startAge <= 0
  ) {
    return false;
  }

  if (
    typeof socialSecurity.monthlyBenefit !== 'number' ||
    socialSecurity.monthlyBenefit < 0
  ) {
    return false;
  }

  if (typeof socialSecurity.inflationAdjusted !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Validates RMD settings
 * @param rmdSettings - The RMD settings to validate
 * @returns True if valid, false otherwise
 */
function validateRMDSettings(rmdSettings: RMDSettings): boolean {
  if (
    typeof rmdSettings.rmdStartAge !== 'number' ||
    rmdSettings.rmdStartAge <= 0
  ) {
    return false;
  }

  const validTables = ['uniform', 'joint'];
  if (!validTables.includes(rmdSettings.rmdTable)) {
    return false;
  }

  return true;
}

/**
 * Creates a new plan with default values
 * @param id - The plan ID
 * @param name - The plan name
 * @param type - The plan type
 * @param startDate - The start date
 * @param timeHorizon - The time horizon in years
 * @returns A new Plan object
 */
export function createPlan(
  id: string,
  name: string,
  type: PlanType,
  startDate: string,
  timeHorizon: number
): Plan {
  return {
    id,
    name,
    type,
    startDate,
    timeHorizon,
    assumptions: {
      inflation: {
        rate: 2.5,
        adjustSpending: true,
        adjustGrowth: true,
      },
      growthModel: {
        defaultRate: 7.0,
      },
      withdrawalRules: {
        strategy: 'tax-efficient',
        retirementAge: 65,
        maxProjectionYears: 30,
      },
    },
  };
}

/**
 * Updates plan assumptions
 * @param plan - The plan to update
 * @param assumptions - The new assumptions
 * @returns A new Plan object with updated assumptions
 */
export function updatePlanAssumptions(
  plan: Plan,
  assumptions: Partial<Plan['assumptions']>
): Plan {
  return {
    ...plan,
    assumptions: {
      ...plan.assumptions,
      ...assumptions,
    },
  };
}
