# Feature Landscape: Financial Planning Visualizations with Chart.js

**Domain:** Financial Planning & Retirement Readiness
**Researched:** 2026-01-20
**Confidence:** HIGH (Chart.js docs verified, existing codebase analyzed)

## Executive Summary

Chart.js is well-suited for financial planning visualizations, with robust support for line charts (balance projections), area charts (confidence intervals), and mixed chart types (income vs expenses). The existing Open Finance Planner already implements core visualizations effectively. Chart.js financial plugin exists but is unnecessary for retirement planning (designed for stock trading).

## Current Implementation

Open Finance Planner currently has 4 visualizations via ChartRenderer.js:

1. **Portfolio Balance Projection** (Line chart)
   - Single line showing balance over time
   - Retirement milestone annotation with vertical line
   - Tension smoothing for natural curves

2. **Monte Carlo Fan Chart** (Multi-line with fill)
   - 3 datasets: P90 (best case), Median, P10 (worst case)
   - Confidence interval visualization using fill mode
   - 1,000 scenario simulation support

3. **Asset Allocation** (Pie chart)
   - Breakdown by account type (401k, IRA, Roth, HSA, Taxable)
   - Percentage labels in tooltips
   - Color-coded account types

4. **Income vs Expenses** (Stacked bar chart)
   - Expenses vs Social Security income
   - Annual breakdown by year
   - Stacked bars for comparison

## Table Stakes

Visualizations users expect from a financial planning tool.

| Feature                       | Why Expected                                  | Complexity | Current Status               |
| ----------------------------- | --------------------------------------------- | ---------- | ---------------------------- |
| Balance Projection Line Chart | Shows growth trajectory, retirement readiness | Low        | ✅ Implemented               |
| Confidence Interval Band      | Monte Carlo uncertainty visualization         | Medium     | ✅ Implemented (fan chart)   |
| Retirement Milestone Marker   | Clear visual for retirement year              | Low        | ✅ Implemented (annotation)  |
| Asset Allocation Pie/Doughnut | Portfolio composition at a glance             | Low        | ✅ Implemented               |
| Annual Cash Flow Chart        | Income vs expenses by year                    | Low        | ✅ Implemented (stacked bar) |
| Y-Axis Currency Formatting    | Readable dollar amounts ($1M, $500k)          | Low        | ✅ Implemented               |
| Interactive Tooltips          | Hover for detailed values                     | Low        | ✅ Implemented               |
| Responsive Design             | Works on mobile/desktop                       | Medium     | ✅ Implemented               |

## Differentiators

Features that set financial planning tools apart through visualization.

| Feature                         | Value Proposition                                  | Complexity | Current Status                        |
| ------------------------------- | -------------------------------------------------- | ---------- | ------------------------------------- |
| **What-If Scenarios Overlay**   | Compare different strategies side-by-side          | Medium     | ❌ Missing                            |
| **Net Worth Heatmap**           | Visual wealth accumulation by year and asset class | High       | ❌ Missing                            |
| **Retirement Readiness Gauge**  | Single metric with visual "meter"                  | Low        | ❌ Missing                            |
| **Savings Rate Tracker**        | Line chart showing % income saved over time        | Low        | ❌ Missing                            |
| **Tax Drag Visualization**      | Show tax impact on portfolio growth                | Medium     | ❌ Missing                            |
| **RMD Countdown Timer**         | Visual timeline to Required Minimum Distributions  | Low        | ❌ Missing                            |
| **Social Security Breakeven**   | Compare claiming ages visually                     | Medium     | ❌ Missing                            |
| **Income Stream Waterfall**     | Show contribution sources to retirement income     | Medium     | ❌ Missing                            |
| **Interactive Scenario Slider** | Drag to see impact of variable changes             | High       | ❌ Missing                            |
| **Historical vs Projected**     | Compare past performance vs future assumptions     | High       | ❌ Missing (requires historical data) |

## Chart.js Capabilities for Financial Planning

### Supported Chart Types (HIGH confidence - verified in Chart.js docs)

| Chart Type        | Use Case in Financial Planning                           | Implementation Notes                                         |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| **Line Chart**    | Balance projection, savings rate, historical performance | Time series, tension smoothing, fill to origin               |
| **Area Chart**    | Confidence intervals, accumulated contributions          | Multiple fill modes: origin, start, end, or to other dataset |
| **Bar Chart**     | Annual expenses, contribution breakdown by year          | Stacked bars for income vs expenses                          |
| **Mixed Chart**   | Combine bar (expenses) + line (cumulative)               | Set `type` per dataset                                       |
| **Scatter Chart** | Retirement age vs final balance scenarios                | Correlation analysis                                         |
| **Bubble Chart**  | Risk vs return for portfolio allocations                 | Size = portfolio amount                                      |
| **Radar Chart**   | Financial health score across categories                 | Emergency fund, debt ratio, savings rate                     |

### Advanced Features (HIGH confidence - verified)

**Area Fill Modes:**

```javascript
// Fill to axis origin
fill: 'origin'

// Fill to another dataset (confidence intervals)
fill: 1  // Fill to dataset at index 1
fill: '+1'  // Fill to next dataset
fill: '-1'  // Fill to previous dataset

// Conditional colors for positive/negative
fill: {
  target: 'origin',
  above: 'rgb(75, 192, 192)',  // Green for positive
  below: 'rgb(255, 99, 132)'   // Red for negative
}
```

**Time Series Support:**

- Native time scale with adapters (Luxon, Moment, date-fns, Day.js)
- Major/minor ticks for intelligently spaced labels
- SpanGaps to bridge missing data
- Time-based tooltips

**Annotations Plugin:**

```javascript
// Vertical line for retirement
annotation: {
  annotations: {
    retirementLine: {
      type: 'line',
      xMin: retirementIndex,
      xMax: retirementIndex,
      borderColor: 'rgb(255, 99, 132)',
      borderDash: [5, 5],
      label: {
        display: true,
        content: 'Retirement'
      }
    }
  }
}
```

**Zoom/Pan Plugin:**

- Navigate large time ranges (40+ years)
- Zoom into specific periods
- Pan to explore timeline

### Chart.js Financial Plugin

**Status:** Available but **not recommended** for retirement planning

**Purpose:** Candlestick and OHLC charts for stock trading
**Why not suitable:**

- Requires OHLC data (Open-High-Low-Close) - retirement planning has yearly balances
- Designed for high-frequency trading data, not multi-decade projections
- Adds unnecessary dependency for use case

**Use only if:**

- Building stock portfolio tracking
- Visualizing investment performance on daily/weekly basis

**Installation (if needed):**

```javascript
import { CandlestickController, OhlcController } from 'chartjs-chart-financial';
Chart.register(CandlestickController, OhlcController);
```

## Retirement Readiness Metrics Visualization

### Core Metrics to Visualize

| Metric                       | Chart Type                               | Why Important                           |
| ---------------------------- | ---------------------------------------- | --------------------------------------- |
| **Success Probability**      | Gauge/Donut or single stat with color    | Monte Carlo % of scenarios that succeed |
| **Final Balance vs Goal**    | Bar comparison (actual vs target)        | Are you on track?                       |
| **Safe Withdrawal Rate**     | Line chart over retirement years         | Sustainable withdrawal %                |
| **Sequence of Returns Risk** | Fan chart showing early retirement years | How market timing affects success       |
| **Portfolio Depletion**      | Area chart showing drawdown              | When money runs out                     |

### Recommended Visualizations

#### 1. Retirement Readiness Dashboard (MVP+)

**Layout:** Grid of 3-4 summary cards with sparkline charts

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ Success Rate: 87%  │  Final Balance: $2.1M │  Years Funded: 35    │
│    [DONUT CHART]   │   [BAR VS GOAL]      │   [LINE CHART]       │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Implementation:**

- Donut chart for success probability (green/yellow/red)
- Bar chart comparing actual vs target final balance
- Mini line chart showing trajectory to goal

#### 2. What-If Scenario Comparison

**Chart Type:** Multi-line chart with interactive legend

**Features:**

- Base case vs increased contribution
- Delay retirement vs early retirement
- Different return assumptions

**Chart.js implementation:**

```javascript
datasets: [
  {
    label: 'Base Case',
    data: baseProjection,
    borderColor: 'rgb(75, 192, 192)',
    borderWidth: 2,
  },
  {
    label: '+5% Contributions',
    data: higherContribProjection,
    borderColor: 'rgb(54, 162, 235)',
    borderWidth: 2,
    borderDash: [5, 5], // Differentiate
  },
  {
    label: 'Retire 2 Years Early',
    data: earlyRetireProjection,
    borderColor: 'rgb(255, 159, 64)',
    borderWidth: 2,
    borderDash: [2, 2],
  },
];
```

#### 3. Income Stream Waterfall (Post-MVP)

**Chart Type:** Stacked bar or custom visualization

**Shows:**

- Pre-retirement: Salary + employer match
- Early retirement: Part-time work + portfolio withdrawal
- Full retirement: Social Security + portfolio withdrawal + RMDs
- Late retirement: Portfolio depletion (negative stack)

**Chart.js approach:**

- Stacked bar with positive/negative values
- Different colors for income sources
- Annotations for key transitions (SS start, RMD start)

## Anti-Features

Visualizations to explicitly AVOID.

| Anti-Feature                                              | Why Avoid                                       | What to Do Instead                      |
| --------------------------------------------------------- | ----------------------------------------------- | --------------------------------------- |
| **Candlestick/OHLC for yearly data**                      | Misleading - designed for daily price movements | Use line chart with area fill           |
| **3D Charts**                                             | Hard to read, distort data perception           | Use flat 2D charts                      |
| **Pie charts with >5 slices**                             | Too complex to compare                          | Group smaller categories into "Other"   |
| **Dual Y-axis without clear separation**                  | Confusing which axis applies to which data      | Use stacked bars or two separate charts |
| **Animation on data updates** (for financial projections) | Distracting, slows down scenario comparison     | Static charts, allow manual refresh     |
| **Excessive trend lines**                                 | Overfitting noise in volatile projections       | Show confidence intervals instead       |
| **Radar charts for unrelated metrics**                    | Misleading visual correlation                   | Use separate bar/line charts            |
| **Bubble charts with overlapping bubbles**                | Hard to compare sizes                           | Use scatter or bar chart                |

## Feature Dependencies

```
Balance Projection → Monte Carlo Fan Chart → Retirement Readiness Metrics
Asset Allocation → Tax Drag Visualization → After-Tax Projections
Cash Flow Chart → Savings Rate Tracker → Retirement Gap Analysis
```

## MVP Recommendation

**Current MVP is complete** for core visualization needs. Focus on enhancements:

**Priority 1 (Quick wins):**

1. Retirement readiness gauge (success probability visual)
2. Scenario comparison overlay (what-if analysis)

**Priority 2 (Medium effort):** 3. Savings rate trend line 4. Tax drag visualization (show tax impact) 5. RMD timeline annotation

**Priority 3 (Post-MVP):** 6. Net worth heatmap 7. Interactive scenario sliders 8. Social Security breakeven comparison 9. Income stream waterfall

## Technical Considerations

### Performance

**Chart.js strengths:**

- Canvas rendering (fast for large datasets)
- Tree-shaking (minimal bundle size)
- Efficient with 1,000+ data points

**Optimization tips:**

- Disable animations for Monte Carlo (1000 scenarios × 40 years = 40k points)
- Use `decimation` plugin for dense time series
- Destroy old charts before creating new ones (already implemented)

### Responsiveness

**Current setup:**

- `responsive: true` in all charts
- `maintainAspectRatio: true` with `aspectRatio: 2` (width:height)
- Breakpoints may need adjustment for mobile

**Recommendations:**

- Test on 375px wide (iPhone SE)
- Consider stacking charts vertically on mobile
- Reduce data points shown on mobile (e.g., 5-year intervals)

### Accessibility

**Chart.js limitations:**

- Canvas-based (screen reader challenges)
- Requires fallback text

**Mitigations:**

- Provide data tables below charts (already done for year-by-year)
- Use aria-labels on canvas elements
- Consider adding `chartjs-plugin-a11y-legend` for keyboard navigation

## Data Format Requirements

### Balance Projection

```javascript
{
  year: 2025,
  age: 40,
  totalBalance: 150000,
  isRetired: false,
  totalExpense: 60000,
  socialSecurityIncome: 0,
  totalFederalTax: 25000,
  totalStateTax: 5000,
  totalFicaTax: 9300,
  totalRmdAmount: 0
}
```

### Monte Carlo Results

```javascript
{
  scenarios: [
    { projection: [{ totalBalance: 150000 }, ...] },
    // ... 999 more scenarios
  ],
  averageFinalBalance: 2100000,
  percentiles: {
    p10: 1200000,
    p90: 3500000
  }
}
```

### Account Data (Allocation)

```javascript
{
  type: '401k' | 'IRA' | 'Roth' | 'HSA' | 'Taxable',
  balance: 75000,
  contributionRate: 0.06,
  matchRate: 0.03
}
```

## Plugin Recommendations

### Essential

- **chartjs-plugin-annotation** - Vertical lines, labels (already using)
- **chartjs-plugin-zoom** - Navigate 40-year timelines (recommended for dense projections)

### Optional

- **chartjs-plugin-datalabels** - Direct labels on data points (use sparingly)
- **chartjs-plugin-trendline** - Linear regression (not recommended for projections)
- **chartjs-plugin-streaming** - Real-time data (not needed for projections)

### Avoid

- **chartjs-chart-financial** - Not relevant for retirement planning
- **chartjs-plugin-funnel** - Not applicable to financial planning

## Color Scheme Recommendations

**Semantic colors for financial data:**

```javascript
const financialColors = {
  positive: 'rgb(75, 192, 192)', // Teal - growth, income
  negative: 'rgb(255, 99, 132)', // Red - expenses, depletion
  neutral: 'rgb(201, 203, 207)', // Gray - baseline
  warning: 'rgb(255, 159, 64)', // Orange - caution
  info: 'rgb(54, 162, 235)', // Blue - information
  success: 'rgb(75, 192, 192)', // Teal - success metrics

  // Account types (maintain consistency)
  '401k': 'rgb(54, 162, 235)',
  IRA: 'rgb(255, 99, 132)',
  Roth: 'rgb(75, 192, 192)',
  HSA: 'rgb(255, 206, 86)',
  Taxable: 'rgb(153, 102, 255)',
};
```

**Confidence interval colors:**

- P10 (worst case): Semi-transparent red
- Median (expected): Solid blue
- P90 (best case): Semi-transparent teal

## Sources

- **Chart.js Documentation (HIGH confidence)**: https://www.chartjs.org/docs/latest/
  - Line chart configuration
  - Area chart fill modes
  - Mixed chart types
  - Annotation plugin usage
- **Chart.js Financial Plugin (HIGH confidence)**: https://github.com/chartjs/chartjs-chart-financial
  - Candlestick/OHLC capabilities
  - Time series support
- **Chart.js Awesome (HIGH confidence)**: https://github.com/chartjs/awesome
  - Plugin ecosystem
  - Integrations
- **Open Finance Planner Codebase (HIGH confidence)**:
  - src/ui/ChartRenderer.js (current implementation)
  - src/ui/ProjectionController.js (visualization integration)
  - index.html (Chart.js CDN v4.4.0)

## Research Gaps

- **LOW confidence on industry best practices**: External financial planning sites blocked by 404 errors. Unable to verify what competitors like Vanguard, Fidelity, Schwab use for visualizations.
- **Accessibility patterns**: Limited research on accessible financial charts for screen readers.
- **Mobile-first design**: Current implementation likely desktop-focused. Mobile patterns for 40-year projections need exploration.
