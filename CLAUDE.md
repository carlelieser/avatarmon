# Avatarmon - Development Guidelines

## Core Principles

This project follows **Test-Driven Development (TDD)**, **Clean Code**, and **TypeScript** best practices.

---

## Test-Driven Development (TDD)

### The Red-Green-Refactor Cycle

1. **Red**: Write a failing test first
2. **Green**: Write the minimum code to make the test pass
3. **Refactor**: Clean up the code while keeping tests green

### TDD Rules

- Never write production code without a failing test
- Write only enough test code to fail (compilation failures count)
- Write only enough production code to pass the failing test
- Tests are first-class citizens - maintain them with the same rigor as production code

### Testing Guidelines

- Use descriptive test names
- One assertion per test when possible
- Test behavior, not implementation
- Mock external dependencies, not internal modules
- Aim for high coverage but prioritize meaningful tests over metrics

---

## Clean Code Principles

### Naming Conventions

- Use intention-revealing names
- Avoid abbreviations (use `customer` not `cust`)
- Use verb phrases for functions: `createAvatar`, `validateInput`
- Use noun phrases for classes: `AvatarGenerator`, `UserRepository`
- Boolean variables/functions: `isValid`, `hasPermission`, `canGenerate`

### Functions

- Keep functions small (< 20 lines preferred)
- Single responsibility - do one thing well
- Maximum 3 parameters; use objects for more
- No side effects - be explicit about mutations
- Prefer pure functions when possible

### Classes

- Single Responsibility Principle (SRP)
- Prefer composition over inheritance
- Keep classes focused and cohesive
- Dependency injection for external services

### Code Organization

```
src/
├── domain/           # Business logic, entities, value objects
├── application/      # Use cases, application services
├── infrastructure/   # External services, APIs, databases
├── presentation/     # UI components, controllers
└── shared/           # Utilities, types, constants
```

### Clean Code Checklist

- [ ] No magic numbers or strings - use named constants
- [ ] No commented-out code - delete it
- [ ] No dead code - if unused, remove it
- [ ] No duplicate code - extract and reuse
- [ ] Error handling is explicit and meaningful
- [ ] Functions have single return points when practical

---

## TypeScript Standards

### Type Safety

- Enable strict mode in `tsconfig.json`
- Never use `any` - use `unknown` if type is truly unknown
- Prefer interfaces for object shapes, types for unions/intersections
- Use generics for reusable components
- Leverage discriminated unions for state management

### Null Safety

- Use `null` for intentional absence, `undefined` for unset
- Prefer optional chaining (`?.`) and nullish coalescing (`??`)
- Use strict null checks
- Avoid non-null assertions (`!`) except in tests

### Async/Await

- Always use async/await over raw Promises
- Handle errors with try/catch or Result types
- Avoid floating promises - always await or handle

---

## Architecture Guidelines

### Dependency Rule

- Dependencies point inward (toward domain)
- Domain has no external dependencies
- Infrastructure implements domain interfaces

### Immutability

- Prefer `const` over `let`
- Use `readonly` for properties that shouldn't change
- Avoid mutating function parameters
- Return new objects/arrays instead of mutating

---

## Code Review Checklist

Before considering code complete:

1. [ ] All tests pass
2. [ ] New code has tests written first (TDD)
3. [ ] No TypeScript errors or warnings
4. [ ] No linting errors
5. [ ] Functions are small and focused
6. [ ] Names are clear and descriptive
7. [ ] No code duplication
8. [ ] Error cases are handled
9. [ ] Types are explicit (no implicit any)
10. [ ] Documentation for public APIs

---

## Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

---

## Commit Messages

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `test:` Adding/updating tests
- `refactor:` Code refactoring (no behavior change)
- `docs:` Documentation changes
- `chore:` Build/tooling changes
