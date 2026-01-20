/**
 * PlanController - Handles plan CRUD operations, settings, import/export, and Social Security
 * Extracted from AppController to reduce complexity
 */
import { Plan } from '../core/models/Plan.js';
import { Account } from '../core/models/Account.js';
import { Expense } from '../core/models/Expense.js';
import { Income } from '../core/models/Income.js';
import { StorageManager } from '../storage/StorageManager.js';
import { ChartRenderer } from './ChartRenderer.js';

export class PlanController {
  constructor(
    currentPlan,
    storageManager,
    accountController = null,
    expenseIncomeController = null
  ) {
    this.currentPlan = currentPlan;
    this.storageManager = storageManager;
    this.chartRenderer = new ChartRenderer();
    this.accountController = accountController;
    this.expenseIncomeController = expenseIncomeController;
    // Reference to app controller for routing onclick handlers
    this.appController = null; // Will be set by AppController
  }

  // Plan CRUD Methods

  loadPlansList() {
    const list = this.storageManager.listPlans();
    const planListEl = document.getElementById('planList');
    planListEl.innerHTML = '';

    if (list.length === 0) {
      planListEl.innerHTML =
        '<li style="color: var(--color-text-secondary); font-size: 12px;">No plans yet</li>';
      return;
    }

    list.forEach((meta) => {
      const li = document.createElement('li');
      li.className = `plan-item ${this.currentPlan?.id === meta.id ? 'active' : ''}`;
      // Route through AppController to trigger setter and sync all controllers
      li.onclick = () => window.app.loadPlan(meta.id);
      li.innerHTML = `
        <div class="plan-item-name">${this.escapeHtml(meta.name)}</div>
        <div class="plan-item-date">${new Date(meta.lastModified).toLocaleDateString()}</div>
      `;
      planListEl.appendChild(li);
    });
  }

  loadPlan(planId) {
    const planData = this.storageManager.loadPlan(planId);
    if (planData) {
      this.currentPlan = Plan.fromJSON(planData);
      this.currentPlan.accounts = planData.accounts.map((acc) =>
        acc instanceof Account ? acc : Account.fromJSON(acc)
      );
      this.currentPlan.expenses = planData.expenses.map((exp) =>
        exp instanceof Expense ? exp : Expense.fromJSON(exp)
      );
      this.currentPlan.incomes = planData.incomes
        ? planData.incomes.map((inc) => (inc instanceof Income ? inc : Income.fromJSON(inc)))
        : [];

      // Update plan list to show active selection
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

    // Render accounts list if accountController is available
    if (this.accountController) {
      this.accountController.currentPlan = this.currentPlan;
      this.accountController.renderAccountsList();
    }
  }

  populateAssumptionFields() {
    document.getElementById('inflationRate').value = (
      this.currentPlan.assumptions.inflationRate * 100
    ).toFixed(2);
    document.getElementById('equityGrowthRate').value = (
      this.currentPlan.assumptions.equityGrowthRate * 100
    ).toFixed(2);
    document.getElementById('bondGrowthRate').value = (
      this.currentPlan.assumptions.bondGrowthRate * 100
    ).toFixed(2);
    document.getElementById('equityVolatility').value = (
      this.currentPlan.assumptions.equityVolatility * 100
    ).toFixed(1);
    document.getElementById('bondVolatility').value = (
      this.currentPlan.assumptions.bondVolatility * 100
    ).toFixed(1);
  }

  populateSocialSecurityFields() {
    const ss = this.currentPlan.socialSecurity;
    document.getElementById('socialSecurityEnabled').checked = ss.enabled;

    if (ss.enabled) {
      document.getElementById('socialSecurityFields').style.display = 'block';
      document.getElementById('birthYear').value = ss.birthYear || '';
      document.getElementById('monthlyBenefit').value = ss.monthlyBenefit || '';
      document.getElementById('filingAge').value =
        ss.filingAge || this.currentPlan.taxProfile.retirementAge;
    } else {
      document.getElementById('socialSecurityFields').style.display = 'none';
    }
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach((el) => el.classList.remove('active'));

    const contentMap = {
      overview: 'overviewTab',
      assumptions: 'assumptionsTab',
      socialsecurity: 'socialsecurityTab',
      income: 'incomeTab',
      accounts: 'accountsTab',
      expenses: 'expensesTab',
      projection: 'projectionTab',
    };

    const tab = document.getElementById(contentMap[tabName]);
    if (tab) {
      tab.classList.add('active');
    }

    event.target.classList.add('active');
  }

  saveAssumptions() {
    if (!this.currentPlan) {
      alert('Please create or select a plan first');
      return;
    }
    this.currentPlan.assumptions.inflationRate =
      parseFloat(document.getElementById('inflationRate').value) / 100;
    this.currentPlan.assumptions.equityGrowthRate =
      parseFloat(document.getElementById('equityGrowthRate').value) / 100;
    this.currentPlan.assumptions.bondGrowthRate =
      parseFloat(document.getElementById('bondGrowthRate').value) / 100;
    this.currentPlan.assumptions.equityVolatility =
      parseFloat(document.getElementById('equityVolatility').value) / 100;
    this.currentPlan.assumptions.bondVolatility =
      parseFloat(document.getElementById('bondVolatility').value) / 100;
    this.currentPlan.touch();
    this.storageManager.savePlan(this.currentPlan);
    alert('Assumptions saved!');
  }

  showNewPlanModal() {
    document.getElementById('newPlanModal').classList.add('active');
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
    plan.addAccount(new Account('Main Portfolio', '401k', 100000));
    plan.addExpense(new Expense('Living Expenses', 60000, 0));

    this.storageManager.savePlan(plan);
    document.getElementById('newPlanModal').classList.remove('active');
    this.loadPlansList();

    // Route through AppController to trigger setter and sync all controllers
    if (window.app) {
      window.app.loadPlan(plan.id);
    } else {
      // Fallback if app not initialized
      this.loadPlan(plan.id);
    }

    document.getElementById('newPlanName').value = '';
    document.getElementById('newPlanAge').value = '';
    document.getElementById('newPlanRetirementAge').value = '';
  }

  deletePlan() {
    if (!this.currentPlan) return;
    if (!confirm(`Delete plan "${this.currentPlan.name}"?`)) return;

    this.storageManager.deletePlan(this.currentPlan.id);
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

  // Plan Settings Methods

  showPlanSettingsModal() {
    if (!this.currentPlan) return;

    const content = document.getElementById('planSettingsContent');
    const rc = this.currentPlan.rothConversions || {
      enabled: false,
      strategy: 'fixed',
      annualAmount: 0,
      percentage: 0.05,
      bracketTop: 0,
    };
    const qcd = this.currentPlan.qcdSettings || {
      enabled: false,
      strategy: 'fixed',
      annualAmount: 0,
      percentage: 0.1,
      marginalTaxRate: 0.24,
    };

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

    document.getElementById('planSettingsModal').classList.add('active');
  }

  savePlanSettings() {
    if (!this.currentPlan) {
      alert('Please create or select a plan first');
      return;
    }
    this.currentPlan.name = document.getElementById('settingsPlanName').value.trim();
    this.currentPlan.taxProfile.currentAge = parseInt(
      document.getElementById('settingsCurrentAge').value
    );
    this.currentPlan.taxProfile.retirementAge = parseInt(
      document.getElementById('settingsRetirementAge').value
    );
    this.currentPlan.taxProfile.estimatedTaxRate =
      parseFloat(document.getElementById('settingsEstimatedTaxRate').value) / 100;
    this.currentPlan.withdrawalStrategy = document.getElementById(
      'settingsWithdrawalStrategy'
    ).value;

    const rcEnabled = document.getElementById('settingsRothConversionsEnabled').checked;
    const rcStrategy = document.getElementById('settingsRothConversionsStrategy').value;
    const rcAnnualAmount =
      parseFloat(document.getElementById('settingsRothConversionsAnnualAmount').value) || 0;
    const rcPercentage =
      parseFloat(document.getElementById('settingsRothConversionsPercentage').value) || 0;
    const rcBracketTop =
      parseFloat(document.getElementById('settingsRothConversionsBracketTop').value) || 0;

    this.currentPlan.rothConversions = {
      enabled: rcEnabled,
      strategy: rcStrategy,
      annualAmount: Math.round(rcAnnualAmount * 100),
      percentage: rcPercentage / 100,
      bracketTop: Math.round(rcBracketTop * 100),
    };

    const qcdEnabled = document.getElementById('settingsQCDEnabled').checked;
    const qcdStrategy = document.getElementById('settingsQCDStrategy').value;
    const qcdAnnualAmount =
      parseFloat(document.getElementById('settingsQCDAnnualAmount').value) || 0;
    const qcdPercentage = parseFloat(document.getElementById('settingsQCDPercentage').value) || 0;
    const qcdMarginalTaxRate =
      parseFloat(document.getElementById('settingsQCDMarginalTaxRate').value) || 0;

    this.currentPlan.qcdSettings = {
      enabled: qcdEnabled,
      strategy: qcdStrategy,
      annualAmount: Math.round(qcdAnnualAmount * 100),
      percentage: qcdPercentage / 100,
      marginalTaxRate: qcdMarginalTaxRate / 100,
    };

    // Tax Loss Harvesting - defensive check (TLH UI fields not yet in modal)
    const tlhEnabledEl = document.getElementById('settingsTLHEnabled');
    if (tlhEnabledEl) {
      const tlhEnabled = tlhEnabledEl.checked;
      const tlhStrategy = document.getElementById('settingsTLHStrategy').value;
      const tlhThreshold =
        parseFloat(document.getElementById('settingsTLHThreshold').value) || 1000;

      this.currentPlan.taxLossHarvesting = {
        enabled: tlhEnabled,
        strategy: tlhStrategy,
        threshold: Math.round(tlhThreshold * 100),
      };
    } else {
      // Preserve existing TLH settings or set default
      this.currentPlan.taxLossHarvesting = this.currentPlan.taxLossHarvesting || {
        enabled: false,
        strategy: 'threshold',
        threshold: 100000,
      };
    }

    this.currentPlan.touch();
    this.storageManager.savePlan(this.currentPlan);
    document.getElementById('planSettingsModal').classList.remove('active');
    this.renderPlanUI();
    this.loadPlansList();
    alert('Settings saved!');
  }

  // Social Security Methods

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
    if (!this.currentPlan) {
      alert('Please create or select a plan first');
      return;
    }
    const enabled = document.getElementById('socialSecurityEnabled').checked;
    const birthYear = parseInt(document.getElementById('birthYear').value);
    const monthlyBenefit = parseFloat(document.getElementById('monthlyBenefit').value);
    const filingAge = parseInt(document.getElementById('filingAge').value);

    if (enabled) {
      if (!birthYear || !monthlyBenefit || !filingAge) {
        alert('Please fill all Social Security fields');
        return;
      }

      import('../calculations/social-security.js').then(
        ({ calculateFullRetirementAge, calculateSocialSecurityBenefit }) => {
          const fra = calculateFullRetirementAge(birthYear);
          const annualBenefit =
            calculateSocialSecurityBenefit(
              monthlyBenefit,
              birthYear,
              filingAge,
              new Date().getFullYear(),
              new Date().getFullYear() + (filingAge - this.currentPlan.taxProfile.currentAge),
              this.currentPlan.assumptions.inflationRate
            ) * 12;

          document.getElementById('estimatedAnnualBenefit').textContent =
            annualBenefit.toLocaleString('en-US', { minimumFractionDigits: 0 });
          document.getElementById('estimatedFRA').textContent =
            `${fra.years} years ${fra.months} months`;
          document.getElementById('socialSecurityEstimate').style.display = 'block';
        }
      );
    }

    this.currentPlan.socialSecurity = {
      enabled,
      birthYear: birthYear || 0,
      monthlyBenefit: monthlyBenefit || 0,
      filingAge: filingAge || this.currentPlan.taxProfile.retirementAge,
    };

    this.currentPlan.touch();
    this.storageManager.savePlan(this.currentPlan);
    alert('Social Security settings saved!');
  }

  // Import/Export Methods

  showImportModal() {
    document.getElementById('importModal').classList.add('active');
  }

  importPlan() {
    const textContent = document.getElementById('importText').value.trim();
    const fileInput = document.getElementById('importFile');

    const processImport = (jsonString) => {
      try {
        const plan = this.storageManager.importPlan(jsonString);
        this.storageManager.savePlan(plan);
        document.getElementById('importModal').classList.remove('active');
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

    const json = this.storageManager.exportPlan(this.currentPlan);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentPlan.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
