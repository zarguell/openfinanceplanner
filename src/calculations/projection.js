/**
 * Projection calculations - Pure functions for financial projections
 * No side effects, no state mutations, testable in isolation
 */

import {
   calculateFederalTax,
   calculateTotalTax,
   calculateLongTermCapitalGainsTax,
   calculateFicaTax,
   calculateRMD,
   getRmdAgeRequirement
} from './tax.js';
import { calculateSocialSecurityForYear } from './social-security.js';

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

  const startYear = new Date().getFullYear();
  const startAge = plan.taxProfile.currentAge;

  for (let year = 0; year <= yearsToProject; year++) {
    const currentYear = startYear + year;
    const age = startAge + year;
    const isRetired = age >= plan.taxProfile.retirementAge;

    // Calculate total expenses for this year
    const totalExpense = calculateTotalExpenses(
      plan.expenses,
      year,
      plan.assumptions.inflationRate
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
    let totalFicaTax = 0;
    let totalRmdAmount = 0;

    // Calculate pre-tax income for FICA calculations
    const preTaxIncome = plan.accounts.reduce((sum, acc) => sum + (acc.annualContribution || 0), 0);

    // Calculate FICA taxes on pre-retirement income
    if (!isRetired && preTaxIncome > 0) {
      const ficaResult = calculateFicaTax(Math.round(preTaxIncome * 100), plan.taxProfile.filingStatus, taxYear);
      totalFicaTax = ficaResult.totalFicaTax / 100; // Convert cents to dollars
    }

    for (let i = 0; i < accountSnapshots.length; i++) {
      let balance = accountSnapshots[i].balance / 100;
      const account = plan.accounts[i];
      let withdrawalAmount = 0;

      if (!isRetired) {
        // Accumulation phase: add contributions (after FICA taxes)
        const contribution = account.annualContribution || 0;
        balance += contribution;
      } else {
        // Distribution phase: withdrawals for expenses
        const netExpense = Math.max(0, totalExpense - socialSecurityIncome);
        withdrawalAmount = netExpense / plan.accounts.length;

        // Add RMD if required for qualified accounts
        const rmdAge = getRmdAgeRequirement(new Date().getFullYear() - startAge);
        if (age >= rmdAge && (account.type === '401k' || account.type === 'IRA' || account.type === 'Roth')) {
          const rmd = calculateRMD(Math.round(balance * 100), age, taxYear) / 100;
          withdrawalAmount = Math.max(withdrawalAmount, rmd);
          totalRmdAmount += rmd;
        }

        // Calculate taxes based on account type
        let taxAmount = 0;
        let federalTax = 0;
        let stateTax = 0;

        if (account.type === '401k' || account.type === 'IRA') {
          // Traditional retirement accounts: withdrawals taxed as ordinary income
          const taxResult = calculateTotalTax(
            plan.taxProfile.state,
            Math.round(withdrawalAmount * 100),
            plan.taxProfile.filingStatus,
            taxYear
          );
          federalTax = taxResult.federalTax / 100;
          stateTax = taxResult.stateTax / 100;
          taxAmount = federalTax + stateTax;
        } else if (account.type === 'Taxable') {
          // Taxable accounts: assume long-term capital gains tax on withdrawals
          // This is a simplification - in reality, cost basis would be tracked
          federalTax = calculateLongTermCapitalGainsTax(
            Math.round(withdrawalAmount * 100),
            plan.taxProfile.filingStatus,
            taxYear
          ) / 100;
          // State capital gains tax rates vary, using ordinary income rate as approximation
          const stateTaxResult = calculateTotalTax(
            plan.taxProfile.state,
            Math.round(withdrawalAmount * 100),
            plan.taxProfile.filingStatus,
            taxYear
          );
          stateTax = stateTaxResult.stateTax / 100;
          taxAmount = federalTax + stateTax;
        } else if (account.type === 'Roth' || account.type === 'HSA') {
          // Roth and HSA: qualified withdrawals are tax-free
          taxAmount = 0;
          federalTax = 0;
          stateTax = 0;
        }

        totalFederalTax += federalTax;
        totalStateTax += stateTax;

        // Withdraw full amount from account (taxes are paid separately)
        balance -= withdrawalAmount;
      }

      // Apply investment growth (only during accumulation phase)
      if (!isRetired) {
        const growthRate = getAccountGrowthRate(
          plan.accounts[i].type,
          plan.assumptions
        );
        balance *= (1 + growthRate);
      }

      accountSnapshots[i].balance = balance * 100;
      totalBalance += balance;
    }

    results.push({
      year: currentYear,
      age: age,
      isRetired: isRetired,
      totalBalance: totalBalance,
      totalExpense: totalExpense,
      socialSecurityIncome: socialSecurityIncome,
      accountBalances: accountSnapshots.map(acc => acc.balance / 100),
      totalFederalTax: totalFederalTax,
      totalStateTax: totalStateTax,
      totalFicaTax: totalFicaTax,
      totalRmdAmount: totalRmdAmount,
      totalTax: totalFederalTax + totalStateTax + totalFicaTax
    });
  }

  return results;
}
