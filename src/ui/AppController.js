/**
 * AppController - Main UI controller for application
 * Thin controller layer that delegates to domain layer
 */
import { Expense } from '../core/models/Expense.js';
import { Income } from '../core/models/Income.js';
import { project } from '../calculations/projection.js';
import {
  runMonteCarloSimulation,
  getSuccessProbabilityWithConfidence,
} from '../calculations/monte-carlo.js';
import { StorageManager } from '../storage/StorageManager.js';
import { ChartRenderer } from './ChartRenderer.js';
import { PlanController } from './PlanController.js';
import { AccountController } from './AccountController.js';

export class AppController {
  constructor() {
    this.currentPlan = null;
    this.projectionResults = null;
    this.monteCarloResults = null;
    this.chartRenderer = new ChartRenderer();
    this.accountController = new AccountController(this.currentPlan, StorageManager);
    this.planController = new PlanController(
      this.currentPlan,
      StorageManager,
      this.accountController
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
    this.renderExpensesList();
    this.renderIncomesList();
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

  renderExpensesList() {
    const container = document.getElementById('expensesList');
    container.innerHTML = '';

    if (this.currentPlan.expenses.length === 0) {
      container.innerHTML =
        '<p class="text-muted">No expenses configured yet. Add one to forecast spending.</p>';
      return;
    }

    this.currentPlan.expenses.forEach((expense) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <h4>${this.escapeHtml(expense.name)}</h4>
          <div class="card-actions">
            <button class="btn btn-danger btn-small" onclick="app.deleteExpense('${expense.id}')">Delete</button>
          </div>
        </div>
        <div class="form-row">
          <div>
            <div class="result-label">Annual Amount</div>
            <div class="result-value">$${(expense.baseAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div class="result-label">Starts Year</div>
            <div class="result-value">${expense.startYear}</div>
          </div>
          <div>
            <div class="result-label">Inflation Adjusted</div>
            <div class="result-value">${expense.inflationAdjusted ? 'Yes' : 'No'}</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderIncomesList() {
    const container = document.getElementById('incomesList');
    container.innerHTML = '';

    if (this.currentPlan.incomes.length === 0) {
      container.innerHTML =
        '<p class="text-muted">No income configured yet. Add one to model your earnings.</p>';
      return;
    }

    this.currentPlan.incomes.forEach((income) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <h4>${this.escapeHtml(income.name)} <span class="badge badge-success">${income.type}</span></h4>
          <div class="card-actions">
            <button class="btn btn-danger btn-small" onclick="app.deleteIncome('${income.id}')">Delete</button>
          </div>
        </div>
        <div class="form-row">
          <div>
            <div class="result-label">Annual Amount</div>
            <div class="result-value">$${(income.baseAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div class="result-label">Starts Year</div>
            <div class="result-value">${income.startYear}</div>
          </div>
          <div>
            <div class="result-label">Growth Rate</div>
            <div class="result-value">${(income.growthRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
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

  // Expense Management

  showAddExpenseModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'addExpenseModal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Add Expense</h2>
        </div>
        <div class="form-group">
          <label class="form-label">Expense Name</label>
          <input type="text" id="expenseName" class="form-control" placeholder="e.g., Living Expenses">
        </div>
        <div class="form-group">
          <label class="form-label">Annual Amount <span class="form-label-hint">$</span></label>
          <input type="number" id="expenseAmount" class="form-control" placeholder="60000" min="0" step="100">
        </div>
        <div class="form-group">
          <label class="form-label">Start Year <span class="form-label-hint"># of years from now</span></label>
          <input type="number" id="expenseStartYear" class="form-control" placeholder="0" min="0" step="1" value="0">
        </div>
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="expenseInflation" checked> Inflation Adjusted
          </label>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="document.getElementById('addExpenseModal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="app.addExpense()">Add</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  addExpense() {
    const name = document.getElementById('expenseName').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
    const startYear = parseInt(document.getElementById('expenseStartYear').value) || 0;
    const inflationAdjusted = document.getElementById('expenseInflation').checked;

    if (!name || !amount) {
      alert('Please fill required fields');
      return;
    }

    const expense = new Expense(name, amount, startYear, inflationAdjusted);
    this.currentPlan.addExpense(expense);
    StorageManager.savePlan(this.currentPlan);
    this.renderExpensesList();
    document.getElementById('addExpenseModal').remove();
  }

  deleteExpense(expenseId) {
    if (!confirm('Delete this expense?')) return;
    this.currentPlan.removeExpense(expenseId);
    StorageManager.savePlan(this.currentPlan);
    this.renderExpensesList();
  }

  // Income Management

  showAddIncomeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'addIncomeModal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Add Income</h2>
        </div>
        <div class="form-group">
          <label class="form-label">Income Name</label>
          <input type="text" id="incomeName" class="form-control" placeholder="e.g., Software Engineer Salary">
        </div>
        <div class="form-group">
          <label class="form-label">Income Type</label>
          <select id="incomeType" class="form-control">
            <option value="salary">Salary/Wages</option>
            <option value="business">Business Income</option>
            <option value="pension">Pension</option>
            <option value="rental">Rental Income</option>
            <option value="dividends">Qualified Dividends (tax-advantaged)</option>
            <option value="non-qualified-dividends">Non-Qualified Dividends (ordinary tax)</option>
            <option value="interest">Interest Income (ordinary tax)</option>
            <option value="other">Other Income</option>
          </select>
          <small class="form-help">Type affects how income is taxed</small>
        </div>
        <div class="form-group">
          <label class="form-label">Annual Amount <span class="form-label-hint">$</span></label>
          <input type="number" id="incomeAmount" class="form-control" placeholder="80000" min="0" step="1000">
        </div>
        <div class="form-group">
          <label class="form-label">Start Year <span class="form-label-hint"># of years from now</span></label>
          <input type="number" id="incomeStartYear" class="form-control" placeholder="0" min="0" step="1" value="0">
        </div>
        <div class="form-group">
          <label class="form-label">End Year <span class="form-label-hint"># of years from now (optional)</span></label>
          <input type="number" id="incomeEndYear" class="form-control" placeholder="leave empty for ongoing" min="0" step="1">
          <small class="form-help">Leave empty for income that continues indefinitely</small>
        </div>
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="incomeIsOneTime"> One-time income event
          </label>
          <small class="form-help">Check if this is a one-time payment (e.g., bonus, inheritance)</small>
        </div>
        <div class="form-group">
          <label class="form-label">Annual Growth Rate <span class="form-label-hint">%</span></label>
          <input type="number" id="incomeGrowthRate" class="form-control" placeholder="3.0" min="-10" max="20" step="0.1" value="3.0">
          <small class="form-help">Expected annual raise or income growth (e.g., 3% for salary increases)</small>
        </div>

        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--color-border);">

        <h3 style="margin-bottom: 1rem; font-size: 1rem;">Smart Rules <small style="font-size: 0.8rem; font-weight: normal; color: var(--color-text-secondary);">(optional)</small></h3>

        <div class="form-group">
          <label class="form-label">Start Rule</label>
          <select id="incomeStartRule" class="form-control" onchange="app.toggleIncomeStartRuleFields()">
            <option value="manual">Manual (use start year above)</option>
            <option value="retirement">Start at retirement age</option>
            <option value="age">Start at specific age</option>
            <option value="retirement-if-age">Start at retirement IF minimum age met</option>
          </select>
          <small class="form-help">Automatically calculate start year based on rule</small>
        </div>

        <div id="incomeStartRuleAgeFields" style="display: none;">
          <div class="form-group">
            <label class="form-label">Start Age <span class="form-label-hint">years</span></label>
            <input type="number" id="incomeStartRuleAge" class="form-control" placeholder="55" min="0" max="120" step="1">
            <small class="form-help">Income will start at this age</small>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">End Rule</label>
          <select id="incomeEndRule" class="form-control" onchange="app.toggleIncomeEndRuleFields()">
            <option value="manual">Manual (use end year above)</option>
            <option value="retirement">Stop at retirement age</option>
            <option value="age">Stop at specific age</option>
          </select>
          <small class="form-help">Automatically calculate end year based on rule</small>
        </div>

        <div id="incomeEndRuleAgeFields" style="display: none;">
          <div class="form-group">
            <label class="form-label">End Age <span class="form-label-hint">years</span></label>
            <input type="number" id="incomeEndRuleAge" class="form-control" placeholder="65" min="0" max="120" step="1">
            <small class="form-help">Income will stop at this age</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="document.getElementById('addIncomeModal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="app.addIncome()">Add</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  addIncome() {
    const name = document.getElementById('incomeName').value.trim();
    const type = document.getElementById('incomeType').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value) || 0;
    const startYear = parseInt(document.getElementById('incomeStartYear').value) || 0;
    const endYear = document.getElementById('incomeEndYear').value
      ? parseInt(document.getElementById('incomeEndYear').value)
      : null;
    const isOneTime = document.getElementById('incomeIsOneTime').checked;
    const growthRate = parseFloat(document.getElementById('incomeGrowthRate').value) / 100 || 0.03;

    const startRule = document.getElementById('incomeStartRule').value;
    const startRuleAge = document.getElementById('incomeStartRuleAge').value
      ? parseInt(document.getElementById('incomeStartRuleAge').value)
      : null;
    const endRule = document.getElementById('incomeEndRule').value;
    const endRuleAge = document.getElementById('incomeEndRuleAge').value
      ? parseInt(document.getElementById('incomeEndRuleAge').value)
      : null;

    if (!name || !amount) {
      alert('Please fill required fields');
      return;
    }

    if (endYear !== null && endYear <= startYear) {
      alert('End year must be greater than start year');
      return;
    }

    const income = new Income(name, amount, startYear, type);
    income.endYear = endYear;
    income.isOneTime = isOneTime;
    income.growthRate = growthRate;
    income.startRule = startRule;
    income.startRuleAge = startRuleAge;
    income.endRule = endRule;
    income.endRuleAge = endRuleAge;
    income.growthRate = growthRate;
    this.currentPlan.addIncome(income);
    StorageManager.savePlan(this.currentPlan);
    this.renderIncomesList();
    document.getElementById('addIncomeModal').remove();
  }

  toggleIncomeStartRuleFields() {
    const rule = document.getElementById('incomeStartRule').value;
    const ageFields = document.getElementById('incomeStartRuleAgeFields');
    ageFields.style.display = rule === 'age' || rule === 'retirement-if-age' ? 'block' : 'none';
  }

  toggleIncomeEndRuleFields() {
    const rule = document.getElementById('incomeEndRule').value;
    const ageFields = document.getElementById('incomeEndRuleAgeFields');
    ageFields.style.display = rule === 'age' ? 'block' : 'none';
  }

  deleteIncome(incomeId) {
    if (!confirm('Delete this income?')) return;
    this.currentPlan.removeIncome(incomeId);
    StorageManager.savePlan(this.currentPlan);
    this.renderIncomesList();
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
