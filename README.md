# Open Finance Planner

A client-side financial planning application that runs entirely in your browser with zero dependencies. Open source, privacy-focused, and designed for comprehensive retirement and financial projections.

## Features

- 📊 **Multi-Account Projections** - Model 401(k), IRA, Roth IRA, HSA, and taxable brokerage accounts
- 💰 **Expense Modeling** - Project expenses with inflation adjustment
- 📈 **Growth Scenarios** - Customize growth rates for equities and bonds
- 💾 **Local Storage** - All data stays in your browser (privacy-first)
- 📤 **Import/Export** - JSON format for data portability and backup
- 🌙 **Dark Mode** - Automatic dark mode support

## Quick Start

1. **Clone and open:**

   ```bash
   git clone https://github.com/yourusername/openfinanceplanner.git
   cd openfinanceplanner
   # Open index.html in your browser
   ```

2. **Or use the dev server:**
   ```bash
   npm run serve
   # Navigate to http://localhost:3030
   ```

## Project Status

**Current Version:** 0.1.0

**Maintainability Overhaul Complete** (2026-01-17)

This project has completed a comprehensive maintainability overhaul across 6 phases:

1. **Phase 1: Tooling Setup** - ESLint 9 flat config, Prettier formatting
2. **Phase 2: Configuration Centralization** - Extracted hardcoded values to config system
3. **Phase 3: UI Controller Extraction** - Split monolithic AppController into focused modules
4. **Phase 4: Tax Module Refactoring** - Modularized tax calculations (federal, state, config)
5. **Phase 5: Test Migration** - Migrated to Vitest framework, added coverage reporting
6. **Phase 6: Validation & Polish** - Fixed ESLint browser globals, updated documentation

**Key Improvements:**
- Modular architecture with separated concerns
- Centralized configuration management
- Modern tooling (ESLint, Prettier, Vitest)
- 308 tests passing with 57% coverage
- CI/CD pipeline with quality enforcement

Core features are fully functional including progressive tax brackets, RMDs, Roth conversions, and Monte Carlo simulations.

## Architecture

The application uses a layered architecture with ES6 modules:

```
src/
├── core/models/      # Domain models (Plan, Account, Expense, Income)
├── core/rules/       # Strategy pattern for financial rules
├── calculations/     # Pure calculation functions
│   ├── tax/         # Federal and state tax calculations
│   │   └── config/  # Centralized configuration
│   └── ...
├── config/           # Centralized configuration management
├── storage/          # localStorage with versioning
├── ui/               # Modular UI controllers
│   ├── AppController.js        # Main coordinator
│   ├── PlanController.js       # Plan management
│   ├── AccountController.js    # Account CRUD
│   ├── ExpenseIncomeController.js # Expenses & Income
│   └── ProjectionController.js # Projection rendering
└── styles/           # Modular CSS
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with interactive UI
npm run test:ui
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

### CI/CD

The project uses GitHub Actions for continuous integration:
- Runs tests on every push and pull request
- Enforces minimum 50% code coverage
- Runs ESLint for code quality checks
- Coverage reports uploaded to Codecov

### Project Structure

- `index.html` - Main entry point
- `src/core/models/` - Business logic layer
- `src/calculations/` - Pure calculation functions
- `src/storage/` - Data persistence with schema validation
- `src/ui/` - UI controllers
- `tests/` - Unit and integration tests

## Contributing

Contributions welcome! Please see [docs/tasks.md](docs/tasks.md) for the roadmap and planned enhancements.

## License

MIT License - see LICENSE file for details

## Roadmap

See [docs/tasks.md](docs/tasks.md) for detailed development plans including:

- Advanced tax calculations with progressive brackets
- Required Minimum Distribution (RMD) calculations
- Roth conversion strategies (backdoor Roth, conversion ladders)
- Monte Carlo simulations for variance modeling
- Data visualization with charts

## Privacy & Data

- **Client-side only** - No data ever leaves your browser
- **No tracking** - No analytics or telemetry
- **No accounts** - No registration or login required
- **Export your data** - Full control via JSON export/import

---

**Note:** This tool is for educational and planning purposes. Consult a qualified financial advisor for personalized advice.
