/**
 * Utility helper functions for the application
 */

/**
 * Sleep for a specified duration
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise} Promise that resolves after the duration
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Note: This is a basic sanitization for text content.
 * For comprehensive XSS protection with rich HTML content,
 * consider using a dedicated library like DOMPurify.
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Debounce a function to limit its execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function to ensure it executes at most once per interval
 * Unlike debounce, throttle guarantees execution at regular intervals
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between executions in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function executedFunction(...args) {
    const context = this;
    
    if (!inThrottle) {
      // First call or after cooldown - execute immediately
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
      
      // Reset throttle flag after limit period
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      // During throttle period - schedule for later
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}
