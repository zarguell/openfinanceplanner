To get to “ProjectionLab‑level” quality, think less in terms of individual screens and more in terms of _capabilities_. Below is a feature map derived from ProjectionLab’s public pages, help docs, and reviews, organized into tiers you can build toward.

---

## 1. Core Pillars to Aim For

ProjectionLab’s quality comes from combining five pillars:

1. **Expressive modeling** – can represent real life in detail (accounts, taxes, life events, etc.). [projectionlab](https://projectionlab.com/retirement-calculator)
2. **Accurate simulation** – solid tax and cash‑flow math, account‑type rules, and withdrawal logic. [projectionlab](https://projectionlab.com/help/tax-withholding-vs-total-tax-liability)
3. **Scenario analysis** – Monte Carlo, historical backtesting, multiple plans, and what‑if comparisons. [projectionlab](https://projectionlab.com/monte-carlo)
4. **Insightful visualizations** – net worth, taxes, spending, and cash flow shown clearly (including Sankey). [projectionlab](https://projectionlab.com/tax-analytics)
5. **Great UX & trust** – guided setup, rich but approachable UI, clear assumptions, and strong privacy controls. [projectionlab](https://projectionlab.com)

The rest of this answer breaks those pillars into concrete feature sets and then into a phased roadmap.

---

## 2. User & Plan Management Features

These underpin everything else.

### 2.1 User Profiles & Household Modeling

- Single vs. partnered households; spouse/partner with age, income, accounts, and benefits. [robberger](https://robberger.com/projectionlab-review/)
- Dependents (kids) with birth years and key events (college, leaving home, etc.). [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)
- Basic demographics: country, state, local region (for taxes); primary currency. [projectionlab](https://projectionlab.com/blog/whats-new-v430)

### 2.2 Plans & Scenarios

- Multiple _plans_ per user (e.g., “Base plan”, “Early retirement at 45”, “Move to low-tax state”). [projectionlab](https://projectionlab.com/help/create-new-plan)
- Clone/duplicate plan to create variants and compare them.
- Different _plan start modes_:
  - Start “now” (rolling annual period) vs. a specific year. [projectionlab](https://projectionlab.com/help/create-new-plan)
- “End of plan” setting (life expectancy) per plan. [robberger](https://robberger.com/projectionlab-review/)

---

## 3. Financial Model Inputs

This is where the expressiveness comes from.

### 3.1 Current Finances / Accounts

A central “Current Finances” page that holds all accounts once, reused across plans. [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)

- **Account categories** (each may have multiple accounts): [robberger](https://robberger.com/projectionlab-review/)
  - Taxable brokerage
  - Tax‑deferred retirement (401(k), Traditional IRA, etc.)
  - Roth accounts
  - HSA
  - 529 / education savings
  - Cash / savings
  - Crypto / alternative assets
- For each account:
  - Current balance
  - Owner (self, spouse, joint)
  - Cost basis and contribution history fields (for capital gains and withdrawal logic). [projectionlab](https://projectionlab.com/blog/whats-new-v430)
  - Expected contributions pattern (amount, frequency, start/end conditions).

### 3.2 Income Modeling

Rich income modeling over time. [projectionlab](https://projectionlab.com/resources/employers/quick-start-guide)

- Employment income: salary, bonus, equity, etc., with:
  - Start/end dates or tied to milestones (e.g., “retire”).
  - Growth assumptions (annual raises).
- Side income: side hustle, rental income, freelance, etc.
- Retirement income:
  - Pensions (with start age, COLA, survivor options).
  - Social Security (claiming age, strategy modeling). [projectionlab](https://projectionlab.com/financial-terms/social-security)
  - Annuities.
- Other inflows:
  - One‑time windfalls (inheritance, business sale).
  - Recurring stipends/support.

Each income source:

- Has type classification for tax purposes (wages vs. self‑employment vs. tax‑exempt). [youtube](https://www.youtube.com/watch?v=CE3KE5DVDzk)
- Has withholding configuration (for realistic tax remittance vs. liability). [projectionlab](https://projectionlab.com/help/tax-withholding-vs-total-tax-liability)

### 3.3 Expense & Spending Modeling

Detailed expense modeling is a big part of PL’s nuance. [projectionlab](https://projectionlab.com/resources/employers/quick-start-guide)

- Baseline spending broken into:
  - Non‑discretionary / essential
  - Discretionary
- Debt payments:
  - Student loans, credit cards, personal loans (rate, term, payment strategy).
- Lifestyle categories:
  - Travel (e.g., higher in first 10 years of retirement).
  - Children‑related (childcare, school, activities).
  - Long‑term care or medical expenses in later years.
- Inflation handling:
  - Category‑specific inflation (e.g., healthcare faster than CPI).
- Custom timing rules:
  - Always active
  - Active between milestone A and B (e.g., “retirement travel” between retirement and age 80). [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)

### 3.4 Real Assets & Liabilities

“Real Assets” screen for property and big‑ticket items. [projectionlab](https://projectionlab.com/blog/whats-new-v430)

- Real assets:
  - Primary residence
  - Second homes / rentals
  - Cars, boats, RVs
  - Precious metals, collectibles
- For each:
  - Purchase date, purchase price, financed vs. cash.
  - Loan terms (principal, interest, amortization).
  - Ongoing costs (maintenance, insurance).
  - Property tax and local tax modeling. [projectionlab](https://projectionlab.com/blog/whats-new-v430)
  - Appreciation / depreciation assumptions.
  - Planned sale date and handling of proceeds.

---

## 4. Events & Milestones System

This is a signature ProjectionLab feature. [projectionlab](https://projectionlab.com/retirement-calculator)

### 4.1 Milestones as Anchors

- Milestones like:
  - Financial independence achieved
  - Retirement
  - Home purchase/sale
  - Moving to a different state/country
  - Having a child
- Each milestone:
  - Has a date or conditional trigger (e.g., “when portfolio hits $X”, “at age 65”). [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)
  - Can have attributes like icon, color, labels. [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)

### 4.2 Using Milestones to Control Other Events

- Spending, income, and asset events can be tied to milestones:
  - Travel expenses active only after “retirement” milestone. [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)
  - Different tax regime after “move to low‑tax state” milestone. [projectionlab](https://projectionlab.com/retirement-calculator)
  - College expenses for a child starting at “child turns 18” milestone.

This gives a declarative “timeline” that orchestrates the rest of the model.

---

## 5. Market, Return, and Assumption Modeling

### 5.1 Global Assumptions

- Plan‑level assumptions: [projectionlab](https://projectionlab.com/retirement-calculator)
  - Investment growth rate (real or nominal)
  - Dividend yield
  - Inflation rate
  - Cash return rates
- Override options for more advanced users:
  - Separate growth assumptions by asset class / account type.
  - Different assumptions by time period (pre‑ vs. post‑retirement).

### 5.2 Historical Backtesting

ProjectionLab allows modeling based on historical market performance instead of just a single fixed return. [robberger](https://robberger.com/projectionlab-review/)

- Run the plan using:
  - Historical sequence(s) (e.g., rolling 30‑year windows from US stock/bond history).
  - “Bad case” vs “good case” historical paths.

---

## 6. Tax Engine & Analytics

This is one of the most complex areas and key to “pro” quality.

### 6.1 Annual Tax Liability Calculation

- For each simulated year, compute total tax liability based on all incomes, gains, contributions, deductions, and withdrawals. [projectionlab](https://projectionlab.com/tax-analytics)
- Support:
  - Ordinary income brackets
  - Capital gains brackets
  - Dividend tax treatment
  - Payroll taxes (Social Security and Medicare)
- Separate:
  - Federal tax
  - State and local income taxes
  - Property taxes for real estate. [projectionlab](https://projectionlab.com/tax-analytics)

### 6.2 Withholding vs. Liability

ProjectionLab distinguishes:

- Tax _liability_ (computed at end of year)
- Actual tax _flows_ (withholding, refunds, payments) over the year. [youtube](https://www.youtube.com/watch?v=CE3KE5DVDzk)

Features:

- Per‑income‑source withholding settings (percentage withheld). [projectionlab](https://projectionlab.com/help/tax-withholding-vs-total-tax-liability)
- Reconciliation: if withheld < liability → tax payment next year; if withheld > liability → refund next year. [projectionlab](https://projectionlab.com/help/tax-withholding-vs-total-tax-liability)
- Ability to add a one‑time tax payment as a custom expense when needed. [projectionlab](https://projectionlab.com/help/tax-withholding-vs-total-tax-liability)

### 6.3 State & Local Nuances

Recent PL updates emphasize more accurate state/local handling: [projectionlab](https://projectionlab.com/tax-analytics)

- Local income taxes (e.g., city taxes).
- Property tax rules and rates by location. [projectionlab](https://projectionlab.com/blog/whats-new-v430)
- State‑specific rules for:
  - Social Security taxability
  - Pension treatment
  - Retirement income preferences. [projectionlab](https://projectionlab.com/blog/whats-new-v430)

### 6.4 Tax Analytics UI

Dedicated “Tax Analytics” page: [youtube](https://www.youtube.com/watch?v=CE3KE5DVDzk)

- Charts for:
  - Income by type over time.
  - Total taxes over time.
  - Effective tax rate over time.
  - Marginal rate by income type (how extra $ of wage vs. capital gain is taxed). [projectionlab](https://projectionlab.com/tax-analytics)
- Visual “effective brackets”:
  - Show combined effect of brackets, deductions, and allowances into one set of effective rates per income category. [projectionlab](https://projectionlab.com/tax-analytics)
- Tabular tax details by year with CSV export. [youtube](https://www.youtube.com/watch?v=CE3KE5DVDzk)

---

## 7. Simulation, Risk, and Strategy Features

### 7.1 Deterministic Base Plan

- Single‑path simulation using your selected growth and inflation assumptions.
- Year‑by‑year net worth, flows, and account balances. [projectionlab](https://projectionlab.com/retirement-calculator)

### 7.2 Monte Carlo Simulations

ProjectionLab heavily markets its Monte Carlo engine: [projectionlab](https://projectionlab.com/financial-terms/monte-carlo-simulation)

- Define return distributions (e.g., mean/SD or per‑asset class).
- Run hundreds or thousands of random simulations.
- Results:
  - “Chance of success” (percentage of runs that do not run out of money). [projectionlab](https://projectionlab.com/monte-carlo)
  - Bands (percentiles) of portfolio value over time (e.g., 10th, 50th, 90th percentiles).
  - Histogram of terminal wealth.

### 7.3 Withdrawal Strategies

- Configurable withdrawal order: which accounts to draw from first in retirement. [robberger](https://robberger.com/projectionlab-review/)
  - Cash → taxable → tax‑deferred → Roth, etc.
- Rules:
  - Fixed real spending vs. “guardrails” approaches.
  - Optional modeling of RMDs and how they interact with other withdrawals.

### 7.4 Cash‑Flow Priorities & Goals

- “Cash Flow Priorities” feature: [projectionlab](https://projectionlab.com/resources/employers/quick-start-guide)
  - Prioritize emergency fund build‑up, debt paydown, contributions, etc.
  - Algorithm decides where surplus cash goes each year based on rules.
- Explicit goals:
  - Financial independence (net worth target, income replacement target).
  - College funding goals.
  - Debt‑free by certain year.

---

## 8. Outputs, Visualizations, and Reporting

### 8.1 Dashboards & Charts

Key visualizations: [youtube](https://www.youtube.com/watch?v=CE3KE5DVDzk)

- Net worth over time
  - Stacked or line charts by asset type / account category.
- Portfolio allocation over time.
- Cash flow over time:
  - Income vs. expenses vs. savings.
- Taxes over time:
  - Total tax, effective rate, by component (federal, state, local, etc.). [projectionlab](https://projectionlab.com/tax-analytics)

### 8.2 Cash‑Flow Sankey

ProjectionLab’s cash flow Sankey is a standout feature: [projectionlab](https://projectionlab.com/retirement-calculator)

- Visual “flows” from income sources to:
  - Taxes (withholding)
  - Savings/investments
  - Consumption categories
- Helps users see where every dollar is going.

### 8.3 Year‑by‑Year Drill‑Down

- Detail panel for each simulated year showing: [projectionlab](https://projectionlab.com/help/tax-withholding-vs-total-tax-liability)
  - Beginning/ending balances by account.
  - Inflows/outflows by type.
  - Tax amounts and bracket usage.
  - Contributions, withdrawals, and realized gains.

### 8.4 Tables & Export

- Tabular view of yearly (or monthly in advanced versions) data. [youtube](https://www.youtube.com/watch?v=CE3KE5DVDzk)
- Export to CSV for further analysis.
- Printable or PDF‑like summary reports (for advisors/clients).

---

## 9. Scenario Management & Comparison

- List of all plans/scenarios on a dashboard. [projectionlab](https://projectionlab.com)
- Scenario comparison views:
  - Key metrics side‑by‑side (FI age, chance of success, median terminal wealth).
  - Compare charts for two or more plans (overlay net worth curves).
- Features like:
  - “Roth conversion scenario” vs. “No conversion” side‑by‑side, particularly in tax analytics. [youtube](https://www.youtube.com/watch?v=CE3KE5DVDzk)

---

## 10. International & Localization Features

ProjectionLab highlights that you can “test international scenarios.” [projectionlab](https://projectionlab.com)

- Multiple country presets:
  - Different tax regimes
  - Different default inflation and return assumptions
- Multiple currencies & localized number/date formats.
- Ability to define custom tax systems for unsupported countries.

---

## 11. Tracking Actual Progress

Beyond projections, PL supports tracking real‑world progress. [projectionlab](https://projectionlab.com)

- “Track your progress over time”:
  - Manually log actual net worth snapshots.
  - Compare actual vs. projected trajectory.
- Journaling:
  - Notes attached to specific dates or milestones (e.g., “Job change,” “Market crash,” “Bought house”).

---

## 12. Data, Storage, Privacy & Deployment

ProjectionLab’s trust model is a selling point: [projectionlab](https://projectionlab.com)

- No direct linkage to real financial institutions (manual entry only).
- Multiple data persistence options:
  - Cloud sync via Firebase. [projectionlab](https://projectionlab.com/retirement-calculator)
  - Browser‑only (localStorage / IndexedDB) mode. [projectionlab](https://projectionlab.com)
  - Manual import/export flat files (JSON). [projectionlab](https://projectionlab.com)
  - Self‑hosting option (for enterprises/advisors). [projectionlab](https://projectionlab.com/retirement-calculator)

For your static, open‑source version, the browser‑only + import/export + self‑hosted story aligns very well.

---

## 13. Advisor & Employer‑Oriented Features (Stretch Goals)

ProjectionLab also targets advisors and employers: [projectionlab](https://projectionlab.com/resources/employers/quick-start-guide)

- Advisor mode:
  - Multi‑client management.
  - Branded experience/white‑labeling.
  - Shareable plan outputs for clients (view‑only links, PDFs).
- Employer / financial wellness:
  - Scaled onboarding for many employees.
  - Preconfigured defaults based on employer benefits.

---

## 14. Turning This into a Roadmap for Your Project

Given this landscape, a sensible roadmap for your static, browser‑only open‑source clone could look like:

### Phase 0 – Your MVP (You Already Described)

- Single user, single plan.
- Deterministic projections:
  - Inputs: age, current savings, retirement age, spending, constant growth & inflation.
- Simple net worth chart and basic year‑by‑year table.
- JSON import/export.

### Phase 1 – “Serious Hobbyist” Level

- Multiple plans/scenarios + cloning.
- Current finances page with multiple account types.
- Basic income & expenses over time (employment + baseline spending).
- Simple milestones (retirement age, FI age).
- Month‑to‑month computation in the engine, even if UI shows yearly.
- Better charts (stacked net worth, income vs. expense).

### Phase 2 – “Advanced DIY Planner” Level

- Full milestone system to control events and timing.
- Real assets & debts (homes, cars, loans).
- Expanded income (side hustle, rental, pensions, SS modeling at basic level).
- Expanded expenses (discretionary vs non‑discretionary, categories, LTC, education).
- Basic tax engine:
  - Federal brackets + capital gains
  - Simple state tax %.
- Year‑by‑year drill‑down tables and CSV export.

### Phase 3 – “ProjectionLab‑Grade” Features

- Robust tax engine:
  - Withholding vs liability, refunds.
  - State/local rules, property taxes, Social Security taxability.
- Tax analytics dashboards (effective/marginal rates, per‑source tax graphs).
- Monte Carlo simulations + chance of success metrics.
- Historical backtesting mode.
- Withdrawal order strategies with configurable rules.
- Full cash‑flow priorities engine (emergency fund, debt vs invest).
- Cash‑flow Sankey.
- International scenarios + custom tax systems.

From a product perspective, _these_ are the features that collectively give ProjectionLab its “wow” factor. You do not need all of them on day one, but designing your math engine and data model with these categories in mind will help you grow toward that level without rewrites.
