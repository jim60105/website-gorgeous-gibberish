/**
 * Error logger
 * 錯誤日誌記錄器
 */

export class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 50;
    this.isDebugMode = this.checkDebugMode();
  }
  
  /**
   * Check if debug mode is enabled
   */
  checkDebugMode() {
    return (
      localStorage.getItem('debug') === 'true' ||
      new URLSearchParams(window.location.search).has('debug')
    );
  }
  
  /**
   * Log an error
   * @param {Error} error - The error object
   * @param {Object} context - Additional context
   */
  log(error, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
      },
    };
    
    // Add to local logs
    this.logs.push(entry);
    
    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Console output in debug mode
    if (this.isDebugMode) {
      console.group('Error Logged');
      console.error(error);
      console.table(context);
      console.groupEnd();
    }
    
    // Persist to localStorage for debugging
    this.persistLogs();
  }
  
  /**
   * Save logs to localStorage
   */
  persistLogs() {
    try {
      localStorage.setItem('error_logs', JSON.stringify(this.logs));
    } catch (e) {
      // localStorage full, clear old logs
      this.logs = this.logs.slice(-10);
      localStorage.setItem('error_logs', JSON.stringify(this.logs));
    }
  }
  
  /**
   * Get all logs
   * @returns {Array}
   */
  getLogs() {
    return this.logs;
  }
  
  /**
   * Export logs as JSON
   * @returns {string}
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
  
  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('error_logs');
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();
