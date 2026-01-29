/**
 * InputComponent - Handles user input functionality
 * Manages input validation, character counting, and submission
 */

import { MAX_INPUT_LENGTH, SELECTORS } from '../utils/constants.js';
import { getRandomPhrase } from '../config/phrases.js';

export class InputComponent {
  constructor(chatManager) {
    this.chatManager = chatManager;
    this.maxLength = MAX_INPUT_LENGTH;
    this.isSubmitting = false;
    
    // DOM elements
    this.inputElement = null;
    this.sendButton = null;
    this.charCountElement = null;
    
    this.init();
  }
  
  /**
   * Initialize the component
   */
  init() {
    // Initial state elements
    this.inputElement = document.querySelector(SELECTORS.INPUT);
    this.sendButton = document.querySelector(SELECTORS.SEND_BUTTON);
    this.charCountElement = document.querySelector(SELECTORS.CHAR_COUNT);
    
    // Chat state elements
    this.inputChatElement = document.querySelector('#user-input-chat');
    this.sendChatButton = document.querySelector('#send-button-chat');
    this.charCountChatElement = document.querySelector('#char-count-chat');
    
    if (!this.inputElement || !this.sendButton || !this.charCountElement) {
      console.error('InputComponent: Required DOM elements not found');
      return;
    }
    
    this.setupEventListeners();
    this.prefillRandomPhrase();
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Initial state input listeners
    this.inputElement.addEventListener('input', () => this.handleInput());
    this.sendButton.addEventListener('click', () => this.handleSubmit());
    this.inputElement.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Chat state input listeners (if elements exist)
    if (this.inputChatElement) {
      this.inputChatElement.addEventListener('input', () => this.handleInputChat());
      this.inputChatElement.addEventListener('keydown', (e) => this.handleKeydownChat(e));
    }
    
    if (this.sendChatButton) {
      this.sendChatButton.addEventListener('click', () => this.handleSubmitChat());
    }
  }
  
  /**
   * Handle input changes
   */
  handleInput() {
    this.updateCharCount();
    this.enforceMaxLength();
    
    // Clear error styling when user starts typing
    this.inputElement.classList.remove('border-red-400');
  }
  
  /**
   * Enforce maximum input length
   * Truncates input if it exceeds the limit
   */
  enforceMaxLength() {
    const currentValue = this.inputElement.value;
    
    if (currentValue.length > this.maxLength) {
      this.inputElement.value = currentValue.slice(0, this.maxLength);
    }
  }
  
  /**
   * Validate input before submission
   * @param {string} text - The input text to validate
   * @returns {Object} - Validation result with isValid and message
   */
  validateInput(text) {
    // Check for empty input
    if (!text || text.trim().length === 0) {
      return {
        isValid: false,
        message: '請輸入內容'
      };
    }
    
    // Check for exceeding max length
    if (text.length > this.maxLength) {
      return {
        isValid: false,
        message: `輸入不得超過 ${this.maxLength} 字`
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  }
  
  /**
   * Update the character count display
   * Changes color based on remaining characters
   */
  updateCharCount() {
    const currentLength = this.inputElement.value.length;
    
    // Update display text
    this.charCountElement.textContent = `${currentLength}/${this.maxLength}`;
    
    // Remove all color classes first
    this.charCountElement.classList.remove(
      'text-text-muted',
      'text-yellow-400',
      'text-red-400'
    );
    
    // Apply color based on character count
    const usageRatio = currentLength / this.maxLength;
    
    if (usageRatio >= 1) {
      // At limit - red
      this.charCountElement.classList.add('text-red-400');
    } else if (usageRatio >= 0.8) {
      // Near limit (80%+) - yellow warning
      this.charCountElement.classList.add('text-yellow-400');
    } else {
      // Normal - muted
      this.charCountElement.classList.add('text-text-muted');
    }
  }
  
  /**
   * Prefill input with a random phrase
   */
  prefillRandomPhrase() {
    const phrase = getRandomPhrase();
    this.inputElement.value = phrase;
    this.updateCharCount();
  }
  
  /**
   * Get a new random phrase and update input
   * Can be called to refresh the placeholder
   */
  refreshRandomPhrase() {
    const phrase = getRandomPhrase();
    this.inputElement.placeholder = phrase;
    
    // Only update value if input is empty
    if (!this.inputElement.value.trim()) {
      this.inputElement.value = phrase;
      this.updateCharCount();
    }
  }
  
  /**
   * Show error message to user
   * @param {string} message - Error message to display
   */
  showError(message) {
    const errorElement = document.querySelector(SELECTORS.INPUT_ERROR);
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.remove('opacity-0');
    errorElement.classList.add('opacity-100');
    
    // Auto-hide error after 3 seconds
    setTimeout(() => this.hideError(), 3000);
    
    // Add visual feedback to input
    this.inputElement.classList.add('border-red-400');
  }
  
  /**
   * Hide error message
   */
  hideError() {
    const errorElement = document.querySelector(SELECTORS.INPUT_ERROR);
    if (!errorElement) return;
    
    errorElement.classList.remove('opacity-100');
    errorElement.classList.add('opacity-0');
    
    this.inputElement.classList.remove('border-red-400');
  }
  
  /**
   * Handle keydown events
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSubmit();
    }
  }
  
  /**
   * Handle form submission
   */
  async handleSubmit() {
    // Prevent double submission
    if (this.isSubmitting) return;
    
    const inputValue = this.inputElement.value.trim();
    
    // Validate input
    const validation = this.validateInput(inputValue);
    if (!validation.isValid) {
      this.showError(validation.message);
      return;
    }
    
    // Set submitting state
    this.isSubmitting = true;
    this.setLoadingState(true);
    
    try {
      // Send message through chat manager
      await this.chatManager.sendMessage(inputValue);
      
      // Clear input on success
      this.inputElement.value = '';
      this.updateCharCount();
      this.hideError();
      
    } catch (error) {
      this.showError(error.message || '發送失敗，請重試');
    } finally {
      this.isSubmitting = false;
      this.setLoadingState(false);
    }
  }
  
  /**
   * Set loading state on send button
   * @param {boolean} isLoading - Loading state
   */
  setLoadingState(isLoading) {
    if (isLoading) {
      this.sendButton.disabled = true;
      this.sendButton.innerHTML = '<span class="animate-pulse">...</span>';
    } else {
      this.sendButton.disabled = false;
      this.sendButton.innerHTML = '→';
    }
  }
  
  /**
   * Handle input changes (chat state)
   */
  handleInputChat() {
    this.updateCharCountChat();
    this.enforceMaxLengthChat();
    
    // Clear error styling when user starts typing
    if (this.inputChatElement) {
      this.inputChatElement.classList.remove('border-red-400');
    }
  }
  
  /**
   * Enforce maximum input length (chat state)
   */
  enforceMaxLengthChat() {
    if (!this.inputChatElement) return;
    
    const currentValue = this.inputChatElement.value;
    
    if (currentValue.length > this.maxLength) {
      this.inputChatElement.value = currentValue.slice(0, this.maxLength);
    }
  }
  
  /**
   * Update the character count display (chat state)
   */
  updateCharCountChat() {
    if (!this.inputChatElement || !this.charCountChatElement) return;
    
    const currentLength = this.inputChatElement.value.length;
    
    // Update display text
    this.charCountChatElement.textContent = `${currentLength}/${this.maxLength}`;
    
    // Remove all color classes first
    this.charCountChatElement.classList.remove(
      'text-text-muted',
      'text-yellow-400',
      'text-red-400'
    );
    
    // Apply color based on character count
    const usageRatio = currentLength / this.maxLength;
    
    if (usageRatio >= 1) {
      this.charCountChatElement.classList.add('text-red-400');
    } else if (usageRatio >= 0.8) {
      this.charCountChatElement.classList.add('text-yellow-400');
    } else {
      this.charCountChatElement.classList.add('text-text-muted');
    }
  }
  
  /**
   * Handle keydown events (chat state)
   */
  handleKeydownChat(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSubmitChat();
    }
  }
  
  /**
   * Handle form submission (chat state)
   */
  async handleSubmitChat() {
    if (!this.inputChatElement) return;
    
    // Prevent double submission
    if (this.isSubmitting) return;
    
    const inputValue = this.inputChatElement.value.trim();
    
    // Validate input
    const validation = this.validateInput(inputValue);
    if (!validation.isValid) {
      this.showErrorChat(validation.message);
      return;
    }
    
    // Set submitting state
    this.isSubmitting = true;
    this.setLoadingStateChat(true);
    
    try {
      // Send message through chat manager
      await this.chatManager.sendMessage(inputValue);
      
      // Clear input on success
      this.inputChatElement.value = '';
      this.updateCharCountChat();
      this.hideErrorChat();
      
    } catch (error) {
      this.showErrorChat(error.message || '發送失敗，請重試');
    } finally {
      this.isSubmitting = false;
      this.setLoadingStateChat(false);
    }
  }
  
  /**
   * Show error message to user (chat state)
   */
  showErrorChat(message) {
    const errorElement = document.querySelector('#input-error-chat');
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.remove('opacity-0');
    errorElement.classList.add('opacity-100');
    
    // Auto-hide error after 3 seconds
    setTimeout(() => this.hideErrorChat(), 3000);
    
    // Add visual feedback to input
    if (this.inputChatElement) {
      this.inputChatElement.classList.add('border-red-400');
    }
  }
  
  /**
   * Hide error message (chat state)
   */
  hideErrorChat() {
    const errorElement = document.querySelector('#input-error-chat');
    if (!errorElement) return;
    
    errorElement.classList.remove('opacity-100');
    errorElement.classList.add('opacity-0');
    
    if (this.inputChatElement) {
      this.inputChatElement.classList.remove('border-red-400');
    }
  }
  
  /**
   * Set loading state on send button (chat state)
   */
  setLoadingStateChat(isLoading) {
    if (!this.sendChatButton) return;
    
    if (isLoading) {
      this.sendChatButton.disabled = true;
      this.sendChatButton.innerHTML = '<span class="animate-pulse">...</span>';
    } else {
      this.sendChatButton.disabled = false;
      this.sendChatButton.innerHTML = '→';
    }
  }
}
