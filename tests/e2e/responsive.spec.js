/**
 * E2E tests for Responsive Design
 * Task 7.3.2: 測試響應式設計
 */

import { test, expect } from '@playwright/test';

test.describe('Responsive Design E2E', () => {
  
  test.describe('Mobile viewport (iPhone 12)', () => {
    test.use({ viewport: { width: 390, height: 844 } });
    
    test('should display correctly on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Check title is visible
      const title = page.locator('.hero-title');
      await expect(title).toBeVisible();
      
      // Check input box is present
      const input = page.locator('#user-input');
      await expect(input).toBeVisible();
      
      // Check no horizontal scrollbar
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
    });
    
    test('should have appropriate touch targets on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Check send button size (should be >= 44px for touch)
      const sendButton = page.locator('#send-button');
      const box = await sendButton.boundingBox();
      
      expect(box.width).toBeGreaterThanOrEqual(40); // Allow small margin
      expect(box.height).toBeGreaterThanOrEqual(40);
    });
    
    test('should display text at readable size on mobile', async ({ page }) => {
      await page.goto('/');
      
      const title = page.locator('.hero-title');
      const fontSize = await title.evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      
      // Title should be at least 32px on mobile
      const size = parseFloat(fontSize);
      expect(size).toBeGreaterThanOrEqual(32);
    });
  });
  
  test.describe('Tablet viewport (iPad)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });
    
    test('should display correctly on tablet', async ({ page }) => {
      await page.goto('/');
      
      const title = page.locator('.hero-title');
      await expect(title).toBeVisible();
      
      const input = page.locator('#user-input');
      await expect(input).toBeVisible();
      
      // Check layout is centered
      const appContainer = page.locator('#app');
      const alignment = await appContainer.evaluate(el => 
        window.getComputedStyle(el).justifyContent
      );
      expect(alignment).toBe('center');
    });
    
    test('should show appropriate spacing on tablet', async ({ page }) => {
      await page.goto('/');
      
      const container = page.locator('#input-container');
      const maxWidth = await container.evaluate(el => 
        window.getComputedStyle(el).maxWidth
      );
      
      // Should have max-width constraint
      expect(maxWidth).not.toBe('none');
    });
  });
  
  test.describe('Desktop viewport (1920x1080)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });
    
    test('should display correctly on desktop', async ({ page }) => {
      await page.goto('/');
      
      const title = page.locator('.hero-title');
      await expect(title).toBeVisible();
      
      // Check title is large on desktop
      const fontSize = await title.evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      const size = parseFloat(fontSize);
      expect(size).toBeGreaterThanOrEqual(80); // Should be large
    });
    
    test('should center content on desktop', async ({ page }) => {
      await page.goto('/');
      
      const appContainer = page.locator('#app');
      const display = await appContainer.evaluate(el => 
        window.getComputedStyle(el).display
      );
      
      expect(display).toBe('flex');
    });
  });
  
  test.describe('Small mobile viewport (iPhone SE)', () => {
    test.use({ viewport: { width: 375, height: 667 } });
    
    test('should fit content on smallest viewport', async ({ page }) => {
      await page.goto('/');
      
      // All key elements should be visible
      await expect(page.locator('.hero-title')).toBeVisible();
      await expect(page.locator('#user-input')).toBeVisible();
      await expect(page.locator('#send-button')).toBeVisible();
      
      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
    });
  });
  
  test.describe('Orientation changes', () => {
    test('should adapt to landscape orientation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 844, height: 390 }); // iPhone 12 landscape
      await page.goto('/');
      
      // Content should still be accessible
      await expect(page.locator('.hero-title')).toBeVisible();
      await expect(page.locator('#user-input')).toBeVisible();
    });
  });
  
  test.describe('Fixed elements positioning', () => {
    test.use({ viewport: { width: 390, height: 844 } }); // Mobile viewport
    
    test('should keep input at bottom in chat mode on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Fill input and send message
      await page.fill('#user-input', 'test');
      await page.click('#send-button');
      
      // Wait for transition to chat mode
      await page.waitForSelector('#chat-container:not(.hidden)', { timeout: 5000 });
      
      // Check if chat input is at bottom
      const chatInput = page.locator('#user-input-chat');
      const box = await chatInput.boundingBox();
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      // Input should be near bottom (within 200px)
      expect(box.y).toBeGreaterThan(viewportHeight - 200);
    });
  });
});
