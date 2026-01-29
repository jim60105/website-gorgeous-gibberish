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
  
  // Module name mapper for CSS/assets and mocks
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '^openai$': '<rootDir>/tests/__mocks__/openai.js',
    '^../../js/config/api.js$': '<rootDir>/tests/__mocks__/api.js',
    '^../../js/services/APIErrorHandler.js$': '<rootDir>/tests/__mocks__/APIErrorHandler.js',
    '^../../js/services/ErrorLogger.js$': '<rootDir>/tests/__mocks__/ErrorLogger.js',
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
