/**
 * Jest configuration for website-gorgeous-gibberish
 * Testing configuration for vanilla JS + ES6 modules
 */

export default {
  // Use jsdom environment for browser-like testing
  testEnvironment: 'jsdom',
  
  // Setup files run after test environment is set up
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
  ],
  
  // Coverage collection
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/config/*.js',
    '!js/main.js',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Module name mapper for CSS/assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
  },
  
  // Transform ES6 modules
  transform: {},
  
  // Module paths
  modulePaths: ['<rootDir>'],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Reset mocks between tests
  resetMocks: true,
};
