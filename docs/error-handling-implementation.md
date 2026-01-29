# 錯誤處理與用戶體驗實現文件

## 概述

本文件詳細說明任務 6.x 的實現，包含完整的錯誤處理機制和用戶體驗改進。

## 架構設計

### 服務層 (Services)

#### 1. APIErrorHandler
**檔案**: `js/services/APIErrorHandler.js`

**功能**:
- 統一處理所有 OpenAI API 錯誤
- 識別網路錯誤和超時錯誤
- 將技術錯誤轉換為用戶友好訊息

**支援的錯誤類型**:
- HTTP 400-503 狀態碼
- 網路連線錯誤 (ENOTFOUND, ECONNREFUSED, ECONNRESET)
- 超時錯誤 (AbortError, ETIMEDOUT)

**使用範例**:
```javascript
try {
  await openAIService.sendMessage(messages);
} catch (error) {
  const errorInfo = APIErrorHandler.handle(error);
  console.log(errorInfo.message);    // 用戶友好訊息
  console.log(errorInfo.suggestion); // 恢復建議
  console.log(errorInfo.canRetry);   // 是否可重試
}
```

#### 2. NetworkMonitor
**檔案**: `js/services/NetworkMonitor.js`

**功能**:
- 監聽瀏覽器 online/offline 事件
- 自動顯示網路狀態通知
- 提供狀態變化回調

**使用範例**:
```javascript
// 檢查網路狀態
if (!networkMonitor.checkOnline()) {
  toast.error('網路連線已中斷');
  return;
}

// 監聽狀態變化
networkMonitor.onStatusChange((status) => {
  console.log('Network status:', status);
});
```

#### 3. ErrorRecovery
**檔案**: `js/services/ErrorRecovery.js`

**功能**:
- 自動重試失敗的操作
- 指數退避延遲 (1s, 3s, 5s)
- 可自訂重試條件

**使用範例**:
```javascript
await errorRecovery.executeWithRetry(
  () => this.streamResponse(message),
  {
    maxRetries: 2,
    onRetry: (attempt, error) => {
      toast.info(`正在重試... (${attempt}/2)`);
    },
    shouldRetry: (error) => error.canRetry === true,
  }
);
```

#### 4. ErrorLogger
**檔案**: `js/services/ErrorLogger.js`

**功能**:
- 記錄錯誤詳細資訊
- localStorage 持久化
- Debug 模式詳細輸出

**啟用 Debug 模式**:
```javascript
// localStorage
localStorage.setItem('debug', 'true');

// URL 參數
http://localhost:3000/?debug
```

**查看日誌**:
```javascript
errorLogger.getLogs();      // 取得所有日誌
errorLogger.exportLogs();   // 匯出為 JSON
errorLogger.clearLogs();    // 清除日誌
```

#### 5. LoadingManager
**檔案**: `js/services/LoadingManager.js`

**功能**:
- 管理多個載入狀態
- 自動更新 UI 元素
- 追蹤載入時間

**使用範例**:
```javascript
loadingManager.start('send-message');
try {
  await sendMessage();
} finally {
  loadingManager.stop('send-message');
}
```

#### 6. TimeoutHandler
**檔案**: `js/services/TimeoutHandler.js`

**功能**:
- Promise 超時控制
- 漸進式超時警告
- 可取消的超時計時器

**使用範例**:
```javascript
const cancelTimeout = TimeoutHandler.progressiveTimeout(
  30000,
  0.7,
  (message) => toast.warning(message)
);

try {
  await TimeoutHandler.withTimeout(
    apiCall(),
    30000,
    '請求超時'
  );
} finally {
  cancelTimeout();
}
```

#### 7. LoadingExperience
**檔案**: `js/services/LoadingExperience.js`

**功能**:
- 骨架屏顯示
- 樂觀 UI 更新
- 避免載入閃爍

**使用範例**:
```javascript
// 顯示骨架屏
const cleanup = loadingExperience.showSkeleton(container);
// 資料載入完成後
cleanup();

// 樂觀更新
loadingExperience.showOptimisticUpdate(message);
```

### 組件層 (Components)

#### 1. ToastNotification
**檔案**: `js/components/ToastNotification.js`

**功能**:
- 非侵入式通知
- 4 種類型：success, error, warning, info
- 自動消失和堆疊顯示

**使用範例**:
```javascript
toast.success('操作成功');
toast.error('發生錯誤', 5000);  // 顯示 5 秒
toast.warning('警告訊息');
toast.info('提示訊息');
```

#### 2. LimitWarning
**檔案**: `js/components/LimitWarning.js`

**功能**:
- 對話限制警告
- 輸入限制檢查
- 限制達到時的 Modal

**使用範例**:
```javascript
limitWarning.checkConversationLimit(4, 5);  // 倒數第二次
limitWarning.checkConversationLimit(5, 5);  // 已達上限
```

#### 3. HelpModal
**檔案**: `js/components/HelpModal.js`

**功能**:
- 使用說明顯示
- ESC 鍵關閉
- 背景點擊關閉

**功能特性**:
- 自動初始化
- 支援鍵盤操作
- 無障礙設計

### 工具層 (Utils)

#### errorMessages.js
**檔案**: `js/utils/errorMessages.js`

**功能**:
- 預定義錯誤訊息
- 統一訊息格式
- 包含圖示和操作建議

**訊息結構**:
```javascript
{
  title: '錯誤標題',
  description: '錯誤描述',
  action: '建議操作',
  icon: '圖示 emoji'
}
```

## 整合說明

### OpenAIService 更新

**新增功能**:
1. 整合 APIErrorHandler 處理所有錯誤
2. 整合 ErrorLogger 記錄錯誤
3. 統一錯誤轉換格式

**錯誤處理流程**:
```
API 錯誤 → APIErrorHandler → ErrorLogger → 轉換為統一格式 → 拋出
```

### ChatManager 更新

**新增功能**:
1. 網路狀態檢查
2. 自動重試機制
3. 超時處理
4. Toast 通知
5. 限制警告
6. 載入狀態管理

**訊息發送流程**:
```
檢查網路 → 檢查限制 → 樂觀更新 → 
開始載入 → 執行重試邏輯 → 超時控制 → 
顯示結果 → 更新狀態 → 結束載入
```

### Main.js 更新

**初始化順序**:
1. AnimationController
2. ChatManager
3. InputComponent
4. HelpModal (自動初始化)
5. NetworkMonitor (自動初始化)

**錯誤處理**:
- 捕捉初始化錯誤
- 顯示友好錯誤頁面
- 記錄錯誤到 ErrorLogger

## CSS 樣式

### Toast 樣式
```css
.toast                    - 基礎樣式
.toast-visible           - 顯示動畫
.toast-hiding            - 隱藏動畫
.toast-success/error/... - 類型樣式
```

### Modal 樣式
```css
.modal-backdrop     - 背景遮罩
.modal-content      - 內容容器
.modal-title        - 標題樣式
.modal-description  - 描述文字
```

### Network Toast 樣式
```css
.network-toast         - 基礎樣式
.network-toast.success - 成功樣式
.network-toast.error   - 錯誤樣式
```

## HTML 元素

### 新增元素

1. **Network Toast**:
```html
<div id="network-toast" class="network-toast hidden"></div>
```

2. **Help Modal**:
```html
<div id="help-modal" class="modal-backdrop hidden">
  <!-- Modal 內容 -->
</div>
```

3. **Help Button** (在 Chat Header):
```html
<button id="help-button" aria-label="說明">
  <!-- SVG 圖示 -->
</button>
```

## 測試場景

### 已測試功能

1. ✅ **空輸入驗證**
   - 顯示「請輸入內容」錯誤
   - 輸入框震動動畫
   - 3 秒後自動隱藏

2. ✅ **字數限制**
   - 0-16 字: 灰色計數器
   - 17-19 字: 黃色警告
   - 20 字: 紅色限制
   - 超過 20 字自動截斷

3. ✅ **API 錯誤處理**
   - 錯誤訊息顯示
   - 自動重試 (最多 2 次)
   - Toast 通知

4. ✅ **幫助 Modal**
   - 點擊按鈕開啟
   - ESC 鍵關閉
   - 點擊背景關閉
   - 點擊「了解了」關閉

5. ✅ **對話狀態轉換**
   - 初始狀態 → 聊天狀態
   - 對話點顯示正確
   - 主題更新正確

### 錯誤場景測試清單

- [ ] 401 Unauthorized (需要真實 API 配置)
- [ ] 429 Rate Limited (需要高頻請求)
- [ ] 500 Server Error (需要模擬)
- [ ] Network Offline (可手動測試)
- [ ] Timeout (需要慢速 API)
- [x] Empty Input
- [x] Input Too Long
- [x] Conversation Limit

## 效能考量

### 優化措施

1. **DOM 更新批次處理**
   - 使用 requestAnimationFrame
   - 減少 reflow 和 repaint

2. **錯誤日誌限制**
   - 最多保留 50 筆
   - 自動清理舊記錄

3. **載入狀態去抖動**
   - 200ms 延遲避免閃爍
   - 快速回應不顯示載入

4. **Toast 佇列管理**
   - 自動堆疊顯示
   - 自動清理舊通知

## 已知限制

1. **API 配置**
   - 需要有效的 API 配置才能完整測試
   - 目前使用佔位符配置

2. **瀏覽器支援**
   - 需要支援 ES6 modules
   - 需要支援 async/await
   - 需要支援 navigator.onLine

3. **錯誤覆蓋**
   - 無法測試所有 API 錯誤情境
   - 部分錯誤需要真實環境

## 維護指南

### 新增錯誤類型

1. 在 `errorMessages.js` 中定義訊息
2. 在 `APIErrorHandler.js` 中添加處理邏輯
3. 更新文件

### 新增載入狀態

1. 在 `LoadingManager.updateUI()` 中添加 case
2. 實現對應的 UI 更新方法
3. 在需要的地方調用 start/stop

### 新增 Toast 類型

1. 在 `ToastNotification.js` 中添加圖示
2. 在 CSS 中添加對應樣式
3. 添加便捷方法

## 參考資源

- [OpenAI API 錯誤碼文件](https://platform.openai.com/docs/guides/error-codes)
- [MDN: Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [Web API: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
