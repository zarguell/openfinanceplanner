/**
 * ExpenseIncomeController - Handles expense and income CRUD operations
 * Extracted from AppController to reduce complexity
 */
import { Expense } from '../core/models/Expense.js';
import { Income } from '../core/models/Income.js';
import { StorageManager } from '../storage/StorageManager.js';

export class ExpenseIncomeController {
  constructor(currentPlan, storageManager) {
    this.currentPlan = currentPlan;
    this.storageManager = storageManager;
  }

  // Expense CRUD Methods

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
    if (!this.currentPlan) {
      alert('Please create or select a plan first');
      return;
    }
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
    this.storageManager.savePlan(this.currentPlan);
    this.renderExpensesList();
    document.getElementById('addExpenseModal').remove();
  }

  deleteExpense(expenseId) {
    if (!confirm('Delete this expense?')) return;
    this.currentPlan.removeExpense(expenseId);
    this.storageManager.savePlan(this.currentPlan);
    this.renderExpensesList();
  }

  // Income CRUD Methods

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
    if (!this.currentPlan) {
      alert('Please create or select a plan first');
      return;
    }
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
    this.storageManager.savePlan(this.currentPlan);
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
    this.storageManager.savePlan(this.currentPlan);
    this.renderIncomesList();
  }

  // UI Helpers

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
