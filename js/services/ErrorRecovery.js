/**
 * Error recovery manager
 * 錯誤恢復管理器
 */

import { APIErrorHandler } from './APIErrorHandler.js';

export class ErrorRecovery {
  constructor() {
    this.maxRetries = 3;
    this.retryDelays = [1000, 3000, 5000]; // Exponential backoff
    this.currentRetry = 0;
  }
  
  /**
   * Execute with retry logic
   * @param {Function} operation - Async operation to execute
   * @param {Object} options - Retry options
   * @returns {Promise<any>}
   */
  async executeWithRetry(operation, options = {}) {
    const {
      maxRetries = this.maxRetries,
      shouldRetry = this.defaultShouldRetry,
      onRetry = null,
    } = options;
    
    this.currentRetry = 0;
    
    while (this.currentRetry <= maxRetries) {
      try {
        return await operation();
      } catch (error) {
        // Check if should retry
        if (!shouldRetry(error) || this.currentRetry >= maxRetries) {
          throw error;
        }
        
        // Notify retry attempt
        if (onRetry) {
          onRetry(this.currentRetry + 1, error);
        }
        
        // Wait before retry
        const delay = this.retryDelays[this.currentRetry] || 5000;
        await this.delay(delay);
        
        this.currentRetry++;
      }
    }
  }
  
  /**
   * Default retry condition
   * @param {Error} error
   * @returns {boolean}
   */
  defaultShouldRetry(error) {
    // Retry on network errors or 5xx server errors
    const errorInfo = APIErrorHandler.handle(error);
    return errorInfo.canRetry;
  }
  
  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Reset retry counter
   */
  reset() {
    this.currentRetry = 0;
  }
}

// Export singleton instance
export const errorRecovery = new ErrorRecovery();
