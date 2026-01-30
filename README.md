# 絢 hsüan<sup>4</sup>

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com/jim60105/website-gorgeous-gibberish)

> A unique AI chatbot experience: **short questions**, **long answers**

🌐 **Visit**: [絢.tw](https://絢.tw) (coming soon)

---

## What is 絢?

**絢** (pronounced "hsüan") is an AI-powered chatbot with a twist.

Think of it as an AI that loves to elaborate. You give it a seed, it grows a garden of words.

### Features

- 🎨 **Minimalist Dark Design**: Clean, distraction-free interface
- 💬 **Streaming Responses**: Real-time AI text generation with typewriter effect
- 🎯 **Constrained Input**: Maximum 20 characters per message
- 📊 **Conversation Tracking**: Visual progress indicators (5 messages per conversation)
- 🔄 **Easy Reset**: Start fresh conversations anytime
- 🌐 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- 🚨 **Error Handling**: Comprehensive error recovery with retry logic
- 🔔 **Toast Notifications**: Non-intrusive status updates
- 📶 **Network Monitoring**: Real-time connection status tracking
- ✨ **Smooth Animations**: GPU-accelerated transitions with reduced motion support
- ⚙️ **Loading States**: Visual feedback for all async operations

---

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jim60105/website-gorgeous-gibberish.git
cd website-gorgeous-gibberish
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure API settings:
   - Edit `js/config/api.js` with your API endpoint and key
   - See [API Configuration Guide](docs/API_CONFIGURATION.md) for details

4. Build CSS:
```bash
pnpm run build:css
```

5. Start development server:
```bash
pnpm run start
```

6. Open browser at `http://localhost:3000`

### Available Commands

- `pnpm run build:css` - Build CSS with Tailwind (production)
- `pnpm run watch:css` - Watch CSS changes (development)
- `pnpm run dev` - Start live-server on port 3000
- `pnpm run start` - Watch CSS and start dev server simultaneously

### Testing Commands

```bash
# Unit & Integration Tests
pnpm test                    # Run all Jest tests
pnpm run test:unit           # Unit tests only
pnpm run test:integration    # Integration tests only
pnpm run test:watch          # Watch mode
pnpm run test:coverage       # With coverage report

# E2E Tests (Playwright)
pnpm run test:e2e            # Run all E2E tests
pnpm run test:e2e:ui         # Interactive UI mode
pnpm run test:e2e:headed     # With visible browser
pnpm run test:e2e:debug      # Debug mode

# First-time E2E setup
pnpm exec playwright install
```

**Test Coverage**: 215 tests (158 unit + 31 integration + 26 E2E)

---

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Tailwind CSS v3.4.19
- **AI Integration**: OpenAI JS SDK v6.17.0
- **Testing**: Jest + Playwright (215 tests)
- **Dev Tools**: live-server, Tailwind CLI
- **Language**: 正體中文 (Traditional Chinese)

---

## Documentation

- 📋 [Requirements](docs/requirements.md) - Feature specifications
- 🎨 [Design](docs/design.md) - Technical architecture
- ✅ [Tasks](docs/tasks.md) - Implementation checklist
- 🔧 [API Configuration](docs/API_CONFIGURATION.md) - Setup guide
- 🧪 [Testing](docs/testing.md) - Testing documentation
- 🎭 [E2E Testing](docs/e2e-testing.md) - Playwright E2E guide
- 📊 [Testing Summary](docs/testing-summary.md) - Test coverage report

---

## License

<img src="https://github.com/user-attachments/assets/2764cf04-4509-4ca4-be06-057dc37a0cd7" alt="agplv3" width="300" />

[GNU AFFERO GENERAL PUBLIC LICENSE Version 3](./LICENSE)

Copyright (C) 2026 Jim Chen <Jim@ChenJ.im>.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
