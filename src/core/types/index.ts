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
export type TaxCharacteristics =
  | 'taxable'
  | 'tax-deferred'
  | 'tax-free'
  | 'tax-deductible'
  | 'non-deductible';

/**
 * Specific account types for tax-advantaged accounts
 */
export type TaxAdvantagedAccountType =
  | '401k'
  | '403b'
  | '457'
  | 'traditional-ira'
  | 'roth-ira'
  | 'rollover-ira'
  | 'inherited-traditional-ira'
  | 'inherited-roth-ira'
  | 'hsa'
  | 'sep-ira'
  | 'simple-ira'
  | 'defined-benefit'
  | 'employee-stock-option'
  | 'espp';

/**
 * Specific asset types for real assets
 */
export type RealAssetType =
  | 'primary-home'
  | 'rental-property'
  | 'vacation-home'
  | 'vehicle'
  | 'boat'
  | 'art'
  | 'jewelry'
  | 'business'
  | 'precious-metals'
  | 'other-real-asset';

/**
 * Specific liability types for debts
 */
export type LiabilityType =
  | 'mortgage'
  | 'student-loan'
  | 'credit-card'
  | 'auto-loan'
  | 'personal-loan'
  | 'business-loan'
  | 'medical-debt'
  | 'other-liability';

/**
 * Base account interface
 */
interface BaseAccount {
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
}

/**
 * Taxable investment account
 */
export type TaxableAccount = Readonly<
  BaseAccount & {
    type: 'taxable';
    taxCharacteristics: 'taxable';
    /** Financial institution name */
    institution?: string;
    /** Account number (masked) */
    accountNumber?: string;
    /** Cost basis for taxable investments */
    costBasis?: number;
    /** Contribution history */
    contributions?: ReadonlyArray<{
      year: number;
      amount: number;
      description?: string;
    }>;
  }
>;

/**
 * Tax-advantaged retirement account
 */
export type TaxAdvantagedAccount = Readonly<
  BaseAccount & {
    type: 'tax-advantaged';
    /** Specific account type */
    accountType: TaxAdvantagedAccountType;
    /** Financial institution name */
    institution?: string;
    /** Account number (masked) */
    accountNumber?: string;
    /** Annual contribution limit */
    contributionLimit?: number;
    /** Catch-up contribution amount (if eligible) */
    catchUpContribution?: number;
    /** Employer match information */
    employerMatch?: {
      percentage: number;
      limit: number;
    };
    /** Vesting schedule for employer contributions */
    vestingSchedule?: 'immediate' | 'graded' | 'cliff';
  }
>;

/**
 * Real asset account
 */
export type Asset = Readonly<
  BaseAccount & {
    type: 'real-assets';
    /** Specific asset type */
    assetType: RealAssetType;
    /** Purchase price of the asset */
    purchasePrice?: number;
    /** Purchase date of the asset */
    purchaseDate?: string;
    /** Annual appreciation rate percentage */
    appreciationRate?: number;
    /** Ongoing maintenance/expenses as percentage of value */
    ongoingExpenses?: number;
    /** Sale assumptions */
    saleAssumptions?: {
      timing: 'retirement' | 'specific-year' | 'never';
      year?: number;
      costBasisStepUp: boolean;
    };
  }
>;

/**
 * Liability account
 */
export type Liability = Readonly<
  BaseAccount & {
    type: 'debts';
    /** Specific liability type */
    liabilityType: LiabilityType;
    /** Interest rate percentage */
    interestRate: number;
    /** Start date of the liability */
    startDate?: string;
    /** End date/term of the liability */
    endDate?: string;
    /** Minimum monthly payment */
    minimumPayment?: number;
    /** Amortization schedule */
    amortizationType?: 'amortized' | 'interest-only' | 'revolving';
    /** Tax deductibility status */
    taxCharacteristics: 'tax-deductible' | 'non-deductible';
  }
>;

/**
 * Union type for all account types
 */
export type Account = TaxableAccount | TaxAdvantagedAccount | Asset | Liability;

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
