<p align="center">
  <h1 align="center">json-expression-eval</h1>
  <p align="center">
    <strong>A fully typed, JSON-serializable boolean expression evaluator and rule engine for Node.js</strong>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/json-expression-eval"><img src="https://img.shields.io/npm/v/json-expression-eval.svg?style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/json-expression-eval"><img src="https://img.shields.io/node/v-lts/json-expression-eval?style=flat-square" alt="node version"></a>
  <a href="https://github.com/PruvoNet/json-expression-eval/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/PruvoNet/json-expression-eval/ci.yml?branch=master&style=flat-square" alt="build status"></a>
  <a href="https://qlty.sh/gh/PruvoNet/projects/json-expression-eval"><img src="https://qlty.sh/gh/PruvoNet/projects/json-expression-eval/coverage.svg" alt="coverage"></a>
  <a href="https://qlty.sh/gh/PruvoNet/projects/json-expression-eval"><img src="https://qlty.sh/gh/PruvoNet/projects/json-expression-eval/maintainability.svg" alt="maintainability"></a>
  <a href="https://snyk.io/test/github/PruvoNet/json-expression-eval?targetFile=package.json"><img src="https://snyk.io/test/github/PruvoNet/json-expression-eval/badge.svg?targetFile=package.json" alt="vulnerabilities"></a>
</p>

---

## Why json-expression-eval?

Need to store complex business rules in a database? Want to evaluate dynamic conditions without `eval()`? This library lets you:

- **Serialize expressions as JSON** - Store rules in databases, send them over APIs
- **100% type-safe** - Full TypeScript support with compile-time validation
- **Extensible** - Add custom functions for domain-specific logic
- **Debug easily** - `evaluateWithReason` tells you exactly *why* an expression matched

---

## Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Expression Syntax](#-expression-syntax)
- [Operators](#-operators)
- [Custom Functions](#-custom-functions)
- [Rule Engine](#-rule-engine)
- [API Reference](#-api-reference)

---

## Installation

```sh
# npm
npm install json-expression-eval

# yarn
yarn add json-expression-eval

# pnpm
pnpm add json-expression-eval
```

---

## Quick Start

```typescript
import { evaluate } from 'json-expression-eval';

// Define your context (the data to evaluate against)
const context = {
  user: { age: 25, role: 'admin' },
  subscription: { plan: 'pro', daysLeft: 15 }
};

// Define your expression (can be stored as JSON!)
const expression = {
  and: [
    { 'user.age': { gte: 18 } },
    { 'user.role': 'admin' },
    { 'subscription.daysLeft': { gt: 0 } }
  ]
};

// Evaluate
const result = await evaluate(expression, context, {});
console.log(result); // true
```

---

## Expression Syntax

Expressions are plain JavaScript objects that can be serialized to JSON. They support:

### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `and` | All conditions must be true | `{ and: [expr1, expr2] }` |
| `or` | At least one condition must be true | `{ or: [expr1, expr2] }` |
| `not` | Negates the condition | `{ not: expr }` |

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal (`===`) | `{ age: { eq: 25 } }` |
| `neq` | Not equal (`!==`) | `{ status: { neq: 'inactive' } }` |
| `gt` | Greater than | `{ price: { gt: 100 } }` |
| `gte` | Greater than or equal | `{ age: { gte: 18 } }` |
| `lt` | Less than | `{ quantity: { lt: 10 } }` |
| `lte` | Less than or equal | `{ score: { lte: 100 } }` |
| `inq` | In array | `{ color: { inq: ['red', 'blue'] } }` |
| `nin` | Not in array | `{ status: { nin: ['banned', 'suspended'] } }` |
| `between` | Between two values (inclusive) | `{ age: { between: [18, 65] as const } }` |
| `regexp` | Matches regex | `{ email: { regexp: '^.*@gmail\\.com$' } }` |
| `regexpi` | Matches regex (case-insensitive) | `{ name: { regexpi: '^john' } }` |
| `exists` | Check if value exists (not null/undefined) | `{ middleName: { exists: true } }` |

### Shorthand Syntax

For simple equality checks, you can omit the operator:

```typescript
// These are equivalent:
{ userId: { eq: 'abc123' } }
{ userId: 'abc123' }
```

### Nested Properties

Access nested properties using dot notation:

```typescript
{ 'user.address.city': 'New York' }
{ 'order.items.0.price': { gt: 50 } }
```

---

## Operators

### Reference Values

Compare a property against another property in the context:

```typescript
{
  'cart.total': {
    lte: { ref: 'user.balance' }  // cart.total <= user.balance
  }
}
```

### Math Operations

Perform calculations in comparisons:

```typescript
{
  'order.total': {
    lte: {
      op: '*',           // Multiply
      lhs: { ref: 'user.credit' },  // Left-hand side
      rhs: 0.9           // Right-hand side (10% discount)
    }
  }
}
```

**Available operations:** `+`, `-`, `*`, `/`, `%`, `pow`

---

## Custom Functions

Add domain-specific logic with custom functions:

```typescript
import { evaluate, Expression, EvaluatorFuncRunOptions } from 'json-expression-eval';

// Define your function table type
type MyFunctions = {
  isPremiumUser: (
    minPurchases: number,
    ctx: { purchases: number },
    opts: EvaluatorFuncRunOptions<{}>
  ) => Promise<boolean>;
};

// Implement the functions
const functions: MyFunctions = {
  isPremiumUser: async (minPurchases, ctx) => {
    return ctx.purchases >= minPurchases;
  }
};

// Use in expressions
const expression: Expression<MyContext, MyFunctions> = {
  and: [
    { isPremiumUser: 10 },  // Custom function call
    { 'subscription.active': true }
  ]
};

await evaluate(expression, context, functions);
```

---

## Rule Engine

For more complex scenarios, use the rule engine to evaluate multiple rules and get detailed results:

```typescript
import { RulesEngine, Rule } from 'json-expression-eval';

type MyPayload = { discountPercent: number };

const rules: Rule<MyPayload, ...>[] = [
  {
    condition: {
      and: [
        { 'user.tier': 'gold' },
        { 'cart.total': { gte: 100 } }
      ]
    },
    consequence: {
      message: 'Gold member discount applied!',
      custom: { discountPercent: 20 }
    }
  },
  {
    condition: { 'cart.total': { gte: 50 } },
    consequence: {
      message: 'Bulk discount applied!',
      custom: { discountPercent: 10 }
    }
  }
];

const engine = new RulesEngine(functions, ruleFunctions);
const results = await engine.evaluateAll(rules, context, {});
// Returns all matching rules with their consequences
```

---

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `evaluate(expr, ctx, funcs, opts?)` | Evaluate expression, returns `boolean` |
| `evaluateWithReason(expr, ctx, funcs, opts?)` | Evaluate and return the minimal matching sub-expression |
| `validate(expr, ctx, funcs, opts?)` | Validate expression structure against a context |

### Classes

| Class | Description |
|-------|-------------|
| `ExpressionHandler` | Reusable expression evaluator instance |
| `RulesEngine` | Rule engine for evaluating multiple rules |

### `evaluateWithReason` Behavior

Returns `{ result: boolean, reason: Expression }` where `reason` is the minimal sub-expression that determined the result:

- **`or` = true**: Returns `{or: [firstTrueExpr]}`
- **`or` = false**: Returns `{or: [allExprs]}` (all failed)
- **`and` = false**: Returns `{and: [firstFalseExpr]}`
- **`and` = true**: Returns `{and: [allExprs]}` (all passed)

---

## Examples

For more examples, see the [`/src/examples`](./src/examples) and [`/src/test`](./src/test) directories.

---

## License

MIT - See [LICENSE](./LICENSE) for details.
