/**
 * AppController - Main UI controller for application
 * Thin coordinator layer that delegates to specialized controllers
 */
import { StorageManager } from '../storage/StorageManager.js';
import { ChartRenderer } from './ChartRenderer.js';
import { PlanController } from './PlanController.js';
import { AccountController } from './AccountController.js';
import { ExpenseIncomeController } from './ExpenseIncomeController.js';
import { ProjectionController } from './ProjectionController.js';

export class AppController {
  constructor() {
    this._currentPlan = null;
    this.projectionResults = null;
    this.monteCarloResults = null;
    this.chartRenderer = new ChartRenderer();
    this.accountController = new AccountController(this._currentPlan, StorageManager);
    this.expenseIncomeController = new ExpenseIncomeController(this._currentPlan, StorageManager);
    this.planController = new PlanController(
      this._currentPlan,
      StorageManager,
      this.accountController,
      this.expenseIncomeController
    );
    this.projectionController = new ProjectionController(this._currentPlan, this.chartRenderer);
    this.init();
  }

  get currentPlan() {
    return this._currentPlan;
  }

  set currentPlan(value) {
    this._currentPlan = value;
    // Sync currentPlan to all controllers
    this.planController.currentPlan = value;
    this.accountController.currentPlan = value;
    this.expenseIncomeController.currentPlan = value;
    this.projectionController.currentPlan = value;
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
    this.projectionController.currentPlan = this.currentPlan;
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

  // Projection (delegated to ProjectionController)

  runProjection() {
    this.projectionController.currentPlan = this.currentPlan;
    this.projectionController.runProjection();
    this.projectionResults = this.projectionController.projectionResults;
    this.monteCarloResults = this.projectionController.monteCarloResults;
  }

  runMonteCarlo() {
    this.projectionController.currentPlan = this.currentPlan;
    this.projectionController.runMonteCarlo();
    this.projectionResults = this.projectionController.projectionResults;
    this.monteCarloResults = this.projectionController.monteCarloResults;
  }

  renderProjectionResults() {
    return this.projectionController.renderProjectionResults();
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
