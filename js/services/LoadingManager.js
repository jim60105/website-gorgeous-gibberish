/**
 * Loading state manager
 * 載入狀態管理器
 */

export class LoadingManager {
  constructor() {
    this.states = new Map();
  }
  
  /**
   * Start loading for a specific key
   * @param {string} key - Loading state identifier
   */
  start(key) {
    this.states.set(key, {
      isLoading: true,
      startTime: Date.now(),
    });
    
    this.updateUI(key, true);
  }
  
  /**
   * Stop loading for a specific key
   * @param {string} key
   */
  stop(key) {
    const state = this.states.get(key);
    if (state) {
      state.isLoading = false;
      state.duration = Date.now() - state.startTime;
    }
    
    this.updateUI(key, false);
  }
  
  /**
   * Check if loading
   * @param {string} key
   * @returns {boolean}
   */
  isLoading(key) {
    return this.states.get(key)?.isLoading || false;
  }
  
  /**
   * Update UI based on loading state
   * @param {string} key
   * @param {boolean} isLoading
   */
  updateUI(key, isLoading) {
    switch (key) {
      case 'send-message':
        this.updateSendButton(isLoading);
        this.updateInputField(isLoading);
        break;
      case 'stream-response':
        this.updateResponseArea(isLoading);
        break;
    }
  }
  
  /**
   * Update send button state
   */
  updateSendButton(isLoading) {
    const buttons = [
      document.querySelector('#send-button'),
      document.querySelector('#send-button-chat')
    ];
    
    buttons.forEach(button => {
      if (!button) return;
      
      if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading-spinner w-5 h-5"></span>';
      } else {
        button.disabled = false;
        button.innerHTML = '→';
      }
    });
  }
  
  /**
   * Update input field state
   */
  updateInputField(isLoading) {
    const inputs = [
      document.querySelector('#user-input'),
      document.querySelector('#user-input-chat')
    ];
    
    inputs.forEach(input => {
      if (!input) return;
      
      input.disabled = isLoading;
      input.classList.toggle('opacity-50', isLoading);
    });
  }
  
  /**
   * Update response area state
   */
  updateResponseArea(isLoading) {
    const response = document.querySelector('#ai-response');
    if (!response) return;
    
    if (isLoading) {
      response.innerHTML = `
        <span class="text-text-muted flex items-center gap-2">
          <span class="loading-dots">
            <span></span><span></span><span></span>
          </span>
          思考中...
        </span>
      `;
    }
  }
}

// Export singleton instance
export const loadingManager = new LoadingManager();
