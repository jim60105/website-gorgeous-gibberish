/**
 * Mock for OpenAI SDK
 * All tests should run without real API calls
 */

// Mock streaming chunk generator
async function* mockStreamGenerator(content) {
  const words = content.split(' ');
  for (const word of words) {
    yield {
      choices: [{
        delta: { content: word + ' ' },
        finish_reason: null,
      }],
    };
  }
  // Final chunk with finish reason
  yield {
    choices: [{
      delta: {},
      finish_reason: 'stop',
    }],
  };
}

// Mock OpenAI class
class MockOpenAI {
  constructor(config) {
    this.config = config;
    this.apiKey = config?.apiKey || 'mock-api-key';
    this.baseURL = config?.baseURL || 'https://api.openai.com/v1';
    
    this.chat = {
      completions: {
        create: jest.fn(async (params) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Check if streaming is requested
          if (params.stream) {
            // Return mock stream
            const mockContent = 'This is a mock streaming response from the AI assistant.';
            return mockStreamGenerator(mockContent);
          }
          
          // Return mock non-streaming response
          return {
            id: 'mock-completion-id',
            object: 'chat.completion',
            created: Date.now(),
            model: params.model || 'gpt-3.5-turbo',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: 'This is a mock response from the AI assistant.',
              },
              finish_reason: 'stop',
            }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30,
            },
          };
        }),
      },
    };
  }
}

// Mock APIError class
class MockAPIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

// Mock error classes
MockOpenAI.APIError = MockAPIError;

// Export mock
export default MockOpenAI;
