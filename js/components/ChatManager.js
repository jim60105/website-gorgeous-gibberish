/**
 * ChatManager - Manages conversation state and AI interactions
 */

import { MAX_CONVERSATION_COUNT, SELECTORS } from '../utils/constants.js';
import { OpenAIService } from '../services/OpenAIService.js';

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
    
    this.init();
  }
  
  /**
   * Initialize the chat manager
   */
  init() {
    this.conversationDotsElement = document.querySelector(SELECTORS.CONVERSATION_DOTS);
    this.aiResponseElement = document.querySelector(SELECTORS.AI_RESPONSE);
    this.topicDisplayElement = document.querySelector(SELECTORS.TOPIC_DISPLAY);
    
    // Initialize OpenAI service with a placeholder key
    // In production, this should be handled securely
    try {
      this.openAIService = new OpenAIService('placeholder-key');
    } catch (error) {
      console.warn('OpenAI service not initialized:', error.message);
    }
    
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
    this.messageCount++;
    this.updateConversationDots();
  }
  
  /**
   * Send a message to AI
   * @param {string} message - User message
   */
  async sendMessage(message) {
    // Check limit
    if (this.hasReachedLimit()) {
      throw new Error('已達到對話次數上限，請點擊「重新開始」開始新對話');
    }
    
    // Update state
    this.currentTopic = message;
    this.incrementMessageCount();
    
    // Add to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });
    
    // Trigger layout transition on first message
    if (this.messageCount === 1) {
      await this.animationController.transitionToChat();
    }
    
    // Update topic display
    this.updateTopicDisplay(message);
    
    // Stream AI response
    await this.streamResponse(message);
  }
  
  /**
   * Stream AI response with typewriter effect
   * @param {string} message - User message
   */
  async streamResponse(message) {
    this.isStreaming = true;
    
    try {
      // Clear previous response
      if (this.aiResponseElement) {
        this.aiResponseElement.textContent = '';
      }
      
      // Simulate streaming response with typewriter effect
      // In production, this would use the OpenAI streaming API
      const mockResponse = this.generateMockResponse(message);
      await this.animationController.typewriterEffect(
        this.aiResponseElement, 
        mockResponse
      );
      
      // Add AI response to history
      this.addAIResponse(mockResponse);
      
    } catch (error) {
      console.error('Error streaming response:', error);
      throw new Error('無法獲取回應，請重試');
    } finally {
      this.isStreaming = false;
    }
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
    
    console.log('Conversation reset');
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
      resetButton.addEventListener('click', () => this.resetConversation());
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
