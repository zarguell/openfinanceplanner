/**
 * AppController - Main UI controller for application
 * Thin controller layer that delegates to domain layer
 */
import { project } from '../calculations/projection.js';
import {
  runMonteCarloSimulation,
  getSuccessProbabilityWithConfidence,
} from '../calculations/monte-carlo.js';
import { StorageManager } from '../storage/StorageManager.js';
import { ChartRenderer } from './ChartRenderer.js';
import { PlanController } from './PlanController.js';
import { AccountController } from './AccountController.js';
import { ExpenseIncomeController } from './ExpenseIncomeController.js';

export class AppController {
  constructor() {
    this.currentPlan = null;
    this.projectionResults = null;
    this.monteCarloResults = null;
    this.chartRenderer = new ChartRenderer();
    this.accountController = new AccountController(this.currentPlan, StorageManager);
    this.expenseIncomeController = new ExpenseIncomeController(this.currentPlan, StorageManager);
    this.planController = new PlanController(
      this.currentPlan,
      StorageManager,
      this.accountController,
      this.expenseIncomeController
    );
    this.init();
  }

  init() {
    this.loadPlansList();
  }

  _syncPlanControllerCurrentPlan() {
    this.planController.currentPlan = this.currentPlan;
  }

  // Plan Management (delegated to PlanController)

  loadPlansList() {
    this.currentPlan = this.planController.currentPlan;
    this.planController.loadPlansList();
  }

  loadPlan(planId) {
    this.planController.currentPlan = this.currentPlan;
    this.planController.loadPlan(planId);
    this.currentPlan = this.planController.currentPlan;
  }

  renderPlanUI() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.renderPlanUI();
    this.accountController.currentPlan = this.currentPlan;
    this.accountController.renderAccountsList();
    this.expenseIncomeController.currentPlan = this.currentPlan;
    this.expenseIncomeController.renderExpensesList();
    this.expenseIncomeController.renderIncomesList();
    this.renderOverviewSummary();
  }

  populateAssumptionFields() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.populateAssumptionFields();
  }

  populateSocialSecurityFields() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.populateSocialSecurityFields();
  }

  renderOverviewSummary() {
    const container = document.getElementById('overviewResults');
    const totalBalance = this.currentPlan.accounts.reduce((sum, acc) => sum + acc.balance / 100, 0);
    const totalAnnualContributions = this.currentPlan.accounts.reduce(
      (sum, acc) => sum + acc.annualContribution,
      0
    );
    const yearsToRetirement =
      this.currentPlan.taxProfile.retirementAge - this.currentPlan.taxProfile.currentAge;

    container.innerHTML = `
      <div class="result-card">
        <div class="result-label">Total Savings</div>
        <div class="result-value">$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
      </div>
      <div class="result-card">
        <div class="result-label">Annual Contributions</div>
        <div class="result-value">$${totalAnnualContributions.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
      </div>
      <div class="result-card">
        <div class="result-label">Years to Retirement</div>
        <div class="result-value">${yearsToRetirement}</div>
      </div>
      <div class="result-card">
        <div class="result-label">Current Age</div>
        <div class="result-value">${this.currentPlan.taxProfile.currentAge}</div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.planController.switchTab(tabName);
  }

  saveAssumptions() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.saveAssumptions();
    this.currentPlan = this.planController.currentPlan;
  }

  // Projection

  runProjection() {
    if (!this.currentPlan) {
      alert('Please create or load a plan first');
      return;
    }

    // Run deterministic projection
    this.projectionResults = project(this.currentPlan, 40, 2025);

    // Run Monte Carlo simulation (1,000 scenarios for good statistical significance)
    this.monteCarloResults = runMonteCarloSimulation(this.currentPlan, 1000, 40, 2025);

    this.renderProjectionResults();
    this.switchTab('projection');
  }

  runMonteCarlo() {
    if (!this.currentPlan) {
      alert('Please create or load a plan first');
      return;
    }

    // Run Monte Carlo simulation only
    this.monteCarloResults = runMonteCarloSimulation(this.currentPlan, 1000, 40, 2025);
    this.renderProjectionResults();
    this.switchTab('projection');
  }

  renderProjectionResults() {
    const container = document.getElementById('projectionResults');
    if (!this.projectionResults || this.projectionResults.length === 0) {
      container.innerHTML = '<p class="alert alert-info">Run a projection to see results.</p>';
      return;
    }

    const finalBalance = this.projectionResults[this.projectionResults.length - 1].totalBalance;
    const retirementBalance = this.projectionResults.find((r) => r.isRetired)?.totalBalance || 0;
    const retirementYear = this.projectionResults.find((r) => r.isRetired)?.year || '-';
    const yearsProjected = this.projectionResults.length - 1;

    let monteCarloSection = '';
    if (this.monteCarloResults) {
      const successProb = getSuccessProbabilityWithConfidence(this.monteCarloResults);
      const successClass =
        successProb.probability >= 0.8
          ? 'badge-success'
          : successProb.probability >= 0.6
            ? 'badge-warning'
            : 'badge-danger';

      monteCarloSection = `
        <div class="card">
          <div class="card-header">
            <h3>Monte Carlo Analysis (1,000 Scenarios)</h3>
          </div>
          <div class="results-grid">
            <div class="result-card">
              <div class="result-label">Success Probability</div>
              <div class="result-value"><span class="badge ${successClass}">${(successProb.probability * 100).toFixed(1)}%</span></div>
              <div class="result-sublabel">${successProb.lowerBound.toFixed(3)} - ${successProb.upperBound.toFixed(3)} (95% CI)</div>
            </div>
            <div class="result-card">
              <div class="result-label">Average Final Balance</div>
              <div class="result-value">$${this.monteCarloResults.averageFinalBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
              <div class="result-sublabel">Across all scenarios</div>
            </div>
            <div class="result-card">
              <div class="result-label">90th Percentile</div>
              <div class="result-value">$${this.monteCarloResults.percentiles.p90.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
              <div class="result-sublabel">Best case outcome</div>
            </div>
            <div class="result-card">
              <div class="result-label">10th Percentile</div>
              <div class="result-value">$${this.monteCarloResults.percentiles.p10.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
              <div class="result-sublabel">Worst case outcome</div>
            </div>
          </div>
          <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--color-text-secondary);">
            <strong>Analysis:</strong> ${
              successProb.probability >= 0.8
                ? 'Excellent success probability!'
                : successProb.probability >= 0.6
                  ? 'Good success probability, but consider increasing savings.'
                  : 'Success probability is low. Consider adjusting assumptions or increasing contributions.'
            }
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="results-grid">
        <div class="result-card">
          <div class="result-label">Final Balance (Age 97)</div>
          <div class="result-value">$${finalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div class="result-sublabel">${this.projectionResults[this.projectionResults.length - 1].year}</div>
        </div>
        <div class="result-card">
          <div class="result-label">Balance at Retirement</div>
          <div class="result-value">$${retirementBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
          <div class="result-sublabel">${retirementYear}</div>
        </div>
      </div>

      ${monteCarloSection}

      <div class="card">
        <div class="card-header">
          <h3>Portfolio Balance Projection</h3>
        </div>
        <div class="chart-container">
          <canvas id="balanceChart"></canvas>
        </div>
      </div>

      ${
        this.monteCarloResults
          ? `
      <div class="card">
        <div class="card-header">
          <h3>Monte Carlo Fan Chart</h3>
        </div>
        <div class="chart-container">
          <canvas id="monteCarloChart"></canvas>
        </div>
      </div>
      `
          : ''
      }

      <div class="card">
        <div class="card-header">
          <h3>Asset Allocation</h3>
        </div>
        <div class="chart-container">
          <canvas id="allocationChart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Income vs Expenses</h3>
        </div>
        <div class="chart-container">
          <canvas id="cashFlowChart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Tax Breakdown Summary</h3>
        </div>
        <div class="results-grid">
          <div class="result-card">
            <div class="result-label">Total Federal Tax Paid</div>
            <div class="result-value">$${this.projectionResults.reduce((sum, r) => sum + r.totalFederalTax, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            <div class="result-sublabel">Over ${yearsProjected} years</div>
          </div>
          <div class="result-card">
            <div class="result-label">Total State Tax Paid</div>
            <div class="result-value">$${this.projectionResults.reduce((sum, r) => sum + r.totalStateTax, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            <div class="result-sublabel">Over ${yearsProjected} years</div>
          </div>
          <div class="result-card">
            <div class="result-label">Total FICA Tax Paid</div>
            <div class="result-value">$${this.projectionResults.reduce((sum, r) => sum + r.totalFicaTax, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            <div class="result-sublabel">Pre-retirement only</div>
          </div>
          <div class="result-card">
            <div class="result-label">Total RMD Withdrawals</div>
            <div class="result-value">$${this.projectionResults.reduce((sum, r) => sum + r.totalRmdAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            <div class="result-sublabel">Required minimum distributions</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Year-by-Year Projection</h3>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Age</th>
                <th class="number-cell">Balance</th>
                <th class="number-cell">Expenses</th>
                <th class="number-cell">SS Income</th>
                <th class="number-cell">Federal Tax</th>
                <th class="number-cell">State Tax</th>
                <th class="number-cell">FICA Tax</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${this.projectionResults
                .map(
                  (row) => `
                <tr>
                  <td>${row.year}</td>
                  <td>${row.age}</td>
                  <td class="number-cell">$${row.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td class="number-cell">$${row.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td class="number-cell">$${row.socialSecurityIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td class="number-cell">$${row.totalFederalTax.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td class="number-cell">$${row.totalStateTax.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td class="number-cell">$${row.totalFicaTax.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td>${row.isRetired ? '<span class="badge badge-success">Retired</span>' : '<span class="badge badge-warning">Saving</span>'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.chartRenderer.createBalanceChart('balanceChart', this.projectionResults);

    if (this.monteCarloResults) {
      this.chartRenderer.createMonteCarloFanChart(
        'monteCarloChart',
        this.monteCarloResults,
        this.projectionResults
      );
    }

    this.chartRenderer.createAllocationChart('allocationChart', this.currentPlan.accounts);

    this.chartRenderer.createCashFlowChart('cashFlowChart', this.projectionResults);
  }

  showNewPlanModal() {
    this.planController.showNewPlanModal();
  }

  createNewPlan() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.createNewPlan();
    this.currentPlan = this.planController.currentPlan;
  }

  deletePlan() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.deletePlan();
    this.currentPlan = this.planController.currentPlan;
  }

  // Account Management (delegated to AccountController)

  renderAccountsList() {
    this.accountController.currentPlan = this.currentPlan;
    this.accountController.renderAccountsList();
  }

  showAddAccountModal() {
    this.accountController.showAddAccountModal();
  }

  addAccount() {
    this.accountController.currentPlan = this.currentPlan;
    this.accountController.addAccount();
    this.currentPlan = this.accountController.currentPlan;
  }

  deleteAccount(accountId) {
    this.accountController.currentPlan = this.currentPlan;
    this.accountController.deleteAccount(accountId);
    this.currentPlan = this.accountController.currentPlan;
  }

  editAccount(accountId) {
    this.accountController.currentPlan = this.currentPlan;
    this.accountController.editAccount(accountId);
  }

  saveEditAccount(accountId) {
    this.accountController.currentPlan = this.currentPlan;
    this.accountController.saveEditAccount(accountId);
    this.currentPlan = this.accountController.currentPlan;
  }

  // Expense and Income Management (delegated to ExpenseIncomeController)

  renderExpensesList() {
    return this.expenseIncomeController.renderExpensesList();
  }

  showAddExpenseModal() {
    return this.expenseIncomeController.showAddExpenseModal();
  }

  addExpense() {
    return this.expenseIncomeController.addExpense();
  }

  deleteExpense(expenseId) {
    return this.expenseIncomeController.deleteExpense(expenseId);
  }

  renderIncomesList() {
    return this.expenseIncomeController.renderIncomesList();
  }

  showAddIncomeModal() {
    return this.expenseIncomeController.showAddIncomeModal();
  }

  addIncome() {
    return this.expenseIncomeController.addIncome();
  }

  deleteIncome(incomeId) {
    return this.expenseIncomeController.deleteIncome(incomeId);
  }

  toggleIncomeStartRuleFields() {
    return this.expenseIncomeController.toggleIncomeStartRuleFields();
  }

  toggleIncomeEndRuleFields() {
    return this.expenseIncomeController.toggleIncomeEndRuleFields();
  }

  // Import/Export

  showImportModal() {
    this.planController.showImportModal();
  }

  importPlan() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.importPlan();
    this.currentPlan = this.planController.currentPlan;
  }

  exportCurrentPlan() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.exportCurrentPlan();
  }

  // Settings

  showPlanSettingsModal() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.showPlanSettingsModal();
  }

  savePlanSettings() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.savePlanSettings();
    this.currentPlan = this.planController.currentPlan;
  }

  // Social Security Management

  toggleQCDFields() {
    const enabled = document.getElementById('settingsQCDEnabled').checked;
    const fields = document.getElementById('qcdFields');
    fields.style.display = enabled ? 'block' : 'none';
  }

  toggleQCDStrategyFields() {
    const strategy = document.getElementById('settingsQCDStrategy').value;
    const allFields = document.querySelectorAll('.qcd-fields');
    allFields.forEach((field) => (field.style.display = 'none'));

    const activeField = document.getElementById(
      `qcd${strategy.charAt(0).toUpperCase() + strategy.slice(1)}Fields`
    );
    if (activeField) {
      activeField.style.display = 'block';
    }
  }

  toggleTLHFields() {
    const enabled = document.getElementById('settingsTLHEnabled').checked;
    const fields = document.getElementById('tlhFields');
    fields.style.display = enabled ? 'block' : 'none';
  }

  toggleSocialSecurity() {
    this.planController.toggleSocialSecurity();
  }

  saveSocialSecurity() {
    this.planController.currentPlan = this.currentPlan;
    this.planController.saveSocialSecurity();
    this.currentPlan = this.planController.currentPlan;
  }

  toggleQCDStrategyFields() {
    const strategy = document.getElementById('settingsQCDStrategy').value;
    const allFields = document.querySelectorAll('.qcd-fields');
    allFields.forEach((field) => (field.style.display = 'none'));

    const activeField = document.getElementById(
      `qcd${strategy.charAt(0).toUpperCase() + strategy.slice(1)}Fields`
    );
    if (activeField) {
      activeField.style.display = 'block';
    }
  }

  toggleTLHFields() {
    const enabled = document.getElementById('settingsTLHEnabled').checked;
    const fields = document.getElementById('tlhFields');
    fields.style.display = enabled ? 'block' : 'none';
  }

  // Modal Helpers (kept in AppController for shared use)

  openModal(id) {
    document.getElementById(id).classList.add('active');
  }

  closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  // UI Helpers (kept in AppController for convenience)

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
