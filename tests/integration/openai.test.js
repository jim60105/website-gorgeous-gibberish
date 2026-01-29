/**
 * Integration tests for OpenAI API
 * Task 7.2.2: 測試 OpenAI API 整合
 * 
 * Note: All tests use mocked OpenAI client - no real API calls
 */

import { jest } from '@jest/globals';

// Mock OpenAI before importing
jest.mock('openai');

import { OpenAIService } from '../../js/services/OpenAIService.js';
import MockOpenAI from 'openai';

describe('OpenAI Integration', () => {
  let openAIService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    openAIService = new OpenAIService();
  });
  
  describe('Message sending and receiving', () => {
    test('should send message and receive response', async () => {
      // Mock response
      openAIService.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: { content: 'Test response from AI' },
          finish_reason: 'stop',
        }],
      });
      
      const messages = openAIService.buildMessages('Hello');
      const response = await openAIService.sendMessage(messages);
      
      expect(response).toBe('Test response from AI');
      expect(openAIService.client.chat.completions.create).toHaveBeenCalled();
    });
    
    test('should include conversation history in messages', async () => {
      openAIService.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: { content: 'Response with history' },
          finish_reason: 'stop',
        }],
      });
      
      const history = [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ];
      
      const messages = openAIService.buildMessages('Current message', history);
      const response = await openAIService.sendMessage(messages);
      
      expect(messages).toHaveLength(4); // system + 2 history + current
      expect(response).toBe('Response with history');
    });
    
    test('should handle empty response gracefully', async () => {
      openAIService.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: { content: '' },
          finish_reason: 'stop',
        }],
      });
      
      const messages = openAIService.buildMessages('Test');
      const response = await openAIService.sendMessage(messages);
      
      expect(response).toBe('');
    });
  });
  
  describe('Streaming response handling', () => {
    test('should handle streaming response', async () => {
      const chunks = ['Hello', ' ', 'World', '!'];
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of chunks) {
            yield {
              choices: [{ delta: { content: chunk } }],
            };
          }
        },
      };
      
      openAIService.client.chat.completions.create.mockResolvedValue(mockStream);
      
      const receivedChunks = [];
      let fullContent = '';
      
      await openAIService.sendStreamingMessage(
        openAIService.buildMessages('Hi'),
        {
          onChunk: (chunk, full) => {
            receivedChunks.push(chunk);
            fullContent = full;
          },
          onComplete: jest.fn(),
          onError: jest.fn(),
        }
      );
      
      expect(receivedChunks).toEqual(chunks);
      expect(fullContent).toBe('Hello World!');
    });
    
    test('should call onComplete with full content', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Complete' } }] };
          yield { choices: [{ delta: { content: ' text' } }] };
        },
      };
      
      openAIService.client.chat.completions.create.mockResolvedValue(mockStream);
      
      const onComplete = jest.fn();
      
      await openAIService.sendStreamingMessage(
        openAIService.buildMessages('Test'),
        {
          onChunk: jest.fn(),
          onComplete,
          onError: jest.fn(),
        }
      );
      
      expect(onComplete).toHaveBeenCalledWith('Complete text');
    });
    
    test('should handle empty chunks in stream', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: {} }] }; // Empty chunk
          yield { choices: [{ delta: { content: ' World' } }] };
        },
      };
      
      openAIService.client.chat.completions.create.mockResolvedValue(mockStream);
      
      let fullContent = '';
      
      await openAIService.sendStreamingMessage(
        openAIService.buildMessages('Test'),
        {
          onChunk: (chunk, full) => { fullContent = full; },
          onComplete: jest.fn(),
          onError: jest.fn(),
        }
      );
      
      expect(fullContent).toBe('Hello World');
    });
  });
  
  describe('API error handling', () => {
    test('should handle API errors gracefully', async () => {
      const error = new MockOpenAI.APIError('API Error', 429);
      openAIService.client.chat.completions.create.mockRejectedValue(error);
      
      const onError = jest.fn();
      
      await openAIService.sendStreamingMessage(
        openAIService.buildMessages('Hi'),
        {
          onChunk: jest.fn(),
          onComplete: jest.fn(),
          onError,
        }
      );
      
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toContain('頻繁');
    });
    
    test('should handle 401 unauthorized error', async () => {
      const error = new MockOpenAI.APIError('Unauthorized', 401);
      openAIService.client.chat.completions.create.mockRejectedValue(error);
      
      await expect(
        openAIService.sendMessage(openAIService.buildMessages('Test'))
      ).rejects.toThrow();
    });
    
    test('should handle 500 server error', async () => {
      const error = new MockOpenAI.APIError('Internal Server Error', 500);
      openAIService.client.chat.completions.create.mockRejectedValue(error);
      
      const onError = jest.fn();
      
      await openAIService.sendStreamingMessage(
        openAIService.buildMessages('Test'),
        {
          onChunk: jest.fn(),
          onComplete: jest.fn(),
          onError,
        }
      );
      
      expect(onError).toHaveBeenCalled();
      const errorArg = onError.mock.calls[0][0];
      expect(errorArg.canRetry).toBe(true);
    });
    
    test('should handle network errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      openAIService.client.chat.completions.create.mockRejectedValue(networkError);
      
      await expect(
        openAIService.sendMessage(openAIService.buildMessages('Test'))
      ).rejects.toThrow();
    });
  });
  
  describe('Response validation', () => {
    test('should validate correct response structure', () => {
      const validResponse = {
        choices: [{
          message: { content: 'Valid response' },
        }],
      };
      
      expect(openAIService.validateResponse(validResponse)).toBe(true);
    });
    
    test('should reject invalid response structure', () => {
      const invalidResponse = {
        choices: [],
      };
      
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
  
  describe('Message building', () => {
    test('should build messages with system prompt', () => {
      const messages = openAIService.buildMessages('User message');
      
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toBe('User message');
    });
    
    test('should include conversation history', () => {
      const history = [
        { role: 'user', content: 'First' },
        { role: 'assistant', content: 'Response' }
      ];
      
      const messages = openAIService.buildMessages('Second', history);
      
      expect(messages).toHaveLength(4);
      expect(messages[1]).toEqual({ role: 'user', content: 'First' });
      expect(messages[2]).toEqual({ role: 'assistant', content: 'Response' });
    });
    
    test('should handle empty history', () => {
      const messages = openAIService.buildMessages('Message', []);
      
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
    });
  });
  
  describe('Configuration', () => {
    test('should have correct configuration', () => {
      const config = openAIService.getConfig();
      
      expect(config).toHaveProperty('model');
      expect(config).toHaveProperty('maxTokens');
      expect(config).toHaveProperty('temperature');
      expect(config).toHaveProperty('baseURL');
    });
    
    test('should use configured model and parameters', async () => {
      openAIService.client.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });
      
      await openAIService.sendMessage(openAIService.buildMessages('Test'));
      
      const callArgs = openAIService.client.chat.completions.create.mock.calls[0][0];
      expect(callArgs).toHaveProperty('model');
      expect(callArgs).toHaveProperty('max_tokens');
      expect(callArgs).toHaveProperty('temperature');
    });
  });
});
