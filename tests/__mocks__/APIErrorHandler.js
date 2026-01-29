/**
 * Mock for APIErrorHandler
 */

export class APIErrorHandler {
  static handle(error) {
    // Default mock behavior
    if (error.status === 401) {
      return {
        type: 'UNAUTHORIZED',
        message: 'API 金鑰無效或已過期',
        suggestion: '請檢查您的 API 金鑰設定',
        canRetry: false,
      };
    }
    
    if (error.status === 429) {
      return {
        type: 'RATE_LIMIT',
        message: '請求過於頻繁',
        suggestion: '請稍後再試',
        canRetry: true,
      };
    }
    
    if (error.status === 500 || error.status === 503) {
      return {
        type: error.status === 503 ? 'SERVICE_UNAVAILABLE' : 'SERVER_ERROR',
        message: '伺服器錯誤',
        suggestion: '請稍後重試',
        canRetry: true,
      };
    }
    
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        type: 'TIMEOUT_ERROR',
        message: '請求超時',
        suggestion: '伺服器回應過慢，請稍後重試',
        canRetry: true,
      };
    }
    
    if (error instanceof TypeError && error.message?.includes('fetch')) {
      return {
        type: 'NETWORK_ERROR',
        message: '無法連接到 AI 服務',
        suggestion: '請檢查您的網路連線後重試',
        canRetry: true,
      };
    }
    
    if (error.status === 400) {
      return {
        type: 'BAD_REQUEST',
        message: '請求格式錯誤',
        suggestion: '請確認您的輸入是否正確',
        canRetry: false,
      };
    }
    
    return {
      type: 'UNKNOWN_ERROR',
      message: '發生未知錯誤',
      suggestion: '請重新整理頁面後重試',
      canRetry: false,
    };
  }
  
  static isNetworkError(error) {
    return error instanceof TypeError && error.message?.includes('fetch');
  }
  
  static isTimeoutError(error) {
    return error.name === 'AbortError' || error.message?.includes('timeout');
  }
}
