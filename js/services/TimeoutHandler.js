/**
 * Timeout handler for async operations
 * 超時處理器
 */

export class TimeoutHandler {
  /**
   * Execute with timeout
   * @param {Promise} promise - The promise to execute
   * @param {number} timeout - Timeout in milliseconds
   * @param {string} errorMessage - Custom error message
   * @returns {Promise<any>}
   */
  static async withTimeout(promise, timeout, errorMessage = '操作超時') {
    let timeoutId;
    
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(errorMessage));
      }, timeout);
    });
    
    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  /**
   * Progressive timeout indicator
   * Shows warning before actual timeout
   * @param {number} timeout - Total timeout
   * @param {number} warningAt - Show warning at this percentage
   * @param {Function} onWarning - Warning callback
   * @returns {Function} Cancel function
   */
  static progressiveTimeout(timeout, warningAt = 0.7, onWarning) {
    const warningTime = timeout * warningAt;
    
    const warningTimeoutId = setTimeout(() => {
      onWarning?.('回應時間較長，請稍候...');
    }, warningTime);
    
    const errorTimeoutId = setTimeout(() => {
      // Will be handled by withTimeout
    }, timeout);
    
    // Return cancel function
    return () => {
      clearTimeout(warningTimeoutId);
      clearTimeout(errorTimeoutId);
    };
  }
}

// API timeout constant
export const API_TIMEOUT = 30000; // 30 seconds
