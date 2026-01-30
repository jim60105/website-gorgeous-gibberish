/**
 * Loading experience optimizer
 * 載入體驗優化器
 */

export class LoadingExperience {
  /**
   * Show skeleton while loading
   * @param {HTMLElement} container
   * @returns {Function} Cleanup function
   */
  showSkeleton(container) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-container';
    skeleton.innerHTML = `
      <div class="space-y-3">
        <div class="skeleton h-6 w-3/4"></div>
        <div class="skeleton h-6 w-full"></div>
        <div class="skeleton h-6 w-5/6"></div>
      </div>
    `;
    
    container.appendChild(skeleton);
    
    // Return cleanup function
    return () => skeleton.remove();
  }
  
  /**
   * Show optimistic UI update
   * @param {string} message - User message
   */
  showOptimisticUpdate(message) {
    const topicDisplay = document.querySelector('#topic-display');
    if (topicDisplay) {
      topicDisplay.textContent = message;
    }
  }
  
  /**
   * Perceived performance: start animation immediately
   * even before actual data arrives
   */
  startEarlyAnimation() {
    const response = document.querySelector('#ai-response');
    if (response) {
      // Add slight delay before showing loading indicator
      // to avoid flash for fast responses
      return setTimeout(() => {
        if (!response.textContent) {
          response.innerHTML = `<span class="text-text-muted animate-pulse">靈光沸騰</span>`;
        }
      }, 200);
    }
  }
}

// Export singleton instance
export const loadingExperience = new LoadingExperience();
