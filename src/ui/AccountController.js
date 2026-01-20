/**
 * AccountController - Handles account CRUD operations (list, add, edit, delete)
 * Extracted from AppController to reduce complexity
 */
import { Account } from '../core/models/Account.js';
import { StorageManager } from '../storage/StorageManager.js';

export class AccountController {
  constructor(currentPlan, storageManager) {
    this.currentPlan = currentPlan;
    this.storageManager = storageManager;
  }

  // Render Methods

  renderAccountsList() {
    const container = document.getElementById('accountsList');
    container.innerHTML = '';

    if (this.currentPlan.accounts.length === 0) {
      container.innerHTML = '<p class="text-muted">No accounts yet. Add one to get started.</p>';
      return;
    }

    this.currentPlan.accounts.forEach((account) => {
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
            <div class="result-value">$${(account.balance / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div class="result-label">Annual Contribution</div>
            <div class="result-value">$${account.annualContribution.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
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

  // Modal Creation

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

  // CRUD Operations

  addAccount() {
    if (!this.currentPlan) {
      alert('Please create or select a plan first');
      return;
    }
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
    this.storageManager.savePlan(this.currentPlan);
    this.renderAccountsList();
    document.getElementById('addAccountModal').remove();
  }

  deleteAccount(accountId) {
    if (!confirm('Delete this account?')) return;
    this.currentPlan.removeAccount(accountId);
    this.storageManager.savePlan(this.currentPlan);
    this.renderAccountsList();
  }

  editAccount(accountId) {
    if (!this.currentPlan) {
      alert('Please create or select a plan first');
      return;
    }
    const account = this.currentPlan.accounts.find((a) => a.id === accountId);
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
    const account = this.currentPlan.accounts.find((a) => a.id === accountId);
    if (!account) return;

    account.name = document.getElementById('editAccountName').value.trim();
    account.balance = parseFloat(document.getElementById('editAccountBalance').value) * 100;
    account.annualContribution = parseFloat(
      document.getElementById('editAccountContribution').value
    );

    this.currentPlan.touch();
    this.storageManager.savePlan(this.currentPlan);
    this.renderAccountsList();
    document.getElementById('editAccountModal').remove();
  }

  // Helper Methods

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
