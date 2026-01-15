/**
 * AppController - Main UI controller for application
 * Thin controller layer that delegates to domain layer
 */
import { Plan } from '../core/models/Plan.js';
import { Account } from '../core/models/Account.js';
import { Expense } from '../core/models/Expense.js';
import { Income } from '../core/models/Income.js';
import { project } from '../calculations/projection.js';
import { runMonteCarloSimulation, getSuccessProbabilityWithConfidence } from '../calculations/monte-carlo.js';
import { StorageManager } from '../storage/StorageManager.js';
import { ChartRenderer } from './ChartRenderer.js';

export class AppController {
  constructor() {
    this.currentPlan = null;
    this.projectionResults = null;
    this.monteCarloResults = null;
    this.chartRenderer = new ChartRenderer();
    this.init();
  }

  init() {
    this.loadPlansList();
  }

  // Plan Management

  loadPlansList() {
    const list = StorageManager.listPlans();
    const planListEl = document.getElementById('planList');
    planListEl.innerHTML = '';

    if (list.length === 0) {
      planListEl.innerHTML = '<li style="color: var(--color-text-secondary); font-size: 12px;">No plans yet</li>';
      return;
    }

    list.forEach(meta => {
      const li = document.createElement('li');
      li.className = `plan-item ${this.currentPlan?.id === meta.id ? 'active' : ''}`;
      li.onclick = () => this.loadPlan(meta.id);
      li.innerHTML = `
        <div class="plan-item-name">${this.escapeHtml(meta.name)}</div>
        <div class="plan-item-date">${new Date(meta.lastModified).toLocaleDateString()}</div>
      `;
      planListEl.appendChild(li);
    });
  }

  loadPlan(planId) {
    const planData = StorageManager.loadPlan(planId);
    if (planData) {
      // Reconstruct domain objects from plain JSON
      this.currentPlan = Plan.fromJSON(planData);
      this.currentPlan.accounts = planData.accounts.map(acc =>
        acc instanceof Account ? acc : Account.fromJSON(acc)
      );
      this.currentPlan.expenses = planData.expenses.map(exp =>
        exp instanceof Expense ? exp : Expense.fromJSON(exp)
      );
      this.currentPlan.incomes = planData.incomes ? planData.incomes.map(inc =>
        inc instanceof Income ? inc : Income.fromJSON(inc)
      ) : [];

      this.renderPlanUI();
      this.loadPlansList();
    }
  }

  renderPlanUI() {
    const contentArea = document.getElementById('contentArea');
    const headerTitle = document.getElementById('headerTitle');
    headerTitle.textContent = this.currentPlan.name;
    document.getElementById('deleteBtn').style.display = 'block';

    contentArea.innerHTML = `
      <div class="tabs">
        <button class="tab active" onclick="app.switchTab('overview')">Overview</button>
        <button class="tab" onclick="app.switchTab('assumptions')">Assumptions</button>
        <button class="tab" onclick="app.switchTab('socialsecurity')">Social Security</button>
        <button class="tab" onclick="app.switchTab('income')">Income</button>
        <button class="tab" onclick="app.switchTab('accounts')">Accounts</button>
        <button class="tab" onclick="app.switchTab('expenses')">Expenses</button>
        <button class="tab" onclick="app.switchTab('projection')">Projection</button>
      </div>

      <div id="overviewTab" class="tab-content active">
        <div class="results-grid" id="overviewResults"></div>
        <button class="btn btn-primary" onclick="app.runProjection()">Run Projection</button>
      </div>

      <div id="assumptionsTab" class="tab-content">
        <div class="card">
          <div class="card-header">
            <h3>Financial Assumptions</h3>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Inflation Rate <span class="form-label-hint">%</span></label>
              <input type="number" id="inflationRate" class="form-control" step="0.001" min="0" max="0.2">
            </div>
            <div class="form-group">
              <label class="form-label">Equity Growth Rate <span class="form-label-hint">%</span></label>
              <input type="number" id="equityGrowthRate" class="form-control" step="0.001" min="0" max="0.3">
            </div>
            <div class="form-group">
              <label class="form-label">Bond Growth Rate <span class="form-label-hint">%</span></label>
              <input type="number" id="bondGrowthRate" class="form-control" step="0.001" min="0" max="0.2">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Equity Volatility <span class="form-label-hint">%</span></label>
              <input type="number" id="equityVolatility" class="form-control" step="0.1" min="0" max="50" placeholder="12.0">
              <small class="form-help">Annual volatility for stocks (e.g., 12% for typical market)</small>
            </div>
            <div class="form-group">
              <label class="form-label">Bond Volatility <span class="form-label-hint">%</span></label>
              <input type="number" id="bondVolatility" class="form-control" step="0.1" min="0" max="20" placeholder="4.0">
              <small class="form-help">Annual volatility for bonds (e.g., 4% for government bonds)</small>
            </div>
          </div>
          <button class="btn btn-primary" onclick="app.saveAssumptions()" style="margin-top: 1rem;">Save</button>
        </div>
      </div>

      <div id="socialsecurityTab" class="tab-content">
        <div class="card">
          <div class="card-header">
            <h3>Social Security Benefits</h3>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="socialSecurityEnabled" onchange="app.toggleSocialSecurity()">
                Include Social Security income in projections
              </label>
            </div>
          </div>
          <div id="socialSecurityFields" style="display: none;">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Birth Year</label>
                <input type="number" id="birthYear" class="form-control" min="1900" max="2100">
                <small class="form-help">Used to calculate Full Retirement Age (FRA)</small>
              </div>
              <div class="form-group">
                <label class="form-label">Monthly Benefit at FRA <span class="form-label-hint">$</span></label>
                <input type="number" id="monthlyBenefit" class="form-control" step="10" min="0" max="5000">
                <small class="form-help">Monthly benefit amount at your Full Retirement Age</small>
              </div>
              <div class="form-group">
                <label class="form-label">Filing Age</label>
                <select id="filingAge" class="form-control">
                  <option value="62">62 (Early - reduced benefits)</option>
                  <option value="63">63 (Early - reduced benefits)</option>
                  <option value="64">64 (Early - reduced benefits)</option>
                  <option value="65">65 (FRA for some - check your FRA)</option>
                  <option value="66">66 (FRA for some - check your FRA)</option>
                  <option value="67">67 (FRA for most - check your FRA)</option>
                  <option value="68">68 (Delayed - increased benefits)</option>
                  <option value="69">69 (Delayed - increased benefits)</option>
                  <option value="70">70 (Delayed - maximum benefits)</option>
                </select>
                <small class="form-help">Age when you plan to start claiming benefits</small>
              </div>
            </div>
            <div id="socialSecurityEstimate" class="alert alert-info" style="margin-top: 1rem; display: none;">
              <strong>Estimated Annual Benefit:</strong> $<span id="estimatedAnnualBenefit">-</span><br>
              <strong>Full Retirement Age:</strong> <span id="estimatedFRA">-</span>
            </div>
          </div>
          <button class="btn btn-primary" onclick="app.saveSocialSecurity()" style="margin-top: 1rem;">Save Social Security Settings</button>
        </div>
      </div>

      <div id="incomeTab" class="tab-content">
        <div id="incomesList"></div>
        <button class="btn btn-primary" onclick="app.showAddIncomeModal()" style="margin-top: 1rem;">+ Add Income</button>
      </div>

      <div id="accountsTab" class="tab-content">
        <div id="accountsList"></div>
        <button class="btn btn-primary" onclick="app.showAddAccountModal()" style="margin-top: 1rem;">+ Add Account</button>
      </div>

      <div id="expensesTab" class="tab-content">
        <div id="expensesList"></div>
        <button class="btn btn-primary" onclick="app.showAddExpenseModal()" style="margin-top: 1rem;">+ Add Expense</button>
      </div>

      <div id="projectionTab" class="tab-content">
        <div id="projectionResults"></div>
      </div>
    `;

    this.populateAssumptionFields();
    this.populateSocialSecurityFields();
    this.renderAccountsList();
    this.renderExpensesList();
    this.renderIncomesList();
    this.renderOverviewSummary();
  }

  populateAssumptionFields() {
    document.getElementById('inflationRate').value = (this.currentPlan.assumptions.inflationRate * 100).toFixed(2);
    document.getElementById('equityGrowthRate').value = (this.currentPlan.assumptions.equityGrowthRate * 100).toFixed(2);
    document.getElementById('bondGrowthRate').value = (this.currentPlan.assumptions.bondGrowthRate * 100).toFixed(2);
    document.getElementById('equityVolatility').value = (this.currentPlan.assumptions.equityVolatility * 100).toFixed(1);
    document.getElementById('bondVolatility').value = (this.currentPlan.assumptions.bondVolatility * 100).toFixed(1);
  }

  populateSocialSecurityFields() {
    const ss = this.currentPlan.socialSecurity;
    document.getElementById('socialSecurityEnabled').checked = ss.enabled;

    if (ss.enabled) {
      document.getElementById('socialSecurityFields').style.display = 'block';
      document.getElementById('birthYear').value = ss.birthYear || '';
      document.getElementById('monthlyBenefit').value = ss.monthlyBenefit || '';
      document.getElementById('filingAge').value = ss.filingAge || this.currentPlan.taxProfile.retirementAge;
    } else {
      document.getElementById('socialSecurityFields').style.display = 'none';
    }
  }

  renderAccountsList() {
    const container = document.getElementById('accountsList');
    container.innerHTML = '';

    if (this.currentPlan.accounts.length === 0) {
      container.innerHTML = '<p class="text-muted">No accounts yet. Add one to get started.</p>';
      return;
    }

    this.currentPlan.accounts.forEach(account => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <h4>${this.escapeHtml(account.name)} <span class="badge badge-success">${account.type}</span></h4>
          <div class="card-actions">
            <button class="btn btn-outline btn-small" onclick="app.editAccount('${account.id}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="app.deleteAccount('${account.id}')">Delete</button>
          </div>
        </div>
        <div class="form-row">
          <div>
            <div class="result-label">Balance</div>
            <div class="result-value">$${(account.balance / 100).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div>
            <div class="result-label">Annual Contribution</div>
            <div class="result-value">$${(account.annualContribution).toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
          </div>
          <div>
            <div class="result-label">Withdrawal Rate</div>
            <div class="result-value">${(account.withdrawalRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderExpensesList() {
    const container = document.getElementById('expensesList');
    container.innerHTML = '';

    if (this.currentPlan.expenses.length === 0) {
      container.innerHTML = '<p class="text-muted">No expenses configured yet. Add one to forecast spending.</p>';
      return;
    }

    this.currentPlan.expenses.forEach(expense => {
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
            <div class="result-value">$${(expense.baseAmount / 100).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
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
      container.innerHTML = '<p class="text-muted">No income configured yet. Add one to model your earnings.</p>';
      return;
    }

    this.currentPlan.incomes.forEach(income => {
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
            <div class="result-value">$${(income.baseAmount / 100).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
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
    const totalAnnualContributions = this.currentPlan.accounts.reduce((sum, acc) => sum + acc.annualContribution, 0);
    const yearsToRetirement = this.currentPlan.taxProfile.retirementAge - this.currentPlan.taxProfile.currentAge;

    container.innerHTML = `
      <div class="result-card">
        <div class="result-label">Total Savings</div>
        <div class="result-value">$${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
      </div>
      <div class="result-card">
        <div class="result-label">Annual Contributions</div>
        <div class="result-value">$${totalAnnualContributions.toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
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
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));

    // Show selected tab
    const contentMap = {
      'overview': 'overviewTab',
      'assumptions': 'assumptionsTab',
      'socialsecurity': 'socialsecurityTab',
      'income': 'incomeTab',
      'accounts': 'accountsTab',
      'expenses': 'expensesTab',
      'projection': 'projectionTab'
    };

    const tab = document.getElementById(contentMap[tabName]);
    if (tab) {
      tab.classList.add('active');
    }

    // Mark button as active
    event.target.classList.add('active');
  }

  saveAssumptions() {
    this.currentPlan.assumptions.inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
    this.currentPlan.assumptions.equityGrowthRate = parseFloat(document.getElementById('equityGrowthRate').value) / 100;
    this.currentPlan.assumptions.bondGrowthRate = parseFloat(document.getElementById('bondGrowthRate').value) / 100;
    this.currentPlan.assumptions.equityVolatility = parseFloat(document.getElementById('equityVolatility').value) / 100;
    this.currentPlan.assumptions.bondVolatility = parseFloat(document.getElementById('bondVolatility').value) / 100;
    this.currentPlan.touch();
    StorageManager.savePlan(this.currentPlan);
    alert('Assumptions saved!');
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
    const retirementBalance = this.projectionResults.find(r => r.isRetired)?.totalBalance || 0;
    const retirementYear = this.projectionResults.find(r => r.isRetired)?.year || '-';
    const yearsProjected = this.projectionResults.length - 1;

    let monteCarloSection = '';
    if (this.monteCarloResults) {
      const successProb = getSuccessProbabilityWithConfidence(this.monteCarloResults);
      const successClass = successProb.probability >= 0.8 ? 'badge-success' :
                          successProb.probability >= 0.6 ? 'badge-warning' : 'badge-danger';

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
              <div class="result-value">$${this.monteCarloResults.averageFinalBalance.toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
              <div class="result-sublabel">Across all scenarios</div>
            </div>
            <div class="result-card">
              <div class="result-label">90th Percentile</div>
              <div class="result-value">$${this.monteCarloResults.percentiles.p90.toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
              <div class="result-sublabel">Best case outcome</div>
            </div>
            <div class="result-card">
              <div class="result-label">10th Percentile</div>
              <div class="result-value">$${this.monteCarloResults.percentiles.p10.toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
              <div class="result-sublabel">Worst case outcome</div>
            </div>
          </div>
          <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--color-text-secondary);">
            <strong>Analysis:</strong> ${successProb.probability >= 0.8 ? 'Excellent success probability!' :
                                      successProb.probability >= 0.6 ? 'Good success probability, but consider increasing savings.' :
                                      'Success probability is low. Consider adjusting assumptions or increasing contributions.'}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="results-grid">
        <div class="result-card">
          <div class="result-label">Final Balance (Age 97)</div>
          <div class="result-value">$${finalBalance.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
          <div class="result-sublabel">${this.projectionResults[this.projectionResults.length - 1].year}</div>
        </div>
        <div class="result-card">
          <div class="result-label">Balance at Retirement</div>
          <div class="result-value">$${retirementBalance.toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
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

      ${this.monteCarloResults ? `
      <div class="card">
        <div class="card-header">
          <h3>Monte Carlo Fan Chart</h3>
        </div>
        <div class="chart-container">
          <canvas id="monteCarloChart"></canvas>
        </div>
      </div>
      ` : ''}

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
            <div class="result-value">$${this.projectionResults.reduce((sum, r) => sum + r.totalFederalTax, 0).toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
            <div class="result-sublabel">Over ${yearsProjected} years</div>
          </div>
          <div class="result-card">
            <div class="result-label">Total State Tax Paid</div>
            <div class="result-value">$${this.projectionResults.reduce((sum, r) => sum + r.totalStateTax, 0).toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
            <div class="result-sublabel">Over ${yearsProjected} years</div>
          </div>
          <div class="result-card">
            <div class="result-label">Total FICA Tax Paid</div>
            <div class="result-value">$${this.projectionResults.reduce((sum, r) => sum + r.totalFicaTax, 0).toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
            <div class="result-sublabel">Pre-retirement only</div>
          </div>
          <div class="result-card">
            <div class="result-label">Total RMD Withdrawals</div>
            <div class="result-value">$${this.projectionResults.reduce((sum, r) => sum + r.totalRmdAmount, 0).toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
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
              ${this.projectionResults.map(row => `
                <tr>
                  <td>${row.year}</td>
                  <td>${row.age}</td>
                  <td class="number-cell">$${row.totalBalance.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                  <td class="number-cell">$${row.totalExpense.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                  <td class="number-cell">$${row.socialSecurityIncome.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                  <td class="number-cell">$${row.totalFederalTax.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                  <td class="number-cell">$${row.totalStateTax.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                  <td class="number-cell">$${row.totalFicaTax.toLocaleString('en-US', {minimumFractionDigits: 0})}</td>
                  <td>${row.isRetired ? '<span class="badge badge-success">Retired</span>' : '<span class="badge badge-warning">Saving</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.chartRenderer.createBalanceChart('balanceChart', this.projectionResults);

    if (this.monteCarloResults) {
      this.chartRenderer.createMonteCarloFanChart('monteCarloChart', this.monteCarloResults, this.projectionResults);
    }

    this.chartRenderer.createAllocationChart('allocationChart', this.currentPlan.accounts);

    this.chartRenderer.createCashFlowChart('cashFlowChart', this.projectionResults);
  }

  showNewPlanModal() {
    this.openModal('newPlanModal');
  }

  createNewPlan() {
    const name = document.getElementById('newPlanName').value.trim();
    const age = parseInt(document.getElementById('newPlanAge').value);
    const retirementAge = parseInt(document.getElementById('newPlanRetirementAge').value);

    if (!name || !age || !retirementAge) {
      alert('Please fill all fields');
      return;
    }

    const plan = new Plan(name, age, retirementAge);
    // Add default account
    plan.addAccount(new Account('Main Portfolio', '401k', 100000));
    // Add default expense
    plan.addExpense(new Expense('Living Expenses', 60000, 0));

    StorageManager.savePlan(plan);
    this.closeModal('newPlanModal');
    this.loadPlansList();
    this.loadPlan(plan.id);

    document.getElementById('newPlanName').value = '';
    document.getElementById('newPlanAge').value = '';
    document.getElementById('newPlanRetirementAge').value = '';
  }

  deletePlan() {
    if (!this.currentPlan) return;
    if (!confirm(`Delete plan "${this.currentPlan.name}"?`)) return;

    StorageManager.deletePlan(this.currentPlan.id);
    this.currentPlan = null;
    this.chartRenderer.destroyAll();
    this.loadPlansList();

    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <h2>Plan Deleted</h2>
        <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">
          Create a new plan to get started.
        </p>
      </div>
    `;
    document.getElementById('headerTitle').textContent = 'Welcome';
    document.getElementById('deleteBtn').style.display = 'none';
  }

  // Account Management

  showAddAccountModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'addAccountModal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Add Account</h2>
        </div>
        <div class="form-group">
          <label class="form-label">Account Name</label>
          <input type="text" id="accountName" class="form-control" placeholder="e.g., 401(k)">
        </div>
        <div class="form-group">
          <label class="form-label">Account Type</label>
          <select id="accountType" class="form-control">
            <option value="401k">401(k)</option>
            <option value="IRA">Traditional IRA</option>
            <option value="Roth">Roth IRA</option>
            <option value="HSA">HSA</option>
            <option value="Taxable">Taxable Brokerage</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Current Balance <span class="form-label-hint">$</span></label>
          <input type="number" id="accountBalance" class="form-control" placeholder="100000" min="0" step="1000">
        </div>
        <div class="form-group">
          <label class="form-label">Annual Contribution <span class="form-label-hint">$</span></label>
          <input type="number" id="accountContribution" class="form-control" placeholder="23500" min="0" step="100">
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="document.getElementById('addAccountModal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="app.addAccount()">Add</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  addAccount() {
    const name = document.getElementById('accountName').value.trim();
    const type = document.getElementById('accountType').value;
    const balance = parseFloat(document.getElementById('accountBalance').value) || 0;
    const contribution = parseFloat(document.getElementById('accountContribution').value) || 0;

    if (!name || !balance) {
      alert('Please fill required fields');
      return;
    }

    const account = new Account(name, type, balance);
    account.annualContribution = contribution;
    this.currentPlan.addAccount(account);
    StorageManager.savePlan(this.currentPlan);
    this.renderAccountsList();
    document.getElementById('addAccountModal').remove();
  }

  deleteAccount(accountId) {
    if (!confirm('Delete this account?')) return;
    this.currentPlan.removeAccount(accountId);
    StorageManager.savePlan(this.currentPlan);
    this.renderAccountsList();
  }

  editAccount(accountId) {
    const account = this.currentPlan.accounts.find(a => a.id === accountId);
    if (!account) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'editAccountModal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Edit Account</h2>
        </div>
        <div class="form-group">
          <label class="form-label">Account Name</label>
          <input type="text" id="editAccountName" class="form-control" value="${this.escapeHtml(account.name)}">
        </div>
        <div class="form-group">
          <label class="form-label">Current Balance <span class="form-label-hint">$</span></label>
          <input type="number" id="editAccountBalance" class="form-control" value="${(account.balance / 100).toFixed(2)}" min="0" step="1000">
        </div>
        <div class="form-group">
          <label class="form-label">Annual Contribution <span class="form-label-hint">$</span></label>
          <input type="number" id="editAccountContribution" class="form-control" value="${account.annualContribution}" min="0" step="100">
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="document.getElementById('editAccountModal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="app.saveEditAccount('${accountId}')">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  saveEditAccount(accountId) {
    const account = this.currentPlan.accounts.find(a => a.id === accountId);
    if (!account) return;

    account.name = document.getElementById('editAccountName').value.trim();
    account.balance = parseFloat(document.getElementById('editAccountBalance').value) * 100;
    account.annualContribution = parseFloat(document.getElementById('editAccountContribution').value);

    this.currentPlan.touch();
    StorageManager.savePlan(this.currentPlan);
    this.renderAccountsList();
    document.getElementById('editAccountModal').remove();
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
    const endYear = document.getElementById('incomeEndYear').value ? parseInt(document.getElementById('incomeEndYear').value) : null;
    const isOneTime = document.getElementById('incomeIsOneTime').checked;
    const growthRate = parseFloat(document.getElementById('incomeGrowthRate').value) / 100 || 0.03;
    
    const startRule = document.getElementById('incomeStartRule').value;
    const startRuleAge = document.getElementById('incomeStartRuleAge').value ? parseInt(document.getElementById('incomeStartRuleAge').value) : null;
    const endRule = document.getElementById('incomeEndRule').value;
    const endRuleAge = document.getElementById('incomeEndRuleAge').value ? parseInt(document.getElementById('incomeEndRuleAge').value) : null;

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
    ageFields.style.display = (rule === 'age' || rule === 'retirement-if-age') ? 'block' : 'none';
  }

  toggleIncomeEndRuleFields() {
    const rule = document.getElementById('incomeEndRule').value;
    const ageFields = document.getElementById('incomeEndRuleAgeFields');
    ageFields.style.display = (rule === 'age') ? 'block' : 'none';
  }

  deleteIncome(incomeId) {
    if (!confirm('Delete this income?')) return;
    this.currentPlan.removeIncome(incomeId);
    StorageManager.savePlan(this.currentPlan);
    this.renderIncomesList();
  }

  // Import/Export

  showImportModal() {
    this.openModal('importModal');
  }

  importPlan() {
    const textContent = document.getElementById('importText').value.trim();
    const fileInput = document.getElementById('importFile');

    const processImport = (jsonString) => {
      try {
        const plan = StorageManager.importPlan(jsonString);
        StorageManager.savePlan(plan);
        this.closeModal('importModal');
        this.loadPlansList();
        this.loadPlan(plan.id);
        alert('Plan imported successfully!');
        document.getElementById('importText').value = '';
        fileInput.value = '';
      } catch (err) {
        alert('Invalid JSON format: ' + err.message);
      }
    };

    if (textContent) {
      processImport(textContent);
    } else if (fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processImport(e.target.result);
      };
      reader.readAsText(fileInput.files[0]);
    } else {
      alert('Please paste JSON or select a file');
    }
  }

  exportCurrentPlan() {
    if (!this.currentPlan) {
      alert('No plan selected');
      return;
    }

    const json = StorageManager.exportPlan(this.currentPlan);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentPlan.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Settings

  showPlanSettingsModal() {
    if (!this.currentPlan) return;

    const content = document.getElementById('planSettingsContent');
    const rc = this.currentPlan.rothConversions || { enabled: false, strategy: 'fixed', annualAmount: 0, percentage: 0.05, bracketTop: 0 };
    const qcd = this.currentPlan.qcdSettings || { enabled: false, strategy: 'fixed', annualAmount: 0, percentage: 0.1, marginalTaxRate: 0.24 };
    const tlh = this.currentPlan.taxLossHarvesting || { enabled: false, strategy: 'all', threshold: 100000 };

    content.innerHTML = `
      <div class="form-group">
        <label class="form-label">Plan Name</label>
        <input type="text" id="settingsPlanName" class="form-control" value="${this.escapeHtml(this.currentPlan.name)}">
      </div>
      <div class="form-group">
        <label class="form-label">Current Age</label>
        <input type="number" id="settingsCurrentAge" class="form-control" value="${this.currentPlan.taxProfile.currentAge}">
      </div>
      <div class="form-group">
        <label class="form-label">Retirement Age</label>
        <input type="number" id="settingsRetirementAge" class="form-control" value="${this.currentPlan.taxProfile.retirementAge}">
      </div>
      <div class="form-group">
        <label class="form-label">Estimated Tax Rate <span class="form-label-hint">%</span></label>
        <input type="number" id="settingsEstimatedTaxRate" class="form-control" value="${(this.currentPlan.taxProfile.estimatedTaxRate * 100).toFixed(1)}" step="0.1" min="0" max="50">
        <small class="form-help">Combined federal + state tax rate for retirement withdrawals (e.g., 25% = 0.25)</small>
      </div>
      <div class="form-group">
        <label class="form-label">Withdrawal Strategy</label>
        <select id="settingsWithdrawalStrategy" class="form-control">
          <option value="proportional" ${this.currentPlan.withdrawalStrategy === 'proportional' ? 'selected' : ''}>Proportional (default)</option>
          <option value="tax-efficient" ${this.currentPlan.withdrawalStrategy === 'tax-efficient' ? 'selected' : ''}>Tax-Efficient (recommended)</option>
          <option value="tax-aware" ${this.currentPlan.withdrawalStrategy === 'tax-aware' ? 'selected' : ''}>Tax-Aware (advanced)</option>
        </select>
        <small class="form-help">Strategy for ordering withdrawals from accounts in retirement</small>
      </div>

      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--color-border);">

      <h3 style="margin-bottom: 1rem;">Roth Conversion Settings</h3>
      <div class="form-group">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" id="settingsRothConversionsEnabled" onchange="app.toggleRothConversionFields()"> Enable Roth Conversions
        </label>
        <small class="form-help">Convert Traditional IRA/401(k) funds to Roth IRA for tax-free growth</small>
      </div>

      <div id="rothConversionsFields" style="display: none;">
        <div class="form-group">
          <label class="form-label">Conversion Strategy</label>
          <select id="settingsRothConversionsStrategy" class="form-control" onchange="app.toggleRothConversionStrategyFields()">
            <option value="fixed" ${rc.strategy === 'fixed' ? 'selected' : ''}>Fixed Annual Amount</option>
            <option value="bracket-fill" ${rc.strategy === 'bracket-fill' ? 'selected' : ''}>Fill to Tax Bracket Top</option>
            <option value="percentage" ${rc.strategy === 'percentage' ? 'selected' : ''}>Percentage of Balance</option>
          </select>
          <small class="form-help">How much to convert each year</small>
        </div>

        <div id="rothConversionFixedFields" class="roth-conversion-fields" style="display: ${rc.strategy === 'fixed' ? 'block' : 'none'};">
          <div class="form-group">
            <label class="form-label">Annual Conversion Amount <span class="form-label-hint">$</span></label>
            <input type="number" id="settingsRothConversionsAnnualAmount" class="form-control" value="${(rc.annualAmount / 100).toFixed(2)}" min="0" step="100">
            <small class="form-help">Fixed amount to convert each year (subject to available balance)</small>
          </div>
        </div>

        <div id="rothConversionBracketFillFields" class="roth-conversion-fields" style="display: ${rc.strategy === 'bracket-fill' ? 'block' : 'none'};">
          <div class="form-group">
            <label class="form-label">Fill to Bracket Top <span class="form-label-hint">$</span></label>
            <input type="number" id="settingsRothConversionsBracketTop" class="form-control" value="${(rc.bracketTop / 100).toFixed(2)}" min="0" step="1000">
            <small class="form-help">Convert up to this income level in your current tax bracket</small>
          </div>
        </div>

        <div id="rothConversionPercentageFields" class="roth-conversion-fields" style="display: ${rc.strategy === 'percentage' ? 'block' : 'none'};">
          <div class="form-group">
            <label class="form-label">Conversion Percentage <span class="form-label-hint">%</span></label>
            <input type="number" id="settingsRothConversionsPercentage" class="form-control" value="${(rc.percentage * 100).toFixed(1)}" min="0" max="100" step="1">
            <small class="form-help">Percentage of Traditional balance to convert each year (e.g., 5%)</small>
          </div>
        </div>
      </div>

      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--color-border);">

      <h3 style="margin-bottom: 1rem;">Qualified Charitable Distribution (QCD) Settings</h3>
      <div class="form-group">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" id="settingsQCDEnabled" onchange="app.toggleQCDFields()"> Enable QCDs
        </label>
        <small class="form-help">Tax-free charitable distributions from IRAs for age 70½+ (counts toward RMDs)</small>
      </div>

        <div id="qcdFields" style="display: none;">
          <div class="form-group">
            <label class="form-label">QCD Strategy</label>
            <select id="settingsQCDStrategy" class="form-control" onchange="app.toggleQCDStrategyFields()">
              <option value="fixed" ${qcd.strategy === 'fixed' ? 'selected' : ''}>Fixed Annual Amount</option>
              <option value="percentage" ${qcd.strategy === 'percentage' ? 'selected' : ''}>Percentage of Balance</option>
              <option value="rmd" ${qcd.strategy === 'rmd' ? 'selected' : ''}>RMD Amount</option>
            </select>
            <small class="form-help">How much to donate to charity each year</small>
          </div>

          <div id="qcdFixedFields" class="qcd-fields" style="display: ${qcd.strategy === 'fixed' ? 'block' : 'none'};">
            <div class="form-group">
              <label class="form-label">Annual QCD Amount <span class="form-label-hint">$</span></label>
              <input type="number" id="settingsQCDAnnualAmount" class="form-control" value="${(qcd.annualAmount / 100).toFixed(2)}" min="0" max="100000" step="100">
              <small class="form-help">Fixed amount to donate each year (max $100,000 per IRS rules)</small>
            </div>
          </div>

          <div id="qcdPercentageFields" class="qcd-fields" style="display: ${qcd.strategy === 'percentage' ? 'block' : 'none'};">
            <div class="form-group">
              <label class="form-label">QCD Percentage <span class="form-label-hint">%</span></label>
              <input type="number" id="settingsQCDPercentage" class="form-control" value="${(qcd.percentage * 100).toFixed(1)}" min="0" max="100" step="1">
              <small class="form-help">Percentage of IRA balance to donate each year</small>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Estimated Marginal Tax Rate <span class="form-label-hint">%</span></label>
            <input type="number" id="settingsQCDMarginalTaxRate" class="form-control" value="${(qcd.marginalTaxRate * 100).toFixed(1)}" min="0" max="50" step="0.1">
            <small class="form-help">Your marginal tax rate for tax benefit calculations</small>
          </div>
        </div>
    `;

    this.openModal('planSettingsModal');
  }

  savePlanSettings() {
    this.currentPlan.name = document.getElementById('settingsPlanName').value.trim();
    this.currentPlan.taxProfile.currentAge = parseInt(document.getElementById('settingsCurrentAge').value);
    this.currentPlan.taxProfile.retirementAge = parseInt(document.getElementById('settingsRetirementAge').value);
    this.currentPlan.taxProfile.estimatedTaxRate = parseFloat(document.getElementById('settingsEstimatedTaxRate').value) / 100;
    this.currentPlan.withdrawalStrategy = document.getElementById('settingsWithdrawalStrategy').value;

    const rcEnabled = document.getElementById('settingsRothConversionsEnabled').checked;
    const rcStrategy = document.getElementById('settingsRothConversionsStrategy').value;
    const rcAnnualAmount = parseFloat(document.getElementById('settingsRothConversionsAnnualAmount').value) || 0;
    const rcPercentage = parseFloat(document.getElementById('settingsRothConversionsPercentage').value) || 0;
    const rcBracketTop = parseFloat(document.getElementById('settingsRothConversionsBracketTop').value) || 0;

    this.currentPlan.rothConversions = {
      enabled: rcEnabled,
      strategy: rcStrategy,
      annualAmount: Math.round(rcAnnualAmount * 100),
      percentage: rcPercentage / 100,
      bracketTop: Math.round(rcBracketTop * 100)
    };

    const qcdEnabled = document.getElementById('settingsQCDEnabled').checked;
    const qcdStrategy = document.getElementById('settingsQCDStrategy').value;
    const qcdAnnualAmount = parseFloat(document.getElementById('settingsQCDAnnualAmount').value) || 0;
    const qcdPercentage = parseFloat(document.getElementById('settingsQCDPercentage').value) || 0;
    const qcdMarginalTaxRate = parseFloat(document.getElementById('settingsQCDMarginalTaxRate').value) || 0;

    this.currentPlan.qcdSettings = {
      enabled: qcdEnabled,
      strategy: qcdStrategy,
      annualAmount: Math.round(qcdAnnualAmount * 100),
      percentage: qcdPercentage / 100,
      marginalTaxRate: qcdMarginalTaxRate / 100
    };

    const tlhEnabled = document.getElementById('settingsTLHEnabled').checked;
    const tlhStrategy = document.getElementById('settingsTLHStrategy').value;
    const tlhThreshold = parseFloat(document.getElementById('settingsTLHThreshold').value) || 1000;

    this.currentPlan.taxLossHarvesting = {
      enabled: tlhEnabled,
      strategy: tlhStrategy,
      threshold: Math.round(tlhThreshold * 100)
    };

    this.currentPlan.touch();
    StorageManager.savePlan(this.currentPlan);
    this.closeModal('planSettingsModal');
    this.renderPlanUI();
    this.loadPlansList();
    alert('Settings saved!');
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
    allFields.forEach(field => field.style.display = 'none');

    const activeField = document.getElementById(`qcd${strategy.charAt(0).toUpperCase() + strategy.slice(1)}Fields`);
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
    const enabled = document.getElementById('socialSecurityEnabled').checked;
    const fields = document.getElementById('socialSecurityFields');
    const estimate = document.getElementById('socialSecurityEstimate');

    if (enabled) {
      fields.style.display = 'block';
      estimate.style.display = 'none';
    } else {
      fields.style.display = 'none';
      estimate.style.display = 'none';
    }
  }

  saveSocialSecurity() {
    const enabled = document.getElementById('socialSecurityEnabled').checked;
    const birthYear = parseInt(document.getElementById('birthYear').value);
    const monthlyBenefit = parseFloat(document.getElementById('monthlyBenefit').value);
    const filingAge = parseInt(document.getElementById('filingAge').value);

    if (enabled) {
      if (!birthYear || !monthlyBenefit || !filingAge) {
        alert('Please fill all Social Security fields');
        return;
      }

      // Import the calculation function
      import('./social-security.js').then(({ calculateFullRetirementAge, calculateSocialSecurityBenefit }) => {
        const fra = calculateFullRetirementAge(birthYear);
        const annualBenefit = calculateSocialSecurityBenefit(monthlyBenefit, birthYear, filingAge, new Date().getFullYear(), new Date().getFullYear() + (filingAge - this.currentPlan.taxProfile.currentAge), this.currentPlan.assumptions.inflationRate) * 12;

        // Update estimate display
        document.getElementById('estimatedAnnualBenefit').textContent = annualBenefit.toLocaleString('en-US', {minimumFractionDigits: 0});
        document.getElementById('estimatedFRA').textContent = `${fra.years} years ${fra.months} months`;
        document.getElementById('socialSecurityEstimate').style.display = 'block';
      });
    }

    this.currentPlan.socialSecurity = {
      enabled,
      birthYear: birthYear || 0,
      monthlyBenefit: monthlyBenefit || 0,
      filingAge: filingAge || this.currentPlan.taxProfile.retirementAge
    };

    this.currentPlan.touch();
    StorageManager.savePlan(this.currentPlan);
    alert('Social Security settings saved!');
  }

  // Modal Helpers

  openModal(id) {
    document.getElementById(id).classList.add('active');
  }

  closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  // UI Helpers

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
