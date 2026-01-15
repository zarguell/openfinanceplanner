/**
 * Projection calculations - Pure functions for financial projections
 * No side effects, no state mutations, testable in isolation
 */

import {
    calculateFederalTax,
    calculateTotalTax,
    calculateLongTermCapitalGainsTax,
    calculateFicaTax
   } from './tax.js';
import { calculateTotalIncome } from './income.js';
import { calculateSocialSecurityForYear } from './social-security.js';
import { mustTakeRMD, calculateRMDForAccount } from './rmd.js';
import { calculateWithdrawals } from './withdrawal-strategies.js';
import { RuleRegistry } from '../core/rules/RuleRegistry.js';
import { RothConversionRule } from '../core/rules/RothConversionRule.js';
import { QCDRule } from '../core/rules/QCDRule.js';
import { TLHRule } from '../core/rules/TLHRule.js';
import { BackdoorRothRule } from '../core/rules/BackdoorRothRule.js';
import { MegaBackdoorRothRule } from '../core/rules/MegaBackdoorRothRule.js';

function initializeRuleRegistry(plan) {
  const registry = new RuleRegistry();

  if (plan.rothConversions && plan.rothConversions.enabled) {
    const rothRule = new RothConversionRule({
      name: 'roth-conversions',
      description: 'Roth conversion strategy',
      dependencies: [],
      strategy: plan.rothConversions.strategy,
      annualAmount: plan.rothConversions.annualAmount,
      bracketTop: plan.rothConversions.bracketTop,
      percentage: plan.rothConversions.percentage
    });
    registry.register(rothRule);
  }

  if (plan.qcdSettings && plan.qcdSettings.enabled) {
    const qcdRule = new QCDRule({
      name: 'qcd',
      description: 'Qualified charitable distribution strategy',
      dependencies: [],
      strategy: plan.qcdSettings.strategy,
      annualAmount: plan.qcdSettings.annualAmount,
      percentage: plan.qcdSettings.percentage
    });
    registry.register(qcdRule);
  }

  if (plan.taxLossHarvesting && plan.taxLossHarvesting.enabled) {
    const tlhRule = new TLHRule({
      name: 'tax-loss-harvesting',
      description: 'Tax-loss harvesting strategy',
      dependencies: [],
      strategy: plan.taxLossHarvesting.strategy,
      threshold: plan.taxLossHarvesting.threshold
    });
    registry.register(tlhRule);
  }

  if (plan.backdoorRoth && plan.backdoorRoth.enabled) {
    const backdoorRule = new BackdoorRothRule({
      name: 'backdoor-roth',
      description: 'Backdoor Roth strategy',
      dependencies: [],
      annualContribution: plan.backdoorRoth.annualContribution,
      incomeThreshold: plan.backdoorRoth.incomeThreshold,
      phaseOutEnd: plan.backdoorRoth.phaseOutEnd
    });
    registry.register(backdoorRule);
  }

  if (plan.megaBackdoorRoth && plan.megaBackdoorRoth.enabled) {
    const megaBackdoorRule = new MegaBackdoorRothRule({
      name: 'mega-backdoor-roth',
      description: 'Mega Backdoor Roth strategy',
      dependencies: [],
      annualContribution: plan.megaBackdoorRoth.annualContribution,
      planSupportsAfterTax: plan.megaBackdoorRoth.planSupportsAfterTax,
      planSupportsInServiceWithdrawal: plan.megaBackdoorRoth.planSupportsInServiceWithdrawal,
      employerMatchRate: plan.megaBackdoorRoth.employerMatchRate,
      employeeDeferralLimit: plan.megaBackdoorRoth.employeeDeferralLimit,
      total401kLimit: plan.megaBackdoorRoth.total401kLimit
    });
    registry.register(megaBackdoorRule);
  }

  return registry;
}

/**
 * Get growth rate for account type based on assumptions
 * @param {string} accountType - Account type (401k, IRA, Roth, etc.)
 * @param {object} assumptions - Growth rate assumptions
 * @returns {number} Annual growth rate as decimal
 */
export function getAccountGrowthRate(accountType, assumptions) {
  const rates = {
    '401k': assumptions.equityGrowthRate,
    'IRA': assumptions.equityGrowthRate,
    'Roth': assumptions.equityGrowthRate,
    'Taxable': assumptions.equityGrowthRate * 0.8, // 20% reduction for annual tax drag on dividends/capital gains
    'HSA': assumptions.equityGrowthRate
  };
  return rates[accountType] || assumptions.equityGrowthRate;
}

/**
 * Calculate inflation-adjusted expense for a given year
 * @param {object} expense - Expense object
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {number} Expense amount in dollars for that year
 */
export function calculateExpenseForYear(expense, yearOffset, inflationRate) {
  if (yearOffset < expense.startYear) {
    return 0;
  }

  // For one-time expenses, only appears in start year
  if (expense.isOneTime) {
    return yearOffset === expense.startYear ? expense.baseAmount / 100 : 0;
  }

  // For recurring expenses, check end year
  if (expense.endYear && yearOffset > expense.endYear) {
    return 0;
  }

  const baseAmount = expense.baseAmount / 100; // Convert cents to dollars
  const inflationMultiplier = expense.inflationAdjusted
    ? Math.pow(1 + inflationRate, yearOffset)
    : 1;

  return baseAmount * inflationMultiplier;
}

/**
 * Calculate total expenses for all expense items in a given year
 * @param {Array} expenses - Array of expense objects
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {number} Total expenses in dollars
 */
export function calculateTotalExpenses(expenses, yearOffset, inflationRate) {
  return expenses.reduce((total, expense) => {
    return total + calculateExpenseForYear(expense, yearOffset, inflationRate);
  }, 0);
}

/**
 * Project a financial plan year by year
 * @param {object} plan - Plan object with accounts, expenses, taxProfile, assumptions
 * @param {number} yearsToProject - Number of years to project
 * @param {number} taxYear - Tax year to use for calculations (2024 or 2025)
 * @returns {Array} Array of yearly projection results
 */
export function project(plan, yearsToProject = 40, taxYear = 2025) {
  const results = [];
  const accountSnapshots = plan.accounts.map(acc => ({
    ...acc,
    balance: acc.balance
  }));

  const ruleRegistry = initializeRuleRegistry(plan);

  const startYear = new Date().getFullYear();
  const startAge = plan.taxProfile.currentAge;

  for (let year = 0; year <= yearsToProject; year++) {
    const currentYear = startYear + year;
    const age = startAge + year;
    const isRetired = age >= plan.taxProfile.retirementAge;

    let totalWithdrawalNeeded = 0;

    // Calculate total expenses for this year
    const totalExpense = calculateTotalExpenses(
      plan.expenses,
      year,
      plan.assumptions.inflationRate
    );

    // Calculate total earned income for this year
    const totalIncome = calculateTotalIncome(
      plan.incomes || [],
      year,
      plan.assumptions.inflationRate,
      { currentAge: startAge, retirementAge: plan.taxProfile.retirementAge }
    );

    // Calculate Social Security income for this year
    const socialSecurityIncome = calculateSocialSecurityForYear(
      plan.socialSecurity,
      year,
      startAge,
      plan.taxProfile.retirementAge,
      plan.assumptions.inflationRate
    );

  let totalBalance = 0;
    let totalFederalTax = 0;
    let totalStateTax = 0;
    let totalFicaTax =  0;

    // Calculate total contributions across all accounts (considering timing and one-time flags)
    const totalContributions = plan.accounts.reduce((sum, acc) => {
      // Check if we're in contribution window
      if (year < (acc.contributionStartYear || 0)) return sum;
      if (acc.contributionEndYear && year > acc.contributionEndYear) return sum;

      // For one-time contributions, only contribute in start year
      if (acc.isOneTimeContribution && year !== (acc.contributionStartYear || 0)) return sum;

      return sum + (acc.annualContribution || 0);
    }, 0);

    // Calculate FICA taxes on earned income (not just contributions)
    if (!isRetired && totalIncome > 0) {
      const ficaResult = calculateFicaTax(Math.round(totalIncome * 100), plan.taxProfile.filingStatus, taxYear);
      totalFicaTax = ficaResult.totalFicaTax / 100;
    }

    // Calculate net cash flow for this year
    // Pre-retirement: Income - Expenses = surplus/deficit (surplus goes to savings, deficit requires withdrawals)
    // Post-retirement: SS + withdrawals from accounts - Expenses
    const netCashFlow = totalIncome + socialSecurityIncome - totalExpense;

    // Calculate RMD requirements for all Traditional accounts
    const rmdRequirements = accountSnapshots.map((acc, idx) => {
      const account = plan.accounts[idx];
      if ((account.type === '401k' || account.type === 'IRA') && mustTakeRMD(age)) {
        const rmdAmountInCents = calculateRMDForAccount({ ...account, balance: acc.balance }, age);
        return rmdAmountInCents;
      }
      return 0;
    });
    const totalRmdAmount = rmdRequirements.reduce((sum, rmd) => sum + rmd, 0) / 100;
    const totalRmdWithdrawalCents = rmdRequirements.reduce((sum, rmd) => sum + rmd, 0);

    const projectionState = {
      totalTaxableIncome: (totalIncome + socialSecurityIncome) * 100,
      traditionalBalance: accountSnapshots
        .filter((acc, idx) => plan.accounts[idx].type === '401k' || plan.accounts[idx].type === 'IRA')
        .reduce((sum, acc) => sum + acc.balance, 0),
      mustTakeRMD: mustTakeRMD(age),
      rmdAmount: totalRmdWithdrawalCents,
      capitalGains: 0
    };

    const ruleResults = ruleRegistry.applyRules({
      plan,
      yearOffset: year,
      projectionState,
      accountSnapshots,
      rmdRequirements
    });

    let totalQCDAmount = 0;
    let rothConversionAmount = 0;
    let rothConversionTax = { federalTax: 0, stateTax: 0 };
    let totalTaxBenefitFromHarvesting = 0;
    let totalHarvestedLoss = 0;
    let backdoorRothContribution = 0;
    let backdoorRothConversion = 0;
    let megaBackdoorRothContribution = 0;
    let megaBackdoorRothConversion = 0;
    let megaBackdoorRothEmployerMatch = 0;

    ruleResults.forEach(ruleResult => {
      if (ruleResult.balanceModifications) {
        ruleResult.balanceModifications.forEach(mod => {
          accountSnapshots[mod.accountIndex].balance += mod.change;
          if (mod.costBasisUpdate) {
            accountSnapshots[mod.accountIndex].costBasis = mod.costBasisUpdate;
          }
        });
      }

      if (ruleResult.totalQCD !== undefined) {
        totalQCDAmount = ruleResult.totalQCD / 100;
      }
      if (ruleResult.name === 'roth-conversions' && ruleResult.conversionAmount !== undefined) {
        rothConversionAmount = ruleResult.conversionAmount / 100;
      }
      if (ruleResult.name === 'roth-conversions' && ruleResult.taxOnConversion !== undefined) {
        rothConversionTax = ruleResult.taxOnConversion;
      }
      if (ruleResult.taxBenefitFromHarvesting !== undefined) {
        totalTaxBenefitFromHarvesting = ruleResult.taxBenefitFromHarvesting;
      }
      if (ruleResult.harvestedLoss !== undefined) {
        totalHarvestedLoss = ruleResult.harvestedLoss;
      }
      if (ruleResult.name === 'backdoor-roth') {
        if (ruleResult.contributionAmount !== undefined) {
          backdoorRothContribution = ruleResult.contributionAmount / 100;
        }
        if (ruleResult.conversionAmount !== undefined) {
          backdoorRothConversion = ruleResult.conversionAmount / 100;
        }
      }
      if (ruleResult.name === 'mega-backdoor-roth') {
        if (ruleResult.contributionAmount !== undefined) {
          megaBackdoorRothContribution = ruleResult.contributionAmount / 100;
        }
        if (ruleResult.conversionAmount !== undefined) {
          megaBackdoorRothConversion = ruleResult.conversionAmount / 100;
        }
        if (ruleResult.employerMatch !== undefined) {
          megaBackdoorRothEmployerMatch = ruleResult.employerMatch / 100;
        }
      }
    });

    if (netCashFlow < 0) {
      totalWithdrawalNeeded = Math.abs(netCashFlow);
    }

    const rmdAfterQCD = Math.max(0, totalRmdWithdrawalCents - (totalQCDAmount * 100));
    totalWithdrawalNeeded = Math.max(totalWithdrawalNeeded, rmdAfterQCD / 100);

    // Use withdrawal strategy to allocate across accounts
    const withdrawalStrategy = plan.withdrawalStrategy || 'proportional';
    const withdrawalsInCents = calculateWithdrawals(
      withdrawalStrategy,
      plan.accounts,
      totalWithdrawalNeeded,
      rmdRequirements,
      { filingStatus: plan.taxProfile.filingStatus, taxYear }
    );

    for (let i = 0; i < accountSnapshots.length; i++) {
      let balance = accountSnapshots[i].balance / 100;
      const account = plan.accounts[i];
      const contribution = account.annualContribution || 0;

      // Add contribution to balance
      balance += contribution;

      // Get withdrawal for this account from strategy
      const withdrawalAmount = withdrawalsInCents[i] / 100;

      // Calculate taxes on withdrawals
      let federalTax = 0;
      let stateTax = 0;

      if (withdrawalAmount > 0) {
        if (account.type === '401k' || account.type === 'IRA') {
          const taxResult = calculateTotalTax(
            plan.taxProfile.state,
            withdrawalAmount * 100,
            plan.taxProfile.filingStatus,
            taxYear
          );
          federalTax = taxResult.federalTax / 100;
          stateTax = taxResult.stateTax / 100;
        } else if (account.type === 'Taxable') {
          federalTax = calculateLongTermCapitalGainsTax(
            withdrawalAmount * 100,
            plan.taxProfile.filingStatus,
            taxYear
          ) / 100;
          const stateTaxResult = calculateTotalTax(
            plan.taxProfile.state,
            withdrawalAmount * 100,
            plan.taxProfile.filingStatus,
            taxYear
          );
          stateTax = stateTaxResult.stateTax / 100;
        }
        // Roth and HSA: tax-free withdrawals
      }

      totalFederalTax += federalTax + (rothConversionTax.federalTax || 0);
      totalStateTax += stateTax + (rothConversionTax.stateTax || 0);

      // Apply withdrawal
      balance -= withdrawalAmount;

      // Apply investment growth
      const growthRate = getAccountGrowthRate(account.type, plan.assumptions);
      balance *= (1 + growthRate);

      accountSnapshots[i].balance = balance * 100;
      totalBalance += balance;
    }

    results.push({
      year: currentYear,
      age: age,
      isRetired: isRetired,
      totalBalance: totalBalance,
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      socialSecurityIncome: socialSecurityIncome,
      accountBalances: accountSnapshots.map(acc => acc.balance / 100),
      accounts: accountSnapshots.map(acc => ({
        balance: acc.balance,
        costBasis: acc.costBasis
      })),
      totalFederalTax: totalFederalTax,
      totalStateTax: totalStateTax,
      totalFicaTax: totalFicaTax,
      totalRmdAmount: totalRmdAmount,
      totalQCD: totalQCDAmount,
      rothConversions: rothConversionAmount,
      backdoorRothContribution,
      backdoorRothConversion,
      megaBackdoorRothContribution,
      megaBackdoorRothConversion,
      megaBackdoorRothEmployerMatch: megaBackdoorRothEmployerMatch,
      totalTax: Math.max(0, totalFederalTax + totalStateTax + totalFicaTax - totalTaxBenefitFromHarvesting),
      harvestedLoss: totalHarvestedLoss / 100,
      taxBenefitFromHarvesting: totalTaxBenefitFromHarvesting / 100,
      taxLossHarvestingBenefit: totalTaxBenefitFromHarvesting
    });
  }

  return results;
}
