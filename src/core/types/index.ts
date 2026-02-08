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
