/**
 * Limit warning system
 * 限制警告系統
 */

import { toast } from './ToastNotification.js';

export class LimitWarning {
  /**
   * Check and warn for conversation limit
   * @param {number} current - Current message count
   * @param {number} max - Maximum messages
   */
  checkConversationLimit(current, max) {
    const remaining = max - current;
    
    if (remaining === 1) {
      toast.warning('這是最後一次對話機會');
    } else if (remaining === 0) {
      toast.info('已達對話上限，請點擊「重新開始」');
    }
  }
  
  /**
   * Check and warn for input limit
   * @param {number} current - Current character count
   * @param {number} max - Maximum characters
   */
  checkInputLimit(current, max) {
    if (current >= max) {
      // Visual feedback only, no toast needed
      // The character counter already shows red
    }
  }
  
  /**
   * Show limit reached modal
   * @param {string} type - 'conversation' | 'input'
   */
  showLimitModal(type) {
    const messages = {
      conversation: {
        title: '已達對話上限',
        description: '每次對話最多可進行 5 回合',
        action: '重新開始',
        actionCallback: () => window.chatManager?.resetConversation(),
      },
    };
    
    const config = messages[type];
    if (!config) return;
    
    // Show modal
    const modal = document.querySelector('#limit-modal');
    if (modal) {
      modal.querySelector('.modal-title').textContent = config.title;
      modal.querySelector('.modal-description').textContent = config.description;
      modal.querySelector('.modal-action').textContent = config.action;
      modal.querySelector('.modal-action').onclick = config.actionCallback;
      modal.classList.remove('hidden');
    }
  }
}

// Export singleton instance
export const limitWarning = new LimitWarning();
