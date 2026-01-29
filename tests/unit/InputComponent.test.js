/**
 * Unit tests for InputComponent
 * Task 7.1.1: 測試輸入驗證邏輯
 */

import { jest } from '@jest/globals';
import { InputComponent } from '../../js/components/InputComponent.js';

describe('InputComponent', () => {
  let inputComponent;
  let mockChatManager;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <input id="user-input" maxlength="20">
      <span id="char-count"></span>
      <button id="send-button">→</button>
      <div id="input-error" class="opacity-0"></div>
      <input id="user-input-chat" maxlength="20">
      <span id="char-count-chat"></span>
      <button id="send-button-chat">→</button>
      <div id="input-error-chat" class="opacity-0"></div>
    `;
    
    // Mock ChatManager
    mockChatManager = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
      hasReachedLimit: jest.fn().mockReturnValue(false),
    };
    
    inputComponent = new InputComponent(mockChatManager);
  });
  
  describe('validateInput', () => {
    test('should accept valid input within limit', () => {
      const result = inputComponent.validateInput('測試輸入');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });
    
    test('should reject empty input', () => {
      const result = inputComponent.validateInput('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('請輸入內容');
    });
    
    test('should reject whitespace-only input', () => {
      const result = inputComponent.validateInput('   ');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('請輸入內容');
    });
    
    test('should reject input exceeding 20 characters', () => {
      const longInput = '這是一個超過二十個字的測試輸入內容啊啊啊啊啊啊';
      expect(longInput.length).toBeGreaterThan(20);
      const result = inputComponent.validateInput(longInput);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('20');
    });
    
    test('should accept exactly 20 characters', () => {
      const exact20 = '12345678901234567890';
      expect(exact20.length).toBe(20);
      const result = inputComponent.validateInput(exact20);
      expect(result.isValid).toBe(true);
    });
    
    test('should accept 1 character', () => {
      const result = inputComponent.validateInput('a');
      expect(result.isValid).toBe(true);
    });
    
    test('should accept 19 characters', () => {
      const input19 = '1234567890123456789';
      expect(input19.length).toBe(19);
      const result = inputComponent.validateInput(input19);
      expect(result.isValid).toBe(true);
    });
  });
  
  describe('updateCharCount', () => {
    test('should display correct count format', () => {
      inputComponent.inputElement.value = '測試';
      inputComponent.updateCharCount();
      
      expect(inputComponent.charCountElement.textContent).toBe('2/20');
    });
    
    test('should show muted color at low usage (0-79%)', () => {
      inputComponent.inputElement.value = '123456789012345'; // 15 chars = 75%
      inputComponent.updateCharCount();
      
      expect(inputComponent.charCountElement.classList.contains('text-text-muted')).toBe(true);
      expect(inputComponent.charCountElement.classList.contains('text-yellow-400')).toBe(false);
      expect(inputComponent.charCountElement.classList.contains('text-red-400')).toBe(false);
    });
    
    test('should show yellow warning at 80% capacity', () => {
      inputComponent.inputElement.value = '1234567890123456'; // 16 chars = 80%
      inputComponent.updateCharCount();
      
      expect(inputComponent.charCountElement.classList.contains('text-yellow-400')).toBe(true);
      expect(inputComponent.charCountElement.classList.contains('text-text-muted')).toBe(false);
      expect(inputComponent.charCountElement.classList.contains('text-red-400')).toBe(false);
    });
    
    test('should show yellow warning at 99% capacity', () => {
      inputComponent.inputElement.value = '1234567890123456789'; // 19 chars = 95%
      inputComponent.updateCharCount();
      
      expect(inputComponent.charCountElement.classList.contains('text-yellow-400')).toBe(true);
    });
    
    test('should show red at limit', () => {
      inputComponent.inputElement.value = '12345678901234567890'; // 20 chars = 100%
      inputComponent.updateCharCount();
      
      expect(inputComponent.charCountElement.classList.contains('text-red-400')).toBe(true);
      expect(inputComponent.charCountElement.classList.contains('text-yellow-400')).toBe(false);
      expect(inputComponent.charCountElement.classList.contains('text-text-muted')).toBe(false);
    });
    
    test('should show correct count for empty input', () => {
      inputComponent.inputElement.value = '';
      inputComponent.updateCharCount();
      
      expect(inputComponent.charCountElement.textContent).toBe('0/20');
      expect(inputComponent.charCountElement.classList.contains('text-text-muted')).toBe(true);
    });
  });
  
  describe('updateCharCountChat', () => {
    test('should update chat input character count', () => {
      inputComponent.inputElementChat.value = 'test';
      inputComponent.updateCharCountChat();
      
      expect(inputComponent.charCountElementChat.textContent).toBe('4/20');
    });
    
    test('should apply color classes for chat input', () => {
      inputComponent.inputElementChat.value = '12345678901234567890'; // 20 chars
      inputComponent.updateCharCountChat();
      
      expect(inputComponent.charCountElementChat.classList.contains('text-red-400')).toBe(true);
    });
  });
  
  describe('enforceMaxLength', () => {
    test('should truncate input exceeding limit', () => {
      inputComponent.inputElement.value = '這個輸入超過二十個字元限制了啊啊啊啊啊啊啊啊啊';
      expect(inputComponent.inputElement.value.length).toBeGreaterThan(20);
      
      inputComponent.enforceMaxLength();
      
      expect(inputComponent.inputElement.value.length).toBe(20);
    });
    
    test('should not modify input within limit', () => {
      const originalValue = '正常的輸入';
      inputComponent.inputElement.value = originalValue;
      inputComponent.enforceMaxLength();
      
      expect(inputComponent.inputElement.value).toBe(originalValue);
    });
    
    test('should handle exactly 20 characters', () => {
      const exact20 = '12345678901234567890';
      inputComponent.inputElement.value = exact20;
      inputComponent.enforceMaxLength();
      
      expect(inputComponent.inputElement.value).toBe(exact20);
      expect(inputComponent.inputElement.value.length).toBe(20);
    });
  });
  
  describe('enforceMaxLengthChat', () => {
    test('should truncate chat input exceeding limit', () => {
      inputComponent.inputElementChat.value = '超長的聊天輸入內容需要被截斷處理處理處理處理';
      expect(inputComponent.inputElementChat.value.length).toBeGreaterThan(20);
      
      inputComponent.enforceMaxLengthChat();
      
      expect(inputComponent.inputElementChat.value.length).toBe(20);
    });
  });
  
  describe('showError and hideError', () => {
    test('should show error message', () => {
      const errorMessage = '這是錯誤訊息';
      inputComponent.showError(errorMessage);
      
      const errorElement = document.querySelector('#input-error');
      expect(errorElement.textContent).toBe(errorMessage);
      expect(errorElement.classList.contains('opacity-100')).toBe(true);
    });
    
    test('should hide error message', () => {
      const errorElement = document.querySelector('#input-error');
      errorElement.classList.add('opacity-100');
      errorElement.textContent = 'Error';
      
      inputComponent.hideError();
      
      expect(errorElement.classList.contains('opacity-0')).toBe(true);
    });
    
    test('should add error styling to input', () => {
      inputComponent.showError('Error');
      
      expect(inputComponent.inputElement.classList.contains('error-shake')).toBe(true);
      expect(inputComponent.inputElement.classList.contains('error-border')).toBe(true);
    });
  });
  
  describe('handleSubmit', () => {
    test('should not submit empty input', async () => {
      inputComponent.inputElement.value = '';
      
      await inputComponent.handleSubmit();
      
      expect(mockChatManager.sendMessage).not.toHaveBeenCalled();
    });
    
    test('should not submit whitespace-only input', async () => {
      inputComponent.inputElement.value = '   ';
      
      await inputComponent.handleSubmit();
      
      expect(mockChatManager.sendMessage).not.toHaveBeenCalled();
    });
    
    test('should submit valid input', async () => {
      const validInput = '有效的輸入';
      inputComponent.inputElement.value = validInput;
      
      await inputComponent.handleSubmit();
      
      expect(mockChatManager.sendMessage).toHaveBeenCalledWith(validInput);
    });
    
    test('should clear input after successful submission', async () => {
      inputComponent.inputElement.value = '測試';
      
      await inputComponent.handleSubmit();
      
      expect(inputComponent.inputElement.value).toBe('');
    });
    
    test('should prevent double submission', async () => {
      inputComponent.inputElement.value = '測試';
      inputComponent.isSubmitting = true;
      
      await inputComponent.handleSubmit();
      
      expect(mockChatManager.sendMessage).not.toHaveBeenCalled();
    });
    
    test('should show error on submission failure', async () => {
      const errorMessage = '發送失敗';
      mockChatManager.sendMessage.mockRejectedValueOnce(new Error(errorMessage));
      inputComponent.inputElement.value = '測試';
      
      await inputComponent.handleSubmit();
      
      const errorElement = document.querySelector('#input-error');
      expect(errorElement.textContent).toContain('發送失敗');
    });
  });
  
  describe('setLoadingState', () => {
    test('should disable button and show loading', () => {
      inputComponent.setLoadingState(true, false);
      
      expect(inputComponent.sendButton.disabled).toBe(true);
      expect(inputComponent.sendButton.innerHTML).toContain('...');
    });
    
    test('should enable button and restore text', () => {
      inputComponent.sendButton.disabled = true;
      inputComponent.setLoadingState(false, false);
      
      expect(inputComponent.sendButton.disabled).toBe(false);
      expect(inputComponent.sendButton.innerHTML).toBe('→');
    });
    
    test('should handle chat button loading state', () => {
      inputComponent.setLoadingState(true, true);
      
      expect(inputComponent.sendButtonChat.disabled).toBe(true);
    });
  });
  
  describe('prefillRandomPhrase', () => {
    test('should set input value', () => {
      inputComponent.prefillRandomPhrase();
      
      expect(inputComponent.inputElement.value).not.toBe('');
      expect(inputComponent.inputElement.value.length).toBeGreaterThan(0);
      expect(inputComponent.inputElement.value.length).toBeLessThanOrEqual(20);
    });
    
    test('should update character count', () => {
      inputComponent.prefillRandomPhrase();
      
      const expectedCount = `${inputComponent.inputElement.value.length}/20`;
      expect(inputComponent.charCountElement.textContent).toBe(expectedCount);
    });
  });
});
