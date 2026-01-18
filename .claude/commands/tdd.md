---
description: Enforce strict TDD workflow - write test first, see it fail, then implement
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Task
argument-hint: <feature-description> [--unit|--integration] [--file <test_file.js>]
---

# TDD TDD TDD - Strict Test-Driven Development

Enforce the classic **Red -> Green -> Refactor** cycle. Tests are written FIRST, implementation comes SECOND.

> "TDD TDD TDD" - the repetition is intentional. This skill enforces discipline.

## Arguments

- `$ARGUMENTS` - Feature description and options:
  - First part: Feature description in quotes or as text
  - `--unit` - Write unit test (default)
  - `--integration` - Write integration test
  - `--file <path>` - Explicit test file path

## The Three Laws of TDD

1. **You may not write production code until you have written a failing test**
2. **You may not write more test than is sufficient to fail**
3. **You may not write more production code than is sufficient to pass the test**

---

## Workflow

### Phase 0: Understand the Feature

Before writing anything:

1. **Parse `$ARGUMENTS`** to extract feature description and flags
2. **Analyze the feature** - what behavior needs to be tested?
3. **Identify the test location** based on feature area:

| Feature Area | Test Path | Implementation Path |
|--------------|-----------|---------------------|
| Menu/Navigation | `tests/menu.test.js` | `static/js/menu.js` |
| Carousel | `tests/carousel.test.js` | `static/js/carousel.js` |
| Meetup API | `tests/meetup.test.js` | `static/js/meetup.js` |
| Events Data | `tests/events-data.test.js` | `scripts/generate-events-data.js` |
| Build Scripts | `tests/scripts.test.js` | `scripts/*.js` |
| Utilities | `tests/utils.test.js` | `static/js/utils.js` |

4. **Check existing tests** for patterns and fixtures:
   ```bash
   # Find test files
   ls tests/ 2>/dev/null || echo "No tests directory yet"

   # Check package.json for test command
   cat package.json 2>/dev/null | grep -A5 '"scripts"' || echo "No package.json"
   ```

5. **Set up test infrastructure if needed**:
   - If no `tests/` directory exists, create it
   - If no test runner configured, recommend a minimal setup

---

### Phase 1: RED - Write Failing Test

**CRITICAL**: Write the test FIRST. No implementation code yet.

#### Step 1.1: Create Test Function

Write a test that describes the expected behavior:

```javascript
// Example test structure using Node.js assert
import assert from 'assert';
import { functionUnderTest } from '../static/js/module.js';

describe('FeatureName', () => {
  it('should do expected thing', () => {
    // Arrange
    const input = { /* test data */ };

    // Act
    const result = functionUnderTest(input);

    // Assert
    assert.strictEqual(result.status, 'expected');
    assert.strictEqual(result.value, expectedValue);
  });
});
```

For vanilla JS without a test runner, use simple assertions:

```javascript
// tests/feature.test.js
import { functionUnderTest } from '../static/js/module.js';

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}`);
    console.error(`  ${e.message}`);
    process.exitCode = 1;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// Tests
test('feature should do expected thing', () => {
  const result = functionUnderTest(input);
  assert(result.status === 'expected', `Expected "expected", got "${result.status}"`);
});
```

#### Step 1.2: Run Test and VERIFY IT FAILS

```bash
# Run the specific test
node tests/feature.test.js
```

**STOP AND CHECK**:
- [ ] Does the test fail?
- [ ] Does it fail for the RIGHT reason? (e.g., `ReferenceError`, `TypeError`, not assertion)

**If test PASSES without implementation**:
> The test is invalid. It doesn't test new behavior. REWRITE IT.

**If test fails with wrong error**:
> The test has setup issues. Fix the test setup, then continue.

**If test fails with assertion error or import error**:
> Perfect! This is the RED state. Proceed to GREEN phase.

#### Step 1.3: Document the Expected Failure

Before moving on, note:
- What error message appeared
- What the test is actually testing
- What implementation is needed

---

### Phase 2: GREEN - Minimal Implementation

**RULE**: Write the MINIMUM code to make the test pass. Nothing more.

#### Step 2.1: Implement Just Enough

```javascript
// BAD - Over-engineering
function processData(data) {
  // Complex caching, validation, logging, retries...
  const cache = getCache();
  if (cache.has(data.id)) return cache.get(data.id);
  const validated = validate(data);
  logger.info(`Processing ${data.id}`);
  const result = complexProcessing(validated);
  cache.set(data.id, result);
  return result;
}

// GOOD - Minimal implementation for test (KISS principle)
function processData(data) {
  return { status: 'expected', value: data.value * 2 };
}
```

#### Step 2.2: Run Test and VERIFY IT PASSES

```bash
# Run the specific test
node tests/feature.test.js
```

**STOP AND CHECK**:
- [ ] Does the test pass?
- [ ] Did you write ONLY what was needed?

**If test still fails**:
> Debug the implementation. Do NOT modify the test (unless it has a bug).

**If test passes**:
> GREEN state achieved. Proceed to REFACTOR phase.

---

### Phase 3: REFACTOR - Clean Up

**RULE**: Improve code quality while keeping tests GREEN.

#### Step 3.1: Check for Code Smells

Review both test and implementation for:
- [ ] Duplicate code
- [ ] Poor naming
- [ ] Long functions (> 20 lines)
- [ ] Deep nesting
- [ ] Violation of KISS principle

#### Step 3.2: Refactor If Needed

Make small improvements:
- Extract helper functions
- Improve variable names
- Remove duplication
- Keep it simple (per CLAUDE.md)

#### Step 3.3: Run Tests After Each Change

```bash
# After EVERY refactoring change
node tests/feature.test.js
```

**If test fails after refactoring**:
> UNDO the refactoring. Refactoring should never break tests.

#### Step 3.4: Run All Tests

```bash
# Ensure no regressions (run all test files)
for f in tests/*.test.js; do node "$f"; done
```

---

## Iteration

After completing one cycle:

1. **Identify next test case** for the feature
2. **Return to Phase 1** (RED)
3. **Repeat** until feature is complete

Common progression:
1. Happy path test
2. Edge case tests
3. Error handling tests
4. Integration tests (if needed)

---

## Anti-Patterns to AVOID

### DON'T: Write Implementation First
```
# WRONG - This is not TDD
1. Write function
2. Write test
3. Test passes

# RIGHT - TDD way
1. Write test
2. Test fails (RED)
3. Write function
4. Test passes (GREEN)
5. Refactor
```

### DON'T: Write Tests That Can't Fail
```javascript
// BAD - This test is useless
function testTrueIsTrue() {
  assert(true);
}

// BAD - Testing implementation details
function testInternalVariableExists() {
  const obj = new MyClass();
  assert('_internalCache' in obj);
}

// GOOD - Testing behavior
function testCachedResultReturnedOnSecondCall() {
  const service = new MyService();
  const result1 = service.getData('key');
  const result2 = service.getData('key');
  assert(result1 === result2);
}
```

### DON'T: Over-Engineer in GREEN Phase
```javascript
// BAD - Too much for first iteration
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    if (item.isDiscounted) {
      total += item.price * item.discountRate;
    } else {
      total += item.price;
    }
  }
  return Math.round(total * 100) / 100;
}

// GOOD - Start simple, add complexity via new tests
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

---

## Example Session

**User**: `/tdd "add validation for empty event title in carousel"`

**Phase 0 - Understand**:
- Feature: Validate empty event title
- Test location: `tests/carousel.test.js`
- Implementation: `static/js/carousel.js`

**Phase 1 - RED**:
```javascript
// tests/carousel.test.js
import { validateEvent } from '../static/js/carousel.js';

test('validateEvent rejects empty title', () => {
  const event = { title: '', date: '2025-01-01', image: 'test.jpg' };
  const result = validateEvent(event);
  assert(result.valid === false, 'Should be invalid');
  assert(result.reason.includes('title'), 'Should mention title');
});
```

Run: `node tests/carousel.test.js`
Result: FAILS (ImportError or assertion) - Good!

**Phase 2 - GREEN**:
```javascript
// static/js/carousel.js
export function validateEvent(event) {
  if (!event.title || !event.title.trim()) {
    return { valid: false, reason: 'Event title is empty' };
  }
  return { valid: true };
}
```

Run: `node tests/carousel.test.js`
Result: PASSES - Good!

**Phase 3 - REFACTOR**:
- Check naming: "empty" vs "blank" - keep "empty"
- Verify KISS principle followed
- Run all tests: `for f in tests/*.test.js; do node "$f"; done`

**Iterate**: Next test - whitespace-only title...

---

## Project-Specific Patterns

### Pure Functions (per CLAUDE.md)
This project emphasizes pure functions. Test data transformations separately from DOM operations:

```javascript
// Pure function - easy to test
export function formatEventDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Test the pure function
test('formatEventDate formats correctly', () => {
  assert(formatEventDate('2025-01-15') === 'Jan 15');
});
```

### DOM Testing
For DOM-dependent code, mock the DOM or test in browser:

```javascript
// Mock DOM elements for testing
globalThis.document = {
  querySelector: (sel) => ({ textContent: '', style: {} }),
  querySelectorAll: (sel) => [],
};

// Or use a minimal DOM library like jsdom for Node.js tests
```

### ES Modules
This project uses ES modules. Ensure test files use `import`/`export` and have `.js` extension.

---

## Quick Reference

| Phase | Action | Verify |
|-------|--------|--------|
| RED | Write test | Test FAILS |
| GREEN | Write minimal impl | Test PASSES |
| REFACTOR | Clean up | Tests still PASS |

```bash
# Quick commands
node tests/feature.test.js                           # Run specific test
for f in tests/*.test.js; do node "$f"; done         # Run all tests
```

---

## Notes

- Follow KISS principle per CLAUDE.md - vanilla JS, no frameworks
- Prefer pure functions that are easy to test
- Keep DOM manipulation at boundaries
- LET IT CRASH - don't hide test failures
- ES modules require `"type": "module"` in package.json or `.mjs` extension
