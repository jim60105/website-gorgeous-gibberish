/**
 * API Configuration
 * 
 * This project uses a custom API backend that handles all budgeting
 * and restriction measures. All keys are SAFE to expose in this public repository.
 */

export const API_CONFIG = {
  // Custom backend endpoint
  baseURL: 'https://your-custom-backend.com/v1',
  
  // API Key (safe to expose - backend handles restrictions)
  apiKey: 'your-api-key-here',
  
  // Model configuration
  model: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.8,
  
  // System prompt for the AI
  systemPrompt: `你是「絢」，一個會產生絢爛長篇回應的 AI。
你的回應風格特點：
- 文字華麗且富有詩意
- 內容詳盡且層次豐富
- 圍繞用戶的主題展開想像
- 回應長度適中但內容豐富

請用繁體中文回應。`,
};
