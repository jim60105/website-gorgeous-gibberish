/**
 * User-friendly error messages
 * 用戶友好的錯誤訊息
 */

export const ERROR_MESSAGES = {
  // API Errors
  API_KEY_INVALID: {
    title: 'API 金鑰無效',
    description: '您的 API 金鑰似乎有問題',
    action: '重新設定金鑰',
    icon: '🔑',
  },
  API_KEY_MISSING: {
    title: '尚未設定 API 金鑰',
    description: '需要 OpenAI API 金鑰才能使用服務',
    action: '設定金鑰',
    icon: '⚙️',
  },
  RATE_LIMITED: {
    title: '請求過於頻繁',
    description: '請稍候幾秒後再試',
    action: '稍後重試',
    icon: '⏱️',
  },
  
  // Network Errors
  NETWORK_OFFLINE: {
    title: '網路連線中斷',
    description: '請檢查您的網路連線',
    action: '重新連線',
    icon: '📶',
  },
  NETWORK_TIMEOUT: {
    title: '連線超時',
    description: '伺服器回應時間過長',
    action: '重試',
    icon: '⏳',
  },
  
  // Input Errors
  INPUT_EMPTY: {
    title: '請輸入內容',
    description: '輸入框不能為空',
    action: null,
    icon: '✏️',
  },
  INPUT_TOO_LONG: {
    title: '輸入過長',
    description: '最多只能輸入 20 個字',
    action: null,
    icon: '📏',
  },
  
  // Conversation Errors
  CONVERSATION_LIMIT: {
    title: '已達對話上限',
    description: '每次對話最多 5 則訊息',
    action: '重新開始',
    icon: '🔄',
  },
  
  // Server Errors
  SERVER_ERROR: {
    title: 'AI 服務暫時無法使用',
    description: '伺服器正在維護中',
    action: '稍後重試',
    icon: '🔧',
  },
  
  // Generic
  UNKNOWN: {
    title: '發生錯誤',
    description: '請重新整理頁面後再試',
    action: '重新整理',
    icon: '❌',
  },
};

/**
 * Get error message by type
 * @param {string} type - Error type
 * @returns {Object} Error message object
 */
export function getErrorMessage(type) {
  return ERROR_MESSAGES[type] || ERROR_MESSAGES.UNKNOWN;
}
