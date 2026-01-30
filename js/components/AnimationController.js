/**
 * AnimationController - Manages all animations in the application
 */

import { ANIMATION_DURATION, SELECTORS, TYPING_SPEED } from '../utils/constants.js';

export class AnimationController {
  constructor() {
    this.isAnimating = false;
    this.currentState = 'initial'; // 'initial' or 'chat'
    
    // FIFO queue for rate-limited output
    this.contentQueue = [];
    this.queueIndex = 0; // Track current position in queue (avoids shift() O(n) cost)
    this.isProcessingQueue = false;
    this.queueInterval = null;
    this.endStreamingInterval = null;
    this.accumulatedHTML = ''; // Accumulated HTML string
    
    this.init();
  }
  
  /**
   * Initialize animation controller
   */
  init() {
    // Cache DOM elements
    this.heroContainer = document.querySelector('.hero-container');
    this.heroTitle = document.querySelector('.hero-title');
    // Note: heroSubtitle and usageHint removed from DOM
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
      chatHeader: document.querySelector('.chat-header'),
      topicSection: this.topicSection,
      aiResponseContainer: this.aiResponseContainer,
    };
    
    try {
      // Phase 1: Fade out initial elements (300ms)
      // Note: heroSubtitle and usageHint removed from DOM
      const fadeOutPromises = [
        this.fadeOut(elements.heroTitle, 300),
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
      
      // Step 3: Reset hero elements visibility before fade in
      // 重要：確保所有子元素的 hidden class 被移除
      const heroTitle = this.heroTitle || document.querySelector('.hero-title');
      
      if (heroTitle) {
        heroTitle.classList.remove('hidden');
        heroTitle.style.visibility = 'visible';
        heroTitle.style.opacity = '0';
      }
      if (this.heroContainer) {
        this.heroContainer.classList.remove('hidden');
        this.heroContainer.style.visibility = 'visible';
        this.heroContainer.style.opacity = '0';
      }
      
      // Step 4: Show initial state elements with fade in
      // Note: heroSubtitle and usageHint removed from DOM
      await Promise.all([
        this.fadeIn(this.heroContainer, ANIMATION_DURATION.FADE_IN),
        heroTitle ? this.fadeIn(heroTitle, ANIMATION_DURATION.FADE_IN) : Promise.resolve()
      ]);
      
      this.currentState = 'initial';
    } finally {
      this.isAnimating = false;
    }
  }
  
  /**
   * Parse HTML content into tokens (text and HTML tags)
   * @param {string} content - Content with HTML tags
   * @returns {Array} Array of tokens
   */
  parseHTMLTokens(content) {
    const tokens = [];
    let currentPos = 0;
    const tagRegex = /<[^>]+>/g;
    let match;
    
    while ((match = tagRegex.exec(content)) !== null) {
      // Add text before tag
      if (match.index > currentPos) {
        const textBefore = content.substring(currentPos, match.index);
        // Split text into individual characters
        for (const char of textBefore) {
          tokens.push({ type: 'char', content: char });
        }
      }
      
      // Add the HTML tag as a single token
      tokens.push({ type: 'tag', content: match[0] });
      currentPos = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentPos < content.length) {
      const remainingText = content.substring(currentPos);
      for (const char of remainingText) {
        tokens.push({ type: 'char', content: char });
      }
    }
    
    return tokens;
  }

  /**
   * Start processing the FIFO queue at 100ms intervals (10 chars/sec)
   * @param {HTMLElement} element - Target element
   */
  startQueueProcessing(element) {
    if (!element) return;
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    this.accumulatedHTML = element.innerHTML;
    
    this.queueInterval = setInterval(() => {
      if (this.queueIndex >= this.contentQueue.length) {
        return;
      }
      
      const token = this.contentQueue[this.queueIndex++];
      this.accumulatedHTML += token.content;
      element.innerHTML = this.accumulatedHTML;
    }, 100); // 100ms = 10 characters per second
  }

  /**
   * Stop processing the FIFO queue
   */
  stopQueueProcessing() {
    if (this.queueInterval) {
      clearInterval(this.queueInterval);
      this.queueInterval = null;
    }
    if (this.endStreamingInterval) {
      clearInterval(this.endStreamingInterval);
      this.endStreamingInterval = null;
    }
    this.isProcessingQueue = false;
    this.queueIndex = 0;
    this.accumulatedHTML = '';
  }

  /**
   * Add content to the FIFO queue
   * @param {string} content - Content to add (may contain HTML)
   */
  enqueueContent(content) {
    const tokens = this.parseHTMLTokens(content);
    this.contentQueue.push(...tokens);
  }

  /**
   * Clear the FIFO queue
   */
  clearQueue() {
    this.contentQueue = [];
    this.queueIndex = 0;
    this.stopQueueProcessing();
  }

  /**
   * Display text with typewriter effect (HTML-safe)
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to display (may contain HTML)
   * @param {number} speed - Milliseconds per character (default 200 for rate limit)
   * @param {Function} onChar - Callback for each character
   */
  async typewriterEffect(element, text, speed = 200, onChar = null) {
    if (!element || !text) return;
    
    const adjustedSpeed = this.getAnimationDuration(speed);
    
    element.innerHTML = '';
    this.showCursor(element);
    
    // Parse HTML tokens
    const tokens = this.parseHTMLTokens(text);
    let accumulatedHTML = '';
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      accumulatedHTML += token.content;
      element.innerHTML = accumulatedHTML;
      
      // Callback for custom handling
      if (onChar) {
        onChar(token.content, i, tokens.length);
      }
      
      // Variable speed: pause longer on punctuation (only for characters, not tags)
      let delay = adjustedSpeed;
      if (token.type === 'char') {
        if ('，。！？、'.includes(token.content)) {
          delay = adjustedSpeed * 3;
        } else if (',.!?;:'.includes(token.content)) {
          delay = adjustedSpeed * 2;
        }
      }
      
      await this.delay(delay);
    }
    
    this.hideCursor(element);
  }
  
  /**
   * Append text character by character (for streaming with FIFO queue)
   * @param {string} text - Text chunk to append (may contain HTML)
   */
  async appendText(text) {
    const element = document.querySelector(SELECTORS.AI_RESPONSE);
    if (!element) return;
    
    // Add cursor class if not present
    if (!element.classList.contains('streaming-cursor')) {
      element.classList.add('streaming-cursor');
    }
    
    // Start queue processing if not already started
    if (!this.isProcessingQueue) {
      this.startQueueProcessing(element);
    }
    
    // Add content to FIFO queue
    this.enqueueContent(text);
  }
  
  /**
   * Signal end of streaming
   */
  endStreaming() {
    const element = document.querySelector(SELECTORS.AI_RESPONSE);
    if (!element) return;
    
    // Wait for queue to finish processing
    const checkQueue = setInterval(() => {
      if (this.queueIndex >= this.contentQueue.length) {
        clearInterval(checkQueue);
        this.stopQueueProcessing();
        
        // Clear processed queue to free memory
        this.contentQueue = [];
        this.queueIndex = 0;
        
        if (element) {
          element.classList.remove('streaming-cursor');
        }
      }
    }, 100);
    
    // Store interval for cleanup
    this.endStreamingInterval = checkQueue;
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
    
    // Calculate and apply inverse transforms (batched)
    children.forEach(({ el, rect: oldRect }) => {
      if (!el.getBoundingClientRect) return;
      
      const newRect = el.getBoundingClientRect();
      const deltaX = oldRect.left - newRect.left;
      const deltaY = oldRect.top - newRect.top;
      const scaleX = oldRect.width / newRect.width || 1;
      const scaleY = oldRect.height / newRect.height || 1;
      
      el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
      el.style.transformOrigin = 'top left';
    });
    
    // Force single reflow for all elements
    container.offsetHeight;
    
    // Animate to final state (batched)
    children.forEach(({ el }) => {
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
    // Don't clear transform as it may be used by other animations
  }
  
  /**
   * Batch animation start for multiple elements
   * Reduces layout thrashing
   * @param {Array<{element: HTMLElement, animation: Function, duration: number}>} animations
   */
  async batchAnimate(animations) {
    if (!animations || animations.length === 0) return;
    
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
