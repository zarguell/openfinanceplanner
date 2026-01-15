import { project } from '../calculations/projection.js';
import {
  runMonteCarloSimulation,
  getSuccessProbabilityWithConfidence,
} from '../calculations/monte-carlo.js';
import { ChartRenderer } from './ChartRenderer.js';

export class ProjectionController {
  constructor(currentPlan, chartRenderer) {
    this.currentPlan = currentPlan;
    this.chartRenderer = chartRenderer;
    this.projectionResults = null;
    this.monteCarloResults = null;
  }

  runProjection() {
    if (!this.currentPlan) {
      alert('Please create or load a plan first');
      return;
    }

    this.projectionResults = project(this.currentPlan, 40, 2025);
    this.monteCarloResults = runMonteCarloSimulation(this.currentPlan, 1000, 40, 2025);
    this.renderProjectionResults();
    this.switchTab('projection');
  }

  runMonteCarlo() {
    if (!this.currentPlan) {
      alert('Please create or load a plan first');
      return;
    }

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

  switchTab(tabName) {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
    document
      .querySelectorAll('.tab-content')
      .forEach((content) => content.classList.remove('active'));

    const activeTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);

    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
  }

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
