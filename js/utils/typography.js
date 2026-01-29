/**
 * Typography scale reference
 * 
 * Mobile (< 768px):
 * - Hero title: text-5xl (48px)
 * - AI response: text-lg (18px)
 * - User input: text-base (16px)
 * - Meta text: text-xs (12px)
 * 
 * Tablet (768px - 1023px):
 * - Hero title: text-8xl (96px)
 * - AI response: text-xl (20px)
 * - User input: text-lg (18px)
 * - Meta text: text-sm (14px)
 * 
 * Desktop (>= 1024px):
 * - Hero title: text-9xl (128px)
 * - AI response: text-2xl (24px)
 * - User input: text-lg (18px)
 * - Meta text: text-sm (14px)
 */

export const TYPOGRAPHY = {
  mobile: {
    heroTitle: 'text-5xl',
    aiResponse: 'text-lg',
    userInput: 'text-base',
    meta: 'text-xs',
  },
  tablet: {
    heroTitle: 'text-8xl',
    aiResponse: 'text-xl',
    userInput: 'text-lg',
    meta: 'text-sm',
  },
  desktop: {
    heroTitle: 'text-9xl',
    aiResponse: 'text-2xl',
    userInput: 'text-lg',
    meta: 'text-sm',
  },
};
