/**
 * ProjectionPage - Page Object Model for Projection and Monte Carlo operations
 * Encapsulates all interactions with running projections and verifying results
 * Note: Projection requires a plan with accounts to be selected first
 */
export class ProjectionPage {
  constructor(page) {
    this.page = page;
    this.runProjectionButton = page.getByRole('button', { name: 'Run Projection' });
    this.finalBalanceLocator = page.getByTestId('final-balance-result');
    this.retirementBalanceLocator = page.getByTestId('retirement-balance-result');
    this.monteCarloCard = page.getByTestId('monte-carlo-card');
    this.successProbabilityBadge = page.getByTestId('success-probability-badge');
    this.balanceChart = page.getByTestId('balance-chart-canvas');
    this.yearByYearTable = page.getByTestId('year-by-year-table');
  }

  /**
   * Run the projection and wait for results
   */
  async runProjection() {
    await this.runProjectionButton.click();
    // Wait for projection results to appear
    await this.page.waitForSelector('[data-testid="final-balance-result"]', { state: 'visible' });
  }

  /**
   * Get the final balance from projection results
   * @returns {number} Final balance in dollars
   */
  async getFinalBalance() {
    const text = await this.finalBalanceLocator.textContent();
    // Parse format: "$1,234,567" -> 1234567
    return parseFloat(text.replace(/[$,]/g, ''));
  }

  /**
   * Get the retirement balance from projection results
   * @returns {number} Retirement balance in dollars
   */
  async getRetirementBalance() {
    const text = await this.retirementBalanceLocator.textContent();
    // Parse format: "$1,234,567" -> 1234567
    return parseFloat(text.replace(/[$,]/g, ''));
  }

  /**
   * Get the success probability from Monte Carlo analysis
   * @returns {number} Success probability as percentage (0-100)
   */
  async getSuccessProbability() {
    const text = await this.successProbabilityBadge.textContent();
    // Parse format: "85.5%" -> 85.5
    return parseFloat(text.replace('%', ''));
  }

  /**
   * Check if Monte Carlo card is visible
   * @returns {boolean} True if Monte Carlo analysis is displayed
   */
  async isMonteCarloVisible() {
    try {
      await this.monteCarloCard.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if balance chart is visible
   * @returns {boolean} True if chart canvas is rendered
   */
  async isChartVisible() {
    try {
      await this.balanceChart.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the number of years in the year-by-year table
   * @returns {number} Number of rows (years) in the table
   */
  async getYearCount() {
    try {
      // Count rows in tbody (excluding header)
      const rows = await this.yearByYearTable.locator('tbody tr').all();
      return rows.length;
    } catch {
      return 0;
    }
  }

  /**
   * Check if the year-by-year table contains specific text
   * @param {string} text - Text to search for (e.g., "Retired", "Saving")
   * @returns {boolean} True if text is found in table
   */
  async hasTableCell(text) {
    try {
      const cell = this.yearByYearTable.getByText(text);
      await cell.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
