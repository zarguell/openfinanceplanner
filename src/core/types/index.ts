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

/**
 * Goal types for financial planning
 */
export type GoalType =
  | 'retirement-savings'
  | 'emergency-fund'
  | 'debt-payoff'
  | 'home-purchase'
  | 'education'
  | 'vacation'
  | 'major-purchase'
  | 'investment-growth'
  | 'charitable-giving'
  | 'other-goal';

/**
 * Goal status tracking
 */
export type GoalStatus =
  | 'not-started'
  | 'in-progress'
  | 'on-track'
  | 'behind-schedule'
  | 'completed'
  | 'at-risk'
  | 'cancelled';

/**
 * Goal priority level
 */
export type GoalPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Goal entity for financial planning
 */
export type Goal = Readonly<{
  /** Unique identifier for the goal */
  id: string;
  /** Display name for the goal */
  name: string;
  /** Type of goal */
  type: GoalType;
  /** Target amount in dollars */
  targetAmount: number;
  /** Current amount saved/allocated */
  currentAmount: number;
  /** Target date for achieving the goal */
  targetDate: string;
  /** Start date for the goal */
  startDate: string;
  /** Priority level */
  priority: GoalPriority;
  /** Whether goal is mandatory vs flexible */
  mandatory: boolean;
  /** Current status */
  status: GoalStatus;
  /** Description of the goal */
  description?: string;
  /** Monthly contribution amount */
  monthlyContribution?: number;
  /** Associated account ID (if applicable) */
  accountId?: string;
  /** Tags for filtering */
  tags?: ReadonlyArray<string>;
}>;

/**
 * Priority configuration for cash flow allocation
 */
export type CashFlowPriority = Readonly<{
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Priority order (lower number = higher priority) */
  order: number;
  /** Associated goals */
  goalIds: ReadonlyArray<string>;
  /** Percentage of cash flow to allocate */
  allocationPercentage: number;
  /** Whether this priority is mandatory */
  mandatory: boolean;
  /** Description */
  description?: string;
}>;

/**
 * Priority simulation result
 */
export type PrioritySimulationResult = Readonly<{
  /** Year of simulation */
  year: number;
  /** Total cash flow available */
  cashFlowAvailable: number;
  /** Allocation by priority */
  allocations: ReadonlyArray<{
    priorityId: string;
    priorityName: string;
    amountAllocated: number;
    percentageAllocated: number;
  }>;
  /** Goals funded this year */
  goalsFunded: ReadonlyArray<{
    goalId: string;
    goalName: string;
    amountFunded: number;
    progress: number;
  }>;
}>;

/**
 * Goal progress heatmap data
 */
export type GoalHeatmapData = Readonly<{
  /** Goal ID */
  goalId: string;
  /** Goal name */
  goalName: string;
  /** Progress percentage */
  progress: number;
  /** Status */
  status: GoalStatus;
  /** Months until target */
  monthsRemaining: number;
  /** On track indicator */
  onTrack: boolean;
}>;

/**
 * Filing status for tax calculations
 */
export type FilingStatus =
  | 'single'
  | 'married-filing-jointly'
  | 'married-filing-separately'
  | 'head-of-household';

/**
 * Tax bracket configuration
 */
export type TaxBracket = Readonly<{
  /** Minimum income for this bracket */
  min: number;
  /** Maximum income for this bracket (undefined for highest bracket) */
  max?: number;
  /** Tax rate as percentage */
  rate: number;
}>;

/**
 * Tax jurisdiction type
 */
export type TaxJurisdictionType = 'federal' | 'state' | 'local';

/**
 * Tax strategy types for optimization
 */
export type TaxStrategyType =
  | 'roth-conversion'
  | 'sepp-distribution'
  | 'tax-loss-harvesting'
  | 'location-based';

/**
 * Tax jurisdiction information
 */
export type TaxJurisdiction = Readonly<{
  /** Type of jurisdiction */
  type: TaxJurisdictionType;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Name of jurisdiction */
  name: string;
  /** State or province code */
  stateCode?: string;
  /** Locality or municipality name */
  locality?: string;
}>;

/**
 * Tax configuration for a specific jurisdiction
 */
export type TaxConfig = Readonly<{
  /** Tax year */
  year: number;
  /** Filing status */
  filingStatus: FilingStatus;
  /** Jurisdiction information */
  jurisdiction: TaxJurisdiction;
  /** Ordinary income tax brackets */
  ordinaryIncomeBrackets: readonly TaxBracket[];
  /** Long-term capital gains tax brackets */
  longTermCapitalGainsBrackets: readonly TaxBracket[];
  /** Short-term capital gains tax rate */
  shortTermCapitalGainsRate: number;
  /** Standard deduction amount */
  standardDeduction: number;
  /** Personal exemption amount */
  personalExemption: number;
  /** Special tax rules */
  specialRules: readonly TaxSpecialRule[];
}>;

/**
 * Special tax rule configuration
 */
export type TaxSpecialRule = Readonly<{
  /** Type of special rule */
  type: string;
  /** Description of the rule */
  description: string;
  /** Years this rule applies to */
  applicableYears: readonly number[];
  /** Condition function for rule application */
  condition?: (income: number, context: unknown) => boolean;
}>;

/**
 * Tax calculation result
 */
export type TaxCalculationResult = Readonly<{
  /** Federal tax amount */
  federalTax: number;
  /** Ordinary income tax amount */
  ordinaryIncomeTax: number;
  /** Capital gains tax amount */
  capitalGainsTax: number;
  /** Marginal tax rate */
  marginalRate: number;
  /** Effective tax rate */
  effectiveRate: number;
  /** State tax amount (optional) */
  stateTax?: number;
}>;

/**
 * Tax analytics data
 */
export type TaxAnalytics = Readonly<{
  /** Yearly tax breakdown */
  yearlyBreakdown: readonly TaxCalculationResult[];
  /** Total federal tax paid */
  totalFederalTax: number;
  /** Total state tax paid */
  totalStateTax: number;
  /** Total tax paid */
  totalTax: number;
  /** Average effective tax rate */
  averageEffectiveRate: number;
  /** Tax burden trend over time */
  taxBurdenTrend: readonly number[];
  /** Tax optimization opportunities */
  optimizationOpportunities: readonly TaxOptimizationOpportunity[];
}>;

/**
 * Tax optimization opportunity
 */
export type TaxOptimizationOpportunity = Readonly<{
  /** Type of optimization */
  type: string;
  /** Description of the opportunity */
  description: string;
  /** Potential tax savings */
  potentialSavings: number;
  /** Priority level */
  priority: 'high' | 'medium' | 'low';
}>;

/**
 * Tax strategy configuration
 */
export type TaxStrategy = Readonly<{
  /** Type of strategy */
  type: TaxStrategyType;
  /** Amount for conversion/distribution */
  amount?: number;
  /** Target year for strategy */
  targetYear?: number;
  /** Account balance for SEPP calculations */
  accountBalance?: number;
  /** Life expectancy for SEPP calculations */
  lifeExpectancy?: number;
  /** Strategy description */
  description: string;
}>;

/**
 * Return sequence type for Monte Carlo simulations
 */
export type ReturnSequence = ReadonlyArray<number>;

/**
 * Historical data source for backtesting
 */
export type HistoricalDataSource =
  | 's-and-p-500'
  | 'us-treasuries'
  | 'international'
  | 'custom';

/**
 * Return sequence configuration
 */
export type ReturnSequenceConfig = Readonly<{
  /** Type of return sequence */
  type: 'random' | 'historical' | 'bootstrap';
  /** Mean annual return as percentage */
  meanReturn?: number;
  /** Volatility (standard deviation) as percentage */
  volatility?: number;
  /** Historical data source (for historical type) */
  historicalSource?: HistoricalDataSource;
  /** Seed for random number generation (for deterministic results) */
  seed?: number;
  /** Number of years in the sequence */
  years: number;
}>;

/**
 * Monte Carlo simulation result
 */
export type MonteCarloSimulationResult = Readonly<{
  /** Unique identifier for this simulation */
  id: string;
  /** Yearly balances for this simulation */
  yearlyBalances: readonly number[];
  /** Whether the simulation was successful (never depleted) */
  successful: boolean;
  /** Year when balance depleted (if unsuccessful) */
  depletionYear?: number;
}>;

/**
 * Percentile band data for visualization
 */
export type PercentileBandData = Readonly<{
  /** Year index */
  year: number;
  /** Age at this year */
  age: number;
  /** Balance at specified percentile */
  [percentile: number]: number;
}>;

/**
 * Monte Carlo configuration
 */
export type MonteCarloConfig = Readonly<{
  /** Number of simulations to run */
  numSimulations: number;
  /** Return sequence configuration */
  returnSequenceConfig: ReturnSequenceConfig;
  /** Percentiles to calculate */
  percentiles: readonly number[];
  /** Whether to use deterministic mode (same seed for all) */
  deterministic?: boolean;
}>;

/**
 * Chance of success calculation
 */
export type ChanceOfSuccess = Readonly<{
  /** Overall success rate as percentage (0-100) */
  successRate: number;
  /** Number of successful simulations */
  successfulSimulations: number;
  /** Total number of simulations */
  totalSimulations: number;
  /** Success rate by year */
  yearlySuccessRates: readonly number[];
}>;

/**
 * Historical backtest result
 */
export type HistoricalBacktestResult = Readonly<{
  /** Historical period identifier */
  period: string;
  /** Start year of historical period */
  startYear: number;
  /** End year of historical period */
  endYear: number;
  /** Simulation result using actual returns */
  result: MonteCarloSimulationResult;
  /** Average annual return for the period */
  averageAnnualReturn: number;
  /** Volatility for the period */
  volatility: number;
}>;

/**
 * Cash flow calculation result
 */
export type CashFlowResult = Readonly<{
  /** Total income for the period */
  totalIncome: number;
  /** Total expenses for the period */
  totalExpenses: number;
  /** Net cash flow (income - expenses) */
  netCashFlow: number;
  /** Breakdown by category */
  byCategory: Readonly<Record<string, number>>;
}>;

/**
 * Net worth composition result
 */
export type NetWorthComposition = Readonly<{
  /** Total net worth */
  totalNetWorth: number;
  /** Total assets */
  totalAssets: number;
  /** Total liabilities */
  totalLiabilities: number;
  /** Breakdown by account type */
  byType: Readonly<Record<string, number>>;
  /** Individual account breakdown */
  byAccount: ReadonlyArray<{
    id: string;
    name: string;
    type: string;
    balance: number;
  }>;
}>;

/**
 * Progress point for timeline visualization
 */
export type ProgressPoint = Readonly<{
  /** Goal ID */
  goalId: string;
  /** Goal name */
  goalName: string;
  /** Progress percentage (0-1) */
  progress: number;
  /** Target date */
  targetDate: string;
  /** Status */
  status: string;
}>;

/**
 * Progress metrics result
 */
export type ProgressMetrics = Readonly<{
  /** Overall progress across all goals */
  totalProgress: number;
  /** Number of completed goals */
  completedGoals: number;
  /** Number of in-progress goals */
  inProgressGoals: number;
  /** Number of on-track goals */
  onTrackGoals: number;
  /** Progress points for timeline visualization */
  progressPoints: readonly ProgressPoint[];
}>;

/**
 * Sankey node data structure
 */
export type SankeyNode = Readonly<{
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Category (income, expense, savings) */
  category: string;
  /** Value amount */
  value: number;
  /** Color for visualization */
  color?: string;
}>;

/**
 * Sankey link data structure
 */
export type SankeyLink = Readonly<{
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Flow amount */
  value: number;
}>;

/**
 * Complete Sankey diagram data
 */
export type SankeyData = Readonly<{
  /** All nodes in the diagram */
  nodes: readonly SankeyNode[];
  /** All links between nodes */
  links: readonly SankeyLink[];
  /** Year data represents */
  year: number;
}>;

/**
 * Scenario status
 */
export type ScenarioStatus = 'active' | 'archived' | 'deleted';

/**
 * Scenario entity for managing multiple plans
 */
export type Scenario = Readonly<{
  /** Unique identifier for the scenario */
  id: string;
  /** Display name for the scenario */
  name: string;
  /** Description of the scenario */
  description?: string;
  /** ID of the base plan this scenario is based on */
  basePlanId: string;
  /** Status of the scenario */
  status: ScenarioStatus;
  /** Date when scenario was created */
  createdAt: string;
  /** Date when scenario was last modified */
  modifiedAt: string;
  /** ID of scenario this was cloned from (if applicable) */
  parentScenarioId?: string;
  /** Version number for tracking changes */
  version: number;
}>;

/**
 * Scenario snapshot for capturing plan state at a point in time
 */
export type ScenarioSnapshot = Readonly<{
  /** Unique identifier for the snapshot */
  id: string;
  /** ID of the scenario this snapshot belongs to */
  scenarioId: string;
  /** Snapshot name/description */
  name: string;
  /** Date when snapshot was created */
  createdAt: string;
  /** Complete plan data at the time of snapshot */
  planData: Plan;
  /** Complete simulation results at time of snapshot */
  simulationData?: SimulationResult[];
  /** User profile data at time of snapshot */
  profileData?: UserProfile;
  /** Income data at time of snapshot */
  incomeData?: readonly Income[];
  /** Expense data at time of snapshot */
  expenseData?: readonly Expense[];
}>;

/**
 * Flex Spending rule types
 */
export type FlexSpendingRuleType =
  | 'percentage-of-income'
  | 'fixed-amount'
  | 'inflation-adjusted'
  | 'goal-based'
  | 'rule-of-thumb';

/**
 * Flex Spending rule conditions
 */
export type FlexSpendingCondition = Readonly<{
  /** Type of condition */
  type: 'age' | 'year' | 'net-worth' | 'retirement-date' | 'always';
  /** Comparison operator */
  operator: '>' | '>=' | '<' | '<=' | '==' | '!=';
  /** Value to compare against */
  value: number;
}>;

/**
 * Flex Spending rule for dynamic spending allocation
 */
export type FlexSpendingRule = Readonly<{
  /** Unique identifier for the rule */
  id: string;
  /** Display name for the rule */
  name: string;
  /** Type of flex spending rule */
  type: FlexSpendingRuleType;
  /** Category this rule applies to */
  category?: ExpenseCategory;
  /** Base amount or percentage */
  baseValue: number;
  /** Whether baseValue is a percentage or fixed amount */
  isPercentage: boolean;
  /** Minimum amount (floor) */
  minimumAmount?: number;
  /** Maximum amount (ceiling) */
  maximumAmount?: number;
  /** Conditions for when this rule applies */
  conditions: readonly FlexSpendingCondition[];
  /** Whether this rule is enabled */
  enabled: boolean;
  /** Priority order (higher number = higher priority) */
  priority: number;
  /** Description of the rule */
  description?: string;
}>;

/**
 * Flex Spending configuration for a scenario
 */
export type FlexSpendingConfig = Readonly<{
  /** Array of flex spending rules */
  rules: readonly FlexSpendingRule[];
  /** Whether flex spending is enabled */
  enabled: boolean;
  /** Default rule to use if no specific rules apply */
  defaultRule?: FlexSpendingRule;
}>;

/**
 * Scenario comparison data point
 */
export type ScenarioComparisonData = Readonly<{
  /** Year of data point */
  year: number;
  /** Age at this year */
  age: number;
  /** Scenario data */
  scenarios: readonly {
    /** Scenario ID */
    scenarioId: string;
    /** Scenario name */
    scenarioName: string;
    /** Net worth at this year */
    netWorth: number;
    /** Total income for this year */
    income: number;
    /** Total expenses for this year */
    expenses: number;
    /** Cash flow for this year */
    cashFlow: number;
    /** Account breakdown */
    accountBreakdown?: Record<string, number>;
  }[];
}>;

/**
 * Scenario comparison result
 */
export type ScenarioComparisonResult = Readonly<{
  /** Comparison ID */
  id: string;
  /** Scenarios being compared */
  scenarioIds: readonly string[];
  /** Comparison data points by year */
  comparisonData: readonly ScenarioComparisonData[];
  /** Summary statistics */
  summary: {
    /** Average net worth difference between scenarios */
    avgNetWorthDiff: number;
    /** Maximum net worth difference */
    maxNetWorthDiff: number;
    /** Year of maximum difference */
    maxDiffYear: number;
    /** Scenario with highest ending net worth */
    highestScenarioId: string;
    /** Scenario with lowest ending net worth */
    lowestScenarioId: string;
  };
  /** Comparison date */
  createdAt: string;
}>;

/**
 * Scenario update result
 */
export type ScenarioUpdateResult = Readonly<{
  /** The updated scenario */
  scenario: Scenario;
  /** Whether the update was successful */
  success: boolean;
  /** Error message if update failed */
  error?: string;
}>;
