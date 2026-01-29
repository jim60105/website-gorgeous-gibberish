/**
 * Unit tests for AnimationController
 * Task 7.1.3: 測試動畫控制器
 */

import { jest } from '@jest/globals';
import { AnimationController } from '../../js/components/AnimationController.js';

describe('AnimationController', () => {
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
  
  describe('initialization', () => {
    test('should start in initial state', () => {
      expect(animationController.currentState).toBe('initial');
    });
    
    test('should not be animating initially', () => {
      expect(animationController.isAnimating).toBe(false);
    });
    
    test('should cache DOM elements', () => {
      expect(animationController.heroContainer).toBeTruthy();
      expect(animationController.appContainer).toBeTruthy();
      expect(animationController.chatContainer).toBeTruthy();
    });
  });
  
  describe('state management', () => {
    test('should prevent concurrent animations', async () => {
      animationController.isAnimating = true;
      const initialState = animationController.currentState;
      
      await animationController.transitionToChat();
      
      // Should not change state if already animating
      expect(animationController.currentState).toBe(initialState);
    });
    
    test('should not transition if already in target state', async () => {
      animationController.currentState = 'chat';
      animationController.isAnimating = false;
      
      const spy = jest.spyOn(animationController, 'fadeOut');
      await animationController.transitionToChat();
      
      expect(spy).not.toHaveBeenCalled();
    });
  });
  
  describe('transitionToChat', () => {
    test('should change state to chat', async () => {
      await animationController.transitionToChat();
      
      expect(animationController.currentState).toBe('chat');
    });
    
    test('should hide app container', async () => {
      await animationController.transitionToChat();
      
      expect(animationController.appContainer.classList.contains('hidden')).toBe(true);
    });
    
    test('should show chat container', async () => {
      await animationController.transitionToChat();
      
      expect(animationController.chatContainer.classList.contains('hidden')).toBe(false);
    });
    
    test('should set isAnimating during transition', async () => {
      const promise = animationController.transitionToChat();
      
      // Should be animating immediately
      expect(animationController.isAnimating).toBe(true);
      
      await promise;
      
      // Should not be animating after completion
      expect(animationController.isAnimating).toBe(false);
    });
  });
  
  describe('transitionToInitial', () => {
    test('should transition from chat to initial', async () => {
      // First go to chat
      await animationController.transitionToChat();
      
      // Then back to initial
      await animationController.transitionToInitial();
      
      expect(animationController.currentState).toBe('initial');
    });
    
    test('should show app container', async () => {
      animationController.currentState = 'chat';
      await animationController.transitionToInitial();
      
      expect(animationController.appContainer.classList.contains('hidden')).toBe(false);
    });
    
    test('should hide chat container', async () => {
      animationController.currentState = 'chat';
      await animationController.transitionToInitial();
      
      expect(animationController.chatContainer.classList.contains('hidden')).toBe(true);
    });
  });
  
  describe('fade animations', () => {
    test('should fade out element', async () => {
      const element = document.querySelector('.hero-title');
      await animationController.fadeOut(element, 0);
      
      expect(element.classList.contains('hidden')).toBe(true);
      expect(element.style.visibility).toBe('hidden');
    });
    
    test('should fade in element', async () => {
      const element = document.querySelector('.chat-header');
      element.classList.add('hidden');
      
      await animationController.fadeIn(element, 0);
      
      expect(element.classList.contains('hidden')).toBe(false);
      expect(element.style.visibility).toBe('visible');
    });
    
    test('should handle null element gracefully', async () => {
      await expect(animationController.fadeIn(null, 0)).resolves.not.toThrow();
      await expect(animationController.fadeOut(null, 0)).resolves.not.toThrow();
    });
    
    test('should set opacity during fade in', async () => {
      const element = document.querySelector('.chat-header');
      await animationController.fadeIn(element, 0);
      
      expect(element.style.opacity).toBe('1');
    });
    
    test('should set opacity during fade out', async () => {
      const element = document.querySelector('.hero-title');
      await animationController.fadeOut(element, 0);
      
      expect(element.style.opacity).toBe('0');
    });
  });
  
  describe('typewriter effect', () => {
    test('should display text character by character', async () => {
      const element = document.querySelector('#ai-response');
      const text = 'Hello';
      
      await animationController.typewriterEffect(element, text, 0);
      
      expect(element.textContent).toBe(text);
    });
    
    test('should handle empty text', async () => {
      const element = document.querySelector('#ai-response');
      await animationController.typewriterEffect(element, '', 0);
      
      expect(element.textContent).toBe('');
    });
    
    test('should show cursor during typing', async () => {
      const element = document.querySelector('#ai-response');
      const promise = animationController.typewriterEffect(element, 'Test', 0);
      
      // Cursor should be shown immediately
      expect(element.classList.contains('streaming-cursor')).toBe(true);
      
      await promise;
    });
    
    test('should hide cursor after completion', async () => {
      const element = document.querySelector('#ai-response');
      await animationController.typewriterEffect(element, 'Test', 0);
      
      // Give time for cursor removal
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(element.classList.contains('streaming-cursor')).toBe(false);
    });
    
    test('should call onChar callback for each character', async () => {
      const element = document.querySelector('#ai-response');
      const text = 'ABC';
      const callback = jest.fn();
      
      await animationController.typewriterEffect(element, text, 0, callback);
      
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledWith('A', 0, 3);
      expect(callback).toHaveBeenCalledWith('B', 1, 3);
      expect(callback).toHaveBeenCalledWith('C', 2, 3);
    });
  });
  
  describe('appendText', () => {
    test('should append text to response element', async () => {
      const element = document.querySelector('#ai-response');
      element.textContent = 'Hello';
      
      await animationController.appendText(' World');
      
      expect(element.textContent).toBe('Hello World');
    });
    
    test('should add streaming cursor class', async () => {
      const element = document.querySelector('#ai-response');
      
      await animationController.appendText('test');
      
      expect(element.classList.contains('streaming-cursor')).toBe(true);
    });
  });
  
  describe('endStreaming', () => {
    test('should remove streaming cursor', () => {
      const element = document.querySelector('#ai-response');
      element.classList.add('streaming-cursor');
      
      animationController.endStreaming();
      
      expect(element.classList.contains('streaming-cursor')).toBe(false);
    });
  });
  
  describe('reduced motion', () => {
    test('should detect reduced motion preference', () => {
      // Mock matchMedia to return reduced motion
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
      
      expect(animationController.prefersReducedMotion()).toBe(true);
    });
    
    test('should return 0 duration for reduced motion', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
      }));
      
      const duration = animationController.getAnimationDuration(300);
      
      expect(duration).toBe(0);
    });
    
    test('should return normal duration when no reduced motion', () => {
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
      }));
      
      const duration = animationController.getAnimationDuration(300);
      
      expect(duration).toBe(300);
    });
  });
  
  describe('slideDown and slideUp', () => {
    test('should slide down element', async () => {
      const element = document.querySelector('.usage-hint');
      element.classList.add('hidden');
      
      await animationController.slideDown(element, 0);
      
      expect(element.classList.contains('hidden')).toBe(false);
    });
    
    test('should slide up element', async () => {
      const element = document.querySelector('.usage-hint');
      
      await animationController.slideUp(element, 0);
      
      expect(element.classList.contains('hidden')).toBe(true);
    });
  });
  
  describe('executeTimeline', () => {
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
    
    test('should skip animation for non-existent elements', async () => {
      const timeline = [
        {
          element: '.non-existent',
          animation: 'fadeIn',
          duration: 0,
        },
      ];
      
      await expect(animationController.executeTimeline(timeline)).resolves.not.toThrow();
    });
  });
  
  describe('delay', () => {
    test('should delay execution', async () => {
      const start = Date.now();
      await animationController.delay(50);
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(40); // Allow some variance
    });
  });
  
  describe('GPU optimization', () => {
    test('should promote element to GPU', () => {
      const element = document.querySelector('.hero-title');
      animationController.promoteToGPU(element);
      
      expect(element.style.willChange).toBe('transform, opacity');
      expect(element.style.transform).toBe('translateZ(0)');
    });
    
    test('should demote element from GPU', () => {
      const element = document.querySelector('.hero-title');
      element.style.willChange = 'transform';
      
      animationController.demoteFromGPU(element);
      
      expect(element.style.willChange).toBe('auto');
    });
    
    test('should handle null element gracefully', () => {
      expect(() => animationController.promoteToGPU(null)).not.toThrow();
      expect(() => animationController.demoteFromGPU(null)).not.toThrow();
    });
  });
  
  describe('cursor management', () => {
    test('should show cursor', () => {
      const element = document.querySelector('#ai-response');
      animationController.showCursor(element);
      
      expect(element.classList.contains('streaming-cursor')).toBe(true);
    });
    
    test('should hide cursor', () => {
      const element = document.querySelector('#ai-response');
      element.classList.add('streaming-cursor');
      
      animationController.hideCursor(element);
      
      expect(element.classList.contains('complete')).toBe(true);
    });
  });
});
