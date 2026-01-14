/**
 * Monte Carlo simulation tests
 */

import { generateRandomReturn, runMonteCarloScenario, runMonteCarloSimulation, getSuccessProbabilityWithConfidence, analyzeSequenceOfReturnsRisk } from '../../../src/calculations/monte-carlo.js';
import { Plan } from '../../../src/core/models/Plan.js';
import { Account } from '../../../src/core/models/Account.js';
import { Expense } from '../../../src/core/models/Expense.js';

export function testGenerateRandomReturn() {
  const expectedReturn = 0.07; // 7%
  const volatility = 0.12; // 12%

  // Run multiple times to check distribution
  const returns = [];
  for (let i = 0; i < 1000; i++) {
    returns.push(generateRandomReturn(expectedReturn, volatility));
  }

  // Check that returns are around expected value
  const averageReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  if (Math.abs(averageReturn - expectedReturn) > 0.01) {
    throw new Error(`Expected average return around ${expectedReturn}, got ${averageReturn}`);
  }

  // Check that we have some variation (volatility)
  const minReturn = Math.min(...returns);
  const maxReturn = Math.max(...returns);
  if (maxReturn - minReturn < 0.1) {
    throw new Error('Returns should show variation due to volatility');
  }

  console.log('✓ testGenerateRandomReturn passed');
}

export function testRunMonteCarloScenario() {
  // Create a test plan
  const plan = new Plan('Test Plan', 30, 65);
  plan.addAccount(new Account('Test Account', '401k', 100000));
  plan.addExpense(new Expense('Test Expense', 50000, 35)); // Start at age 65

  const scenario = runMonteCarloScenario(plan, 40, 2025);

  // Check basic structure
  if (!scenario.projection || !Array.isArray(scenario.projection)) {
    throw new Error('Scenario should have a projection array');
  }

  if (typeof scenario.success !== 'boolean') {
    throw new Error('Scenario should have a success boolean');
  }

  if (typeof scenario.finalBalance !== 'number') {
    throw new Error('Scenario should have a finalBalance number');
  }

  if (typeof scenario.finalAge !== 'number') {
    throw new Error('Scenario should have a finalAge number');
  }

  console.log('✓ testRunMonteCarloScenario passed');
}

export function testRunMonteCarloSimulation() {
  // Create a test plan
  const plan = new Plan('Test Plan', 30, 65);
  plan.addAccount(new Account('Test Account', '401k', 100000));
  plan.addExpense(new Expense('Test Expense', 50000, 35));

  const numScenarios = 100;
  const results = runMonteCarloSimulation(plan, numScenarios, 40, 2025);

  // Check basic structure
  if (results.numScenarios !== numScenarios) {
    throw new Error(`Expected ${numScenarios} scenarios, got ${results.numScenarios}`);
  }

  if (typeof results.successProbability !== 'number' || results.successProbability < 0 || results.successProbability > 1) {
    throw new Error('successProbability should be a number between 0 and 1');
  }

  if (results.successCount < 0 || results.successCount > numScenarios) {
    throw new Error('successCount should be between 0 and numScenarios');
  }

  if (typeof results.averageFinalBalance !== 'number') {
    throw new Error('averageFinalBalance should be a number');
  }

  // Check percentiles
  if (!results.percentiles || typeof results.percentiles.p50 !== 'number') {
    throw new Error('Should have percentiles including p50');
  }

  // Check that percentiles are ordered correctly
  if (results.percentiles.p10 > results.percentiles.p25 ||
      results.percentiles.p25 > results.percentiles.p50 ||
      results.percentiles.p50 > results.percentiles.p75 ||
      results.percentiles.p75 > results.percentiles.p90) {
    throw new Error('Percentiles should be in ascending order');
  }

  console.log('✓ testRunMonteCarloSimulation passed');
}

export function testGetSuccessProbabilityWithConfidence() {
  const mockResults = {
    successProbability: 0.75,
    numScenarios: 1000
  };

  const confidence = getSuccessProbabilityWithConfidence(mockResults);

  if (typeof confidence.probability !== 'number' || confidence.probability !== 0.75) {
    throw new Error('Should return the original probability');
  }

  if (typeof confidence.lowerBound !== 'number' || confidence.lowerBound >= confidence.probability) {
    throw new Error('Lower bound should be less than probability');
  }

  if (typeof confidence.upperBound !== 'number' || confidence.upperBound <= confidence.probability) {
    throw new Error('Upper bound should be greater than probability');
  }

  if (confidence.confidenceLevel !== 0.95) {
    throw new Error('Should use 95% confidence level');
  }

  console.log('✓ testGetSuccessProbabilityWithConfidence passed');
}

export function testAnalyzeSequenceOfReturnsRisk() {
  // Create mock scenarios - some successful, some failed
  const scenarios = [
    { success: true, projection: [{ totalBalance: 1000, isRetired: false }, { totalBalance: 2000, isRetired: true }] },
    { success: false, projection: [{ totalBalance: 1000, isRetired: false }, { totalBalance: -500, isRetired: true }] },
    { success: false, projection: [{ totalBalance: 1000, isRetired: false }, { totalBalance: 500, isRetired: false }, { totalBalance: -100, isRetired: true }] }
  ];

  const analysis = analyzeSequenceOfReturnsRisk(scenarios);

  if (analysis.totalFailures !== 2) {
    throw new Error('Should identify 2 failed scenarios');
  }

  if (analysis.earlyFailures < 0 || analysis.lateFailures < 0) {
    throw new Error('Failure counts should be non-negative');
  }

  if (analysis.earlyFailureRate < 0 || analysis.earlyFailureRate > 1) {
    throw new Error('Early failure rate should be between 0 and 1');
  }

  console.log('✓ testAnalyzeSequenceOfReturnsRisk passed');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testGenerateRandomReturn();
  testRunMonteCarloScenario();
  testRunMonteCarloSimulation();
  testGetSuccessProbabilityWithConfidence();
  testAnalyzeSequenceOfReturnsRisk();

  console.log('All Monte Carlo tests passed!');
}
