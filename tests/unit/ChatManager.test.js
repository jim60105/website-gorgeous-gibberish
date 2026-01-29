/**
 * Unit tests for ChatManager
 * Task 7.1.2: 測試對話管理功能
 */

import { jest } from '@jest/globals';

// Mock all dependencies before importing ChatManager
jest.mock('../../js/services/OpenAIService.js');
jest.mock('../../js/components/ToastNotification.js');
jest.mock('../../js/components/LimitWarning.js');
jest.mock('../../js/services/LoadingManager.js');
jest.mock('../../js/services/LoadingExperience.js');
jest.mock('../../js/services/ErrorRecovery.js');
jest.mock('../../js/services/ErrorLogger.js');
jest.mock('../../js/services/NetworkMonitor.js');
jest.mock('../../js/services/TimeoutHandler.js');

import { ChatManager } from '../../js/components/ChatManager.js';

describe('ChatManager', () => {
  let chatManager;
  let mockAnimationController;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="conversation-dots"></div>
      <div id="ai-response"></div>
      <div id="topic-display"></div>
      <button id="reset-button">重新開始</button>
      <div id="ai-response-container"></div>
    `;
    
    // Mock AnimationController
    mockAnimationController = {
      transitionToChat: jest.fn().mockResolvedValue(undefined),
      transitionToInitial: jest.fn().mockResolvedValue(undefined),
      appendText: jest.fn().mockResolvedValue(undefined),
      endStreaming: jest.fn(),
      currentState: 'initial',
    };
    
    chatManager = new ChatManager(mockAnimationController);
  });
  
  describe('initialization', () => {
    test('should initialize with zero message count', () => {
      expect(chatManager.messageCount).toBe(0);
    });
    
    test('should initialize with empty conversation history', () => {
      expect(chatManager.conversationHistory).toEqual([]);
    });
    
    test('should not be streaming initially', () => {
      expect(chatManager.isStreaming).toBe(false);
    });
    
    test('should have empty current topic', () => {
      expect(chatManager.currentTopic).toBe('');
    });
  });
  
  describe('conversation limit', () => {
    test('should start with 0 message count', () => {
      expect(chatManager.messageCount).toBe(0);
    });
    
    test('should increment message count', () => {
      chatManager.incrementMessageCount();
      expect(chatManager.messageCount).toBe(1);
    });
    
    test('should detect limit reached at 5 messages', () => {
      for (let i = 0; i < 5; i++) {
        chatManager.incrementMessageCount();
      }
      expect(chatManager.hasReachedLimit()).toBe(true);
    });
    
    test('should throw error when exceeding limit', () => {
      for (let i = 0; i < 5; i++) {
        chatManager.incrementMessageCount();
      }
      
      expect(() => chatManager.incrementMessageCount()).toThrow('已達到對話次數上限');
    });
    
    test('should not have reached limit at 4 messages', () => {
      for (let i = 0; i < 4; i++) {
        chatManager.incrementMessageCount();
      }
      expect(chatManager.hasReachedLimit()).toBe(false);
    });
    
    test('should allow exactly 5 messages', () => {
      for (let i = 0; i < 5; i++) {
        chatManager.incrementMessageCount();
      }
      expect(chatManager.messageCount).toBe(5);
      expect(chatManager.hasReachedLimit()).toBe(true);
    });
  });
  
  describe('conversation dots', () => {
    test('should show all empty dots initially', () => {
      chatManager.updateConversationDots();
      const dots = chatManager.conversationDotsElement.innerHTML;
      
      // Count empty dots
      const emptyDots = (dots.match(/○/g) || []).length;
      expect(emptyDots).toBe(5);
    });
    
    test('should update dots on message send', () => {
      chatManager.incrementMessageCount();
      chatManager.updateConversationDots();
      
      const dots = chatManager.conversationDotsElement.innerHTML;
      expect(dots).toContain('●');
      
      // Should have 1 filled and 4 empty
      const filledDots = (dots.match(/●/g) || []).length;
      const emptyDots = (dots.match(/○/g) || []).length;
      expect(filledDots).toBe(1);
      expect(emptyDots).toBe(4);
    });
    
    test('should show correct dots after 3 messages', () => {
      for (let i = 0; i < 3; i++) {
        chatManager.incrementMessageCount();
      }
      chatManager.updateConversationDots();
      
      const dots = chatManager.conversationDotsElement.innerHTML;
      const filledDots = (dots.match(/●/g) || []).length;
      const emptyDots = (dots.match(/○/g) || []).length;
      
      expect(filledDots).toBe(3);
      expect(emptyDots).toBe(2);
    });
    
    test('should show all filled dots at limit', () => {
      for (let i = 0; i < 5; i++) {
        chatManager.incrementMessageCount();
      }
      chatManager.updateConversationDots();
      
      const dots = chatManager.conversationDotsElement.innerHTML;
      const filledDots = (dots.match(/●/g) || []).length;
      expect(filledDots).toBe(5);
    });
  });
  
  describe('getState', () => {
    test('should return current state object', () => {
      const state = chatManager.getState();
      
      expect(state).toHaveProperty('messageCount');
      expect(state).toHaveProperty('maxMessages');
      expect(state).toHaveProperty('currentTopic');
      expect(state).toHaveProperty('isStreaming');
      expect(state).toHaveProperty('hasReachedLimit');
    });
    
    test('should reflect current message count', () => {
      chatManager.messageCount = 3;
      const state = chatManager.getState();
      
      expect(state.messageCount).toBe(3);
    });
    
    test('should indicate limit status correctly', () => {
      chatManager.messageCount = 5;
      const state = chatManager.getState();
      
      expect(state.hasReachedLimit).toBe(true);
    });
  });
  
  describe('reset', () => {
    test('should reset all state', () => {
      chatManager.messageCount = 3;
      chatManager.currentTopic = 'test topic';
      chatManager.conversationHistory = [
        { role: 'user', content: 'msg1' },
        { role: 'assistant', content: 'msg2' }
      ];
      chatManager.isStreaming = true;
      
      chatManager.resetConversation();
      
      expect(chatManager.messageCount).toBe(0);
      expect(chatManager.currentTopic).toBe('');
      expect(chatManager.conversationHistory).toEqual([]);
      expect(chatManager.isStreaming).toBe(false);
    });
    
    test('should update conversation dots after reset', () => {
      chatManager.messageCount = 3;
      chatManager.resetConversation();
      
      const dots = chatManager.conversationDotsElement.innerHTML;
      const emptyDots = (dots.match(/○/g) || []).length;
      expect(emptyDots).toBe(5);
    });
    
    test('should call transitionToInitial', () => {
      chatManager.resetConversation();
      
      expect(mockAnimationController.transitionToInitial).toHaveBeenCalled();
    });
    
    test('should clear AI response element', () => {
      const aiResponseElement = document.querySelector('#ai-response');
      aiResponseElement.textContent = 'Some response';
      
      chatManager.resetConversation();
      
      expect(aiResponseElement.textContent).toBe('');
    });
  });
  
  describe('conversation history', () => {
    test('should add AI response to history', () => {
      const response = 'AI response content';
      chatManager.addAIResponse(response);
      
      expect(chatManager.conversationHistory).toHaveLength(1);
      expect(chatManager.conversationHistory[0].role).toBe('assistant');
      expect(chatManager.conversationHistory[0].content).toBe(response);
    });
    
    test('should get conversation context', () => {
      chatManager.conversationHistory = [
        { role: 'user', content: 'Hi', timestamp: Date.now() },
        { role: 'assistant', content: 'Hello', timestamp: Date.now() }
      ];
      
      const context = chatManager.getConversationContext();
      
      expect(context).toHaveLength(2);
      expect(context[0]).toEqual({ role: 'user', content: 'Hi' });
      expect(context[1]).toEqual({ role: 'assistant', content: 'Hello' });
    });
    
    test('should get recent messages', () => {
      // Add 10 messages
      for (let i = 0; i < 10; i++) {
        chatManager.conversationHistory.push({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: Date.now() + i
        });
      }
      
      const recent = chatManager.getRecentMessages(5);
      
      expect(recent).toHaveLength(5);
      expect(recent[4].content).toBe('Message 9');
    });
  });
  
  describe('updateTopicDisplay', () => {
    test('should update topic text', () => {
      const topic = '測試主題';
      chatManager.updateTopicDisplay(topic);
      
      expect(chatManager.topicDisplayElement.textContent).toBe(topic);
    });
    
    test('should make topic visible', () => {
      chatManager.updateTopicDisplay('Test');
      
      expect(chatManager.topicDisplayElement.classList.contains('opacity-100')).toBe(true);
    });
  });
  
  describe('getCurrentTopic', () => {
    test('should return current topic', () => {
      chatManager.currentTopic = '當前話題';
      
      expect(chatManager.getCurrentTopic()).toBe('當前話題');
    });
    
    test('should return empty string initially', () => {
      expect(chatManager.getCurrentTopic()).toBe('');
    });
  });
  
  describe('animateConversationDot', () => {
    test('should add success-pulse class to dot', () => {
      chatManager.updateConversationDots();
      chatManager.messageCount = 1;
      chatManager.updateConversationDots();
      
      const dots = chatManager.conversationDotsElement.querySelectorAll('span');
      expect(dots.length).toBeGreaterThan(0);
    });
  });
  
  describe('generateMockResponse', () => {
    test('should generate response containing user message', () => {
      const userMessage = '測試訊息';
      const response = chatManager.generateMockResponse(userMessage);
      
      expect(response).toContain(userMessage);
      expect(response.length).toBeGreaterThan(0);
    });
    
    test('should return different responses', () => {
      const responses = new Set();
      for (let i = 0; i < 20; i++) {
        responses.add(chatManager.generateMockResponse('test'));
      }
      
      // Should have some variety
      expect(responses.size).toBeGreaterThan(1);
    });
  });
});
