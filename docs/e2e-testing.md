# E2E Testing Documentation

## Overview

End-to-end tests using Playwright test the application in real browsers, simulating actual user interactions. These tests verify that the entire system works correctly from a user's perspective.

## Running E2E Tests

### Prerequisites

```bash
# Install dependencies (includes Playwright)
pnpm install

# Install browser binaries
pnpm exec playwright install
```

### Test Commands

```bash
# Run all E2E tests (headless)
pnpm run test:e2e

# Run tests with UI mode (interactive)
pnpm run test:e2e:ui

# Run tests with visible browser
pnpm run test:e2e:headed

# Run tests in debug mode
pnpm run test:e2e:debug

# Run specific test file
pnpm exec playwright test tests/e2e/responsive.spec.js
```

## Test Structure

```
tests/e2e/
├── responsive.spec.js    # Responsive design tests (Task 7.3.2)
└── user-flow.spec.js     # User experience flow tests (Task 7.3.3)
```

## Test Coverage

### Task 7.3.2: Responsive Design (10 tests)
Tests various viewport sizes and device types:

**Mobile viewport (iPhone 12)** - 390x844
- Display correctness on mobile
- Touch target sizes (≥44px)
- Text readability (font sizes)

**Tablet viewport (iPad)** - 768x1024
- Display correctness on tablet
- Appropriate spacing and max-width

**Desktop viewport** - 1920x1080
- Large title font size (≥80px)
- Centered content layout

**Small mobile (iPhone SE)** - 375x667
- Content fits without overflow
- All elements visible

**Orientation changes**
- Landscape orientation adaptation

**Fixed element positioning**
- Input stays at bottom in chat mode

### Task 7.3.3: User Experience Flow (16 tests)

**First-time user journey**
- Prefilled random phrase on load
- Centered input box
- Enter key to send message
- Conversation indicator after first message

**Conversation limit scenario**
- Warning before 5th message
- Input disabled after 5 messages
- Reset button visibility

**Reset conversation flow**
- Return to initial state
- Conversation dots reset

**Input validation**
- Empty message prevention
- 20-character limit enforcement
- Character count display

**Keyboard shortcuts**
- Send message on Enter key

**Visual feedback**
- Loading state when sending

## Browser Configuration

Tests run on multiple browsers/devices:

- **Chromium** (Desktop Chrome)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

To test additional browsers, uncomment in `playwright.config.js`:
- Firefox
- WebKit (Safari)

## Writing E2E Tests

### Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  // Navigate
  await page.goto('/');
  
  // Interact
  await page.fill('#user-input', 'test');
  await page.click('#send-button');
  
  // Assert
  await expect(page.locator('#result')).toBeVisible();
});
```

### Viewport Configuration

```javascript
test.describe('Mobile tests', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  
  test('mobile test', async ({ page }) => {
    // Runs with mobile viewport
  });
});
```

### Waiting for Elements

```javascript
// Wait for element to be visible
await page.waitForSelector('.chat-header:not(.hidden)', { timeout: 5000 });

// Wait for navigation
await page.waitForURL('**/about');

// Wait for custom condition
await page.waitForFunction(() => window.myVar === 'ready');
```

### Common Assertions

```javascript
// Visibility
await expect(page.locator('#element')).toBeVisible();
await expect(page.locator('#element')).toBeHidden();

// Content
await expect(page.locator('#text')).toHaveText('Expected');
await expect(page.locator('#input')).toHaveValue('value');

// State
await expect(page.locator('#button')).toBeDisabled();
await expect(page.locator('#checkbox')).toBeChecked();
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports include:
- Test results
- Screenshots on failure
- Execution traces
- Browser console logs

## Debugging Tests

### Interactive Mode

```bash
pnpm run test:e2e:ui
```

Opens Playwright UI with:
- Test list and filtering
- Time travel debugging
- Watch mode
- Step-through execution

### Debug Mode

```bash
pnpm run test:e2e:debug
```

Opens Playwright Inspector:
- Pause execution
- Step through actions
- Inspect page state
- Generate code

### Visual Debugging

```javascript
// Take screenshot
await page.screenshot({ path: 'debug.png' });

// Pause execution
await page.pause();

// Print to console
console.log(await page.title());
```

## CI/CD Integration

Tests are configured for CI:
- Automatic browser installation
- Headless execution
- Retry on failure (2 retries)
- HTML report generation

## Best Practices

### 1. Use Data Attributes

Prefer `data-testid` over CSS classes:

```html
<button data-testid="send-button">Send</button>
```

```javascript
await page.click('[data-testid="send-button"]');
```

### 2. Wait for Conditions

Always wait for async operations:

```javascript
// Good
await page.waitForSelector('.result');
await expect(page.locator('.result')).toBeVisible();

// Bad
await page.click('#button');
expect(await page.locator('.result').isVisible()).toBe(true);
```

### 3. Isolate Tests

Each test should be independent:

```javascript
test.beforeEach(async ({ page }) => {
  // Reset state
  await page.goto('/');
});
```

### 4. Use Descriptive Names

```javascript
// Good
test('should show error message when submitting empty form', ...)

// Bad
test('test1', ...)
```

### 5. Group Related Tests

```javascript
test.describe('User authentication', () => {
  test.describe('Login flow', () => {
    test('successful login', ...);
    test('invalid credentials', ...);
  });
  
  test.describe('Logout flow', () => {
    test('logout and redirect', ...);
  });
});
```

## Troubleshooting

### Tests Time Out

Increase timeout in specific tests:

```javascript
test('slow test', async ({ page }) => {
  test.setTimeout(30000); // 30 seconds
  // ...
});
```

### Flaky Tests

Add explicit waits:

```javascript
// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('#element', { state: 'visible' });
```

### Screenshots on Failure

Screenshots are automatically captured. Find them in:
```
test-results/[test-name]/test-failed-1.png
```

### Trace Files

View execution traces:

```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

## Future E2E Tests

Additional tests to implement:

- **Task 7.3.1**: Cross-browser compatibility
  - Firefox, Safari (WebKit)
- **Task 7.3.4**: Streaming output tests
  - Cursor visibility during streaming
  - Complete response display
- **Task 7.3.5**: Animation effects
  - Layout transitions
  - Typewriter effect
  - Micro-interactions

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
