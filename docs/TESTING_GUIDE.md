# Testing Guide

## Test Setup

The project uses Jest and React Testing Library for comprehensive testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### Unit Tests (`__tests__/lib/`)
- **utils.test.ts**: Tests for utility functions (cn, etc.)
- **password.test.ts**: Password hashing and verification
- **rbac.test.ts**: Role-based access control

### Component Tests (`__tests__/components/`)
- **ui/Button.test.tsx**: Button component functionality
- More component tests can be added as needed

### Integration Tests (`__tests__/integration/`)
- **user-flow.test.ts**: End-to-end user journey tests
- Placeholder structure for comprehensive integration testing

## Test Coverage Areas

### ✅ Covered
- Utility functions
- Password utilities
- RBAC functions
- Button component

### 🔄 To Be Expanded
- Form components
- API routes
- Server actions
- Database operations
- Authentication flows
- Payment processing

## Writing New Tests

### Example: Testing a Utility Function

```typescript
import { myFunction } from "@/lib/my-utils";

describe("myFunction", () => {
  it("should handle normal case", () => {
    expect(myFunction("input")).toBe("expected");
  });

  it("should handle edge cases", () => {
    expect(myFunction("")).toBe("");
  });
});
```

### Example: Testing a Component

```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

## Test Database Setup

For integration tests, you'll need:
1. Test database configuration
2. Database seeding for tests
3. Cleanup after tests

## Continuous Integration

Tests should run:
- On every commit
- Before deployment
- In CI/CD pipeline
