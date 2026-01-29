/**
 * AnimationController - Manages all animations in the application
 */

import { ANIMATION_DURATION, SELECTORS, TYPING_SPEED } from '../utils/constants.js';

export class AnimationController {
  constructor() {
    this.isAnimating = false;
    this.currentState = 'initial'; // 'initial' or 'chat'
    
    this.init();
  }
  
  /**
   * Initialize animation controller
   */
  init() {
    // Cache DOM elements
    this.heroContainer = document.querySelector('.hero-container');
    this.usageHint = document.querySelector('.usage-hint');
    this.appContainer = document.querySelector('#app');
    this.chatContainer = document.querySelector('#chat-container');
    this.inputContainer = document.querySelector('#input-container');
    this.topicSection = document.querySelector('#topic-section');
    this.aiResponseContainer = document.querySelector('#ai-response-container');
  }
  
  /**
   * Complete transition from initial state to chat state
   * Orchestrates multiple element animations
   */
  async transitionToChat() {
    if (this.isAnimating || this.currentState === 'chat') return;
    
    this.isAnimating = true;
    
    const elements = {
      heroTitle: document.querySelector('.hero-title'),
      heroSubtitle: document.querySelector('.hero-subtitle'),
      usageHint: document.querySelector('.usage-hint'),
      chatHeader: document.querySelector('.chat-header'),
      topicSection: this.topicSection,
      aiResponseContainer: this.aiResponseContainer,
    };
    
    try {
      // Phase 1: Fade out initial elements (300ms)
      const fadeOutPromises = [
        this.fadeOut(elements.heroTitle, 300),
        this.fadeOut(elements.heroSubtitle, 300),
        this.fadeOut(elements.usageHint, 300),
      ];
      await Promise.all(fadeOutPromises);
      
      // Phase 2: Switch containers
      this.appContainer.classList.add('hidden');
      this.chatContainer.classList.remove('hidden');
      
      // Phase 3: Fade in chat elements (300ms each, staggered)
      elements.chatHeader.classList.remove('hidden');
      await this.fadeIn(elements.chatHeader, 300);
      
      if (elements.topicSection) {
        elements.topicSection.classList.remove('hidden');
        await this.fadeIn(elements.topicSection, 200);
      }
      
      if (elements.aiResponseContainer) {
        elements.aiResponseContainer.classList.remove('hidden');
        await this.fadeIn(elements.aiResponseContainer, 200);
      }
      
      this.currentState = 'chat';
      
    } finally {
      this.isAnimating = false;
    }
  }
  
  /**
   * Transition back to initial state
   */
  async transitionToInitial() {
    if (this.isAnimating || this.currentState === 'initial') return;
    
    this.isAnimating = true;
    
    try {
      // Step 1: Fade out chat elements
      await Promise.all([
        this.fadeOut(this.aiResponseContainer, ANIMATION_DURATION.FADE_OUT),
        this.fadeOut(this.topicSection, ANIMATION_DURATION.FADE_OUT)
      ]);
      
      // Step 2: Hide chat container and show app container
      this.chatContainer.classList.add('hidden');
      this.appContainer.classList.remove('hidden');
      
      // Step 3: Show initial state elements
      await Promise.all([
        this.fadeIn(this.heroContainer, ANIMATION_DURATION.FADE_IN),
        this.fadeIn(this.usageHint, ANIMATION_DURATION.FADE_IN)
      ]);
      
      this.currentState = 'initial';
    } finally {
      this.isAnimating = false;
    }
  }
  
  /**
   * Display text with typewriter effect
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to display
   * @param {number} speed - Milliseconds per character (default 30)
   * @param {Function} onChar - Callback for each character
   */
  async typewriterEffect(element, text, speed = 30, onChar = null) {
    if (!element || !text) return;
    
    const adjustedSpeed = this.getAnimationDuration(speed);
    
    element.textContent = '';
    this.showCursor(element);
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      element.textContent += char;
      
      // Callback for custom handling
      if (onChar) {
        onChar(char, i, text.length);
      }
      
      // Variable speed: pause longer on punctuation
      let delay = adjustedSpeed;
      if ('，。！？、'.includes(char)) {
        delay = adjustedSpeed * 3;
      } else if (',.!?;:'.includes(char)) {
        delay = adjustedSpeed * 2;
      }
      
      await this.delay(delay);
    }
    
    this.hideCursor(element);
  }
  
  /**
   * Append text character by character (for streaming)
   * @param {string} text - Text chunk to append
   */
  async appendText(text) {
    const element = document.querySelector(SELECTORS.AI_RESPONSE);
    if (!element) return;
    
    // Add cursor class if not present
    if (!element.classList.contains('streaming-cursor')) {
      element.classList.add('streaming-cursor');
    }
    
    // Append each character with minimal delay
    for (const char of text) {
      element.textContent += char;
      
      // Small delay for visual effect (can be adjusted)
      await this.delay(10);
    }
  }
  
  /**
   * Signal end of streaming
   */
  endStreaming() {
    const element = document.querySelector(SELECTORS.AI_RESPONSE);
    if (element) {
      element.classList.remove('streaming-cursor');
    }
  }
  
  /**
   * Execute a timeline of animations
   * @param {Array} timeline - Array of animation steps
   */
  async executeTimeline(timeline) {
    for (const step of timeline) {
      const element = document.querySelector(step.element);
      if (!element) continue;
      
      switch (step.animation) {
        case 'fadeIn':
          await this.fadeIn(element, step.duration);
          break;
        case 'fadeOut':
          await this.fadeOut(element, step.duration);
          break;
        case 'slideDown':
          await this.slideDown(element, step.duration);
          break;
        case 'slideUp':
          await this.slideUp(element, step.duration);
          break;
        default:
          console.warn(`Unknown animation: ${step.animation}`);
      }
      
      // Optional delay between steps
      if (step.delay) {
        await this.delay(step.delay);
      }
    }
  }
  
  /**
   * Utility: Delay execution
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Fade in animation with visibility handling
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   */
  async fadeIn(element, duration = 300) {
    if (!element) return;
    
    // Respect user preference for reduced motion
    const actualDuration = this.prefersReducedMotion() ? 0 : duration;
    
    // Setup initial state
    element.style.opacity = '0';
    element.style.visibility = 'visible';
    element.classList.remove('hidden');
    
    // Force reflow to ensure initial state is applied
    element.offsetHeight;
    
    // Animate
    element.style.transition = `opacity ${actualDuration}ms ease-out`;
    element.style.opacity = '1';
    
    await this.delay(actualDuration);
    
    // Cleanup
    element.style.transition = '';
  }
  
  /**
   * Fade out animation with visibility handling
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   */
  async fadeOut(element, duration = 300) {
    if (!element) return;
    
    const actualDuration = this.prefersReducedMotion() ? 0 : duration;
    
    element.style.transition = `opacity ${actualDuration}ms ease-out`;
    element.style.opacity = '0';
    
    await this.delay(actualDuration);
    
    // Hide after animation
    element.style.visibility = 'hidden';
    element.classList.add('hidden');
    
    // Cleanup
    element.style.transition = '';
  }
  
  /**
   * Slide down animation
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   */
  async slideDown(element, duration = 300) {
    if (!element) return;
    
    const adjustedDuration = this.getAnimationDuration(duration);
    
    element.style.transition = `transform ${adjustedDuration}ms ease-out, opacity ${adjustedDuration}ms ease-out`;
    element.style.transform = 'translateY(-20px)';
    element.style.opacity = '0';
    element.classList.remove('hidden');
    
    // Trigger reflow
    element.offsetHeight;
    
    element.style.transform = 'translateY(0)';
    element.style.opacity = '1';
    await this.delay(adjustedDuration);
  }
  
  /**
   * Slide up animation
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   */
  async slideUp(element, duration = 300) {
    if (!element) return;
    
    const adjustedDuration = this.getAnimationDuration(duration);
    
    element.style.transition = `transform ${adjustedDuration}ms ease-out, opacity ${adjustedDuration}ms ease-out`;
    element.style.transform = 'translateY(0)';
    element.style.opacity = '1';
    
    // Trigger reflow
    element.offsetHeight;
    
    element.style.transform = 'translateY(-20px)';
    element.style.opacity = '0';
    await this.delay(adjustedDuration);
    element.classList.add('hidden');
  }
  
  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /**
   * Get animation duration based on user preferences
   * @param {number} defaultDuration - Default duration in ms
   * @returns {number} Adjusted duration
   */
  getAnimationDuration(defaultDuration) {
    if (this.prefersReducedMotion()) {
      return 0; // Instant for reduced motion
    }
    return defaultDuration;
  }
  
  /**
   * Request animation frame wrapper for smooth animations
   * @param {Function} callback - Animation callback
   */
  requestFrame(callback) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        callback();
        resolve();
      });
    });
  }
  
  /**
   * Batch DOM reads/writes for better performance
   * @param {Function} readCallback - DOM read operations
   * @param {Function} writeCallback - DOM write operations
   */
  async batchDOMOperations(readCallback, writeCallback) {
    // Read phase
    const data = readCallback();
    
    // Write phase in next frame
    await this.requestFrame(() => writeCallback(data));
  }
  
  /**
   * Perform smooth layout change
   * Uses auto-animate technique for unknown height changes
   * @param {HTMLElement} container - Container element
   * @param {Function} updateFn - Function that changes layout
   */
  async smoothLayoutChange(container, updateFn) {
    if (!container) return;
    
    // Record current state
    const children = Array.from(container.children).map(child => ({
      el: child,
      rect: child.getBoundingClientRect()
    }));
    
    // Perform update
    await updateFn();
    
    // Calculate and apply inverse transforms
    children.forEach(({ el, rect: oldRect }) => {
      if (!el.getBoundingClientRect) return;
      
      const newRect = el.getBoundingClientRect();
      const deltaX = oldRect.left - newRect.left;
      const deltaY = oldRect.top - newRect.top;
      const scaleX = oldRect.width / newRect.width || 1;
      const scaleY = oldRect.height / newRect.height || 1;
      
      el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
      el.style.transformOrigin = 'top left';
      
      // Force reflow
      el.offsetHeight;
      
      // Animate to final state
      el.style.transition = 'transform 300ms ease-out';
      el.style.transform = '';
    });
    
    await this.delay(300);
    
    // Cleanup
    children.forEach(({ el }) => {
      el.style.transition = '';
      el.style.transformOrigin = '';
    });
  }
  
  /**
   * Promote element to GPU layer for better performance
   * @param {HTMLElement} element
   */
  promoteToGPU(element) {
    if (!element) return;
    element.style.willChange = 'transform, opacity';
    element.style.transform = 'translateZ(0)';
  }
  
  /**
   * Demote element from GPU layer (cleanup)
   * @param {HTMLElement} element
   */
  demoteFromGPU(element) {
    if (!element) return;
    element.style.willChange = 'auto';
    element.style.transform = '';
  }
  
  /**
   * Batch animation start for multiple elements
   * Reduces layout thrashing
   * @param {Array<{element: HTMLElement, animation: Function, duration: number}>} animations
   */
  async batchAnimate(animations) {
    if (!animations || animations.length === 0) return;
    
    // Read phase: collect all initial states
    const states = animations.map(({ element }) => ({
      rect: element?.getBoundingClientRect(),
    }));
    
    // Write phase: start all animations
    requestAnimationFrame(() => {
      animations.forEach(({ element, animation }) => {
        if (!element || !animation) return;
        this.promoteToGPU(element);
        animation(element);
      });
    });
    
    // Wait for longest animation
    const maxDuration = Math.max(
      ...animations.map(a => a.duration || 300)
    );
    await this.delay(maxDuration);
    
    // Cleanup phase
    animations.forEach(({ element }) => {
      this.demoteFromGPU(element);
    });
  }
  
  /**
   * Show streaming cursor
   * @param {HTMLElement} element
   */
  showCursor(element) {
    element?.classList.add('streaming-cursor');
    element?.classList.remove('complete');
  }
  
  /**
   * Hide streaming cursor
   * @param {HTMLElement} element
   */
  hideCursor(element) {
    element?.classList.add('complete');
    
    // Remove cursor class after a short delay
    setTimeout(() => {
      element?.classList.remove('streaming-cursor', 'complete');
    }, 100);
  }
}
