/**
 * Network status monitor
 * 網路狀態監測器
 */

export class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    
    this.setupEventListeners();
  }
  
  /**
   * Setup online/offline event listeners
   */
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      this.showNotification('網路連線已恢復', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
      this.showNotification('網路連線已中斷', 'error');
    });
  }
  
  /**
   * Check if currently online
   * @returns {boolean}
   */
  checkOnline() {
    return this.isOnline;
  }
  
  /**
   * Add status change listener
   * @param {Function} callback
   */
  onStatusChange(callback) {
    this.listeners.push(callback);
  }
  
  /**
   * Notify all listeners
   * @param {string} status
   */
  notifyListeners(status) {
    this.listeners.forEach(cb => cb(status));
  }
  
  /**
   * Show network status notification
   * @param {string} message
   * @param {string} type - 'success' | 'error'
   */
  showNotification(message, type) {
    const toast = document.querySelector('#network-toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `network-toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();
