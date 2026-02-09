# Agent Development Guide

This guide provides essential information for AI coding agents working with this repository.

## Build, Lint, and Test Commands

### Development Server

```bash
npm run dev          # Start development server with hot reloading
```

### Building

```bash
npm run build        # Compile TypeScript and bundle for production
npm run preview      # Preview production build locally
```

### Testing

```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run all tests once
npm run test:ui      # Run tests with interactive UI
npm test SomeFile    # Run a specific test file
npm test SomeFile.ts # Run a specific test file
```

### Code Quality

```bash
npm run lint         # Check for linting errors
npm run lint:fix     # Fix auto-fixable linting errors
npm run format       # Format code with Prettier
npm run format:check # Check if code is properly formatted
npm run type-check   # Run TypeScript type checking
```

### Test Coverage

```bash
npm run test:coverage # Generate test coverage report
```

## Code Style Guidelines

### Language and Framework

- TypeScript with strict mode enabled
- React with functional components and hooks
- ES2020+ JavaScript features

### Imports and Exports

- Use absolute imports with path aliases (`@/core`, `@/components`, etc.)
- Import React hooks and utilities first, then components, then types
- Group imports: external libraries, internal modules, types
- Use named exports instead of default exports
- Sort imports alphabetically within each group

### Formatting

- Prettier with:
  - Semi-colons required
  - Trailing commas for ES5 compatibility
  - Single quotes for strings
  - Print width of 80 characters
  - 2-space indentation
  - Spaces instead of tabs

### Types

- Use TypeScript for all code
- Strict typing enforced (`strict: true`)
- Use `Readonly<T>` for immutable data structures
- Define interfaces and types in separate files when shared
- Use descriptive type names with PascalCase
- Document complex types with JSDoc comments

### Naming Conventions

- Variables and functions: camelCase
- Components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Interfaces: PascalCase with `I` prefix when needed
- Files: kebab-case.ts or kebab-case.tsx
- Test files: same-name.test.ts or same-name.test.tsx

### Functions and Components

- Pure functions preferred for business logic
- Small, focused functions with single responsibility
- Comprehensive JSDoc comments for exported functions
- React components with descriptive prop interfaces
- Use React hooks appropriately (useState, useEffect, useMemo, etc.)
- Memoize expensive calculations with useMemo

### Error Handling

- Handle edge cases explicitly
- Use TypeScript discriminated unions for error states
- Validate inputs at function boundaries
- Fail fast with meaningful error messages
- Avoid silent failures

### Testing

- Unit tests for all core business logic
- Test edge cases and boundary conditions
- Use descriptive test names with `it()` and `describe()`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies
- Test both positive and negative cases
- Use `test.each` for parametrized tests
- Maintain high test coverage (>90% if possible)

### Documentation

- JSDoc comments for all exported functions, interfaces, and types
- Inline comments for complex logic
- README updates for user-facing changes
- Clear commit messages following conventional commits

### React Patterns

- Functional components with hooks
- Controlled components for forms
- Custom hooks for reusable logic
- Proper component composition
- Efficient rendering with useMemo and useCallback when needed
- Responsive design with Mantine's responsive utilities
- Accessible components following WCAG guidelines

### State Management

- Zustand for global state
- Local component state with useState when appropriate
- Immutable data patterns
- Proper state normalization

### Performance

- Memoization for expensive calculations
- Virtualized lists for large datasets
- Code splitting for large applications
- Bundle size awareness
- Efficient re-rendering

### Security

- Input validation and sanitization
- Secure dependency management
- Environment variable handling
- XSS prevention in DOM manipulation

## Project Structure

```
src/
├── core/          # Business logic and pure functions
│   ├── types/     # Shared type definitions
│   └── utils/     # Utility functions
├── components/    # React components
│   ├── ui/        # Generic UI components
│   └── tables/    # Specific component groups
├── hooks/         # Custom React hooks
├── utils/         # Application-specific utilities
└── test/          # Test setup and helpers
```

## Dependencies

Core libraries:

- React 18+ with hooks
- TypeScript for static typing
- Mantine for UI components
- Zustand for state management
- Recharts for data visualization
- Vitest for testing
- Vite for building

## Test-Driven Development (TDD)

- Write tests before implementing functionality
- Follow the Red-Green-Refactor cycle:
  1. Write a failing test (Red)
  2. Write minimal code to pass the test (Green)
  3. Refactor implementation while keeping tests passing
- Focus on edge cases and boundary conditions in tests
- Aim for high test coverage (>90%) for core business logic
- Ensure tests are deterministic and isolated

## Git Best Practices

Git serves as the definitive source of truth for project history. Follow these practices:

### Commit Early and Often

- Make small, focused commits that represent single logical changes
- Commit frequently to avoid losing work and enable easy rollback
- Each commit should have a clear, descriptive message
- Follow conventional commit message format:
  - `feat: add new projection algorithm`
  - `fix: resolve negative balance issue`
  - `test: add edge case coverage for zero savings`
  - `docs: update API documentation`
  - `refactor: simplify projection calculation logic`

### Branch Strategy

- Create feature branches from main for all changes
- Use descriptive branch names (e.g., `feature/add-projection-table`, `fix/negative-balance-bug`)
- Keep branches up-to-date with main through rebasing or merging
- Delete branches after merging to keep repository clean

### Pull Request Process

1. Ensure all tests pass and code is properly formatted
2. Write clear PR descriptions explaining the problem and solution
3. Link related issues in PR descriptions
4. Request reviews from appropriate team members
5. Address feedback promptly and thoroughly
6. Merge only after approval and successful CI checks

## Contributing Workflow

1. Create feature branch from main
2. Implement changes with tests (following TDD principles)
3. Run linters and formatters
4. Ensure all tests pass
5. Check type safety
6. Commit changes with clear, descriptive messages
7. Create pull request with detailed description
8. Address review feedback
9. Merge after approval and CI success

Always maintain backward compatibility when possible and follow semantic versioning for any breaking changes.
