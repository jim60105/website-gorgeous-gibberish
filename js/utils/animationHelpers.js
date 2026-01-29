/**
 * Animation helper utilities for streaming text and animation control
 */

/**
 * Streaming text manager
 * Handles real-time text display from API streaming
 */
export class StreamingTextManager {
  constructor(element) {
    this.element = element;
    this.queue = [];
    this.isProcessing = false;
    this.minDelay = 10; // Minimum ms between characters
    this.lastUpdateTime = 0;
  }
  
  /**
   * Add text to the queue
   * @param {string} text - Text chunk from API
   */
  enqueue(text) {
    // Add each character to queue
    for (const char of text) {
      this.queue.push(char);
    }
    
    // Start processing if not already
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  /**
   * Process the character queue
   */
  async processQueue() {
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const char = this.queue.shift();
      
      // Ensure minimum delay between updates
      const now = performance.now();
      const elapsed = now - this.lastUpdateTime;
      
      if (elapsed < this.minDelay) {
        await this.delay(this.minDelay - elapsed);
      }
      
      // Append character
      this.element.textContent += char;
      this.lastUpdateTime = performance.now();
      
      // Yield to browser for smooth animation
      await this.yieldToBrowser();
    }
    
    this.isProcessing = false;
  }
  
  /**
   * Yield to browser to prevent UI blocking
   */
  yieldToBrowser() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }
  
  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Clear all content and queue
   */
  clear() {
    this.queue = [];
    this.element.textContent = '';
  }
}

/**
 * Animation speed controller
 */
export class AnimationSpeedController {
  constructor() {
    this.speedMultiplier = 1.0;
    this.presets = {
      slow: 2.0,
      normal: 1.0,
      fast: 0.5,
      instant: 0,
    };
  }
  
  /**
   * Set speed multiplier
   * @param {number|string} speed - Multiplier or preset name
   */
  setSpeed(speed) {
    if (typeof speed === 'string') {
      this.speedMultiplier = this.presets[speed] ?? 1.0;
    } else {
      this.speedMultiplier = Math.max(0, speed);
    }
  }
  
  /**
   * Get adjusted duration
   * @param {number} baseDuration - Base duration in ms
   * @returns {number} Adjusted duration
   */
  getDuration(baseDuration) {
    // Instant mode
    if (this.speedMultiplier === 0) {
      return 0;
    }
    
    return baseDuration * this.speedMultiplier;
  }
  
  /**
   * Check if animations should be skipped
   * @returns {boolean}
   */
  shouldSkip() {
    return this.speedMultiplier === 0;
  }
}

/**
 * Pausable animation controller
 */
export class PausableAnimation {
  constructor() {
    this.isPaused = false;
    this.pendingResolvers = [];
    this.abortController = null;
  }
  
  /**
   * Pause all animations
   */
  pause() {
    this.isPaused = true;
  }
  
  /**
   * Resume all animations
   */
  resume() {
    this.isPaused = false;
    
    // Resolve all pending waiters
    this.pendingResolvers.forEach(resolve => resolve());
    this.pendingResolvers = [];
  }
  
  /**
   * Wait if paused
   * @returns {Promise<void>}
   */
  async waitIfPaused() {
    if (!this.isPaused) return;
    
    return new Promise(resolve => {
      this.pendingResolvers.push(resolve);
    });
  }
  
  /**
   * Abort all ongoing animations
   */
  abort() {
    this.abortController?.abort();
    this.pendingResolvers.forEach(resolve => resolve());
    this.pendingResolvers = [];
  }
  
  /**
   * Pausable delay function
   * @param {number} ms - Delay in milliseconds
   */
  async delay(ms) {
    // Check if paused before starting delay
    await this.waitIfPaused();
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, ms);
      
      // Allow abort to cancel the delay
      this.abortController = new AbortController();
      this.abortController.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        resolve();
      });
    });
  }
}

// Global speed controller instance
export const speedController = new AnimationSpeedController();

// Global pausable animation instance
export const pausableAnimation = new PausableAnimation();
