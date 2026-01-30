/**
 * Tests for utility helper functions
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { debounce, throttle, sleep, sanitizeHTML, truncateText } from '../../js/utils/helpers.js';

describe('Utility Helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('should delay function execution until after wait time', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      jest.advanceTimersByTime(500);
      debouncedFn(); // Reset timer
      jest.advanceTimersByTime(500);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should execute function immediately on first call', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 1000);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should prevent execution within throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 1000);

      throttledFn(); // First call - executes immediately
      expect(mockFn).toHaveBeenCalledTimes(1);

      throttledFn(); // Second call - should be throttled
      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should execute again after throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 1000);

      throttledFn(); // First call
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);
      throttledFn(); // Second call after cooldown
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should execute scheduled call after throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 1000);

      throttledFn(); // First call - executes immediately
      expect(mockFn).toHaveBeenCalledTimes(1);

      throttledFn(); // Second call - scheduled for later
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple calls during throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 1000);

      throttledFn(); // First call
      throttledFn(); // During throttle
      throttledFn(); // During throttle
      throttledFn(); // During throttle
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);
      // Should execute once more (the last scheduled call)
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('sleep', () => {
    it('should resolve after specified duration', async () => {
      const promise = sleep(1000);
      jest.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('sanitizeHTML', () => {
    it('should escape HTML tags', () => {
      const result = sanitizeHTML('<script>alert("xss")</script>');
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should handle plain text', () => {
      const result = sanitizeHTML('Hello World');
      expect(result).toBe('Hello World');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const result = truncateText('Hello World', 5);
      expect(result).toBe('Hello...');
    });

    it('should not truncate text shorter than maxLength', () => {
      const result = truncateText('Hello', 10);
      expect(result).toBe('Hello');
    });

    it('should handle exact length', () => {
      const result = truncateText('Hello', 5);
      expect(result).toBe('Hello');
    });
  });
});
