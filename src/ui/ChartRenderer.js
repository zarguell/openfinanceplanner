/**
 * ChartRenderer - Creates and manages all data visualizations
 * Uses Chart.js for rendering charts
 */

export class ChartRenderer {
  constructor() {
    this.charts = {};
  }

  /**
   * Destroy all charts to free memory
   */
  destroyAll() {
    Object.values(this.charts).forEach((chart) => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }

  /**
   * Create balance projection line chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} projectionResults - Year-by-year projection data
   */
  createBalanceChart(canvasId, projectionResults) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    // Destroy existing chart if present
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const years = projectionResults.map((r) => r.year);
    const balances = projectionResults.map((r) => r.totalBalance);

    const retirementData = projectionResults.find((r) => r.isRetired);
    const retirementIndex = retirementData ? projectionResults.indexOf(retirementData) : -1;

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Portfolio Balance',
            data: balances,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.1,
            pointRadius: 2,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: 'Portfolio Balance Projection',
            font: { size: 16, weight: 'bold' },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Balance: $${context.parsed.y.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`;
              },
            },
          },
          annotation:
            retirementIndex >= 0
              ? {
                  annotations: {
                    retirementLine: {
                      type: 'line',
                      xMin: retirementIndex,
                      xMax: retirementIndex,
                      borderColor: 'rgb(255, 99, 132)',
                      borderWidth: 2,
                      borderDash: [5, 5],
                      label: {
                        display: true,
                        content: 'Retirement',
                        position: 'start',
                      },
                    },
                  },
                }
              : {},
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + (value / 1000).toFixed(0) + 'k',
            },
            title: {
              display: true,
              text: 'Balance (USD)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Year',
            },
          },
        },
      },
    });

    this.charts[canvasId] = chart;
    return chart;
  }

  /**
   * Create Monte Carlo fan chart with percentiles
   * @param {string} canvasId - Canvas element ID
   * @param {Object} monteCarloResults - Results from Monte Carlo simulation
   * @param {Array} projectionResults - Deterministic projection for median
   */
  createMonteCarloFanChart(canvasId, monteCarloResults, projectionResults) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !monteCarloResults) return null;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const years = projectionResults.map((r) => r.year);
    const medianBalances = projectionResults.map((r) => r.totalBalance);

    const { p10Balances, p90Balances } = this.calculateYearlyPercentiles(
      monteCarloResults.scenarios,
      projectionResults.length
    );

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: '90th Percentile (Best Case)',
            data: p90Balances,
            borderColor: 'rgba(75, 192, 192, 0.8)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: 'Median Projection',
            data: medianBalances,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            fill: '+1',
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: '10th Percentile (Worst Case)',
            data: p10Balances,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: 'Monte Carlo Simulation: 1,000 Scenarios',
            font: { size: 16, weight: 'bold' },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: $${context.parsed.y.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + (value / 1000).toFixed(0) + 'k',
            },
            title: {
              display: true,
              text: 'Portfolio Balance (USD)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Year',
            },
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
      },
    });

    this.charts[canvasId] = chart;
    return chart;
  }

  /**
   * Calculate year-by-year percentiles from scenario data
   * @param {Array} scenarios - Array of scenario results with projections
   * @param {number} numYears - Number of years to calculate
   * @returns {Object} Object with p10Balances and p90Balances arrays
   */
  calculateYearlyPercentiles(scenarios, numYears) {
    if (!scenarios || scenarios.length === 0) {
      return { p10Balances: [], p90Balances: [] };
    }

    const p10Balances = [];
    const p90Balances = [];

    for (let yearIndex = 0; yearIndex < numYears; yearIndex++) {
      const yearBalances = scenarios
        .map((scenario) => scenario.projection[yearIndex]?.totalBalance || 0)
        .filter((balance) => balance !== undefined);

      if (yearBalances.length === 0) {
        p10Balances.push(0);
        p90Balances.push(0);
        continue;
      }

      yearBalances.sort((a, b) => a - b);

      const p10Index = Math.floor(yearBalances.length * 0.1);
      const p90Index = Math.floor(yearBalances.length * 0.9);

      p10Balances.push(yearBalances[p10Index] || 0);
      p90Balances.push(yearBalances[p90Index] || 0);
    }

    return { p10Balances, p90Balances };
  }

  /**
   * Create asset allocation pie chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} accounts - Account objects from plan
   */
  createAllocationChart(canvasId, accounts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !accounts || accounts.length === 0) return null;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const typeGroups = {};
    accounts.forEach((account) => {
      const type = account.type;
      typeGroups[type] = (typeGroups[type] || 0) + account.balance / 100;
    });

    const labels = Object.keys(typeGroups);
    const data = Object.values(typeGroups);

    const colorMap = {
      '401k': 'rgba(54, 162, 235, 0.8)',
      IRA: 'rgba(255, 99, 132, 0.8)',
      Roth: 'rgba(75, 192, 192, 0.8)',
      HSA: 'rgba(255, 206, 86, 0.8)',
      Taxable: 'rgba(153, 102, 255, 0.8)',
    };

    const backgroundColors = labels.map((label) => colorMap[label] || 'rgba(201, 203, 207, 0.8)');

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        plugins: {
          title: {
            display: true,
            text: 'Asset Allocation by Account Type',
            font: { size: 16, weight: 'bold' },
          },
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: $${value.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    this.charts[canvasId] = chart;
    return chart;
  }

  /**
   * Create income vs expense bar chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} projectionResults - Year-by-year projection data
   */
  createCashFlowChart(canvasId, projectionResults) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const years = projectionResults.map((r) => r.year);
    const expenses = projectionResults.map((r) => r.totalExpense);
    const income = projectionResults.map((r) => r.socialSecurityIncome);
    const netCashFlow = projectionResults.map((r, i) => income[i] - expenses[i]);

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Total Expenses',
            data: expenses,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            stack: 'cashflow',
          },
          {
            label: 'Social Security Income',
            data: income,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            stack: 'cashflow',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: 'Annual Income vs Expenses',
            font: { size: 16, weight: 'bold' },
          },
          tooltip: {
            mode: 'index',
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: $${context.parsed.y.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + (value / 1000).toFixed(0) + 'k',
            },
            title: {
              display: true,
              text: 'Amount (USD)',
            },
          },
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Year',
            },
          },
        },
      },
    });

    this.charts[canvasId] = chart;
    return chart;
  }
}
