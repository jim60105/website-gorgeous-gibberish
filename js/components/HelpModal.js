/**
 * Help modal controller
 * 幫助 Modal 控制器
 */

export class HelpModal {
  constructor() {
    this.helpButton = null;
    this.helpModal = null;
    this.closeButton = null;
    this.toggleButton = null;
    this.isFancyStyle = true; // Default to fancy style
    
    // Text versions
    this.textVersions = {
      fancy: {
        title: '奧義玄樞',
        section1Title: '循徑窺奧',
        section1Content: '鍍念二十字內，擊 Enter 或觸「擲語入虛」，靈思幻核即綻放絢燦迴響。',
        section2Title: '五語星閾',
        section2Content: '五番星霜語後，輪迴閾至；觸「焚卷重衍」即投新生。',
        closeText: '印可',
        toggleText: '惘然'
      },
      plain: {
        title: '使用說明',
        section1Title: '如何使用',
        section1Content: '輸入您的想法（最多 20 字），按 Enter 或點擊傳送按鈕，AI 會為您生成絢爛的回應。',
        section2Title: '對話限制',
        section2Content: '每次對話最多可進行 5 個回合。達到上限後可以點擊「重新開始」開始新對話。',
        closeText: '了解了',
        toggleText: '絢爛'
      }
    };
    
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
    this.toggleButton = document.querySelector('#toggle-help-style');
    
    if (!this.helpButton || !this.helpModal) {
      console.warn('Help modal elements not found');
      return;
    }
    
    this.helpButton.addEventListener('click', () => this.show());
    this.closeButton?.addEventListener('click', () => this.hide());
    this.toggleButton?.addEventListener('click', () => this.toggleStyle());
    
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
  
  /**
   * Toggle between fancy and plain text styles
   */
  toggleStyle() {
    this.isFancyStyle = !this.isFancyStyle;
    this.updateText();
  }
  
  /**
   * Update modal text based on current style
   */
  updateText() {
    const version = this.isFancyStyle ? this.textVersions.fancy : this.textVersions.plain;
    
    const titleEl = document.querySelector('#help-modal-title');
    const section1TitleEl = document.querySelector('#help-section1-title');
    const section1ContentEl = document.querySelector('#help-section1-content');
    const section2TitleEl = document.querySelector('#help-section2-title');
    const section2ContentEl = document.querySelector('#help-section2-content');
    const closeTextEl = document.querySelector('#help-close-text');
    const toggleButtonEl = document.querySelector('#toggle-help-style');
    
    if (titleEl) titleEl.textContent = version.title;
    if (section1TitleEl) section1TitleEl.textContent = version.section1Title;
    if (section1ContentEl) section1ContentEl.textContent = version.section1Content;
    if (section2TitleEl) section2TitleEl.textContent = version.section2Title;
    if (section2ContentEl) section2ContentEl.textContent = version.section2Content;
    if (closeTextEl) closeTextEl.textContent = version.closeText;
    if (toggleButtonEl) toggleButtonEl.textContent = version.toggleText;
  }
}

// Export singleton instance
export const helpModal = new HelpModal();
