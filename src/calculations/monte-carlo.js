/**
 * Monte Carlo simulation for retirement planning
 * Generates multiple scenarios to assess success probability
 */

import { project } from './projection.js';

/**
 * Generate a random return based on expected return and volatility
 * Uses geometric Brownian motion model
 * @param {number} expectedReturn - Expected annual return (decimal)
 * @param {number} volatility - Annual volatility/standard deviation (decimal)
 * @returns {number} Random annual return for this scenario
 */
export function generateRandomReturn(expectedReturn, volatility) {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Apply volatility to get random return
  return expectedReturn + (z0 * volatility);
}

/**
 * Run a single Monte Carlo scenario
 * @param {object} plan - Financial plan
 * @param {number} yearsToProject - Years to project
 * @param {number} taxYear - Tax year
 * @returns {object} Scenario results with success flag
 */
export function runMonteCarloScenario(plan, yearsToProject = 40, taxYear = 2025) {
  // Create a modified plan with random returns for this scenario
  const scenarioPlan = {
    ...plan,
    assumptions: {
      ...plan.assumptions,
      // Generate random returns for each account type
      equityGrowthRate: generateRandomReturn(
        plan.assumptions.equityGrowthRate,
        plan.assumptions.equityVolatility || 0.12 // Default 12% volatility if not specified
      ),
      bondGrowthRate: generateRandomReturn(
        plan.assumptions.bondGrowthRate || plan.assumptions.equityGrowthRate * 0.4,
        plan.assumptions.bondVolatility || 0.04 // Default 4% volatility for bonds
      )
    }
  };

  const projection = project(scenarioPlan, yearsToProject, taxYear);
  const finalYear = projection[projection.length - 1];

  // Success criteria: positive balance at end of projection
  const success = finalYear.totalBalance > 0;

  return {
    projection,
    success,
    finalBalance: finalYear.totalBalance,
    finalAge: finalYear.age
  };
}

/**
 * Run Monte Carlo simulation with multiple scenarios
 * @param {object} plan - Financial plan
 * @param {number} numScenarios - Number of scenarios to run (default: 1000)
 * @param {number} yearsToProject - Years to project
 * @param {number} taxYear - Tax year
 * @returns {object} Monte Carlo results
 */
export function runMonteCarloSimulation(plan, numScenarios = 1000, yearsToProject = 40, taxYear = 2025) {
  const scenarios = [];
  let successCount = 0;
  let totalFinalBalance = 0;
  const finalBalances = [];

  for (let i = 0; i < numScenarios; i++) {
    const scenario = runMonteCarloScenario(plan, yearsToProject, taxYear);
    scenarios.push(scenario);

    if (scenario.success) {
      successCount++;
    }

    totalFinalBalance += scenario.finalBalance;
    finalBalances.push(scenario.finalBalance);
  }

  // Calculate statistics
  const successProbability = successCount / numScenarios;
  const averageFinalBalance = totalFinalBalance / numScenarios;

  // Sort balances for percentile calculations
  finalBalances.sort((a, b) => a - b);

  const percentiles = {
    p10: finalBalances[Math.floor(numScenarios * 0.1)],
    p25: finalBalances[Math.floor(numScenarios * 0.25)],
    p50: finalBalances[Math.floor(numScenarios * 0.5)], // median
    p75: finalBalances[Math.floor(numScenarios * 0.75)],
    p90: finalBalances[Math.floor(numScenarios * 0.9)]
  };

  return {
    numScenarios,
    successProbability,
    successCount,
    averageFinalBalance,
    percentiles,
    scenarios // Full scenario data for detailed analysis
  };
}

/**
 * Get success probability with confidence interval
 * @param {object} monteCarloResults - Results from runMonteCarloSimulation
 * @returns {object} Success probability with confidence bounds
 */
export function getSuccessProbabilityWithConfidence(monteCarloResults) {
  const { successProbability, numScenarios } = monteCarloResults;

  // Standard error of proportion
  const standardError = Math.sqrt((successProbability * (1 - successProbability)) / numScenarios);

  // 95% confidence interval using normal approximation
  const zScore = 1.96; // 95% confidence
  const marginOfError = zScore * standardError;

  return {
    probability: successProbability,
    lowerBound: Math.max(0, successProbability - marginOfError),
    upperBound: Math.min(1, successProbability + marginOfError),
    confidenceLevel: 0.95,
    marginOfError
  };
}

/**
 * Analyze sequence of returns risk
 * @param {Array} scenarios - Array of scenario results
 * @returns {object} Sequence of returns analysis
 */
export function analyzeSequenceOfReturnsRisk(scenarios) {
  // Find scenarios that failed due to early negative returns
  const failedScenarios = scenarios.filter(s => !s.success);

  let earlyFailureCount = 0;
  let lateFailureCount = 0;

  failedScenarios.forEach(scenario => {
    // Check if balance went negative before retirement age
    const retirementIndex = scenario.projection.findIndex(p => p.isRetired);
    const preRetirementBalances = scenario.projection.slice(0, retirementIndex);

    const earlyNegative = preRetirementBalances.some(p => p.totalBalance < 0);
    if (earlyNegative) {
      earlyFailureCount++;
    } else {
      lateFailureCount++;
    }
  });

  return {
    totalFailures: failedScenarios.length,
    earlyFailures: earlyFailureCount,
    lateFailures: lateFailureCount,
    earlyFailureRate: earlyFailureCount / scenarios.length,
    lateFailureRate: lateFailureCount / scenarios.length
  };
}
