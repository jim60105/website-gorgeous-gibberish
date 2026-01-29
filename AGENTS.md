# Copilot Agent Instructions for 絢 (website-gorgeous-gibberish)

## Project Overview

**Project Name**: 絢 (hsüan4) - "Gorgeous Gibberish"  
**Project Type**: Vanilla JavaScript + Tailwind CSS Single Page Application  
**Primary Purpose**: An AI chatbot website where users input short phrases (max 20 characters) and receive elaborate, verbose AI responses. The design emphasizes minimalist dark aesthetics contrasting with verbose text output.

**Domain**: 絢.tw  
**License**: GNU AGPL-3.0  
**Languages**: JavaScript (ES6+), HTML5, CSS3 (Tailwind)

## Technical Stack

### Frontend Framework

- **No framework**: Pure HTML/CSS/JavaScript implementation
- **Styling**: Tailwind CSS v3.4.19 as primary styling system
- **JavaScript**: Modular ES6+ with native browser APIs
- **API Integration**: OpenAI JS SDK for AI responses (not yet implemented)

### Development Tools

- **Package Manager**: npm
- **CSS Build**: Tailwind CLI
- **Dev Server**: live-server
- **Language**: 正體中文 (Traditional Chinese) for UI/comments

### Dependencies

```json
{
  "devDependencies": {
    "@jest/globals": "^30.2.0",
    "@playwright/test": "^1.58.0",
    "@testing-library/jest-dom": "^6.9.1",
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0",
    "live-server": "^1.2.2",
    "tailwindcss": "^3.4.19"
  },
  "dependencies": {
    "openai": "^6.17.0"
  }
}
```

## Project Architecture

### Directory Structure

```
website-gorgeous-gibberish/
├── docs/                      # Comprehensive project documentation
│   ├── requirements.md        # Feature requirements & user stories
│   ├── design.md              # Technical design & architecture
│   ├── tasks.md               # Implementation task breakdown
│   ├── testing.md             # Testing documentation
│   ├── e2e-testing.md         # E2E testing guide
│   └── testing-summary.md     # Test coverage summary
├── js/                        # JavaScript modules
│   ├── components/            # UI Components
│   │   ├── AnimationController.js  # Animation orchestration
│   │   ├── ChatManager.js         # Conversation state & AI integration
│   │   ├── InputComponent.js      # User input handling
│   │   ├── ToastNotification.js   # Toast notification system
│   │   ├── HelpModal.js           # Help modal controller
│   │   └── LimitWarning.js        # Limit warning system
│   ├── config/                # Configuration
│   │   ├── phrases.js         # Random phrase presets
│   │   └── api.js             # OpenAI API configuration
│   ├── services/              # External services
│   │   ├── OpenAIService.js   # OpenAI API wrapper (fully functional)
│   │   ├── LoadingManager.js  # Loading state management
│   │   ├── LoadingExperience.js # Enhanced loading UX
│   │   ├── ErrorRecovery.js   # Error recovery manager
│   │   ├── ErrorLogger.js     # Error logging service
│   │   ├── NetworkMonitor.js  # Network status monitor
│   │   ├── TimeoutHandler.js  # Request timeout handler
│   │   └── APIErrorHandler.js # API error classification
│   └── utils/                 # Utility functions
│       ├── breakpoints.js     # Responsive breakpoints
│       ├── constants.js       # App constants
│       ├── helpers.js         # Helper functions
│       └── animationHelpers.js # Animation utilities
├── src/                       # Source files
│   └── styles.css             # Tailwind CSS with custom layers
├── dist/                      # Build output (gitignored)
│   └── styles.css             # Compiled CSS
├── tests/                     # Test suite
│   ├── __mocks__/             # Mock implementations
│   │   ├── openai.js          # OpenAI SDK mock
│   │   ├── api.js             # API config mock
│   │   └── styleMock.js       # CSS mock
│   ├── setup.js               # Jest setup
│   ├── unit/                  # Unit tests (158 tests)
│   │   ├── InputComponent.test.js
│   │   ├── ChatManager.test.js
│   │   ├── AnimationController.test.js
│   │   ├── OpenAIService.test.js
│   │   └── ErrorHandling.test.js
│   ├── integration/           # Integration tests (31 tests)
│   │   ├── animations.test.js
│   │   ├── openai.test.js
│   │   └── helpers.js
│   └── e2e/                   # E2E tests (26 tests)
│       ├── responsive.spec.js
│       └── user-flow.spec.js
├── .github/
│   └── instructions/          # Path-specific instructions
│       └── web-design-guideline.instructions.md
├── index.html                 # Single page application entry
├── tailwind.config.js         # Tailwind configuration
├── jest.config.js             # Jest testing configuration
├── playwright.config.js       # Playwright E2E configuration
└── package.json               # Project manifest
```

## Build & Development Commands

### Essential Commands

```bash
# Install dependencies (always run first)
npm install

# Build CSS (required before first run)
npm run build:css

# Development workflow
npm run start                  # Starts both CSS watcher and dev server

# Individual commands
npm run watch:css             # Watch CSS changes
npm run dev                   # Start live-server on port 3000
```

### Build Process

1. **Initial Setup**: Run `npm install` to install dependencies
2. **CSS Compilation**: Tailwind CLI processes `src/styles.css` → `dist/styles.css`
3. **Development**: Live-server serves root directory with hot reload
4. **Production**: Run `npm run build:css` for minified output

**Important**: Always ensure CSS is built before testing. The `dist/styles.css` file must exist for the app to load correctly.

### Testing Commands

```bash
# Unit & Integration Tests (Jest)
npm test                    # Run all Jest tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report

# E2E Tests (Playwright)
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Interactive UI mode
npm run test:e2e:headed     # With visible browser
npm run test:e2e:debug      # Debug mode

# First-time E2E setup
npx playwright install       # Install browser binaries
```

**Test Coverage**: 215 tests total (158 unit + 31 integration + 26 E2E)  
**Status**: All unit and integration tests passing; E2E tests require full API integration

**Key Testing Features**:

- ✅ No API key required - all external services mocked
- ✅ Fast execution (< 60 seconds total)
- ✅ Multi-browser support (Chromium, Mobile Chrome, Mobile Safari)
- ✅ Comprehensive mocking system (OpenAI SDK, browser APIs)
- ✅ CI/CD ready with automatic retries

## Design System

### Color Palette (Dark Theme)

Defined in [tailwind.config.js](tailwind.config.js#L7-L14):

- **bg-primary**: `#0a0a0a` - Main background
- **bg-secondary**: `#1a1a1a` - Secondary surfaces
- **text-primary**: `#ffffff` - Primary text
- **text-secondary**: `#a0a0a0` - Secondary text
- **text-muted**: `#666666` - Muted/metadata text
- **accent**: `#333333` - Accent elements
- **border-color**: `#2a2a2a` - Border color

### Typography System

- **AI Response**: `1.5rem` (24px) - Large, prominent
- **User Input**: `0.875rem` (14px) - Small, subtle
- **UI Text**: `1rem` (16px) - Standard interface text
- **Metadata**: `0.75rem` (12px) - Labels, counters

**Font Families**:

- Primary: `Inter, -apple-system, BlinkMacSystemFont, sans-serif`
- Mono: `JetBrains Mono, Fira Code, monospace`

### Spacing Scale

```javascript
{
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem'    // 48px
}
```

### Animation System

**Timing Functions**:

- `ease-out-expo`: `cubic-bezier(0.16, 1, 0.3, 1)` - Layout transitions
- `ease-in-out-quart`: `cubic-bezier(0.76, 0, 0.24, 1)` - Smooth animations

**Key Animations**:

- **Typewriter Effect**: Character-by-character text display with blinking cursor
- **Layout Transitions**: Smooth 600ms transitions between initial/chat states
- **Fade In/Out**: 300ms opacity transitions
- **Accessibility**: Respects `prefers-reduced-motion` (instant transitions)

## Application Architecture

### Component Structure

#### 1. InputComponent ([js/components/InputComponent.js](js/components/InputComponent.js))

**Responsibilities**:

- User input validation (20 character limit)
- Real-time character counter with color indicators
- Random phrase prefilling on load
- Keyboard shortcuts (Enter to submit)
- Error message display

**Key Methods**:

- `validateInput(text)` - Returns `{isValid, message}`
- `updateCharCount()` - Updates counter with color coding (muted → yellow → red)
- `prefillRandomPhrase()` - Loads random phrase from config
- `handleSubmit()` - Validates and passes to ChatManager

#### 2. ChatManager ([js/components/ChatManager.js](js/components/ChatManager.js))

**Responsibilities**:

- Conversation state management (5 message limit)
- Message history tracking
- AI response orchestration (currently using mock responses)
- Conversation dots UI (● ● ● ○ ○)
- Topic display and reset functionality

**Key Methods**:

- `sendMessage(message)` - Main message handling pipeline
- `streamResponse(message)` - Coordinates typewriter animation
- `updateConversationDots()` - Updates progress indicators
- `resetConversation()` - Clears state and returns to initial view
- `generateMockResponse(userMessage)` - Temporary mock AI responses

**State Management**:

```javascript
{
  messageCount: 0,        // Current message count (max 5)
  currentTopic: '',       // Latest user input
  isStreaming: false,     // Prevents concurrent requests
  conversationHistory: [] // Array of {role, content, timestamp}
}
```

#### 3. AnimationController ([js/components/AnimationController.js](js/components/AnimationController.js))

**Responsibilities**:

- Layout state transitions (initial ↔ chat)
- Typewriter text animation with configurable speed
- Fade in/out, slide up/down animations
- Motion preference detection

**Key Methods**:

- `transitionToChat()` - Hides hero, shows chat UI
- `transitionToInitial()` - Reverse transition
- `typewriterEffect(element, text, speed)` - Character-by-character display
- `fadeIn(element, duration)` / `fadeOut(element, duration)`
- `prefersReducedMotion()` - Returns animation duration (0 if reduced motion)

#### 4. OpenAIService ([js/services/OpenAIService.js](js/services/OpenAIService.js))

**Status**: ✅ Fully functional with streaming support  
**Purpose**: Handle OpenAI API integration with real-time streaming responses

**Key Methods**:

- `sendMessage(messages)` - Send non-streaming chat completion
- `sendStreamingMessage(messages, callbacks)` - Send streaming chat completion  
- `buildMessages(userMessage, history)` - Build API request messages
- `validateStreamChunk(chunk)` - Validate streaming response chunks
- `getConfig()` - Get current API configuration

**Features**:

- Streaming and non-streaming modes
- Custom backend endpoint support (configured in [js/config/api.js](js/config/api.js))
- Error handling with detailed error messages
- Stream validation and parsing
- Conversation history support

### Application Flow

1. **Initialization** ([js/main.js](js/main.js)):

   ```
   DOM Ready → AnimationController → ChatManager → InputComponent
   ```

2. **User Interaction Flow**:

   ```
   User Input → validateInput → sendMessage → transitionToChat
   → streamResponse → typewriterEffect → incrementMessageCount
   ```

3. **Layout States**:
   - **Initial**: Centered title + input box
   - **Chat**: Header with dots + topic + AI response + input at bottom

## Key Features & Constraints

### User Input Management

- **Character Limit**: Strict 20 character maximum
- **Real-time Validation**: Immediate feedback with color-coded counter
  - 0-80%: Muted gray
  - 80-99%: Yellow warning
  - 100%: Red limit
- **Random Phrases**: 10 preset phrases for inspiration (see [js/config/phrases.js](js/config/phrases.js))

### Conversation Management

- **Message Limit**: 5 messages per conversation
- **Visual Progress**: Dot indicators (● = used, ○ = remaining)
- **Reset Function**: "重新開始" button clears state and returns to initial view
- **History Tracking**: Maintains conversation context for future API integration

### Visual Design Philosophy

**Core Principle**: Minimal dark interface contrasting with verbose AI text

**UI Hierarchy**:

- Large: AI responses (24px, prominent)
- Small: User input (14px, subtle)
- Creates visual contrast emphasizing AI verbosity

**Animation Principles**:

- Smooth, natural transitions (600ms cubic-bezier easing)
- Typewriter effect simulates AI "thinking"
- No gratuitous effects - functional aesthetics only

## Styling Guidelines

### Tailwind-First Approach

**Priority Order**:

1. Use Tailwind utility classes wherever possible
2. Use `@apply` in [src/styles.css](src/styles.css) for repeated patterns
3. Only define custom CSS when Tailwind cannot achieve the effect

**Current Custom CSS** ([src/styles.css](src/styles.css)):

- `.layout-transition` - Complex transition combining multiple properties
- `.streaming-cursor` - Typewriter cursor with blink animation
- Component-level classes for hover/focus states

### Responsive Design

**Breakpoints** (from [js/utils/breakpoints.js](js/utils/breakpoints.js)):

```javascript
xs: 475px   // Extra small phones
sm: 640px   // Phones landscape
md: 768px   // Tablets
lg: 1024px  // Small desktops
xl: 1280px  // Standard desktops
2xl: 1536px // Large screens
```

**Mobile-First Strategy**: Base styles for mobile, `md:` and `lg:` modifiers for larger screens

## Code Conventions

### JavaScript

- **Module System**: ES6 modules with explicit imports/exports
- **Comments**: English for code, 正體中文 for user-facing text
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Error Handling**: Try-catch blocks with user-friendly error messages
- **Async/Await**: Preferred over Promise chains

### HTML

- **Semantic Elements**: Proper use of `<main>`, `<section>`, `<button>`, etc.
- **Accessibility**: ARIA labels where needed (`aria-label`, `aria-live`)
- **Classes**: Tailwind utilities only, no inline styles
- **Language**: `lang="zh-TW"` on `<html>` element

### CSS

- **Layers**: `@layer base`, `@layer components`, `@layer utilities`
- **Custom Properties**: Defined in `:root` for non-Tailwind contexts
- **Animations**: Keyframes for complex animations, transitions for simple ones
- **Motion Safety**: Always respect `prefers-reduced-motion`

## Common Workflows

### Adding a New Component

1. Create file in `js/components/[ComponentName].js`
2. Export ES6 class with constructor and methods
3. Import in [js/main.js](js/main.js) and initialize in `initializeApp()`
4. Add DOM selectors to [js/utils/constants.js](js/utils/constants.js) if needed
5. Document in this file under "Component Structure"

### Modifying Styles

1. **Check Tailwind first**: Can this be done with utilities?
2. **Extend [tailwind.config.js](tailwind.config.js)**: Add to `theme.extend` for reusable tokens
3. **Add to [src/styles.css](src/styles.css)**: Only for complex patterns not achievable with Tailwind
4. **Run `npm run watch:css`**: Ensure changes compile correctly

### Testing Changes

1. Ensure `npm run start` is running
2. Open browser to `http://localhost:3000`
3. Test in Chrome DevTools mobile emulation for responsive behavior
4. Check console for errors
5. Test edge cases:
   - Exactly 20 characters
   - Empty input
   - Rapid consecutive clicks
   - 5 message limit

## Implementation Status

### Completed Features (Tracked in GitHub Issues #1-7)

**Issue #2**: ✅ Project setup & base architecture - **COMPLETE**

- Tailwind CSS configuration with dark theme
- JavaScript module structure (ES6)
- Build tools (npm, Tailwind CLI, live-server)
- Design system (colors, typography, animations)

**Issue #3**: ✅ Core component development - **COMPLETE**

- InputComponent with 20-char limit & validation
- ChatManager with 5-message limit & AI integration
- AnimationController with layout transitions & typewriter effect
- Conversation state management
- Additional components: ToastNotification, HelpModal, LimitWarning

**Issue #4**: ✅ UI Implementation - **COMPLETE**

- Initial state layout (centered title + input)
- Chat state layout (fixed header/footer, scrollable content)
- AI response display area with large text (24px)
- Topic display with conversation dots (● ● ● ○ ○)
- Reset button with confirmation dialog
- Responsive design (mobile/tablet/desktop breakpoints)
- Safe area handling for notched devices
- Typography scale across devices
- Help modal and network status indicators

**Issue #5**: ✅ OpenAI API Integration - **COMPLETE**

- OpenAI JS SDK v6.17.0 installed & configured
- Hardcoded API config in `js/config/api.js` (custom backend)
- Streaming API with `sendStreamingMessage()` method
- Real-time chunk display with cursor animation
- Error handling (400/401/429/500 with retry logic)
- Stream validation and parsing
- Optimized DOM updates (batched with requestAnimationFrame)
- Loading indicators & error recovery
- Network monitoring and timeout handling

**Issue #6**: ✅ Animation & Visual Effects - **COMPLETE**

- Layout transition animations (initial ↔ chat state)
- Input repositioning animation (center → bottom)
- Smooth layout transitions with ease-out-expo timing
- Streaming text with blinking cursor effect
- Button hover effects (lift on hover)
- Input focus animations (border glow)
- Loading states (spinner, dots, animation)
- Error animations (shake, border pulse)
- Success feedback (toast notifications)
- Performance optimizations (GPU acceleration, will-change)
- Reduced motion support

**Issue #7**: ✅ Testing Implementation - **COMPLETE**

- Jest test framework configured with jsdom
- 158 unit tests (all passing)
- 31 integration tests (all passing)
- 26 E2E tests with Playwright
- Comprehensive mocking system (no API keys required)
- Test coverage >80% for core components
- CI/CD ready configuration

### In Progress / Future Work

**Issue #8**: Production Deployment (Pending)

- Domain configuration (絢.tw)
- CDN setup for static assets
- Production API endpoint configuration
- Monitoring and analytics integration
- Performance optimizations for production

**Future Enhancements**:

- [ ] Conversation export/import functionality
- [ ] User preferences (theme, animation speed)
- [ ] Multi-language support
- [ ] Progressive Web App (PWA) features
- [ ] Analytics and usage tracking
- [ ] Accessibility audit and improvements

## Documentation References

### Essential Reading

- **Requirements**: [docs/requirements.md](docs/requirements.md) - Feature specifications & user stories
- **Design**: [docs/design.md](docs/design.md) - Technical architecture & component design
- **Tasks**: [docs/tasks.md](docs/tasks.md) - Implementation checklist
- **Testing**: [docs/testing.md](docs/testing.md) - Comprehensive testing guide
- **E2E Testing**: [docs/e2e-testing.md](docs/e2e-testing.md) - Playwright E2E testing documentation
- **Testing Summary**: [docs/testing-summary.md](docs/testing-summary.md) - Test coverage and results

### Web Design Guidelines

Refer to [.github/instructions/web-design-guideline.instructions.md](.github/instructions/web-design-guideline.instructions.md) for:

- Tailwind CSS best practices
- HTML semantic structure
- Vanilla JS patterns
- Example component templates

## Critical Instructions

### Always Follow

1. **Never use frameworks**: This is a vanilla JS project - no React, Vue, Angular, etc.
2. **Tailwind-first styling**: Exhaust Tailwind options before writing custom CSS
3. **Accessibility**: Ensure all interactive elements have proper ARIA labels
4. **ES6 modules**: Use `import`/`export`, never global variables
5. **正體中文**: All UI text, error messages, and comments for users
6. **English code**: All code, variable names, and technical comments

### Build Failures

If CSS doesn't load:

1. Check `dist/styles.css` exists
2. Run `npm run build:css`
3. Verify Tailwind config syntax
4. Check console for compilation errors

If JavaScript errors:

1. Verify all imports use correct relative paths
2. Check DOM element selectors match HTML IDs
3. Ensure `DOMContentLoaded` fires before initialization
4. Use browser DevTools to trace execution

### Before Committing

- [ ] Run `npm run build:css` for production-ready CSS
- [ ] Run `npm test` to ensure all unit/integration tests pass
- [ ] Run `npm run test:e2e` for E2E validation (optional)
- [ ] Verify responsive behavior (mobile + desktop)
- [ ] Check console for warnings/errors
- [ ] Ensure no dead code or unused imports
- [ ] Update documentation if adding new features
- [ ] Check test coverage with `npm run test:coverage`

## Quick Reference

### File Locations

| Purpose | Path |
|---------|------|
| Entry point | [index.html](index.html) |
| Main JS | [js/main.js](js/main.js) |
| Tailwind config | [tailwind.config.js](tailwind.config.js) |
| Custom CSS | [src/styles.css](src/styles.css) |
| Constants | [js/utils/constants.js](js/utils/constants.js) |
| Random phrases | [js/config/phrases.js](js/config/phrases.js) |

### DOM Selectors

All defined in [js/utils/constants.js](js/utils/constants.js):

- `#app` - Main container
- `#user-input` - Text input field
- `#send-button` - Submit button
- `#char-count` - Character counter
- `#conversation-dots` - Progress dots
- `#ai-response` - AI text display
- `#topic-display` - Current topic label
- `#reset-button` - Conversation reset
- `#help-button` - Help modal trigger
- `#help-modal` - Help modal container
- `#network-toast` - Network status notification

### Test Commands Reference

| Command | Purpose |
|---------|--------|
| `npm test` | Run all Jest tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run test:watch` | Watch mode for Jest |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:e2e` | All Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright interactive mode |
| `npm run test:e2e:headed` | E2E with visible browser |
| `npm run test:e2e:debug` | Playwright debug mode |
