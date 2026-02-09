/**
 * Household status options
 */
export type HouseholdStatus = 'single' | 'married' | 'partnered' | 'other';

/**
 * Location information
 */
export type Location = Readonly<{
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
  /** State or province */
  state?: string;
  /** City or locality */
  city?: string;
}>;

/**
 * Account types for financial planning
 */
export type AccountType =
  | 'taxable'
  | 'tax-advantaged'
  | 'real-assets'
  | 'debts';

/**
 * Tax characteristics for accounts
 */
export type TaxCharacteristics = 'taxable' | 'tax-deferred' | 'tax-free';

/**
 * Individual account information
 */
export type Account = Readonly<{
  /** Unique identifier for the account */
  id: string;
  /** Display name for the account */
  name: string;
  /** Type of account */
  type: AccountType;
  /** Current balance in the account */
  balance: number;
  /** Tax characteristics of the account */
  taxCharacteristics: TaxCharacteristics;
  /** Additional account-specific properties can be added here */
}>;

/**
 * Tax region information
 */
export type TaxRegion = Readonly<{
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
  /** State or province */
  state?: string;
  /** Locality or municipality */
  locality?: string;
}>;

/**
 * User profile data for financial projection
 *
 * All properties are readonly to ensure immutability in pure functions.
 * Annual growth rate is expressed as a percentage (e.g., 7.5 for 7.5%).
 */
export type UserProfile = Readonly<{
  /** Current age in years (0-100) */
  age: number;
  /** Total current savings/investments in dollars */
  currentSavings: number;
  /** Expected annual growth rate as percentage (e.g., 7.5 for 7.5%) */
  annualGrowthRate: number;
  /** Annual spending/withdrawal amount in dollars */
  annualSpending: number;
  /** Household status */
  householdStatus?: HouseholdStatus;
  /** User location information */
  location?: Location;
  /** Collection of user accounts */
  accounts?: Account[];
  /** Tax region information */
  taxRegion?: TaxRegion;
  /** Currency preference */
  currency?: string;
}>;

/**
 * Single year simulation result
 *
 * Represents the financial state for one year of the projection.
 * All properties are readonly to ensure immutability.
 */
export type SimulationResult = Readonly<{
  /** Year index (0 = first year of projection) */
  year: number;
  /** Age at the end of this year */
  age: number;
  /** Starting balance for this year */
  startingBalance: number;
  /** Investment growth earned this year */
  growth: number;
  /** Amount spent/withdrawn this year */
  spending: number;
  /** Ending balance after growth and spending */
  endingBalance: number;
}>;
