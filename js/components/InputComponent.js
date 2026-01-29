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
    // Initial state input
    this.inputElement = document.querySelector(SELECTORS.INPUT);
    this.sendButton = document.querySelector(SELECTORS.SEND_BUTTON);
    this.charCountElement = document.querySelector(SELECTORS.CHAR_COUNT);
    
    // Chat state input
    this.inputElementChat = document.querySelector('#user-input-chat');
    this.sendButtonChat = document.querySelector('#send-button-chat');
    this.charCountElementChat = document.querySelector('#char-count-chat');
    
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
    // Initial state input events
    this.inputElement.addEventListener('input', () => this.handleInput());
    this.sendButton.addEventListener('click', () => this.handleSubmit());
    this.inputElement.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Chat state input events
    if (this.inputElementChat && this.sendButtonChat) {
      this.inputElementChat.addEventListener('input', () => this.handleInputChat());
      this.sendButtonChat.addEventListener('click', () => this.handleSubmitChat());
      this.inputElementChat.addEventListener('keydown', (e) => this.handleKeydownChat(e));
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
   * Handle chat input changes
   */
  handleInputChat() {
    this.updateCharCountChat();
    this.enforceMaxLengthChat();
    
    // Clear error styling when user starts typing
    this.inputElementChat.classList.remove('border-red-400');
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
   * Enforce maximum input length for chat input
   */
  enforceMaxLengthChat() {
    const currentValue = this.inputElementChat.value;
    
    if (currentValue.length > this.maxLength) {
      this.inputElementChat.value = currentValue.slice(0, this.maxLength);
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
   * Update the character count display for chat input
   */
  updateCharCountChat() {
    if (!this.inputElementChat || !this.charCountElementChat) return;
    
    const currentLength = this.inputElementChat.value.length;
    
    // Update display text
    this.charCountElementChat.textContent = `${currentLength}/${this.maxLength}`;
    
    // Remove all color classes first
    this.charCountElementChat.classList.remove(
      'text-text-muted',
      'text-yellow-400',
      'text-red-400'
    );
    
    // Apply color based on character count
    const usageRatio = currentLength / this.maxLength;
    
    if (usageRatio >= 1) {
      // At limit - red
      this.charCountElementChat.classList.add('text-red-400');
    } else if (usageRatio >= 0.8) {
      // Near limit (80%+) - yellow warning
      this.charCountElementChat.classList.add('text-yellow-400');
    } else {
      // Normal - muted
      this.charCountElementChat.classList.add('text-text-muted');
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
   * Handle keydown events for chat input
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeydownChat(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSubmitChat();
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
    this.setLoadingState(true, false);
    
    try {
      // Send message through chat manager
      await this.chatManager.sendMessage(inputValue);
      
      // Clear input on success and sync to chat input
      this.inputElement.value = '';
      this.updateCharCount();
      this.hideError();
      
      // Sync the chat input value
      if (this.inputElementChat) {
        this.inputElementChat.value = '';
        this.updateCharCountChat();
      }
      
    } catch (error) {
      this.showError(error.message || '發送失敗，請重試');
    } finally {
      this.isSubmitting = false;
      this.setLoadingState(false, false);
    }
  }
  
  /**
   * Handle form submission for chat input
   */
  async handleSubmitChat() {
    // Prevent double submission
    if (this.isSubmitting) return;
    
    const inputValue = this.inputElementChat.value.trim();
    
    // Validate input
    const validation = this.validateInput(inputValue);
    if (!validation.isValid) {
      this.showErrorChat(validation.message);
      return;
    }
    
    // Set submitting state
    this.isSubmitting = true;
    this.setLoadingState(true, true);
    
    try {
      // Send message through chat manager
      await this.chatManager.sendMessage(inputValue);
      
      // Clear input on success
      this.inputElementChat.value = '';
      this.updateCharCountChat();
      this.hideErrorChat();
      
    } catch (error) {
      this.showErrorChat(error.message || '發送失敗，請重試');
    } finally {
      this.isSubmitting = false;
      this.setLoadingState(false, true);
    }
  }
  
  /**
   * Set loading state on send button
   * @param {boolean} isLoading - Loading state
   * @param {boolean} isChatInput - Whether this is for chat input
   */
  setLoadingState(isLoading, isChatInput = false) {
    const button = isChatInput ? this.sendButtonChat : this.sendButton;
    
    if (!button) return;
    
    if (isLoading) {
      button.disabled = true;
      button.innerHTML = '<span class="animate-pulse">...</span>';
    } else {
      button.disabled = false;
      button.innerHTML = '→';
    }
  }
  
  /**
   * Show error message for chat input
   * @param {string} message - Error message to display
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
    if (this.inputElementChat) {
      this.inputElementChat.classList.add('border-red-400');
    }
  }
  
  /**
   * Hide error message for chat input
   */
  hideErrorChat() {
    const errorElement = document.querySelector('#input-error-chat');
    if (!errorElement) return;
    
    errorElement.classList.remove('opacity-100');
    errorElement.classList.add('opacity-0');
    
    if (this.inputElementChat) {
      this.inputElementChat.classList.remove('border-red-400');
    }
  }
}
