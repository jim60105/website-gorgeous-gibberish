/**
 * OpenAI API Error Handler
 * 處理 OpenAI API 相關錯誤
 */

import OpenAI from 'openai';

export class APIErrorHandler {
  /**
   * Map OpenAI error to user-friendly message
   * @param {Error} error - The error object
   * @returns {Object} Error info with message and recovery suggestion
   */
  static handle(error) {
    // OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      return this.handleAPIError(error);
    }
    
    // Network errors
    if (this.isNetworkError(error)) {
      return {
        type: 'NETWORK_ERROR',
        message: '無法連接到 AI 服務',
        suggestion: '請檢查您的網路連線後重試',
        canRetry: true,
      };
    }
    
    // Timeout errors
    if (this.isTimeoutError(error)) {
      return {
        type: 'TIMEOUT_ERROR',
        message: '請求超時',
        suggestion: '伺服器回應過慢，請稍後重試',
        canRetry: true,
      };
    }
    
    // Unknown errors
    return {
      type: 'UNKNOWN_ERROR',
      message: '發生未知錯誤',
      suggestion: '請重新整理頁面後重試',
      canRetry: false,
    };
  }
  
  /**
   * Handle OpenAI API specific errors
   * @param {OpenAI.APIError} error
   */
  static handleAPIError(error) {
    const { status, message } = error;
    
    const errorMap = {
      400: {
        type: 'BAD_REQUEST',
        message: '請求格式錯誤',
        suggestion: '請確認您的輸入是否正確',
        canRetry: false,
      },
      401: {
        type: 'UNAUTHORIZED',
        message: 'API 金鑰無效',
        suggestion: '請檢查您的 API 金鑰設定',
        canRetry: false,
        action: 'SHOW_API_KEY_MODAL',
      },
      403: {
        type: 'FORBIDDEN',
        message: '沒有權限使用此服務',
        suggestion: '您的 API 金鑰可能沒有足夠權限',
        canRetry: false,
      },
      404: {
        type: 'NOT_FOUND',
        message: '找不到請求的資源',
        suggestion: '請確認 API 設定是否正確',
        canRetry: false,
      },
      429: {
        type: 'RATE_LIMITED',
        message: '請求過於頻繁',
        suggestion: '請稍候幾秒後再試',
        canRetry: true,
        retryAfter: 5000,
      },
      500: {
        type: 'SERVER_ERROR',
        message: 'AI 服務暫時發生問題',
        suggestion: '伺服器正在維護中，請稍後重試',
        canRetry: true,
      },
      502: {
        type: 'BAD_GATEWAY',
        message: 'AI 服務暫時無法使用',
        suggestion: '請稍後重試',
        canRetry: true,
      },
      503: {
        type: 'SERVICE_UNAVAILABLE',
        message: 'AI 服務暫時過載',
        suggestion: '服務繁忙中，請稍後重試',
        canRetry: true,
        retryAfter: 10000,
      },
    };
    
    return errorMap[status] || {
      type: 'API_ERROR',
      message: `API 錯誤 (${status})`,
      suggestion: message || '請稍後重試',
      canRetry: status >= 500,
    };
  }
  
  /**
   * Check if error is network related
   */
  static isNetworkError(error) {
    return (
      (error.name === 'TypeError' && error.message.includes('fetch')) ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET'
    );
  }
  
  /**
   * Check if error is timeout
   */
  static isTimeoutError(error) {
    return (
      error.name === 'AbortError' ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('timeout')
    );
  }
}
