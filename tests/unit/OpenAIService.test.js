/**
 * Unit tests for OpenAIService
 * Task 7.1.4: 測試 OpenAI API 通信模組
 * 
 * Note: All tests use mocked OpenAI client - no real API calls
 */

import { jest } from '@jest/globals';

// Mock OpenAI before importing
jest.mock('openai');

import { OpenAIService, StreamParser } from '../../js/services/OpenAIService.js';
import MockOpenAI from 'openai';

describe('OpenAIService', () => {
  let openAIService;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create service with mock client
    openAIService = new OpenAIService();
  });
  
  describe('initialization', () => {
    test('should initialize with OpenAI client', () => {
      expect(openAIService.client).toBeDefined();
      expect(openAIService.client).toBeInstanceOf(MockOpenAI);
    });
    
    test('should have chat completions interface', () => {
      expect(openAIService.client.chat).toBeDefined();
      expect(openAIService.client.chat.completions).toBeDefined();
      expect(openAIService.client.chat.completions.create).toBeDefined();
    });
  });
  
  describe('getConfig', () => {
    test('should return configuration object', () => {
      const config = openAIService.getConfig();
      
      expect(config).toHaveProperty('model');
      expect(config).toHaveProperty('maxTokens');
      expect(config).toHaveProperty('temperature');
      expect(config).toHaveProperty('baseURL');
    });
  });
  
  describe('buildMessages', () => {
    test('should build correct message array', () => {
      const messages = openAIService.buildMessages('Hello', []);
      
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toBe('Hello');
    });
    
    test('should include conversation history', () => {
      const history = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' }
      ];
      const messages = openAIService.buildMessages('How are you?', history);
      
      expect(messages).toHaveLength(4); // system + 2 history + current
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toBe('Hi');
      expect(messages[2].role).toBe('assistant');
      expect(messages[2].content).toBe('Hello');
      expect(messages[3].role).toBe('user');
      expect(messages[3].content).toBe('How are you?');
    });
    
    test('should always include system message first', () => {
      const messages = openAIService.buildMessages('Test');
      
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toBeTruthy();
    });
    
    test('should handle empty history', () => {
      const messages = openAIService.buildMessages('Test', []);
      
      expect(messages).toHaveLength(2);
    });
  });
  
  describe('sendMessage', () => {
    test('should call API and return response', async () => {
      const messages = openAIService.buildMessages('Test');
      const response = await openAIService.sendMessage(messages);
      
      expect(openAIService.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: messages,
          model: expect.any(String),
          max_tokens: expect.any(Number),
          temperature: expect.any(Number),
        })
      );
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
    });
    
    test('should throw error on invalid response', async () => {
      // Mock invalid response
      openAIService.client.chat.completions.create.mockResolvedValueOnce({
        choices: [],
      });
      
      await expect(openAIService.sendMessage([])).rejects.toThrow();
    });
    
    test('should transform API errors', async () => {
      const apiError = new MockOpenAI.APIError('Unauthorized', 401);
      openAIService.client.chat.completions.create.mockRejectedValueOnce(apiError);
      
      await expect(openAIService.sendMessage([])).rejects.toThrow();
    });
  });
  
  describe('sendStreamingMessage', () => {
    test('should handle streaming response', async () => {
      const messages = openAIService.buildMessages('Test');
      const chunks = [];
      let fullContent = '';
      
      await openAIService.sendStreamingMessage(messages, {
        onChunk: (chunk, full) => {
          chunks.push(chunk);
          fullContent = full;
        },
        onComplete: jest.fn(),
        onError: jest.fn(),
      });
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(fullContent.length).toBeGreaterThan(0);
    });
    
    test('should call onComplete with full content', async () => {
      const messages = openAIService.buildMessages('Test');
      const onComplete = jest.fn();
      
      await openAIService.sendStreamingMessage(messages, {
        onChunk: jest.fn(),
        onComplete,
        onError: jest.fn(),
      });
      
      expect(onComplete).toHaveBeenCalledWith(expect.any(String));
    });
    
    test('should call onError on failure', async () => {
      const error = new Error('Stream error');
      openAIService.client.chat.completions.create.mockRejectedValueOnce(error);
      
      const onError = jest.fn();
      await openAIService.sendStreamingMessage([], {
        onChunk: jest.fn(),
        onComplete: jest.fn(),
        onError,
      });
      
      expect(onError).toHaveBeenCalled();
    });
    
    test('should accumulate full content from chunks', async () => {
      const messages = openAIService.buildMessages('Test');
      let receivedFullContent = '';
      
      await openAIService.sendStreamingMessage(messages, {
        onChunk: (chunk, full) => {
          receivedFullContent = full;
        },
        onComplete: (final) => {
          expect(final).toBe(receivedFullContent);
        },
        onError: jest.fn(),
      });
    });
  });
  
  describe('validateResponse', () => {
    test('should validate correct response', () => {
      const validResponse = {
        choices: [{
          message: { content: 'Response' },
        }],
      };
      
      expect(openAIService.validateResponse(validResponse)).toBe(true);
    });
    
    test('should reject empty response', () => {
      expect(openAIService.validateResponse(null)).toBe(false);
      expect(openAIService.validateResponse(undefined)).toBe(false);
    });
    
    test('should reject response without choices', () => {
      const invalidResponse = { choices: [] };
      
      expect(openAIService.validateResponse(invalidResponse)).toBe(false);
    });
    
    test('should reject response without content', () => {
      const invalidResponse = {
        choices: [{
          message: {},
        }],
      };
      
      expect(openAIService.validateResponse(invalidResponse)).toBe(false);
    });
  });
  
  describe('validateStreamChunk', () => {
    test('should validate correct chunk', () => {
      const validChunk = {
        choices: [{
          delta: { content: 'text' },
        }],
      };
      
      const content = openAIService.validateStreamChunk(validChunk);
      expect(content).toBe('text');
    });
    
    test('should return null for invalid chunk', () => {
      expect(openAIService.validateStreamChunk(null)).toBeNull();
      expect(openAIService.validateStreamChunk({})).toBeNull();
      expect(openAIService.validateStreamChunk({ choices: [] })).toBeNull();
    });
    
    test('should return null for chunk without content', () => {
      const chunk = {
        choices: [{
          delta: {},
        }],
      };
      
      expect(openAIService.validateStreamChunk(chunk)).toBeNull();
    });
  });
  
  describe('handleError (legacy)', () => {
    test('should transform APIError', () => {
      const apiError = new MockOpenAI.APIError('Rate limit', 429);
      const transformed = openAIService.handleError(apiError);
      
      expect(transformed).toBeInstanceOf(Error);
      expect(transformed.message).toBeTruthy();
      expect(transformed.type).toBeDefined();
    });
    
    test('should handle 401 unauthorized', () => {
      const error = new MockOpenAI.APIError('Unauthorized', 401);
      const transformed = openAIService.handleError(error);
      
      expect(transformed.message).toContain('金鑰');
    });
    
    test('should handle 429 rate limit', () => {
      const error = new MockOpenAI.APIError('Rate limit exceeded', 429);
      const transformed = openAIService.handleError(error);
      
      expect(transformed.message).toContain('頻繁');
    });
  });
});

describe('StreamParser', () => {
  let parser;
  
  beforeEach(() => {
    parser = new StreamParser();
  });
  
  describe('initialization', () => {
    test('should start with empty buffer', () => {
      expect(parser.getBuffer()).toBe('');
      expect(parser.getTotalLength()).toBe(0);
    });
  });
  
  describe('parseChunk', () => {
    test('should parse valid chunk', () => {
      const chunk = {
        choices: [{
          delta: { content: 'Hello' },
        }],
      };
      
      const result = parser.parseChunk(chunk);
      
      expect(result.content).toBe('Hello');
      expect(result.isComplete).toBe(false);
      expect(parser.getBuffer()).toBe('Hello');
    });
    
    test('should accumulate content', () => {
      const chunks = [
        { choices: [{ delta: { content: 'Hello' } }] },
        { choices: [{ delta: { content: ' ' } }] },
        { choices: [{ delta: { content: 'World' } }] },
      ];
      
      chunks.forEach(chunk => parser.parseChunk(chunk));
      
      expect(parser.getBuffer()).toBe('Hello World');
      expect(parser.getTotalLength()).toBe(11);
    });
    
    test('should detect completion', () => {
      const finalChunk = {
        choices: [{
          delta: {},
          finish_reason: 'stop',
        }],
      };
      
      const result = parser.parseChunk(finalChunk);
      
      expect(result.isComplete).toBe(true);
      expect(result.finishReason).toBe('stop');
    });
    
    test('should handle invalid chunks', () => {
      const result = parser.parseChunk(null);
      
      expect(result.content).toBe('');
      expect(result.isComplete).toBe(false);
    });
  });
  
  describe('reset', () => {
    test('should clear buffer and counter', () => {
      parser.parseChunk({
        choices: [{ delta: { content: 'Test' } }],
      });
      
      expect(parser.getBuffer()).toBe('Test');
      
      parser.reset();
      
      expect(parser.getBuffer()).toBe('');
      expect(parser.getTotalLength()).toBe(0);
    });
  });
  
  describe('getTotalLength', () => {
    test('should track total character count', () => {
      const chunks = [
        { choices: [{ delta: { content: 'ABC' } }] },
        { choices: [{ delta: { content: 'DEF' } }] },
      ];
      
      chunks.forEach(chunk => parser.parseChunk(chunk));
      
      expect(parser.getTotalLength()).toBe(6);
    });
  });
});
