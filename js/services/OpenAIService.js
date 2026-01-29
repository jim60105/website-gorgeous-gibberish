/**
 * OpenAIService
 * Handles communication with OpenAI API
 */

export class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    console.log('OpenAIService initialized');
  }

  /**
   * Send chat completion request to OpenAI
   */
  async sendMessage(messages) {
    // TODO: Implement OpenAI API integration
    throw new Error('OpenAI API integration not yet implemented');
  }

  /**
   * Stream chat completion from OpenAI
   */
  async *streamMessage(messages) {
    // TODO: Implement streaming response
    throw new Error('Streaming not yet implemented');
  }
}
