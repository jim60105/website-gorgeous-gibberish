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
    this.inputContainer = document.querySelector('#input-container');
    this.chatContainer = document.querySelector('#chat-container');
    this.chatHeader = document.querySelector('.chat-header');
    this.topicSection = document.querySelector('#topic-section');
    this.aiResponseContainer = document.querySelector('#ai-response-container');
  }
  
  /**
   * Transition from initial state to chat state
   */
  async transitionToChat() {
    if (this.isAnimating || this.currentState === 'chat') return;
    
    this.isAnimating = true;
    
    try {
      // Step 1: Fade out initial state elements
      const fadeOutPromises = [
        this.fadeOut(this.heroContainer, ANIMATION_DURATION.FADE_OUT)
      ];
      
      if (this.usageHint) {
        fadeOutPromises.push(this.fadeOut(this.usageHint, ANIMATION_DURATION.FADE_OUT));
      }
      
      await Promise.all(fadeOutPromises);
      
      // Hide initial input container
      if (this.inputContainer) {
        this.inputContainer.classList.add('hidden');
      }
      
      // Step 2: Show chat container
      if (this.chatContainer) {
        this.chatContainer.classList.remove('hidden');
      }
      
      // Step 3: Show chat elements with fade in
      await this.fadeIn(this.chatHeader, ANIMATION_DURATION.FADE_IN);
      await this.fadeIn(this.topicSection, ANIMATION_DURATION.FADE_IN);
      await this.fadeIn(this.aiResponseContainer, ANIMATION_DURATION.FADE_IN);
      
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
      await this.fadeOut(this.aiResponseContainer, ANIMATION_DURATION.FADE_OUT);
      await this.fadeOut(this.topicSection, ANIMATION_DURATION.FADE_OUT);
      await this.fadeOut(this.chatHeader, ANIMATION_DURATION.FADE_OUT);
      
      // Hide chat container
      if (this.chatContainer) {
        this.chatContainer.classList.add('hidden');
      }
      
      // Show initial input container
      if (this.inputContainer) {
        this.inputContainer.classList.remove('hidden');
      }
      
      // Step 2: Show initial state elements
      await this.fadeIn(this.heroContainer, ANIMATION_DURATION.FADE_IN);
      
      if (this.usageHint) {
        await this.fadeIn(this.usageHint, ANIMATION_DURATION.FADE_IN);
      }
      
      this.currentState = 'initial';
    } finally {
      this.isAnimating = false;
    }
  }
  
  /**
   * Display text with typewriter effect
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to display
   * @param {number} speed - Milliseconds per character
   */
  async typewriterEffect(element, text, speed = TYPING_SPEED) {
    if (!element) return;
    
    const adjustedSpeed = this.getAnimationDuration(speed);
    
    element.textContent = '';
    element.classList.add('streaming-cursor');
    
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await this.delay(adjustedSpeed);
    }
    
    element.classList.remove('streaming-cursor');
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
   * Fade in animation
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   */
  async fadeIn(element, duration = 300) {
    if (!element) return;
    
    const adjustedDuration = this.getAnimationDuration(duration);
    
    element.style.transition = `opacity ${adjustedDuration}ms ease-out`;
    element.style.opacity = '0';
    element.classList.remove('hidden');
    
    // Trigger reflow
    element.offsetHeight;
    
    element.style.opacity = '1';
    await this.delay(adjustedDuration);
  }
  
  /**
   * Fade out animation
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   */
  async fadeOut(element, duration = 300) {
    if (!element) return;
    
    const adjustedDuration = this.getAnimationDuration(duration);
    
    element.style.transition = `opacity ${adjustedDuration}ms ease-out`;
    element.style.opacity = '0';
    await this.delay(adjustedDuration);
    element.classList.add('hidden');
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
}
