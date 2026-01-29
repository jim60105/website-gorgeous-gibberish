/**
 * Test helpers for integration tests
 * Utilities for loading HTML, waiting for conditions, and simulating user actions
 */

import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load HTML file content
 * @param {string} filename - HTML file name (e.g., 'index.html')
 * @returns {Promise<string>} HTML content
 */
export async function loadHTML(filename) {
  const htmlPath = path.join(__dirname, '../../', filename);
  return fs.readFileSync(htmlPath, 'utf-8');
}

/**
 * Wait for a condition to be true
 * @param {Function} condition - Function that returns boolean
 * @param {Object} options - Options {timeout, interval}
 * @returns {Promise<void>}
 */
export async function waitFor(condition, options = {}) {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
}

/**
 * Simulate sending a message
 * @param {string} message - Message to send
 * @returns {Promise<void>}
 */
export async function sendMessage(message) {
  const input = document.querySelector('#user-input') || document.querySelector('#user-input-chat');
  const sendButton = document.querySelector('#send-button') || document.querySelector('#send-button-chat');
  
  if (!input || !sendButton) {
    throw new Error('Input or send button not found');
  }
  
  input.value = message;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  
  sendButton.click();
}

/**
 * Wait for AI response to complete
 * @param {Object} options - Options {timeout}
 * @returns {Promise<void>}
 */
export async function waitForResponse(options = {}) {
  const { timeout = 10000 } = options;
  
  await waitFor(() => {
    const responseElement = document.querySelector('#ai-response');
    if (!responseElement) return false;
    
    // Check if streaming has completed (no cursor class)
    const isStreaming = responseElement.classList.contains('streaming-cursor');
    const hasContent = responseElement.textContent.length > 0;
    
    return !isStreaming && hasContent;
  }, { timeout });
}

/**
 * Initialize the application
 * Imports and runs main.js initialization
 * @returns {Promise<void>}
 */
export async function initializeApp() {
  // Import main module
  const mainModule = await import('../../js/main.js');
  
  // The main.js should auto-initialize on load
  // Wait for initialization to complete
  await waitFor(() => {
    return document.querySelector('#user-input') !== null;
  }, { timeout: 2000 });
}

/**
 * Clean up DOM and reset application state
 */
export function cleanupApp() {
  document.body.innerHTML = '';
  
  // Clear any timers or event listeners
  jest.clearAllTimers();
  jest.clearAllMocks();
}

/**
 * Mock OpenAI service responses for integration tests
 * @param {Object} mockResponses - Custom response configuration
 */
export function mockOpenAIResponses(mockResponses = {}) {
  const {
    response = 'This is a mocked AI response for integration testing.',
    streamChunks = ['This ', 'is ', 'a ', 'mocked ', 'response.'],
    shouldError = false,
    errorType = 'network'
  } = mockResponses;
  
  // This will be used by integration tests to control API behavior
  global.__mockOpenAIConfig = {
    response,
    streamChunks,
    shouldError,
    errorType
  };
}

/**
 * Get current conversation state
 * @returns {Object} Conversation state
 */
export function getConversationState() {
  const dots = document.querySelector('#conversation-dots');
  const response = document.querySelector('#ai-response');
  const topic = document.querySelector('#topic-display');
  
  return {
    messageCount: dots ? (dots.innerHTML.match(/●/g) || []).length : 0,
    hasResponse: response ? response.textContent.length > 0 : false,
    currentTopic: topic ? topic.textContent : '',
    isInChatMode: !document.querySelector('.hero-title')?.classList.contains('hidden') === false
  };
}

/**
 * Assert element visibility
 * @param {string} selector - Element selector
 * @param {boolean} shouldBeVisible - Expected visibility
 */
export function assertElementVisibility(selector, shouldBeVisible) {
  const element = document.querySelector(selector);
  
  if (!element) {
    throw new Error(`Element ${selector} not found`);
  }
  
  const isVisible = !element.classList.contains('hidden') && 
                    element.style.visibility !== 'hidden' &&
                    element.style.display !== 'none';
  
  if (isVisible !== shouldBeVisible) {
    throw new Error(
      `Element ${selector} visibility mismatch. Expected: ${shouldBeVisible}, Got: ${isVisible}`
    );
  }
}
