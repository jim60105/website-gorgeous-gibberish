# 聊天機器人網站「絢」設計文檔

## 設計概述

本設計文檔詳細說明「絢」聊天機器人網站的技術架構、視覺設計和實現方案。網站核心理念是創造視覺簡約與文字絢爛的反差美學，通過黑暗簡潔的界面襯托 AI 生成的豐富文字內容。

## 架構設計

### 系統架構
```
前端 SPA (靜態網站)
├── HTML 結構層
├── Tailwind CSS 樣式層  
├── Pure JavaScript 邏輯層
├── OpenAI JS SDK
└── CSS 動畫層 (僅必要時)

外部服務
└── OpenAI Compatible API Endpoint
```

### 技術棧選擇
- **前端框架**: 無框架，純 HTML/CSS/JS
- **樣式系統**: Tailwind CSS v3.x
- **動畫實現**: CSS Transitions + Keyframes
- **API 通信**: OpenAI JS SDK
- **部署方式**: 靜態網站託管

## 視覺設計系統

### 色彩方案
```css
/* 主色調 - 黑暗主題 */
--bg-primary: #0a0a0a;      /* 主背景 */
--bg-secondary: #1a1a1a;    /* 次要背景 */
--text-primary: #ffffff;     /* 主文字 */
--text-secondary: #a0a0a0;   /* 次要文字 */
--text-muted: #666666;       /* 輔助文字 */
--accent: #333333;           /* 強調色 */
--border: #2a2a2a;           /* 邊框色 */
```

### 字體系統
```css
/* 字體層次 */
--font-ai-response: 1.5rem;   /* AI 回應 - 24px */
--font-user-input: 0.875rem;  /* 用戶輸入 - 14px */
--font-ui-text: 1rem;         /* 界面文字 - 16px */
--font-meta: 0.75rem;         /* 元信息 - 12px */

/* 字體家族 */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 間距系統
```css
/* Tailwind 擴展間距 */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

## 界面設計規範

### 首頁佈局 (Initial State)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              「絢」                  │
│                                     │
│    ┌─────────────────────────┐      │
│    │  [預填隨機短語...]      │ [→]  │
│    └─────────────────────────┘      │
│                 0/20                │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 對話模式佈局 (Chat State)
```
┌─────────────────────────────────────┐
│ 「絢」                    [重新開始] │
├─────────────────────────────────────┤
│                                     │
│ 主題: 晚餐吃什麼                     │
│                                     │
│ 啊，晚餐這個永恆的哲學問題！讓我      │
│ 來為你展開一場關於美食的絢爛冒險...   │
│ [流式輸出中...]                     │
│                                     │
│ ┌─────────────────────────┐ [→]     │
│ │ 繼續對話...             │         │
│ └─────────────────────────┘         │
│              12/20    ● ● ● ● ○      │
└─────────────────────────────────────┘
```

## 動畫設計

### 版面轉換動畫
```css
/* 首頁到對話模式轉換 */
.layout-transition {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 輸入框位置變化 */
.input-reposition {
  transform: translateY(0);
  transition: transform 0.6s ease-out;
}

.input-reposition.chat-mode {
  transform: translateY(calc(100vh - 120px));
}
```

### 流式輸出動畫
```css
/* 打字機效果 */
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

.streaming-text {
  overflow: hidden;
  border-right: 2px solid #ffffff;
  animation: typewriter 0.1s steps(1) infinite;
}

/* 光標閃爍 */
@keyframes blink {
  0%, 50% { border-color: #ffffff; }
  51%, 100% { border-color: transparent; }
}
```

### 微互動動畫
```css
/* 按鈕懸停效果 */
.btn-hover {
  transition: all 0.2s ease;
}

.btn-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

/* 輸入框聚焦效果 */
.input-focus {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-focus:focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}
```

## 組件設計

### 輸入組件 (InputComponent)
```javascript
class InputComponent {
  constructor() {
    this.maxLength = 20;
    this.placeholder = this.getRandomPhrase();
    this.isSubmitting = false;
    this.charCountElement = null;
  }
  
  // 隨機短語生成
  getRandomPhrase() {
    const phrases = [
      "晚餐吃什麼", "今天天氣晴", "你怎麼看太陽從東邊出來",
      "珍奶好喝", "她不愛我", "你是誰?", "你在公三小",
      "3.9 和 3.11 哪個大", "告訴我下一期樂透號碼", "我餓了"
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  // 字數驗證
  validateInput(text) {
    return text.length <= this.maxLength && text.trim().length > 0;
  }
  
  // 更新字數計數器
  updateCharCount(currentLength) {
    if (this.charCountElement) {
      this.charCountElement.textContent = `${currentLength}/${this.maxLength}`;
      
      // 接近限制時改變樣式
      if (currentLength >= this.maxLength * 0.8) {
        this.charCountElement.classList.add('text-yellow-400');
      } else {
        this.charCountElement.classList.remove('text-yellow-400');
      }
      
      if (currentLength >= this.maxLength) {
        this.charCountElement.classList.add('text-red-400');
      } else {
        this.charCountElement.classList.remove('text-red-400');
      }
    }
  }
}
```

### 對話管理組件 (ChatManager)
```javascript
import OpenAI from 'openai';

class ChatManager {
  constructor() {
    this.messageCount = 0;
    this.maxMessages = 5;
    this.currentTopic = '';
    this.isStreaming = false;
    this.conversationDotsElement = null;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
  
  // 發送訊息
  async sendMessage(message) {
    if (this.messageCount >= this.maxMessages) {
      throw new Error('已達到對話限制');
    }
    
    this.messageCount++;
    this.currentTopic = message;
    this.updateConversationDots();
    await this.streamResponse(message);
  }
  
  // 更新對話次數點狀顯示
  updateConversationDots() {
    if (this.conversationDotsElement) {
      const dots = [];
      for (let i = 0; i < this.maxMessages; i++) {
        if (i < this.messageCount) {
          dots.push('●'); // 已使用的對話 (實心圓)
        } else {
          dots.push('○'); // 剩餘的對話 (空心圓)
        }
      }
      this.conversationDotsElement.textContent = dots.join(' ');
    }
  }
  
  // 重置對話
  resetConversation() {
    this.messageCount = 0;
    this.currentTopic = '';
    this.updateConversationDots();
  }
  
  // 流式回應
  async streamResponse(topic) {
    this.isStreaming = true;
    
    const stream = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是「絢」，一個會產生絢爛長篇回應的 AI。"
        },
        {
          role: "user",
          content: topic
        }
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.8
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        await animationController.appendText(content);
      }
    }
    
    this.isStreaming = false;
  }
}
```

### 動畫控制組件 (AnimationController)
```javascript
class AnimationController {
  // 版面轉換
  async transitionToChat() {
    const timeline = [
      { element: '.hero-title', animation: 'fadeOut', duration: 300 },
      { element: '.input-container', animation: 'slideDown', duration: 600 },
      { element: '.chat-header', animation: 'fadeIn', duration: 300 }
    ];
    
    return this.executeTimeline(timeline);
  }
  
  // 流式輸出動畫
  async typewriterEffect(element, text, speed = 50) {
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await this.delay(speed);
    }
  }
}
```

## OpenAI API 整合設計

### OpenAI JS SDK 配置
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 僅用於前端應用
});
```

### 請求格式
```javascript
// 發送訊息到 AI
async function sendMessage(userInput) {
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "你是「絢」，一個會產生絢爛長篇回應的 AI。請圍繞用戶的主題生成非常詳細且富有文采的回應。"
      },
      {
        role: "user", 
        content: userInput
      }
    ],
    stream: true,
    max_tokens: 2000,
    temperature: 0.8
  });
  
  return stream;
}
```

### 流式回應處理
```javascript
async function handleStreamResponse(stream) {
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      await animationController.appendText(content);
    }
  }
}
```

## 響應式設計

### 斷點系統
```css
/* Tailwind 自定義斷點 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### 移動端適配
```css
/* 移動端首頁 */
@media (max-width: 767px) {
  .hero-container {
    padding: 2rem 1rem;
  }
  
  .input-container {
    width: 100%;
    max-width: none;
    margin: 0 1rem;
  }
  
  .ai-response {
    font-size: 1.25rem; /* 縮小字體 */
    line-height: 1.6;
  }
}
```

## 測試策略

### 單元測試
- InputComponent 的字數驗證
- ChatManager 的對話限制邏輯
- AnimationController 的動畫執行

### 整合測試
- OpenAI API 串接流程
- 流式輸出完整性
- 版面轉換動畫

### 端到端測試
- 完整用戶流程測試
- 跨瀏覽器相容性測試
- 響應式設計測試

這個設計文檔提供了完整的前端技術實現指南，涵蓋了視覺設計、動畫效果、組件架構和 OpenAI API 整合等各個方面。