/**
 * Storage schema definitions and version management
 * Handles migration between schema versions
 */

export const CURRENT_SCHEMA_VERSION = '1.0';

export const STORAGE_KEYS = {
  PLANS_LIST: 'ofp_plans_list',
  PLAN_PREFIX: 'ofp_plan_',
  APP_CONFIG: 'ofp_app_config',
  SCHEMA_VERSION: 'ofp_schema_version'
};

/**
 * Validate plan structure against schema requirements
 * @param {object} planData - Plan data to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validatePlanSchema(planData) {
  const errors = [];

  if (!planData.id || typeof planData.id !== 'string') {
    errors.push('Plan must have a valid id');
  }

  if (!planData.name || typeof planData.name !== 'string') {
    errors.push('Plan must have a valid name');
  }

  if (!planData.taxProfile || typeof planData.taxProfile !== 'object') {
    errors.push('Plan must have a taxProfile object');
  }

  // MVP: Use estimatedTaxRate instead of detailed tax calculations
  if (typeof planData.taxProfile.estimatedTaxRate !== 'number' || planData.taxProfile.estimatedTaxRate < 0 || planData.taxProfile.estimatedTaxRate > 1) {
    errors.push('taxProfile.estimatedTaxRate must be a number between 0 and 1 (e.g., 0.25 for 25%)');
  }

  // Optional: Keep state field for future advanced features
  if (planData.taxProfile.state !== null && planData.taxProfile.state !== undefined && (typeof planData.taxProfile.state !== 'string' || planData.taxProfile.state === '')) {
    errors.push('taxProfile.state must be a string (e.g., "DC", "CA", "NY") or null');
  }

  if (planData.taxProfile.state !== null && planData.taxProfile.state !== undefined && ![
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ].includes(planData.taxProfile.state)) {
    errors.push('taxProfile.state must be a valid 2-letter US state or territory code, or null');
  }

  if (!planData.assumptions || typeof planData.assumptions !== 'object') {
    errors.push('Plan must have an assumptions object');
  }

  // Validate growth rates
  if (typeof planData.assumptions.equityGrowthRate !== 'number' || planData.assumptions.equityGrowthRate < -0.5 || planData.assumptions.equityGrowthRate > 0.5) {
    errors.push('assumptions.equityGrowthRate must be a number between -50% and 50%');
  }

  if (typeof planData.assumptions.inflationRate !== 'number' || planData.assumptions.inflationRate < -0.1 || planData.assumptions.inflationRate > 0.2) {
    errors.push('assumptions.inflationRate must be a number between -10% and 20%');
  }

  // Validate volatility (optional, defaults provided)
  if (planData.assumptions.equityVolatility !== undefined && (typeof planData.assumptions.equityVolatility !== 'number' || planData.assumptions.equityVolatility < 0 || planData.assumptions.equityVolatility > 1)) {
    errors.push('assumptions.equityVolatility must be a number between 0 and 100% (1.0)');
  }

  if (planData.assumptions.bondVolatility !== undefined && (typeof planData.assumptions.bondVolatility !== 'number' || planData.assumptions.bondVolatility < 0 || planData.assumptions.bondVolatility > 1)) {
    errors.push('assumptions.bondVolatility must be a number between 0 and 100% (1.0)');
  }

  if (planData.assumptions.bondGrowthRate !== undefined && (typeof planData.assumptions.bondGrowthRate !== 'number' || planData.assumptions.bondGrowthRate < -0.5 || planData.assumptions.bondGrowthRate > 0.5)) {
    errors.push('assumptions.bondGrowthRate must be a number between -50% and 50%');
  }

  // Validate socialSecurity (optional, defaults provided)
  if (planData.socialSecurity !== undefined && typeof planData.socialSecurity !== 'object') {
    errors.push('socialSecurity must be an object if provided');
  }

  if (planData.socialSecurity) {
    if (typeof planData.socialSecurity.enabled !== 'boolean') {
      errors.push('socialSecurity.enabled must be a boolean');
    }

    if (planData.socialSecurity.birthYear !== undefined && (typeof planData.socialSecurity.birthYear !== 'number' || planData.socialSecurity.birthYear < 1900 || planData.socialSecurity.birthYear > 2100)) {
      errors.push('socialSecurity.birthYear must be a number between 1900 and 2100');
    }

    if (planData.socialSecurity.monthlyBenefit !== undefined && (typeof planData.socialSecurity.monthlyBenefit !== 'number' || planData.socialSecurity.monthlyBenefit < 0 || planData.socialSecurity.monthlyBenefit > 5000)) {
      errors.push('socialSecurity.monthlyBenefit must be a number between 0 and 5000');
    }

    if (planData.socialSecurity.filingAge !== undefined && (typeof planData.socialSecurity.filingAge !== 'number' || planData.socialSecurity.filingAge < 62 || planData.socialSecurity.filingAge > 70)) {
      errors.push('socialSecurity.filingAge must be a number between 62 and 70');
    }
  }

  if (!Array.isArray(planData.accounts)) {
    errors.push('Plan must have an accounts array');
  }

  if (!Array.isArray(planData.expenses)) {
    errors.push('Plan must have an expenses array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Migrate plan data to current schema version
 * @param {object} planData - Plan data to migrate
 * @param {string} fromVersion - Source schema version
 * @returns {object} Migrated plan data
 */
export function migratePlan(planData, fromVersion) {
  // For now, no migrations needed (v1.0 is initial version)
  // Future: Add migration logic here when schema evolves

  return planData;
}
