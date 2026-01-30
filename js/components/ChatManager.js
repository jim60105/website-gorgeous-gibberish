/**
 * ChatManager - Manages conversation state and AI interactions
 */

import { MAX_CONVERSATION_COUNT, SELECTORS } from '../utils/constants.js';
import { OpenAIService } from '../services/OpenAIService.js';
import { toast } from './ToastNotification.js';
import { limitWarning } from './LimitWarning.js';
import { loadingManager } from '../services/LoadingManager.js';
import { loadingExperience } from '../services/LoadingExperience.js';
import { errorRecovery } from '../services/ErrorRecovery.js';
import { errorLogger } from '../services/ErrorLogger.js';
import { networkMonitor } from '../services/NetworkMonitor.js';
import { TimeoutHandler, API_TIMEOUT } from '../services/TimeoutHandler.js';
import { debounce } from '../utils/helpers.js';

export class ChatManager {
  constructor(animationController) {
    this.animationController = animationController;
    this.maxMessages = MAX_CONVERSATION_COUNT;
    
    // Conversation state
    this.messageCount = 0;
    this.currentTopic = '';
    this.conversationHistory = [];
    this.isStreaming = false;
    
    // DOM elements
    this.conversationDotsElement = null;
    this.aiResponseElement = null;
    this.topicDisplayElement = null;
    
    // Services
    this.openAIService = null;
    
    // Component references
    this.inputComponent = null;
    
    // Retry configuration
    this.maxRetries = 2;
    
    // Create debounced scroll function (max once per second)
    this.debouncedScrollToBottom = debounce(() => this.scrollToBottom(), 1000);
    
    this.init();
  }
  
  /**
   * Set the input component reference
   * @param {InputComponent} inputComponent - Input component instance
   */
  setInputComponent(inputComponent) {
    this.inputComponent = inputComponent;
  }
  
  /**
   * Initialize the chat manager
   */
  init() {
    this.conversationDotsElement = document.querySelector(SELECTORS.CONVERSATION_DOTS);
    this.aiResponseElement = document.querySelector(SELECTORS.AI_RESPONSE);
    this.topicDisplayElement = document.querySelector(SELECTORS.TOPIC_DISPLAY);
    
    // Initialize OpenAI service with hardcoded configuration
    this.openAIService = new OpenAIService();
    
    // Set initial state
    this.updateConversationDots();
    this.setupResetButton();
  }
  
  /**
   * Get current conversation state
   * @returns {Object} Current state
   */
  getState() {
    return {
      messageCount: this.messageCount,
      maxMessages: this.maxMessages,
      currentTopic: this.currentTopic,
      isStreaming: this.isStreaming,
      hasReachedLimit: this.messageCount >= this.maxMessages,
    };
  }
  
  /**
   * Check if conversation limit has been reached
   * @returns {boolean}
   */
  hasReachedLimit() {
    return this.messageCount >= this.maxMessages;
  }
  
  /**
   * Increment message count
   * @throws {Error} If limit is reached
   */
  incrementMessageCount() {
    if (this.hasReachedLimit()) {
      throw new Error('已達到對話次數上限');
    }
    
    const currentIndex = this.messageCount;
    this.messageCount++;
    this.updateConversationDots();
    
    // Animate the newly filled dot
    this.animateConversationDot(currentIndex);
    
    // Check and warn for conversation limit
    limitWarning.checkConversationLimit(this.messageCount, this.maxMessages);
  }
  
  /**
   * Send a message to AI
   * @param {string} message - User message
   */
  async sendMessage(message) {
    // Check network connectivity
    if (!networkMonitor.checkOnline()) {
      toast.error('網路連線已中斷，請檢查您的網路連線');
      throw new Error('網路連線已中斷');
    }
    
    // Check limit
    if (this.hasReachedLimit()) {
      const error = new Error('已達到對話次數上限，請點擊「重新開始」開始新對話');
      toast.warning(error.message);
      throw error;
    }
    
    // Check for concurrent streaming
    if (this.isStreaming) {
      throw new Error('正在處理上一條訊息，請稍候');
    }
    
    // Update state
    this.currentTopic = message;
    
    // Add to history (before incrementing count, in case of error)
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });
    
    // Show optimistic UI update
    loadingExperience.showOptimisticUpdate(message);
    
    // Start loading state
    loadingManager.start('send-message');
    
    try {
      // Trigger layout transition on first message
      if (this.messageCount === 0) {
        await this.animationController.transitionToChat();
      }
      
      // Update topic display
      this.updateTopicDisplay(message);
      
      // Stream AI response with retry logic
      await errorRecovery.executeWithRetry(
        () => this.streamResponse(message),
        {
          maxRetries: this.maxRetries,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt} after error:`, error.message);
            toast.info(`正在重試... (${attempt}/${this.maxRetries})`);
          },
          shouldRetry: (error) => {
            return error.canRetry === true;
          },
        }
      );
      
      // Only increment count after successful response
      this.incrementMessageCount();
      
      // Show success feedback
      toast.success('回應完成');
      
    } catch (error) {
      // Remove the user message from history on error
      this.conversationHistory.pop();
      
      // Log error
      errorLogger.log(error, {
        message,
        messageCount: this.messageCount,
        conversationLength: this.conversationHistory.length,
      });
      
      // Show error to user
      toast.error(error.message || '發生錯誤，請重試');
      
      throw error;
    } finally {
      loadingManager.stop('send-message');
    }
  }
  
  /**
   * Stream AI response with real-time display
   * @param {string} message - User message
   */
  async streamResponse(message) {
    this.isStreaming = true;
    
    // Setup progressive timeout
    const cancelTimeout = TimeoutHandler.progressiveTimeout(
      API_TIMEOUT,
      0.7,
      (warningMessage) => {
        toast.warning(warningMessage);
      }
    );
    
    try {
      // Clear previous response
      if (this.aiResponseElement) {
        this.aiResponseElement.textContent = '';
        this.aiResponseElement.classList.add('streaming-cursor');
      }
      
      // Show loading indicator
      this.showStreamingLoader();
      
      // Build messages with conversation context
      const messages = this.openAIService.buildMessages(
        message, 
        this.getConversationContext()
      );
      
      // Use optimized streaming with timeout
      await TimeoutHandler.withTimeout(
        this.optimizedStreamResponse(messages),
        API_TIMEOUT,
        '連接 AI 服務超時，請稍後重試'
      );
      
    } catch (error) {
      console.error('Error streaming response:', error);
      
      // Log error
      errorLogger.log(error, {
        method: 'streamResponse',
        message,
      });
      
      // Display error to user
      if (this.aiResponseElement) {
        this.aiResponseElement.classList.remove('streaming-cursor');
        this.aiResponseElement.textContent = `發生錯誤：${error.message}`;
        this.aiResponseElement.classList.add('text-red-400');
      }
      
      throw error;
    } finally {
      this.isStreaming = false;
      cancelTimeout();
    }
  }

  /**
   * Optimized streaming with batched updates
   * @param {Array} messages - Messages array
   */
  async optimizedStreamResponse(messages) {
    const responseElement = this.aiResponseElement;
    if (!responseElement) return;
    
    let pendingContent = '';
    let updateScheduled = false;
    let fullContent = '';
    
    // Batch DOM updates for better performance
    const scheduleUpdate = () => {
      if (updateScheduled) return;
      
      updateScheduled = true;
      requestAnimationFrame(() => {
        this.clearStreamingLoader();
        responseElement.textContent = fullContent;
        this.debouncedScrollToBottom();
        pendingContent = '';
        updateScheduled = false;
      });
    };
    
    await this.openAIService.sendStreamingMessage(messages, {
      onChunk: (chunk, fullText) => {
        fullContent = fullText;
        pendingContent += chunk;
        scheduleUpdate();
      },
      
      onComplete: (finalContent) => {
        // Ensure final content is displayed
        if (responseElement) {
          responseElement.textContent = finalContent;
          responseElement.classList.remove('streaming-cursor');
        }
        
        // Add to conversation history
        this.addAIResponse(finalContent);
        
        console.log('Streaming complete:', finalContent.length, 'characters');
      },
      
      onError: async (error) => {
        // Try recovery or retry
        const shouldRetry = await this.handleStreamingError(error, 0);
        
        if (!shouldRetry) {
          // Display error
          if (responseElement) {
            responseElement.classList.remove('streaming-cursor');
            responseElement.textContent = `發生錯誤：${error.message}`;
            responseElement.classList.add('text-red-400');
          }
          throw error;
        }
      }
    });
  }

  /**
   * Show loading indicator during initial API delay
   */
  showStreamingLoader() {
    const responseElement = this.aiResponseElement;
    if (responseElement) {
      responseElement.innerHTML = '<span class="text-purple-400">思考中...</span>';
    }
  }

  /**
   * Clear loading indicator
   */
  clearStreamingLoader() {
    const responseElement = this.aiResponseElement;
    if (responseElement && responseElement.innerHTML.includes('思考中')) {
      responseElement.innerHTML = '';
    }
  }

  /**
   * Handle streaming errors with retry logic
   * @param {Error} error - The error
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<boolean>} Whether to retry
   */
  async handleStreamingError(error, retryCount = 0) {
    // Log error
    console.error(`Streaming error (attempt ${retryCount + 1}):`, error);
    
    // Check if retryable
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'Rate limit',
    ];
    
    const isRetryable = retryableErrors.some(e => 
      error.message.includes(e) || error.code === e
    );
    
    if (isRetryable && retryCount < this.maxRetries) {
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return true; // Should retry
    }
    
    return false; // Don't retry
  }

  /**
   * Scroll to bottom of the page during streaming
   * Uses auto behavior (not smooth) to avoid lag during real-time streaming
   */
  scrollToBottom() {
    // Method 1: Scroll the window to ensure AI response is visible
    // Use 'nearest' instead of 'end' to prevent content from being covered by fixed footer
    const aiResponse = document.querySelector('#ai-response');
    if (aiResponse) {
      aiResponse.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
    
    // Method 2: Additionally scroll to the absolute bottom to show latest content
    // Add a small delay to ensure the content has been rendered
    requestAnimationFrame(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'auto'
      });
    });
  }
  
  /**
   * Generate a mock AI response
   * @param {string} userMessage - User's message
   * @returns {string} Mock response
   */
  generateMockResponse(userMessage) {
    // Mock responses for demonstration
    const responses = [
      `關於「${userMessage}」，這真是一個值得深思的話題。讓我們從多個角度來探討這個問題...`,
      `「${userMessage}」確實是個有趣的觀點。不過我們可以考慮另一個視角...`,
      `針對「${userMessage}」這個主題，我有幾點看法想與你分享...`,
      `「${userMessage}」這個話題讓我想到了一些相關的思考...`,
      `關於「${userMessage}」，讓我們一起來思考這背後的意義...`
    ];
    
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }
  
  /**
   * Update the conversation dots display
   * Shows filled dots for used messages, empty dots for remaining
   */
  updateConversationDots() {
    if (!this.conversationDotsElement) return;
    
    const dots = [];
    
    for (let i = 0; i < this.maxMessages; i++) {
      if (i < this.messageCount) {
        // Used conversation slot - filled circle
        dots.push('<span class="text-white">●</span>');
      } else {
        // Remaining slot - empty circle
        dots.push('<span class="text-text-muted">○</span>');
      }
    }
    
    this.conversationDotsElement.innerHTML = dots.join(' ');
  }
  
  /**
   * Animate a conversation dot when a message is successfully sent
   * @param {number} dotIndex - Index of the dot to animate
   */
  animateConversationDot(dotIndex) {
    if (!this.conversationDotsElement) return;
    
    const dots = this.conversationDotsElement.querySelectorAll('span');
    const dot = dots[dotIndex];
    
    if (dot) {
      dot.classList.add('success-pulse');
      dot.addEventListener('animationend', () => {
        dot.classList.remove('success-pulse');
      }, { once: true });
    }
  }
  
  /**
   * Reset the conversation to initial state
   */
  resetConversation() {
    // Reset state
    this.messageCount = 0;
    this.currentTopic = '';
    this.conversationHistory = [];
    this.isStreaming = false;
    
    // Update UI
    this.updateConversationDots();
    this.clearAIResponse();
    
    // Transition back to initial layout
    this.animationController.transitionToInitial();
    
    // Prefill a new random phrase
    if (this.inputComponent) {
      this.inputComponent.prefillRandomPhrase();
    }
    
    console.log('Conversation reset with new random phrase');
  }
  
  /**
   * Clear the AI response display
   */
  clearAIResponse() {
    if (this.aiResponseElement) {
      this.aiResponseElement.textContent = '';
    }
    if (this.topicDisplayElement) {
      this.topicDisplayElement.textContent = '';
      this.topicDisplayElement.classList.remove('opacity-100');
      this.topicDisplayElement.classList.add('opacity-0');
    }
  }
  
  /**
   * Setup reset button handler
   */
  setupResetButton() {
    const resetButton = document.querySelector(SELECTORS.RESET_BUTTON);
    if (resetButton) {
      resetButton.addEventListener('click', async () => {
        // Confirm if conversation has started
        if (this.messageCount > 0) {
          const confirmed = confirm('確定要重新開始嗎？目前的對話將會清除。');
          if (!confirmed) return;
        }
        
        await this.resetConversation();
      });
    }
  }
  
  /**
   * Add AI response to conversation history
   * @param {string} response - AI response content
   */
  addAIResponse(response) {
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get formatted conversation history for API
   * @returns {Array} Formatted messages array
   */
  getConversationContext() {
    return this.conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
  
  /**
   * Get the last N messages from history
   * @param {number} count - Number of messages to retrieve
   * @returns {Array} Recent messages
   */
  getRecentMessages(count = 5) {
    return this.conversationHistory.slice(-count);
  }
  
  /**
   * Update the topic display
   * @param {string} topic - Current conversation topic
   */
  updateTopicDisplay(topic) {
    if (!this.topicDisplayElement) return;
    
    this.topicDisplayElement.textContent = topic;
    
    // Animate topic appearance
    this.topicDisplayElement.classList.remove('opacity-0');
    this.topicDisplayElement.classList.add('opacity-100');
  }
  
  /**
   * Get the current topic
   * @returns {string} Current topic
   */
  getCurrentTopic() {
    return this.currentTopic;
  }
}
