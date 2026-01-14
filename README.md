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

**Current Version:** 0.1.0 (Prototype Phase)

This project has been recently refactored from a single-file implementation into a modular architecture. Core features are functional, but advanced financial modeling (progressive tax brackets, RMDs, Roth conversions, Monte Carlo simulations) is planned for future releases.

## Architecture

The application uses a layered architecture with ES6 modules:

```
src/
├── core/models/      # Domain models (Plan, Account, Expense)
├── calculations/     # Pure calculation functions
├── storage/          # localStorage with versioning
├── ui/               # Thin UI controllers
└── styles/           # Modular CSS
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

## Development

### Running Tests

```bash
# Run unit tests
node tests/unit/models/Plan.test.js
node tests/unit/calculations/projection.test.js

# Run integration tests
node tests/integration/full-flow.test.js
```

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
