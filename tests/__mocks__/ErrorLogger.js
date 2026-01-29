/**
 * Mock for ErrorLogger
 */

import { jest } from '@jest/globals';

export const errorLogger = {
  log: jest.fn(),
  clear: jest.fn(),
  getLogs: jest.fn(() => []),
};
