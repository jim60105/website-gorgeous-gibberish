# API Configuration Guide

This guide explains how to configure the OpenAI API for the 絢 (Gorgeous Gibberish) chatbot.

## Configuration Location

The API configuration is located in: `js/config/api.js`

## Configuration Structure

```javascript
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
```

## Setup Instructions

### Step 1: Update API Endpoint

Replace `baseURL` with your custom backend endpoint:

```javascript
baseURL: 'https://api.example.com/v1',
```

**Note**: This project is designed to work with a **custom API backend** that handles budgeting and rate limiting. If you're using the standard OpenAI API, you can use:

```javascript
baseURL: 'https://api.openai.com/v1',
```

### Step 2: Set API Key

Replace `apiKey` with your actual API key:

```javascript
apiKey: 'sk-...',  // Your OpenAI API key
```

### Step 3: Adjust Model Settings (Optional)

You can customize the AI behavior by adjusting these parameters:

#### Model
```javascript
model: 'gpt-3.5-turbo',  // Or 'gpt-4', 'gpt-4-turbo', etc.
```

#### Max Tokens
Controls the maximum length of responses:
```javascript
maxTokens: 2000,  // Increase for longer responses, decrease for shorter
```

#### Temperature
Controls creativity (0.0 = deterministic, 2.0 = very creative):
```javascript
temperature: 0.8,  // Recommended range: 0.7-1.0 for creative content
```

### Step 4: Customize System Prompt (Optional)

The `systemPrompt` defines the AI's personality and response style. You can customize it to change the chatbot's behavior:

```javascript
systemPrompt: `你是「絢」，一個[描述你想要的風格]...`,
```

## Security Considerations

### For Custom Backends
If you're using a custom backend that handles authentication and rate limiting:
- ✅ It's safe to hardcode keys in this file
- ✅ The backend should handle all security measures
- ✅ Keys can be exposed in the public repository

### For Direct OpenAI API
If you're using the OpenAI API directly:
- ⚠️ **DO NOT commit real API keys to public repositories**
- Consider implementing environment variables or a secure key management system
- Be aware that client-side keys can be extracted from browser

## Testing Configuration

To verify your configuration is working:

1. Start the development server:
```bash
npm run start
```

2. Open the browser at `http://localhost:3000`

3. Type a message and send it

4. Check the browser console for:
   - ✅ "OpenAI Service initialized with custom backend"
   - ❌ Any error messages indicating configuration issues

## Common Issues

### Issue: "Failed to load resource: net::ERR_NAME_NOT_RESOLVED"
**Solution**: Update `baseURL` with a valid API endpoint

### Issue: "API 驗證失敗，請聯繫管理員" (401 error)
**Solution**: Check that your `apiKey` is correct and valid

### Issue: "請求過於頻繁，請稍後重試" (429 error)
**Solution**: Your API key has hit rate limits. Wait and try again, or upgrade your plan

### Issue: "AI 服務暫時無法使用" (500+ errors)
**Solution**: The API service is experiencing issues. Try again later

## Advanced Configuration

### Using Environment-Specific Configs

For development vs production environments, you could create multiple config files:

```javascript
// js/config/api.dev.js
export const API_CONFIG = {
  baseURL: 'http://localhost:8000/v1',
  apiKey: 'dev-key',
  // ... other settings
};

// js/config/api.prod.js
export const API_CONFIG = {
  baseURL: 'https://api.production.com/v1',
  apiKey: 'prod-key',
  // ... other settings
};
```

Then import the appropriate one based on your environment.

## Support

For more information about the OpenAI API:
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)

For project-specific issues, please refer to the project README or open an issue.
