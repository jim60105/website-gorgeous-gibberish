/**
 * Unit tests for Error Handling
 * Task 7.1.5: 測試錯誤處理機制
 */

import { jest } from '@jest/globals';

jest.mock('openai');

import { APIErrorHandler } from '../../js/services/APIErrorHandler.js';
import { ErrorRecovery } from '../../js/services/ErrorRecovery.js';
import MockOpenAI from 'openai';

describe('APIErrorHandler', () => {
  describe('handle', () => {
    test('should handle network errors', () => {
      const error = new TypeError('Failed to fetch');
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('NETWORK_ERROR');
      expect(result.message).toContain('無法連接');
      expect(result.canRetry).toBe(true);
    });
    
    test('should handle timeout errors', () => {
      const error = new Error('Request timeout');
      error.name = 'AbortError';
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('TIMEOUT_ERROR');
      expect(result.message).toContain('超時');
      expect(result.canRetry).toBe(true);
    });
    
    test('should handle unknown errors', () => {
      const error = new Error('Random error');
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('UNKNOWN_ERROR');
      expect(result.message).toContain('未知錯誤');
      expect(result.canRetry).toBe(false);
    });
  });
  
  describe('handleAPIError', () => {
    test('should handle 400 bad request', () => {
      const error = new MockOpenAI.APIError('Bad request', 400);
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('BAD_REQUEST');
      expect(result.message).toBeTruthy();
      expect(result.canRetry).toBe(false);
    });
    
    test('should handle 401 unauthorized', () => {
      const error = new MockOpenAI.APIError('Unauthorized', 401);
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('UNAUTHORIZED');
      expect(result.message).toContain('金鑰');
      expect(result.canRetry).toBe(false);
    });
    
    test('should handle 429 rate limit', () => {
      const error = new MockOpenAI.APIError('Rate limit exceeded', 429);
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('RATE_LIMIT');
      expect(result.message).toContain('頻繁');
      expect(result.canRetry).toBe(true);
    });
    
    test('should handle 500 server error', () => {
      const error = new MockOpenAI.APIError('Internal server error', 500);
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('SERVER_ERROR');
      expect(result.canRetry).toBe(true);
    });
    
    test('should handle 503 service unavailable', () => {
      const error = new MockOpenAI.APIError('Service unavailable', 503);
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('SERVICE_UNAVAILABLE');
      expect(result.canRetry).toBe(true);
    });
  });
  
  describe('isNetworkError', () => {
    test('should detect fetch errors', () => {
      const error = new TypeError('Failed to fetch');
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('NETWORK_ERROR');
    });
    
    test('should detect network failure', () => {
      const error = new TypeError('Failed to fetch');
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('NETWORK_ERROR');
    });
  });
  
  describe('isTimeoutError', () => {
    test('should detect AbortError', () => {
      const error = new Error('Aborted');
      error.name = 'AbortError';
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('TIMEOUT_ERROR');
    });
    
    test('should detect timeout message', () => {
      const error = new Error('Request timeout');
      const result = APIErrorHandler.handle(error);
      
      expect(result.type).toBe('TIMEOUT_ERROR');
    });
  });
});

describe('ErrorRecovery', () => {
  let errorRecovery;
  
  beforeEach(() => {
    errorRecovery = new ErrorRecovery();
    // Use real timers - no fake timers
  });
  
  describe('initialization', () => {
    test('should initialize with default retry settings', () => {
      expect(errorRecovery.maxRetries).toBe(3);
      expect(errorRecovery.retryDelays).toHaveLength(3);
      expect(errorRecovery.currentRetry).toBe(0);
    });
  });
  
  describe('executeWithRetry', () => {
    test('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await errorRecovery.executeWithRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
    
    test('should retry on retryable errors', async () => {
      // Use short delays for testing
      errorRecovery.retryDelays = [1, 1, 1];
      let attempts = 0;
      const operation = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          const error = new Error('Temporary error');
          error.canRetry = true;
          throw error;
        }
        return 'success';
      });
      
      const result = await errorRecovery.executeWithRetry(operation, {
        maxRetries: 3,
        shouldRetry: () => true,
      });
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
    
    test('should not retry on non-retryable errors', async () => {
      const operation = jest.fn().mockImplementation(async () => {
        const error = new Error('Fatal');
        error.canRetry = false;
        throw error;
      });
      
      await expect(
        errorRecovery.executeWithRetry(operation, {
          maxRetries: 3,
          shouldRetry: () => false,
        })
      ).rejects.toThrow('Fatal');
      
      expect(operation).toHaveBeenCalledTimes(1);
    });
    
    test('should call onRetry callback', async () => {
      // Use short delays
      errorRecovery.retryDelays = [1, 1];
      let attempts = 0;
      const operation = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary');
        }
        return 'success';
      });
      
      const onRetry = jest.fn();
      await errorRecovery.executeWithRetry(operation, {
        maxRetries: 2,
        shouldRetry: () => true,
        onRetry,
      });
      
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });
    
    test('should throw after max retries', async () => {
      // Use real timers for simplicity but with short delays
      errorRecovery.retryDelays = [1, 1, 1];
      const operation = jest.fn().mockRejectedValue(new Error('Persistent error'));
      
      await expect(
        errorRecovery.executeWithRetry(operation, {
          maxRetries: 2,
          shouldRetry: () => true,
        })
      ).rejects.toThrow('Persistent error');
      
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
    
    test('should use exponential backoff', async () => {
      // Use short delays for testing
      errorRecovery.retryDelays = [10, 20, 30];
      let attempts = 0;
      const operation = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 4) {
          throw new Error('Retry');
        }
        return 'success';
      });
      
      const delaySpy = jest.spyOn(errorRecovery, 'delay');
      
      await errorRecovery.executeWithRetry(operation, {
        maxRetries: 3,
        shouldRetry: () => true,
      });
      
      // Check delays were called with increasing values
      expect(delaySpy).toHaveBeenCalledWith(10); // First retry
      expect(delaySpy).toHaveBeenCalledWith(20); // Second retry
      expect(delaySpy).toHaveBeenCalledWith(30); // Third retry
    });
  });
  
  describe('defaultShouldRetry', () => {
    test('should retry on network errors', () => {
      const error = new TypeError('Failed to fetch');
      
      const shouldRetry = errorRecovery.defaultShouldRetry(error);
      
      expect(shouldRetry).toBe(true);
    });
    
    test('should retry on rate limit errors', () => {
      const error = new MockOpenAI.APIError('Rate limit', 429);
      
      const shouldRetry = errorRecovery.defaultShouldRetry(error);
      
      expect(shouldRetry).toBe(true);
    });
    
    test('should not retry on auth errors', () => {
      const error = new MockOpenAI.APIError('Unauthorized', 401);
      
      const shouldRetry = errorRecovery.defaultShouldRetry(error);
      
      expect(shouldRetry).toBe(false);
    });
  });
  
  describe('reset', () => {
    test('should reset retry counter', () => {
      errorRecovery.currentRetry = 3;
      
      errorRecovery.reset();
      
      expect(errorRecovery.currentRetry).toBe(0);
    });
  });
  
  describe('delay', () => {
    test('should delay execution', async () => {
      const start = Date.now();
      await errorRecovery.delay(50);
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(40); // Allow some variance
    });
  });
});

describe('Error Recovery Integration', () => {
  test('should recover from temporary errors', async () => {
    const errorRecovery = new ErrorRecovery();
    errorRecovery.retryDelays = [1, 1, 1]; // Use short delays
    let attempts = 0;
    
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        const error = new TypeError('Failed to fetch');
        throw error;
      }
      return 'recovered';
    };
    
    const result = await errorRecovery.executeWithRetry(operation, {
      maxRetries: 3,
    });
    
    expect(result).toBe('recovered');
    expect(attempts).toBe(3);
  });
  
  test('should fail fast on non-retryable errors', async () => {
    const errorRecovery = new ErrorRecovery();
    
    const operation = async () => {
      throw new MockOpenAI.APIError('Unauthorized', 401);
    };
    
    await expect(
      errorRecovery.executeWithRetry(operation, {
        maxRetries: 3,
      })
    ).rejects.toThrow();
  });
});
