/**
 * OpenAI Service - Handles all OpenAI API communications
 */

import OpenAI from 'openai';
import { API_CONFIG } from '../config/api.js';
import { APIErrorHandler } from './APIErrorHandler.js';
import { errorLogger } from './ErrorLogger.js';

export class OpenAIService {
  constructor() {
    // Initialize with hardcoded configuration
    this.client = new OpenAI({
      apiKey: API_CONFIG.apiKey,
      baseURL: API_CONFIG.baseURL,
      dangerouslyAllowBrowser: true // Required for browser-based apps
    });
    
    console.log('OpenAI Service initialized with custom backend');
  }
  
  /**
   * Get current configuration
   * @returns {Object}
   */
  getConfig() {
    return {
      model: API_CONFIG.model,
      maxTokens: API_CONFIG.maxTokens,
      temperature: API_CONFIG.temperature,
      baseURL: API_CONFIG.baseURL
    };
  }

  /**
   * Send a non-streaming chat completion request
   * @param {Array} messages - Conversation messages
   * @returns {Promise<string>} AI response content
   */
  async sendMessage(messages) {
    try {
      const response = await this.client.chat.completions.create({
        model: API_CONFIG.model,
        messages: messages,
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        frequency_penalty: 0.1,
        presence_penalty: 0.0,
        top_p: 1.0,
        reasoning_effort: 'medium',
      });
      
      if (!this.validateResponse(response)) {
        throw new Error('Invalid response from API');
      }
      
      return response.choices[0]?.message?.content || '';
      
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Log error with context
      errorLogger.log(error, {
        method: 'sendMessage',
        messageCount: messages.length,
      });
      
      // Handle and transform error
      const errorInfo = APIErrorHandler.handle(error);
      const transformedError = new Error(errorInfo.message);
      transformedError.type = errorInfo.type;
      transformedError.canRetry = errorInfo.canRetry;
      transformedError.suggestion = errorInfo.suggestion;
      
      throw transformedError;
    }
  }

  /**
   * Send a streaming chat completion request
   * @param {Array} messages - Conversation messages
   * @param {Object} callbacks - Callbacks { onChunk, onComplete, onError }
   * @returns {Promise<void>}
   */
  async sendStreamingMessage(messages, { onChunk, onComplete, onError }) {
    let fullContent = '';
    
    try {
      const stream = await this.client.chat.completions.create({
        model: API_CONFIG.model,
        messages: messages,
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        stream: true,
        frequency_penalty: 0.1,
        presence_penalty: 0.0,
        top_p: 1.0,
        reasoning_effort: 'medium',
      });
      
      for await (const chunk of stream) {
        const content = this.validateStreamChunk(chunk);
        
        if (content) {
          fullContent += content;
          onChunk?.(content, fullContent);
        }
      }
      
      onComplete?.(fullContent);
      
    } catch (error) {
      console.error('Streaming error:', error);
      
      // Log error with context
      errorLogger.log(error, {
        method: 'sendStreamingMessage',
        messageCount: messages.length,
        partialContent: fullContent.substring(0, 100),
      });
      
      // Handle and transform error
      const errorInfo = APIErrorHandler.handle(error);
      const transformedError = new Error(errorInfo.message);
      transformedError.type = errorInfo.type;
      transformedError.canRetry = errorInfo.canRetry;
      transformedError.suggestion = errorInfo.suggestion;
      
      onError?.(transformedError);
    }
  }

  /**
   * Build messages array for API request
   * @param {string} userMessage - User's message
   * @param {Array} history - Conversation history (optional)
   * @returns {Array} Formatted messages array
   */
  buildMessages(userMessage, history = []) {
    const messages = [
      {
        role: 'system',
        content: API_CONFIG.systemPrompt
      }
    ];
    
    // Add conversation history if provided
    if (history.length > 0) {
      messages.push(...history);
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });
    
    return messages;
  }

  /**
   * Handle OpenAI API errors (Legacy - kept for compatibility)
   * @param {Error} error - The error object
   * @returns {Error} Formatted error with user-friendly message
   * @deprecated Use APIErrorHandler.handle() instead
   */
  handleError(error) {
    const errorInfo = APIErrorHandler.handle(error);
    const transformedError = new Error(errorInfo.message);
    transformedError.type = errorInfo.type;
    transformedError.canRetry = errorInfo.canRetry;
    
    return transformedError;
  }

  /**
   * Validate API response structure
   * @param {Object} response - API response object
   * @returns {boolean}
   */
  validateResponse(response) {
    if (!response) {
      console.error('Empty response from API');
      return false;
    }
    
    if (!response.choices || response.choices.length === 0) {
      console.error('No choices in API response');
      return false;
    }
    
    const content = response.choices[0]?.message?.content;
    if (content === undefined || content === null) {
      console.error('No content in API response');
      return false;
    }
    
    return true;
  }

  /**
   * Validate streaming chunk
   * @param {Object} chunk - Streaming chunk
   * @returns {string|null} Content or null if invalid
   */
  validateStreamChunk(chunk) {
    if (!chunk || !chunk.choices || chunk.choices.length === 0) {
      return null;
    }
    
    const delta = chunk.choices[0]?.delta;
    if (!delta) return null;
    
    return delta.content || null;
  }
}

/**
 * StreamParser - Utility class for parsing streaming responses
 */
export class StreamParser {
  constructor() {
    this.buffer = '';
    this.totalLength = 0;
  }
  
  /**
   * Parse incoming chunk and extract content
   * @param {Object} chunk - SSE chunk from OpenAI
   * @returns {Object} Parsed result
   */
  parseChunk(chunk) {
    const result = {
      content: '',
      isComplete: false,
      finishReason: null,
    };
    
    if (!chunk?.choices?.[0]) {
      return result;
    }
    
    const choice = chunk.choices[0];
    
    // Check for finish reason
    if (choice.finish_reason) {
      result.isComplete = true;
      result.finishReason = choice.finish_reason;
    }
    
    // Extract content from delta
    if (choice.delta?.content) {
      result.content = choice.delta.content;
      this.buffer += result.content;
      this.totalLength += result.content.length;
    }
    
    return result;
  }
  
  /**
   * Get current buffer content
   * @returns {string}
   */
  getBuffer() {
    return this.buffer;
  }
  
  /**
   * Get total character count
   * @returns {number}
   */
  getTotalLength() {
    return this.totalLength;
  }
  
  /**
   * Reset parser state
   */
  reset() {
    this.buffer = '';
    this.totalLength = 0;
  }
}
