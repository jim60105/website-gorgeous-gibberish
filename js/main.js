/**
 * Main application entry point
 * Initializes all components and sets up the application
 */

import { InputComponent } from './components/InputComponent.js';
import { ChatManager } from './components/ChatManager.js';
import { AnimationController } from './components/AnimationController.js';
import { toast } from './components/ToastNotification.js';
import { helpModal } from './components/HelpModal.js';
import { networkMonitor } from './services/NetworkMonitor.js';
import { errorLogger } from './services/ErrorLogger.js';

// Application state
let inputComponent;
let chatManager;
let animationController;

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

/**
 * Initialize all application components
 */
function initializeApp() {
  try {
    // Initialize animation controller first
    animationController = new AnimationController();
    
    // Initialize chat manager
    chatManager = new ChatManager(animationController);
    
    // Initialize input component
    inputComponent = new InputComponent(chatManager);
    
    // Connect input component to chat manager
    chatManager.setInputComponent(inputComponent);
    
    // Initialize help modal
    // Already initialized as singleton in helpModal
    
    // Network monitor already initialized as singleton
    
    // Make chatManager globally accessible for reset button in modals
    window.chatManager = chatManager;
    
    console.log('Application initialized successfully');
    
    // Show welcome message in debug mode
    if (errorLogger.isDebugMode) {
      toast.info('Debug mode enabled');
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Log initialization error
    errorLogger.log(error, {
      phase: 'initialization',
    });
    
    // Display error message to user
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.innerHTML = `
        <div class="text-center p-8">
          <div class="text-red-400 text-xl mb-4">無法初始化應用程式</div>
          <div class="text-text-muted text-sm mb-4">${error.message}</div>
          <button 
            onclick="location.reload()" 
            class="bg-white text-bg-primary px-6 py-2 rounded-lg hover:bg-gray-200"
          >
            重新整理頁面
          </button>
        </div>
      `;
    }
  }
}
