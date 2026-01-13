/**
 * AppController - Main UI controller for the application
 * Thin controller layer that delegates to domain layer
 */
import { Plan } from '../core/models/Plan.js';
import { Account } from '../core/models/Account.js';
import { Expense } from '../core/models/Expense.js';
import { project } from '../calculations/projection.js';
import { StorageManager } from '../storage/StorageManager.js';

export class AppController {
  constructor() {
    this.currentPlan = null;
    this.projectionResults = null;
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
          <button class="btn btn-primary" onclick="app.saveAssumptions()" style="margin-top: 1rem;">Save</button>
        </div>
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
    this.renderAccountsList();
    this.renderExpensesList();
    this.renderOverviewSummary();
  }

  populateAssumptionFields() {
    document.getElementById('inflationRate').value = (this.currentPlan.assumptions.inflationRate * 100).toFixed(2);
    document.getElementById('equityGrowthRate').value = (this.currentPlan.assumptions.equityGrowthRate * 100).toFixed(2);
    document.getElementById('bondGrowthRate').value = (this.currentPlan.assumptions.bondGrowthRate * 100).toFixed(2);
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

    this.projectionResults = project(this.currentPlan, 40, 2025);
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

    container.innerHTML = `
      <div class="results-grid">
        <div class="result-card">
          <div class="result-label">Final Balance (Age 97)</div>
          <div class="result-value">$${finalBalance.toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
          <div class="result-sublabel">${this.projectionResults[this.projectionResults.length - 1].year}</div>
        </div>
        <div class="result-card">
          <div class="result-label">Balance at Retirement</div>
          <div class="result-value">$${retirementBalance.toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
          <div class="result-sublabel">${retirementYear}</div>
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
                  <td>${row.isRetired ? '<span class="badge badge-success">Retired</span>' : '<span class="badge badge-warning">Saving</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
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
        <label class="form-label">Filing Status</label>
        <select id="settingsFilingStatus" class="form-control">
          <option value="single" ${this.currentPlan.taxProfile.filingStatus === 'single' ? 'selected' : ''}>Single</option>
          <option value="married_joint" ${this.currentPlan.taxProfile.filingStatus === 'married_joint' ? 'selected' : ''}>Married Filing Jointly</option>
          <option value="married_separate" ${this.currentPlan.taxProfile.filingStatus === 'married_separate' ? 'selected' : ''}>Married Filing Separately</option>
          <option value="head" ${this.currentPlan.taxProfile.filingStatus === 'head' ? 'selected' : ''}>Head of Household</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Federal Tax Rate <span class="form-label-hint">%</span></label>
        <input type="number" id="settingsFederalTax" class="form-control" value="${(this.currentPlan.taxProfile.federalTaxRate * 100).toFixed(1)}" step="0.1">
      </div>
    `;

    this.openModal('planSettingsModal');
  }

  savePlanSettings() {
    this.currentPlan.name = document.getElementById('settingsPlanName').value.trim();
    this.currentPlan.taxProfile.currentAge = parseInt(document.getElementById('settingsCurrentAge').value);
    this.currentPlan.taxProfile.retirementAge = parseInt(document.getElementById('settingsRetirementAge').value);
    this.currentPlan.taxProfile.filingStatus = document.getElementById('settingsFilingStatus').value;
    this.currentPlan.taxProfile.federalTaxRate = parseFloat(document.getElementById('settingsFederalTax').value) / 100;

    this.currentPlan.touch();
    StorageManager.savePlan(this.currentPlan);
    this.closeModal('planSettingsModal');
    this.renderPlanUI();
    this.loadPlansList();
    alert('Settings saved!');
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
