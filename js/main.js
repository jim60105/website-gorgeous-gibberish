/**
 * Main application entry point
 * Initializes all components and sets up the application
 */

import { InputComponent } from './components/InputComponent.js';
import { ChatManager } from './components/ChatManager.js';
import { AnimationController } from './components/AnimationController.js';

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
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}
