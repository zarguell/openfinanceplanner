/**
 * AccountPage - Page Object Model for Account CRUD operations
 * Encapsulates all interactions with account creation, editing, and deletion
 * Note: Account operations require a plan to be selected first
 */
export class AccountPage {
  constructor(page) {
    this.page = page;
    this.addAccountButton = page.getByRole('button', { name: /Add Account/i });
    this.accountNameInput = page.getByTestId('account-name-input');
    this.accountTypeSelect = page.getByTestId('account-type-select');
    this.accountBalanceInput = page.getByTestId('account-balance-input');
    this.accountContributionInput = page.getByTestId('account-contribution-input');
    this.addButton = page.getByTestId('add-account-button');
    this.accountCards = page.getByTestId('account-card');
    this.editAccountNameInput = page.getByTestId('edit-account-name-input');
    this.editAccountBalanceInput = page.getByTestId('edit-account-balance-input');
    this.editAccountContributionInput = page.getByTestId('edit-account-contribution-input');
    this.saveAccountButton = page.getByTestId('save-account-button');
  }

  /**
   * Add a new account to the current plan
   * @param {string} name - Account name
   * @param {string} type - Account type (401k, IRA, Roth, HSA, Taxable)
   * @param {number} balance - Current balance in dollars
   * @param {number} contribution - Annual contribution in dollars (default: 0)
   */
  async addAccount(name, type, balance, contribution = 0) {
    await this.addAccountButton.click();
    await this.accountNameInput.fill(name);
    await this.accountTypeSelect.selectOption(type);
    await this.accountBalanceInput.fill(String(balance));
    await this.accountContributionInput.fill(String(contribution));
    await this.addButton.click();
    // Wait for modal to close and account card to appear
    await this.page.waitForSelector('[data-testid="account-card"]', { state: 'visible' }).catch(() => {});
  }

  /**
   * Get the count of account cards in the accounts list
   * @returns {number} Number of accounts
   */
  async getAccountCount() {
    try {
      return await this.accountCards.count();
    } catch {
      return 0;
    }
  }

  /**
   * Check if an account card is visible in the accounts list
   * @param {string} name - Account name to check
   * @returns {boolean} True if account exists
   */
  async isAccountVisible(name) {
    try {
      const accountCards = await this.accountCards.all();
      for (const card of accountCards) {
        const text = await card.textContent();
        if (text.includes(name)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Edit an existing account
   * @param {string} name - Current account name to edit
   * @param {string} newName - New account name
   * @param {number} newBalance - New balance in dollars
   * @param {number} newContribution - New annual contribution in dollars
   */
  async editAccount(name, newName, newBalance, newContribution) {
    // Find and click the edit button for the specific account
    const accountCards = await this.accountCards.all();
    for (const card of accountCards) {
      const text = await card.textContent();
      if (text.includes(name)) {
        await card.getByRole('button', { name: 'Edit' }).click();
        break;
      }
    }

    // Wait for edit modal to appear
    await this.page.waitForSelector('[data-testid="edit-account-name-input"]', { state: 'visible' });

    // Fill in the new values
    await this.editAccountNameInput.fill(newName);
    await this.editAccountBalanceInput.fill(String(newBalance));
    await this.editAccountContributionInput.fill(String(newContribution));
    await this.saveAccountButton.click();

    // Wait for modal to close
    await this.page.waitForSelector('#editAccountModal', { state: 'hidden' }).catch(() => {});
  }

  /**
   * Delete an account by name
   * @param {string} name - Account name to delete
   */
  async deleteAccount(name) {
    const accountCards = await this.accountCards.all();
    for (const card of accountCards) {
      const text = await card.textContent();
      if (text.includes(name)) {
        await card.getByRole('button', { name: 'Delete' }).click();
        break;
      }
    }

    // Handle confirmation dialog
    this.page.once('dialog', dialog => dialog.accept());
  }
}
