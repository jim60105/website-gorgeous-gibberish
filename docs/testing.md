# Testing Documentation

## Overview

This project includes comprehensive test coverage using Jest with jsdom environment. All tests run without requiring a valid API key - external dependencies are properly mocked.

## Running Tests

### Prerequisites

```bash
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run specific test file
npm test -- tests/unit/InputComponent.test.js
```

## Test Structure

```
tests/
├── __mocks__/              # Mock implementations
│   ├── openai.js          # Mocked OpenAI SDK (no API calls)
│   ├── styleMock.js       # CSS module mock
│   ├── api.js             # API config mock
│   ├── APIErrorHandler.js # Error handler mock
│   └── ErrorLogger.js     # Logger mock
├── setup.js               # Global test setup
└── unit/                  # Unit tests
    ├── InputComponent.test.js      # 33 tests ✅
    ├── ChatManager.test.js         # 31 tests ✅
    ├── AnimationController.test.js # 38 tests ✅
    ├── OpenAIService.test.js       # 31 tests ✅
    └── ErrorHandling.test.js       # 26 tests ✅
```

**Total: 159 passing tests**

## Test Coverage

### Task 7.1.1: InputComponent Tests (33/33 ✅)
- Input validation (empty, whitespace, length limits)
- Character count display and color coding (muted/yellow/red)
- Max length enforcement
- Error handling and display
- Submit handling with double-submission prevention
- Loading states
- Random phrase prefilling

### Task 7.1.2: ChatManager Tests (31/31 ✅)
- Message count management
- Conversation limit detection (5 messages max)
- Conversation dots display (● ● ○ ○ ○)
- Reset functionality
- Conversation history tracking
- Topic display management
- Mock response generation

### Task 7.1.3: AnimationController Tests (38/38 ✅)
- State management (initial/chat transitions)
- Animation methods (fadeIn/fadeOut, slideUp/slideDown)
- Typewriter effect with cursor
- Text appending for streaming
- Reduced motion support (prefers-reduced-motion)
- Concurrent animation prevention
- GPU optimization (willChange)
- Timeline execution

### Task 7.1.4: OpenAIService Tests (31/31 ✅)
- API initialization with mocked client
- Message building with conversation history
- Non-streaming message handling
- Streaming message handling with callbacks
- Response validation
- Stream chunk parsing
- Error handling (401, 429, network errors)
- Error transformation to user-friendly messages

### Task 7.1.5: Error Handling Tests (26/26 ✅)
- APIErrorHandler for different error types
  - Network errors (canRetry: true)
  - Timeout errors (canRetry: true)
  - Rate limit errors (429, canRetry: true)
  - Auth errors (401, canRetry: false)
  - Server errors (500/503, canRetry: true)
- Retry mechanism with exponential backoff
- Retry condition evaluation
- Error recovery integration

## Key Features

### No API Key Required ✅
All tests use mocked implementations. The OpenAI SDK is completely mocked, so tests never make real API calls.

### ES6 Modules Support
Tests use ES6 module syntax with Jest's experimental VM modules support.

### Browser Environment Simulation
- jsdom provides browser-like DOM
- Mocked browser APIs: requestAnimationFrame, localStorage, matchMedia
- Proper cleanup between tests

### Comprehensive Mocking
All external dependencies are mocked:
- OpenAI SDK → Mock client with fake responses
- API configuration → Mock config
- Service modules → Mock implementations
- Browser APIs → Mock functions

## Writing New Tests

### Basic Test Structure

```javascript
import { jest } from '@jest/globals';
import { YourComponent } from '../../js/components/YourComponent.js';

describe('YourComponent', () => {
  let component;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="test-element"></div>
    `;
    
    // Create component
    component = new YourComponent();
  });
  
  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = component.doSomething(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Async Tests

```javascript
test('should handle async operation', async () => {
  const result = await component.asyncMethod();
  expect(result).toBeTruthy();
});
```

### Mocking Dependencies

```javascript
const mockDependency = {
  method: jest.fn().mockResolvedValue('mocked result'),
};

const component = new Component(mockDependency);
```

## Test Coverage Goals

- **Target**: > 80% coverage for all files
- **Current Status**: 159/159 tests passing
- **Files Covered**:
  - ✅ InputComponent.js
  - ✅ ChatManager.js
  - ✅ AnimationController.js
  - ✅ OpenAIService.js
  - ✅ APIErrorHandler.js
  - ✅ ErrorRecovery.js
  - ✅ StreamParser (within OpenAIService)

## Continuous Integration

Tests are designed to run in CI environments:
- No external dependencies
- Fast execution (< 10 seconds)
- Deterministic results
- No flaky tests

## Troubleshooting

### Tests Timeout
If tests timeout, check:
1. Fake timers are properly cleaned up
2. Async operations use appropriate timeouts
3. No infinite loops in tested code

### Import Errors
Ensure:
1. All imports use `.js` extension
2. Paths are relative (`../../`)
3. Module mocks are in `tests/__mocks__/`

### Mock Not Working
Check:
1. Mock is properly configured in `jest.config.js`
2. Mock file exports correct structure
3. Import statement matches mock path

## Future Work

- Integration tests (Task 7.2.x)
- E2E tests with Playwright (Task 7.3.x)
- Performance benchmarks
- Visual regression tests
