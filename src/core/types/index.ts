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
 * Inflation settings for projection
 */
export type InflationSettings = Readonly<{
  /** Annual inflation rate as percentage (e.g., 2.5 for 2.5%) */
  rate: number;
  /** Whether to adjust spending for inflation */
  adjustSpending: boolean;
  /** Whether to adjust growth rates for inflation */
  adjustGrowth: boolean;
}>;

/**
 * Tax settings for projection
 */
export type TaxSettings = Readonly<{
  /** Ordinary income tax rate as percentage */
  ordinaryIncomeRate: number;
  /** Capital gains tax rate as percentage */
  capitalGainsRate: number;
  /** Whether to apply taxes to withdrawals */
  applyTaxes: boolean;
}>;

/**
 * Withdrawal strategy for retirement accounts
 */
export type WithdrawalStrategy =
  | 'sequential'
  | 'proportional'
  | 'tax-efficient';

/**
 * Social Security settings
 */
export type SocialSecuritySettings = Readonly<{
  /** Age to start claiming benefits */
  startAge: number;
  /** Monthly benefit amount in dollars */
  monthlyBenefit: number;
  /** Whether benefits are inflation-adjusted */
  inflationAdjusted: boolean;
}>;

/**
 * Required Minimum Distribution settings
 */
export type RMDSettings = Readonly<{
  /** Age when RMDs start */
  rmdStartAge: number;
  /** IRS table type */
  rmdTable: 'uniform' | 'joint';
}>;

/**
 * Account-specific growth rates
 */
export type AccountGrowthRates = Readonly<Record<string, number>>;

/**
 * Enhanced projection settings
 */
export type ProjectionSettings = Readonly<{
  /** Inflation settings */
  inflation: InflationSettings;
  /** Tax settings */
  tax: TaxSettings;
  /** Withdrawal strategy */
  withdrawalStrategy: WithdrawalStrategy;
  /** Retirement age */
  retirementAge: number;
  /** Maximum projection years */
  maxProjectionYears: number;
  /** Social Security settings */
  socialSecurity?: SocialSecuritySettings;
  /** Required Minimum Distribution settings */
  rmdSettings?: RMDSettings;
  /** Account-specific growth rates */
  accountGrowthRates?: AccountGrowthRates;
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
  /** Inflation-adjusted values */
  inflationAdjusted?: {
    startingBalance: number;
    spending: number;
    endingBalance: number;
  };
  /** Tax implications for the year */
  taxImpact?: {
    ordinaryIncomeTax: number;
    capitalGainsTax: number;
    totalTax: number;
  };
  /** Account-specific breakdown */
  accountBreakdown?: Record<
    string,
    {
      startingBalance: number;
      growth: number;
      withdrawal: number;
      endingBalance: number;
    }
  >;
}>;

/**
 * Plan types
 */
export type PlanType = 'fixed-date' | 'rolling';

/**
 * Plan entity for financial planning
 */
export type Plan = Readonly<{
  /** Unique identifier for the plan */
  id: string;
  /** Display name for the plan */
  name: string;
  /** Type of plan */
  type: PlanType;
  /** Start date of the plan */
  startDate: string;
  /** Time horizon in years */
  timeHorizon: number;
  /** Global assumptions for the plan */
  assumptions: {
    /** Inflation settings */
    inflation: InflationSettings;
    /** Growth model settings */
    growthModel: {
      /** Default annual growth rate as percentage */
      defaultRate: number;
      /** Account-specific growth rates */
      accountGrowthRates?: AccountGrowthRates;
    };
    /** Withdrawal rules */
    withdrawalRules: {
      /** Withdrawal strategy */
      strategy: WithdrawalStrategy;
      /** Retirement age */
      retirementAge: number;
      /** Maximum projection years */
      maxProjectionYears: number;
    };
    /** Social Security settings */
    socialSecurity?: SocialSecuritySettings;
    /** Required Minimum Distribution settings */
    rmdSettings?: RMDSettings;
  };
}>;

/**
 * Enhanced user profile with projection settings
 */
export type EnhancedUserProfile = UserProfile & {
  /** Enhanced projection settings */
  projectionSettings?: ProjectionSettings;
};

/**
 * Milestone types for financial planning
 */
export type MilestoneType =
  | 'retirement'
  | 'career-change'
  | 'asset-purchase'
  | 'asset-sale'
  | 'family-change'
  | 'other-milestone';

/**
 * Event types for financial planning
 */
export type EventType = 'income' | 'expense';

/**
 * Comparison operators for milestone conditions
 */
export type ComparisonOperator = '>' | '>=' | '<' | '<=' | '==' | '!=';

/**
 * Condition types for milestones
 */
export type ConditionType =
  | 'age'
  | 'net-worth'
  | 'savings-rate'
  | 'debt-ratio'
  | 'date';

/**
 * Milestone condition for decision tree logic
 */
export type MilestoneCondition = Readonly<{
  /** Type of condition */
  type: ConditionType;
  /** Comparison operator */
  operator: ComparisonOperator;
  /** Value to compare against (number for most types, date string for 'date' type) */
  value: number | string;
}>;

/**
 * Recurrence frequency for events
 */
export type RecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

/**
 * Financial impact type
 */
export type FinancialImpactType = 'income' | 'expense';

/**
 * Financial impact for milestones and events
 */
export type FinancialImpact = Readonly<{
  /** Amount in dollars */
  amount: number;
  /** Type of financial impact */
  type: FinancialImpactType;
  /** Whether this is recurring */
  recurring: boolean;
  /** Recurrence frequency (if recurring) */
  frequency?: RecurrenceFrequency;
}>;

/**
 * Milestone entity for financial planning
 */
export type Milestone = Readonly<{
  /** Unique identifier for the milestone */
  id: string;
  /** Display name for the milestone */
  name: string;
  /** Type of milestone */
  type: MilestoneType;
  /** Target date for the milestone */
  targetDate: string;
  /** Whether the milestone has been completed */
  completed: boolean;
  /** Conditions that must be met for this milestone */
  conditions: ReadonlyArray<MilestoneCondition>;
  /** Description of the milestone */
  description?: string;
  /** Financial impact of this milestone */
  financialImpact?: FinancialImpact;
  /** Priority for milestone ordering */
  priority?: number;
}>;

/**
 * Event entity for financial planning
 */
export type Event = Readonly<{
  /** Unique identifier for the event */
  id: string;
  /** Type of event */
  type: EventType;
  /** Display name for the event */
  name: string;
  /** Date of the event */
  date: string;
  /** Amount in dollars */
  amount: number;
  /** Whether this is a recurring event */
  recurring: boolean;
  /** Recurrence frequency (if recurring) */
  frequency?: RecurrenceFrequency;
  /** End date for recurring events */
  endDate?: string;
  /** Description of the event */
  description?: string;
  /** Category for the event */
  category?: string;
  /** Tags for filtering */
  tags?: ReadonlyArray<string>;
}>;

/**
 * Income source types
 */
export type IncomeType =
  | 'work'
  | 'social-security'
  | 'business'
  | 'rental'
  | 'investment'
  | 'pension'
  | 'other-income';

/**
 * Income category types
 */
export type IncomeCategory =
  | 'salary'
  | 'bonus'
  | 'part-time'
  | 'pension'
  | 'business'
  | 'rental'
  | 'dividends'
  | 'capital-gains'
  | 'other-income';

/**
 * Expense type classification
 */
export type ExpenseType = 'recurring' | 'one-time';

/**
 * Expense category types
 */
export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transportation'
  | 'healthcare'
  | 'insurance'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'debt-payment'
  | 'savings'
  | 'taxes'
  | 'celebration'
  | 'maintenance'
  | 'other-expense';

/**
 * Change-over-time entry for income/expense
 */
export type ChangeOverTimeEntry = Readonly<{
  /** Year when the change takes effect */
  year: number;
  /** New amount after change */
  newAmount: number;
  /** Description of the change */
  description?: string;
}>;

/**
 * Base income/expense interface
 */
interface BaseIncomeExpense {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Amount in dollars */
  amount: number;
  /** Frequency of occurrence */
  frequency: RecurrenceFrequency | 'once';
  /** Start date */
  startDate: string;
  /** Category */
  category: string;
  /** Tags for filtering and grouping */
  tags?: ReadonlyArray<string>;
  /** Changes over time */
  changes?: ReadonlyArray<ChangeOverTimeEntry>;
  /** End date (optional) */
  endDate?: string;
}

/**
 * Work income (salaries, bonuses, part-time work)
 */
export type WorkIncome = Readonly<
  BaseIncomeExpense & {
    type: 'work';
    /** Whether income is subject to taxes */
    taxable: boolean;
    /** Employer information */
    employer?: string;
    /** Job title */
    jobTitle?: string;
  }
>;

/**
 * Social Security or pension income
 */
export type PensionIncome = Readonly<
  BaseIncomeExpense & {
    type: 'social-security';
    /** Whether benefits are inflation-adjusted */
    inflationAdjusted: boolean;
    /** Claiming age (for Social Security) */
    claimingAge?: number;
  }
>;

/**
 * Business or self-employment income
 */
export type BusinessIncome = Readonly<
  BaseIncomeExpense & {
    type: 'business';
    /** Associated business expenses */
    associatedExpenses: number;
    /** Business name */
    businessName?: string;
    /** Tax identification number */
    taxId?: string;
  }
>;

/**
 * Rental property income
 */
export type RentalIncome = Readonly<
  BaseIncomeExpense & {
    type: 'rental';
    /** Associated rental expenses (maintenance, taxes, insurance) */
    associatedExpenses: number;
    /** Associated property asset ID */
    propertyId?: string;
  }
>;

/**
 * Investment income
 */
export type InvestmentIncome = Readonly<
  BaseIncomeExpense & {
    type: 'investment';
    /** Type of investment income */
    investmentType: 'dividends' | 'capital-gains' | 'interest';
    /** Associated account ID */
    accountId?: string;
  }
>;

/**
 * Union type for all income sources
 */
export type Income =
  | WorkIncome
  | PensionIncome
  | BusinessIncome
  | RentalIncome
  | InvestmentIncome;

/**
 * Recurring expense
 */
export type RecurringExpense = Readonly<
  BaseIncomeExpense & {
    type: 'recurring';
    /** Whether expense is mandatory (e.g., rent, insurance) vs flexible (e.g., dining out) */
    mandatory: boolean;
    /** Whether amount is fixed or can vary */
    variable: boolean;
  }
>;

/**
 * One-time expense
 */
export type OneTimeExpense = Readonly<
  BaseIncomeExpense & {
    type: 'one-time';
    /** Frequency is always 'once' */
    frequency: 'once';
    /** Estimated or confirmed expense */
    status: 'estimated' | 'confirmed';
  }
>;

/**
 * Union type for all expense types
 */
export type Expense = RecurringExpense | OneTimeExpense;
