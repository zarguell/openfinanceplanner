ProjectionLab is a sophisticated, but still consumer-friendly, financial planning simulator focused on long‑term planning, retirement/FI, and scenario testing. To build a similar application, it helps to think in terms of modules and user personas, then derive detailed functional and non‑functional requirements.

Below is a structured breakdown:

---

## 1. Product scope and personas

**Primary personas**

- Individual “DIY” planners and FIRE/retirement-focused users:
  - Want to simulate their entire financial life, test “what‑if” scenarios, and understand retirement readiness. [robberger](https://robberger.com/projectionlab-review/)
- Financial advisors (Pro version):
  - Need client management, reporting, and collaboration tools on top of the core simulation engine. [projectionlab](https://projectionlab.com/advisors)
- Employers (financial wellness offering):
  - Provide employees with a white‑labelish / co‑branded planning experience and education. [projectionlab](https://projectionlab.com/resources/employers/quick-start-guide)

**Overall product promise**

- Build a “living model” of your whole financial life (income, spending, assets, taxes, goals) and visualize a spectrum of possible outcomes. [projectionlab](https://projectionlab.com)
- No live account aggregation: users enter abstractions of their finances; app does not link to real financial accounts by default, emphasizing privacy and control. [projectionlab](https://projectionlab.com/cash-flow)
- Highly visual: charts, graphs, Sankey diagrams, heatmaps, and Monte Carlo outputs. [projectionlab](https://projectionlab.com/tax-analytics)

From this, your system must:

- Support multi‑persona UX (individuals, advisors, employers).
- Implement a generic but powerful financial simulation engine (deterministic + Monte Carlo).
- Provide rich visualization and scenario‑management tooling.

---

## 2. Core domain model and planning flow

ProjectionLab centers on a few key concepts:

1. **Current finances / starting state**
2. **Plans** (deterministic projections)
3. **Chance of Success** (stochastic simulations / Monte Carlo)
4. **Cash‑flow priorities & goals**
5. **Analytics tabs** (cash flow, tax, net worth, success, reports)
6. **Progress tracking** (actual vs projected) [youtube](https://www.youtube.com/watch?v=GaRTibmFWlc)

### 2.1 Onboarding and profile

**Features**

- Guided onboarding wizard:
  - Collects basic demographics (age, birth date, household status, location). [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)
  - Asks “what do you have today?” (savings, investments, real assets, debt). [robberger](https://robberger.com/projectionlab-review/)
  - Sets default tax preset based on location (US federal + state, or other country presets). [projectionlab](https://projectionlab.com/blog/whats-new-v440)
- Plan type selection:
  - Fixed‑date plans vs “project from today” plans (for progress overlay and backtesting). [projectionlab](https://projectionlab.com/help/overlay-actual-progress)

**Requirements**

- User model with:
  - Demographics, currency, locale.
  - Country/state/locality for tax modeling.
- Wizard engine supporting:
  - Multi‑step flows.
  - Saving partial progress.
  - Conditional branching (e.g., different questions for US vs non‑US).

---

### 2.2 Current finances

This is where users model their present‑day financial situation.

**Features**

- Input and manage:
  - Cash & savings accounts.
  - Taxable brokerage accounts.
  - Tax‑advantaged accounts (401k, IRA, Roth variants, HSA, etc.).
  - Inherited IRAs (Traditional and Roth) with specific withdrawal rules. [projectionlab](https://projectionlab.com/blog/whats-new-v430)
  - Real assets: primary home, additional properties, cars, boats, precious metals, etc. [projectionlab](https://projectionlab.com)
  - Debts: mortgages, student loans, credit cards, other loans. [robberger](https://robberger.com/projectionlab-review/)
- Asset allocation / growth settings per account (or at plan level), including dividend yield, growth assumptions, and custom return sequences. [projectionlab](https://projectionlab.com/help/growth-dividend-settings-chance-of-success)
- Cost basis tracking and contribution history to support tax‑aware withdrawals and capital gains modeling. [projectionlab](https://projectionlab.com/blog/whats-new-v430)

**Requirements**

- Data model for:
  - Account types with tax characteristics (taxable, tax‑deferred, tax‑free, special rules like inherited IRAs and 72t/SEPP). [projectionlab](https://projectionlab.com/tax-analytics)
  - Real assets with purchase price, maintenance/ongoing expenses assumptions, and sale assumptions.
  - Liabilities with interest, amortization schedule, payoff options.
- “Current finances” update flow:
  - Editing balances and structures creates “progress points” (snapshots) used later for tracking. [projectionlab](https://projectionlab.com/help/capture-progress)
  - Option to auto‑create progress points vs manual control. [projectionlab](https://projectionlab.com/help/capture-progress)

---

### 2.3 Plans, milestones, income, and expenses

A **Plan** is a deterministic projection of cash flows, balances, and taxes over time.

**Features**

- Milestones and life events:
  - Retirement date, career changes, time‑off for travel, moving to a new location, purchase or sale of assets, family changes, etc. [projectionlab](https://projectionlab.com/blog/financial-planning-scenarios)
  - Multi‑condition milestones that can act as decision tree nodes (e.g., different paths based on market conditions or success metrics). [projectionlab](https://projectionlab.com/tax-analytics)
- Income modeling:
  - Work income (salaries, bonuses, part‑time work).
  - Social Security or country‑specific pensions (e.g., CPP/OAS in Canada). [projectionlab](https://projectionlab.com/blog/whats-new-v440)
  - Business or rental income with associated expenses.
  - Rules for growth over time, step changes, start/end ages, and monthly timing. [youtube](https://www.youtube.com/watch?v=R5qOiUe_8no)
- Expense modeling:
  - Baseline living expenses (with inflation).
  - Categories and tags (essential vs discretionary). [projectionlab](https://projectionlab.com/blog/whats-new-v440)
  - One‑time expenses (e.g., wedding, big trip) and recurring non‑monthly expenses.
  - Advanced “change‑over‑time” editor for nuanced patterns (e.g., childcare only for certain years, ramp‑up/ramp‑down spending). [projectionlab](https://projectionlab.com/cash-flow)
- Currency & inflation settings:
  - Plan‑level assumptions (inflation rate, real vs nominal).
  - Ability to specify items in “today’s currency” vs actual future dollars (for clarity vs modeling purposes). [projectionlab](https://projectionlab.com/help/inflation-in-chance-of-success)

**Requirements**

- Plan entity with:
  - Time horizon, start date, plan type (fixed date vs rolling).
  - Global assumptions (inflation, growth model, withdrawal rules).
- Event/milestone system:
  - Flexible, typed events (income start, expense start, asset purchase, move, etc.) with conditions.
  - Multi‑condition logic to support decision‑tree style behavior.
- Timeline engine:
  - Yearly (and sometimes monthly) resolution that merges events, incomes, expenses, asset changes, and tax computations in order.

---

### 2.4 Cash‑flow priorities and goals

ProjectionLab’s key differentiator is the **cash‑flow priorities** module.

**Features**

- Users define ordered goals that tell the engine how to use excess cash each year:
  - Build emergency fund to a target balance.
  - Make extra loan payments.
  - Contribute to retirement accounts (401k, IRA, HSA, etc.).
  - Contribute to taxable investments as a catch‑all.
  - “Save anything left over” vs “spend anything left over”. [projectionlab](https://projectionlab.com/help/cash-flow-priorities)
- Priority ordering determines allocation of remaining cash after required expenses, debt payments, and taxes.
- Mandatory vs flexible goals:
  - “Contributions are fixed” flag to force some goals (e.g., 401k contributions) to be fulfilled even if it requires drawing down other accounts. [projectionlab](https://projectionlab.com/help/mandatory-goals)
- Goal status tracking:
  - Completed, partial, or abandoned goals visualized via goal heatmaps over the timeline. [youtube](https://www.youtube.com/watch?v=a8p800bQ5ck)

**Requirements**

- “Cash‑flow priorities” configuration UI:
  - Add/edit/delete priority items.
  - Set target amounts, contribution rules (fixed vs maximize vs percentage), mandatory flag.
  - Priority reordering via drag‑and‑drop.
- Simulation logic:
  - After computing net cash each year, run a priority walk‑through:
    - Fulfill mandatory goals even if it implies withdrawals.
    - Allocate remaining funds across optional goals as rules specify.
  - Record outcome per goal per year (complete/partial/fail).
- Goal analytics:
  - Goal heatmap view by year and goal status.
  - Per‑goal summaries (time to reach target, cumulative contributions, etc.).

---

### 2.5 Tax estimation and analytics

Tax modeling is a major part of ProjectionLab’s value proposition.

**Features**

- Automatic tax estimation based on location:
  - Federal, state/province, and local tax support. [projectionlab](https://projectionlab.com/tax-analytics)
  - For US: support for state itemization, credits, and phase‑outs. [projectionlab](https://projectionlab.com/blog/whats-new-v440)
  - International presets, e.g., UK (National Insurance, regional differences), Canada (OAS, GIS, EI, CPP), Netherlands (Box 3 wealth tax). [projectionlab](https://projectionlab.com/blog/whats-new-v440)
- Custom tax configuration:
  - Build your own tax config if presets are insufficient (rates, brackets, deductions, credits). [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)
- Detailed tax analytics mode:
  - Breakdowns of income by source and tax type.
  - Charts for marginal and effective tax rates per year.
  - Effective bracket visualization: combines applicable taxes into a single set of “effective brackets” per income category, factoring in deductions. [projectionlab](https://projectionlab.com/blog/tax-planning-and-analytics)
  - “Income by Tax Rate” heatmap that shows how income falls across brackets, filterable by jurisdiction and type. [projectionlab](https://projectionlab.com/blog/whats-new-v440)
- Strategy modeling:
  - Roth conversions, including multi‑year conversion paths.
  - 72t/SEPP distributions.
  - Mega Backdoor Roth (after‑tax 401k contributions with in‑plan or Roth IRA rollover). [youtube](https://www.youtube.com/watch?v=TQ0YYixOIuw)
  - Liquidity and withdrawal sequence configuration (which accounts to draw from in what order). [projectionlab](https://projectionlab.com/tax-analytics)

**Requirements**

- Tax engine:
  - Extensible tax config schema (jurisdictions, brackets, special rules).
  - Ability to evaluate taxes for each year with inputs:
    - Income by type, deductions, credits, capital gains vs ordinary income.
  - Interface for plug‑in jurisdiction modules (US, CA, UK, NL, etc).
- Tax analytics views:
  - Income breakdown by type and by tax treatment.
  - Estimated tax by type and effective rates.
  - Visualization of effective brackets and marginal rates.
  - Strategy comparison (e.g., plan with vs without Roth conversions).

---

### 2.6 Monte Carlo and “Chance of Success”

ProjectionLab splits deterministic planning from stochastic analysis.

**Features**

- “Plan” tab:
  - Deterministic outputs based on fixed growth and inflation assumptions set in the plan. [projectionlab](https://projectionlab.com/help/plan-vs-chance-of-success)
- “Chance of Success” tab:
  - Monte Carlo simulations and/or historical backtests applied on top of the same plan inputs. [projectionlab](https://projectionlab.com/help/plan-vs-chance-of-success)
  - Configurable:
    - Data source: historical returns vs custom probability distributions. [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)
    - Sampling methodology (e.g., rolling windows, bootstrap).
    - Metric to evaluate (net worth, spending, etc.) and success criteria.
  - Output:
    - Probability of success.
    - Percentile bands over time (e.g., 10th/50th/90th percentile net worth).
    - Possibly split views by age. [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)
- Visualization options:
  - Display results in “actual” vs “today’s” currency (display‑only; does not change probability). [projectionlab](https://projectionlab.com/help/inflation-in-chance-of-success)

**Requirements**

- Monte Carlo engine:
  - Support many trials per plan with pluggable return sequences.
  - Efficient caching and reuse (don’t rerun full simulation on minor cosmetic changes).
- Chance‑of‑success UI:
  - Configuration panel for data source, number of trials, success metrics.
  - Percentile band charts.
  - Summary probability and scenario classification (e.g., success/failure definitions).

---

### 2.7 Cash flow visualization (Sankey) and analytics

**Features**

- Cash‑flow tab with Sankey diagrams:
  - Visualize annual money flows from income sources into accounts, taxes, spending categories, and debt payments. [projectionlab](https://projectionlab.com/resources/employers/quick-start-guide)
  - Track how money moves in each simulated year (sources → uses).
- Cash flow over time:
  - Charts showing transition from accumulation phase to draw‑down phase.
  - Visual differentiation of inflows, outflows, transfers, contributions. [projectionlab](https://projectionlab.com/cash-flow)
- Interactive analysis:
  - Ability to see effects of configuration changes (e.g., change emergency fund priority and see flows shift).
  - Integration with cash‑flow priorities (e.g., watch how “save vs spend anything left over” changes flows). [youtube](https://www.youtube.com/watch?v=a8p800bQ5ck)

**Requirements**

- Engine outputs:
  - For each year, compute a structured cash‑flow graph (nodes: income sources, accounts, tax buckets, expenses; edges: flows with amounts).
- Sankey visualization:
  - Reconstruct flows into a graph and render interactive Sankey.
  - Enable year selection and maybe playback.

---

### 2.8 Net worth, progress tracking, and reports

**Features**

- Net worth analysis:
  - Standard net worth chart over time (deterministic or percentile overlays).
  - Composition by asset type, account type, and tax treatment. [youtube](https://www.youtube.com/watch?v=R5qOiUe_8no)
- Progress points:
  - Application captures “progress points” whenever current finances are updated, or manually if preferred. [projectionlab](https://projectionlab.com/help/capture-progress)
  - “Net Worth + Progress” chart overlays actual historical progress over the projected curve for fixed‑date plans. [youtube](https://www.youtube.com/watch?v=GaRTibmFWlc)
- Reporting and export:
  - Tables of plan outputs accessible within a dedicated Reports tab. [projectionlab](https://projectionlab.com/blog/whats-new-v440)
  - Export to PDF, CSV, JSON for client deliverables or personal records. [youtube](https://www.youtube.com/watch?v=R5qOiUe_8no)

**Requirements**

- Progress point subsystem:
  - Schema: timestamp, rolled‑up net worth, breakdown by account, metadata.
  - Automatic creation on current finance changes with ability to toggle off/on.
- Reports engine:
  - Tabular outputs for key metrics (income, expenses, contributions, withdrawals, taxes, balances).
  - Export services (PDF generation, CSV/JSON export).
- Net worth + progress visualization:
  - Overlay real vs projected, handle different start dates, allow zoom ranges.

---

### 2.9 Scenario management and comparisons

**Features**

- Multiple plans per user; ability to clone and modify for what‑if scenarios. [robberger](https://robberger.com/projectionlab-review/)
- Compare mode:
  - Visual overlay of two or more scenarios to see differences in net worth, spending, taxes, or success probability. [youtube](https://www.youtube.com/watch?v=7q7zJSlYZAs)
- Static snapshots:
  - Save an evolved plan state as a new static plan for later comparison. [youtube](https://www.youtube.com/watch?v=a8p800bQ5ck)
- Flex Spending:
  - Rules that automatically adjust discretionary spending when portfolio performance deviates (e.g., “If market drops 30% from ATH, cut discretionary spending by 60%”). [projectionlab](https://projectionlab.com/blog/whats-new-v440)
  - Tag expenses as essential vs discretionary so rules only affect appropriate categories. [projectionlab](https://projectionlab.com/blog/whats-new-v440)

**Requirements**

- Scenario management model:
  - Plan versioning or explicit “plan clones”.
  - Scenario metadata: name, description, key differences.
- Comparison engine:
  - Compute deltas for selected metrics between plans.
  - Overlay visuals (e.g., two net worth curves).
- Flex‑spending rules engine:
  - Watch portfolio performance (e.g., drawdown from ATH).
  - Apply rule‑based modifications to expenses or contribution patterns for future years.

---

## 3. Advisor and employer features

### 3.1 Pro version for advisors

**Features**

- Advisor dashboard:
  - List of client profiles with high‑level stats (net worth, AUA, plan status). [projectionlab](https://projectionlab.com/advisors)
  - Add/remove clients, send invite links. [projectionlab](https://projectionlab.com/advisors)
- Permissions:
  - Control whether clients can edit their plans directly or just view. [projectionlab](https://projectionlab.com/advisors)
- Co‑planning experience:
  - Advisors can switch seamlessly between their Pro dashboard and full client view to update plans or walk through scenarios with clients. [projectionlab](https://projectionlab.com/advisors)
- Advisor directory:
  - Public listing of advisors using the platform, included with Pro subscription to help advisors reach high‑intent prospective clients. [projectionlab](https://projectionlab.com/advisors)
- Reporting:
  - Printable reports, PDFs, and exports to share with clients. [projectionlab](https://projectionlab.com/blog/whats-new-v440)

**Requirements**

- Multi‑tenant architecture:
  - Separation of advisor accounts and client accounts.
  - Access control lists linking advisor ↔ client.
- Advisor‑level analytics:
  - Rollup metrics such as total AUA and client count.
- Directory module:
  - Public profile for advisors (bio, location, specialties, contact).

---

### 3.2 Employer / financial wellness

**Features**

- Employer resources:
  - Employer‑facing quick‑start documentation and positioning as a financial wellness benefit for employees. [projectionlab](https://projectionlab.com/resources/employers/quick-start-guide)
- Likely features (inferred from positioning):
  - Organization/tenant objects representing employers.
  - Employee provisioning, possibly via bulk invite or SSO.
  - Shared educational resources and onboarding flows oriented to employees.

**Requirements**

- Tenant model:
  - Employer accounts, branding options (logo, colors).
  - Association of users with an employer.
- Access and billing:
  - Employer‑level subscription handling.

---

## 4. Platform, persistence, and integrations

### 4.1 Data persistence and privacy

ProjectionLab emphasizes privacy and data control:

- No mandatory bank connections or external account sync. [projectionlab](https://projectionlab.com)
- Data persistence options:
  - Cloud sync via Google Firebase.
  - Browser localStorage only.
  - Manual import/export to flat files (likely JSON; CSV export for reports). [youtube](https://www.youtube.com/watch?v=y6RmrzANHKc)

**Requirements**

- Persistence layer abstractions:
  - Pluggable backends (cloud DB vs local storage).
  - Encryption both in transit and at rest in cloud.
- Manual import/export:
  - Serialization of user’s full planning context.
  - Versioning and migration logic for file formats across app versions.
- Privacy guarantees:
  - No ads; no selling of user data; explicit communication of privacy stance. [projectionlab](https://projectionlab.com/cash-flow)

---

### 4.2 Platform and UX

**Features**

- Web‑first app, installable as a Progressive Web App (PWA) on mobile, addable to homescreen like a native app. [projectionlab](https://projectionlab.com/help/mobile-support)
- Fast, modern, visually rich UI with responsive charts and animations. [projectionlab](https://projectionlab.com)
- Desktop usage patterns supported by wrappers like WebCatalog (desktop shell). [webcatalog](https://webcatalog.io/en/apps/projectionlab)
- User preferences:
  - Color scheme and theme options. [youtube](https://www.youtube.com/watch?v=GaRTibmFWlc)
  - Chart options (e.g., stacked views, custom plots, tabular view, CSV export). [youtube](https://www.youtube.com/watch?v=R5qOiUe_8no)

**Requirements**

- SPA/PWA architecture:
  - Offline‑capable core, manifest and service worker.
  - Mobile‑friendly responsive layout.
- Charting and visualization layer:
  - Configurable chart types (line, stacked area, bar, heatmap, Sankey).
  - Performance for multi‑year and multi‑scenario data.
- Settings framework:
  - Persist per‑user color scheme, currency display mode, default tab, etc.

---

### 4.3 Subscriptions and plans

**Features**

- Free tier:
  - Can create simulations but does not save data; sandbox mode. [youtube](https://www.youtube.com/watch?v=pH_r-oox08Y)
- Paid tiers:
  - Premium (individuals) with data persistence and advanced features.
  - Pro (advisors) with additional client management and directory listing. [projectionlab](https://projectionlab.com/pricing)
- 7‑day free trial for paid versions with “no charge if canceled within trial period”. [robberger](https://robberger.com/tools/projectionlab/)

**Requirements**

- Billing/subscription subsystem:
  - Plan definitions, entitlements, feature flags.
  - Trials, renewals, cancellations.
  - Usage of feature gating (e.g., data persistence, advisor tools, exports) based on plan.

---

## 5. Non‑functional requirements inferred from product

To reach parity with ProjectionLab’s experience:

1. **Performance**
   - Handle multi‑decade yearly simulations (and possibly monthly features) quickly, including hundreds/thousands of Monte Carlo runs.
   - Incremental recomputation on small changes (caching, diffing).

2. **Accuracy & auditability**
   - Transparent tax calculations with detailed breakdowns and drill‑downs per year. [projectionlab](https://projectionlab.com/blog/tax-planning-and-analytics)
   - Consistent handling of edge cases (RMDs, Roth rules, withdrawal penalties, international nuances).

3. **Usability**
   - Intuitive onboarding and defaults for non‑experts; advanced editors for power users. [projectionlab](https://projectionlab.com)
   - Interactive, explorable charts with tooltips, filtering, hover previews, and one‑click plotting. [projectionlab](https://projectionlab.com/blog/getting-started-with-projectionlab)
   - Educational content and glossary of financial terms. [projectionlab](https://projectionlab.com)

4. **Extensibility**
   - Public roadmap and release history; ability to add new features (e.g., Mega Backdoor Roth, new jurisdictions) without redesigning core engine. [projectionlab](https://projectionlab.com/cash-flow)

5. **Security & compliance**
   - Proper handling of personal data, even without direct bank connections.
   - Clear disclaimers: educational only, not personalized financial advice (noted in advisor help content). [projectionlab](https://projectionlab.com/help/category/pro-version-for-advisors)

---

## 6. Translating this into a requirements checklist

Below is a concise, implementation‑oriented checklist you can use as a starting spec for a similar application.

**Core modules**

- [ ] User accounts, profiles (demographics, locale, currency, tax region)
- [ ] Current finances model (accounts, assets, debts, allocations, cost basis)
- [ ] Plan module with:
  - [ ] Milestones/events
  - [ ] Income & expense schedules
  - [ ] Plan‑level assumptions (inflation, growth, longevity)
- [ ] Cash‑flow priorities & goals engine
- [ ] Tax engine with multi‑jurisdiction support
- [ ] Monte Carlo / Chance‑of‑Success engine
- [ ] Analytics tabs:
  - [ ] Plan (deterministic)
  - [ ] Cash flow (Sankey + charts)
  - [ ] Tax analytics
  - [ ] Net worth & asset allocation
  - [ ] Chance of Success
  - [ ] Reports (tables + export)
- [ ] Progress tracking (progress points + actual vs projected overlays)
- [ ] Scenario management (clone, compare, flex‑spending rules)

**For advisors & employers**

- [ ] Advisor Pro dashboard (client list, switching into client view)
- [ ] Permissions & AUA/client metrics
- [ ] Advisor directory
- [ ] Employer tenants (branding, employee provisioning)

**Platform & infra**

- [ ] PWA‑capable web app, responsive UI
- [ ] Configurable storage (cloud vs local) and file import/export
- [ ] Subscription plans and billing (free, premium, pro, trials)
- [ ] Privacy and security controls; transparent non‑ad, no‑data‑selling policy

---

If you like, next steps could be:

- Turning this into a structured PRD or user story backlog (e.g., “As a user, I can define prioritized goals so that…”).
- Designing a minimal viable subset (e.g., US‑only, basic tax, single persona) and a staged roadmap toward the full ProjectionLab‑like feature set.
