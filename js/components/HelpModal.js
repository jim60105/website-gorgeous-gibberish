/**
 * Help modal controller
 * 幫助 Modal 控制器
 */

export class HelpModal {
  constructor() {
    this.helpButton = null;
    this.helpModal = null;
    this.closeButton = null;
    
    this.init();
  }
  
  /**
   * Initialize the help modal
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  /**
   * Setup event listeners
   */
  setup() {
    this.helpButton = document.querySelector('#help-button');
    this.helpModal = document.querySelector('#help-modal');
    this.closeButton = document.querySelector('#close-help');
    
    if (!this.helpButton || !this.helpModal) {
      console.warn('Help modal elements not found');
      return;
    }
    
    this.helpButton.addEventListener('click', () => this.show());
    this.closeButton?.addEventListener('click', () => this.hide());
    
    // Close on backdrop click
    this.helpModal.addEventListener('click', (e) => {
      if (e.target === this.helpModal) {
        this.hide();
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.helpModal.classList.contains('hidden')) {
        this.hide();
      }
    });
  }
  
  /**
   * Show the help modal
   */
  show() {
    if (this.helpModal) {
      this.helpModal.classList.remove('hidden');
    }
  }
  
  /**
   * Hide the help modal
   */
  hide() {
    if (this.helpModal) {
      this.helpModal.classList.add('hidden');
    }
  }
}

// Export singleton instance
export const helpModal = new HelpModal();
