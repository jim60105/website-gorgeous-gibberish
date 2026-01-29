/**
 * Integration tests for Animation Sequences
 * Task 7.2.3: 測試動畫序列
 */

import { jest } from '@jest/globals';
import { AnimationController } from '../../js/components/AnimationController.js';
import { waitFor } from './helpers.js';

describe('Animation Sequences Integration', () => {
  let animationController;
  
  beforeEach(() => {
    // Mock window.matchMedia for reduced motion detection
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    document.body.innerHTML = `
      <div id="app" class="">
        <div class="hero-container">
          <div class="hero-title">絢</div>
          <div class="hero-subtitle">副標題</div>
        </div>
        <div class="usage-hint">使用提示</div>
        <div id="input-container" class="initial-state"></div>
      </div>
      <div id="chat-container" class="hidden">
        <div class="chat-header hidden">Header</div>
        <div id="topic-section" class="hidden">Topic</div>
        <div id="ai-response-container" class="hidden">
          <div id="ai-response"></div>
        </div>
      </div>
    `;
    
    animationController = new AnimationController();
  });
  
  describe('Transition to chat sequence', () => {
    test('should perform complete transition to chat mode', async () => {
      // Act
      await animationController.transitionToChat();
      
      // Assert - verify all elements in correct state
      expect(document.querySelector('.hero-title').classList.contains('hidden')).toBe(true);
      expect(document.querySelector('.chat-header').classList.contains('hidden')).toBe(false);
      expect(animationController.currentState).toBe('chat');
      expect(document.querySelector('#app').classList.contains('hidden')).toBe(true);
      expect(document.querySelector('#chat-container').classList.contains('hidden')).toBe(false);
    });
    
    test('should hide hero elements during transition', async () => {
      await animationController.transitionToChat();
      
      const heroTitle = document.querySelector('.hero-title');
      const heroSubtitle = document.querySelector('.hero-subtitle');
      const usageHint = document.querySelector('.usage-hint');
      
      expect(heroTitle.classList.contains('hidden')).toBe(true);
      expect(heroSubtitle?.classList.contains('hidden')).toBe(true);
      expect(usageHint.classList.contains('hidden')).toBe(true);
    });
    
    test('should show chat elements after transition', async () => {
      await animationController.transitionToChat();
      
      const chatHeader = document.querySelector('.chat-header');
      const topicSection = document.querySelector('#topic-section');
      const aiResponseContainer = document.querySelector('#ai-response-container');
      
      expect(chatHeader.classList.contains('hidden')).toBe(false);
      expect(topicSection.classList.contains('hidden')).toBe(false);
      expect(aiResponseContainer.classList.contains('hidden')).toBe(false);
    });
  });
  
  describe('Transition back to initial', () => {
    test('should transition from chat back to initial', async () => {
      // First go to chat
      await animationController.transitionToChat();
      expect(animationController.currentState).toBe('chat');
      
      // Then back to initial
      await animationController.transitionToInitial();
      
      // Check containers are in correct state
      expect(document.querySelector('#app').classList.contains('hidden')).toBe(false);
      expect(document.querySelector('#chat-container').classList.contains('hidden')).toBe(true);
      expect(animationController.currentState).toBe('initial');
    });
    
    test('should show initial state elements after reset', async () => {
      await animationController.transitionToChat();
      await animationController.transitionToInitial();
      
      expect(document.querySelector('#app').classList.contains('hidden')).toBe(false);
      expect(document.querySelector('#chat-container').classList.contains('hidden')).toBe(true);
    });
  });
  
  describe('Timeline execution order', () => {
    test('should execute animations in sequence', async () => {
      const executionOrder = [];
      
      const timeline = [
        {
          element: '.hero-title',
          animation: 'fadeOut',
          duration: 0,
        },
        {
          element: '.chat-header',
          animation: 'fadeIn',
          duration: 0,
        },
      ];
      
      await animationController.executeTimeline(timeline);
      
      // Verify elements were animated
      const heroTitle = document.querySelector('.hero-title');
      const chatHeader = document.querySelector('.chat-header');
      
      expect(heroTitle.classList.contains('hidden')).toBe(true);
      expect(chatHeader.classList.contains('hidden')).toBe(false);
    });
    
    test('should handle timeline with delays', async () => {
      const startTime = Date.now();
      
      const timeline = [
        {
          element: '.hero-title',
          animation: 'fadeOut',
          duration: 0,
          delay: 50,
        },
        {
          element: '.chat-header',
          animation: 'fadeIn',
          duration: 0,
        },
      ];
      
      await animationController.executeTimeline(timeline);
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(40); // Allow some variance
    });
  });
  
  describe('Animation state management', () => {
    test('should prevent concurrent transitions', async () => {
      const firstTransition = animationController.transitionToChat();
      
      // Try to start another transition immediately
      await animationController.transitionToChat();
      
      await firstTransition;
      
      // Should only transition once
      expect(animationController.currentState).toBe('chat');
    });
    
    test('should not transition if already in target state', async () => {
      await animationController.transitionToChat();
      
      const initialElement = document.querySelector('.chat-header');
      const initialClassList = [...initialElement.classList];
      
      // Try to transition again
      await animationController.transitionToChat();
      
      // Classes should remain unchanged
      expect([...initialElement.classList]).toEqual(initialClassList);
    });
  });
  
  describe('Animation completion', () => {
    test('should mark animation as not animating after completion', async () => {
      expect(animationController.isAnimating).toBe(false);
      
      const promise = animationController.transitionToChat();
      
      // Should be animating during transition
      expect(animationController.isAnimating).toBe(true);
      
      await promise;
      
      // Should not be animating after completion
      expect(animationController.isAnimating).toBe(false);
    });
    
    test('should update state after transition completes', async () => {
      expect(animationController.currentState).toBe('initial');
      
      await animationController.transitionToChat();
      
      expect(animationController.currentState).toBe('chat');
    });
  });
  
  describe('Reduced motion support', () => {
    test('should respect prefers-reduced-motion setting', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
      }));
      
      const duration = animationController.getAnimationDuration(300);
      
      expect(duration).toBe(0);
    });
    
    test('should use normal duration when reduced motion is off', () => {
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
      }));
      
      const duration = animationController.getAnimationDuration(300);
      
      expect(duration).toBe(300);
    });
  });
});
