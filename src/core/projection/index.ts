import type { UserProfile, SimulationResult } from '@/core/types';

/**
 * Calculate year-by-year financial projection
 *
 * Pure function that takes a user profile and returns an array of
 * simulation results, one for each year from current age until age 100.
 *
 * Algorithm:
 * 1. Start with current savings
 * 2. For each year:
 *    - Calculate growth: startingBalance * (annualGrowthRate / 100)
 *    - Subtract spending
 *    - Update balance (floor at 0 to prevent negative values)
 * 3. Return array of yearly results
 *
 * @param profile - User profile with age, savings, growth rate, and spending
 * @returns Array of simulation results, one per year until age 100
 */
export function calculateProjection(profile: UserProfile): SimulationResult[] {
  const results: SimulationResult[] = [];
  let balance = profile.currentSavings;

  // Project from current age until age 100
  const yearsToProject = 100 - profile.age;

  for (let year = 0; year < yearsToProject; year++) {
    const age = profile.age + year;
    const startingBalance = balance;

    // Calculate investment growth
    const growth = startingBalance * (profile.annualGrowthRate / 100);

    // Update balance: starting + growth - spending
    balance = startingBalance + growth - profile.annualSpending;

    // Prevent negative balances (floor at zero)
    const endingBalance = Math.max(0, balance);

    results.push({
      year,
      age,
      startingBalance,
      growth,
      spending: profile.annualSpending,
      endingBalance,
    });

    // If we hit zero, all subsequent years will also be zero
    // No need to break early - tests verify this behavior
    balance = endingBalance;
  }

  return results;
}
