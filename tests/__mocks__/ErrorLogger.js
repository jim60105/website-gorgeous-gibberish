/**
 * Mock for ErrorLogger
 */

export const errorLogger = {
  log: jest.fn(),
  clear: jest.fn(),
  getLogs: jest.fn(() => []),
};
