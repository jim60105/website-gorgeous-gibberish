/**
 * Toast notification system
 * Toast 通知系統
 */

export class ToastNotification {
  constructor() {
    this.container = this.createContainer();
    this.queue = [];
    this.isShowing = false;
  }
  
  /**
   * Create toast container
   */
  createContainer() {
    let container = document.querySelector('#toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(container);
    }
    return container;
  }
  
  /**
   * Show a toast notification
   * @param {string} message
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Display duration in ms
   */
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;
    
    // Add to container
    this.container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });
    
    // Auto dismiss
    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  }
  
  /**
   * Dismiss a toast
   */
  dismiss(toast) {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hiding');
    
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
  
  /**
   * Convenience methods
   */
  success(message) { this.show(message, 'success'); }
  error(message) { this.show(message, 'error', 5000); }
  warning(message) { this.show(message, 'warning'); }
  info(message) { this.show(message, 'info'); }
}

// Export singleton instance
export const toast = new ToastNotification();
