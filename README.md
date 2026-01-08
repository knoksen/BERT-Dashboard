<div align="center">

# 🤖 BERT Dashboard
### AI Tool Suite - Multi-Mode Assistant Platform

[![CI Status](https://img.shields.io/github/actions/workflow/status/knoksen/BERT-Dashboard/ci.yml?branch=main&label=CI&logo=github)](https://github.com/knoksen/BERT-Dashboard/actions)
[![Deploy](https://img.shields.io/github/actions/workflow/status/knoksen/BERT-Dashboard/deploy-pages.yml?branch=main&label=Pages%20Deploy&logo=github)](https://github.com/knoksen/BERT-Dashboard/actions)
[![Release](https://img.shields.io/github/actions/workflow/status/knoksen/BERT-Dashboard/release.yml?branch=main&label=Release&logo=github)](https://github.com/knoksen/BERT-Dashboard/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Electron](https://img.shields.io/badge/Electron-35-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)

**Production-ready React + Vite PWA with 30+ AI-powered assistant workflows using the Gemini API**

[🚀 Quick Start](#-quick-start) • [📦 Installation](#installation) • [🎯 Features](#-features) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

---

</div>

## 📑 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [💻 Installation](#installation)
  - [Standard Installation](#standard-installation)
  - [Windows Quick Start](#windows-quick-start)
  - [Desktop Application](#desktop-application-electron)
- [🏗️ Build & Deploy](#️-build--deploy)
- [📱 PWA & Mobile](#-pwa--mobile)
- [🧪 Testing](#-testing)
- [📖 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 **30+ AI Assistant Modes**
- 💬 Chat & Conversation
- 🎨 Art Generation & Gallery
- 📝 Document Analysis (DocuBERT)
- 📋 Contract Analysis (ContractBERT)
- 🌙 Dream Interpretation (DreamBERT)
- 🏋️ Fitness Coaching (FitBERT)
- 💰 Financial Analysis (FinanceBERT)
- 🎮 Quest Generation (QuestBERT)
- 📰 News Analysis (NewsBERT)
- 🔬 Research Assistant (RoBERTa)
- And 20+ more specialized tools!

</td>
<td width="50%">

### 🚀 **Technical Highlights**
- ⚡ **Lightning Fast** - Vite-powered dev & build
- 📱 **PWA Ready** - Install on any device
- 💾 **Offline Support** - Service worker caching
- 🔄 **Streaming Responses** - Real-time AI chat
- 💳 **Credit System** - Built-in usage tracking
- 🎨 **Modern UI** - React 19 with TypeScript
- 🖥️ **Desktop App** - Electron support
- 🔐 **Secure** - Environment-based API keys
- 📊 **Full Test Coverage** - Vitest + Testing Library

</td>
</tr>
</table>

---

## 🚀 Quick Start

### ⚡ Fastest Way to Get Started

<table>
<tr>
<th>Platform</th>
<th>Command</th>
<th>Time</th>
</tr>
<tr>
<td><b>Windows</b></td>
<td><code>.\scripts\windows\start.ps1 -ApiKey "your-key"</code></td>
<td>~30 seconds</td>
</tr>
<tr>
<td><b>macOS/Linux</b></td>
<td><code>npm install --legacy-peer-deps && npm run dev</code></td>
<td>~1 minute</td>
</tr>
</table>

### 📋 Prerequisites

```bash
Node.js 18+ (Recommended: 20.x)
npm 9+ or yarn 1.22+
```

**Get your Gemini API key:**
👉 [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## Installation

### Standard Installation

<details open>
<summary><b>🔧 Step-by-Step Setup</b></summary>

#### 1️⃣ Install Dependencies
```bash
npm install --legacy-peer-deps
```

#### 2️⃣ Configure Environment
```bash
# macOS/Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

#### 3️⃣ Add Your API Key
Edit `.env.local`:
```env
GEMINI_API_KEY=your-actual-api-key-here
```

#### 4️⃣ Start Development Server
```bash
npm run dev
```

🎉 **Done!** Open [http://localhost:5173](http://localhost:5173)

</details>

---

### Windows Quick Start

<div align="center">

**🎯 Automated Installation Scripts for Windows Users**

</div>

#### 🚀 Quick Start Script (Recommended)

The **easiest** way to get started on Windows:

```powershell
.\scripts\windows\start.ps1 -ApiKey "your-api-key-here"
```

**What it does:**
- ✅ Checks if Node.js and dependencies are installed
- ✅ Installs dependencies automatically if needed
- ✅ Configures your API key
- ✅ Starts the development server
- ⏱️ **Ready in ~30 seconds**

#### 🔨 Full Installation Script

For complete setup with build and packaging:

```powershell
.\scripts\windows\install.ps1 -ApiKey "your-api-key-here"
```

**Available Options:**

| Option | Description |
|--------|-------------|
| `-ApiKey` | Your Gemini API key |
| `-SkipInstall` | Skip npm install (use for rebuilds) |
| `-SkipBuild` | Skip production build |
| `-BuildElectron` | Build Windows desktop app + installer |
| `-Verbose` | Show detailed output |

**📦 Examples:**

```powershell
# Basic install with API key
.\scripts\windows\install.ps1 -ApiKey "sk-..."

# Build desktop app with installer
.\scripts\windows\install.ps1 -ApiKey "sk-..." -BuildElectron

# Quick rebuild (skip install)
.\scripts\windows\install.ps1 -SkipInstall

# Debug with verbose output
.\scripts\windows\install.ps1 -Verbose
```

**Output Locations:**
- 📁 `dist/` - Web application build
- 📦 `dist.zip` - Packaged web build
- 💿 `release/` - Desktop installers (with `-BuildElectron`)

#### ✅ Testing Your Installation

Verify everything works:

```powershell
# Run all tests
.\scripts\windows\test-install.ps1

# Detailed test output
.\scripts\windows\test-install.ps1 -Verbose
```

#### 🧹 Cleanup

Remove build artifacts:

```powershell
# Remove build outputs only
.\scripts\windows\uninstall.ps1

# Full cleanup (removes node_modules too)
.\scripts\windows\uninstall.ps1 -Full

# Keep environment file
.\scripts\windows\uninstall.ps1 -KeepEnv
```

---

### Desktop Application (Electron)

### Desktop Application (Electron)

<div align="center">

**🖥️ Native Windows Desktop Application**

</div>

Build a standalone desktop application with native Windows installer:

```bash
# Development mode (with live reload)
npm run electron:dev

# Build NSIS installer
npm run electron:build:win

# Build portable executable
npm run electron:build:portable
```

**📦 Installer Types:**

| Type | Description | File Location |
|------|-------------|---------------|
| 🔷 **NSIS Installer** | Standard Windows installer with wizard | `release/*.exe` |
| 📦 **Portable** | Standalone executable (no install needed) | `release/*.exe` |
| 📁 **ZIP Archive** | Compressed for manual extraction | `release/*.zip` |

**Benefits of Desktop App:**
- ✅ Native Windows integration
- ✅ No browser required
- ✅ System tray support
- ✅ Auto-updates capability
- ✅ Better performance

---

## 🏗️ Build & Deploy

## 🏗️ Build & Deploy

### 📦 Build Commands

```bash
# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Create distribution zip
npm run bundle:zip
```

### 🚀 Deployment Options

<details>
<summary><b>🌐 GitHub Pages (Automated)</b></summary>

Automatic deployment via GitHub Actions workflow.

**Setup:**
1. Push to `main` branch triggers automatic deployment
2. Site deploys to `https://[username].github.io/BERT-Dashboard`
3. For custom domain: add `CNAME` file in `public/` folder

**Workflow:** `.github/workflows/deploy-pages.yml`

</details>

<details>
<summary><b>☁️ Netlify</b></summary>

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

Or drag & drop the `dist/` folder in Netlify's web UI.

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

</details>

<details>
<summary><b>▲ Vercel</b></summary>

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

</details>

<details>
<summary><b>⚡ Cloudflare Pages</b></summary>

**Build Settings:**
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: Add `GEMINI_API_KEY`

</details>

<details>
<summary><b>🔷 Azure Static Web Apps</b></summary>

```yaml
app_location: "/"
output_location: "dist"
app_build_command: "npm run build"
```

</details>

### 🏷️ Release Pipeline

Automated releases via git tags:

```bash
# Create and push a semver tag
git tag v1.0.0
git push origin v1.0.0
```

**What happens:**
1. ✅ Runs lint, type-check, tests
2. ✅ Generates coverage report
3. ✅ Builds production bundle
4. ✅ Creates `dist.zip`
5. ✅ Publishes GitHub Release with artifacts

**Artifacts:**
- 📦 `dist.zip` - Production bundle
- 📊 `coverage-summary.json` - Test coverage

### ⚙️ Build Configuration

**Important:** Vite inlines environment variables at **build time**.

**To update API key:**
1. Edit `.env.local`
2. Rebuild: `npm run build`

⚠️ **Security Note:** For production, use a backend proxy to inject API keys server-side. Never expose production keys in client code.

---

## 📱 PWA & Mobile

### 📲 Progressive Web App Features

### 📲 Progressive Web App Features

**Install the app on any device for native-like experience!**

- 📱 **Installable** - Add to home screen (iOS/Android)
- 🖥️ **Desktop Support** - Install on Windows/Mac/Linux
- 📡 **Offline Mode** - Service worker caching
- 🔔 **App Shortcuts** - Quick access via long-press
- 🎨 **Themed UI** - Status bar & splash screen
- 🔗 **Deep Linking** - Hash-based navigation
- 📤 **Share Support** - QR code generation

### 📱 Installation Instructions

<table>
<tr>
<th>Platform</th>
<th>Steps</th>
</tr>
<tr>
<td><b>🤖 Android (Chrome)</b></td>
<td>
1. Open the site<br>
2. Tap install banner<br>
   <i>OR</i><br>
   Menu (⋮) → "Install App"
</td>
</tr>
<tr>
<td><b>🍎 iOS (Safari)</b></td>
<td>
1. Open the site<br>
2. Share button → "Add to Home Screen"
</td>
</tr>
<tr>
<td><b>🖥️ Desktop (Chrome/Edge)</b></td>
<td>
1. Open the site<br>
2. Click install icon (+) in address bar<br>
   <i>OR</i><br>
   Menu → "Install BERT Dashboard"
</td>
</tr>
</table>

### ⚡ App Shortcuts (Quick Launch)

**Long-press the app icon** after installation to access:

<div align="center">

| Shortcut | Destination | Hash |
|----------|-------------|------|
| 💬 **Chat** | Conversation Mode | `#chat` |
| 🔧 **Fine-Tuning** | Model Training | `#tuning` |
| 🎨 **Art Gallery** | Art Generation | `#art` |

</div>

### 🔗 Deep Linking

Navigate directly to specific modes using hash fragments:

```
https://your-domain.com/#chat      → Opens chat interface
https://your-domain.com/#tuning    → Opens fine-tuning workflow
https://your-domain.com/#art       → Opens art generation tools
https://your-domain.com/#finance   → Opens FinanceBERT
https://your-domain.com/#fitness   → Opens FitBERT
```

### 📤 QR Code Sharing

Built-in QR code component for easy sharing:

```tsx
import QRCode from 'react-qr-code';

export function ShareQR() {
  return (
    <div style={{ background: 'white', padding: '16px' }}>
      <QRCode 
        value={window.location.href} 
        size={160}
        level="H"
      />
    </div>
  );
}
```

### 🎯 Quick Launch Bar

**Mobile users** get a bottom navigation bar with:
- 💬 Chat
- 🔧 Tuning
- 🎨 Art

The bar highlights the active section and maps to hash routes for seamless navigation.

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode (interactive)
npm run test:watch

# With coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

### Test Coverage

Coverage reports are generated in:
- 📊 `coverage/` - Detailed HTML report
- 📄 Terminal output - Summary

**Adding Coverage Badges:**

<details>
<summary><b>Codecov Setup</b></summary>

```yaml
# .github/workflows/ci.yml
- name: Upload coverage
  run: bash <(curl -s https://codecov.io/bash)
```

Badge:
```markdown
[![codecov](https://codecov.io/gh/knoksen/BERT-Dashboard/branch/main/graph/badge.svg)](https://codecov.io/gh/knoksen/BERT-Dashboard)
```

</details>

<details>
<summary><b>Coveralls Setup</b></summary>

```yaml
# .github/workflows/ci.yml
- name: Coveralls
  uses: coverallsapp/github-action@master
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Badge:
```markdown
[![Coverage Status](https://coveralls.io/repos/github/knoksen/BERT-Dashboard/badge.svg?branch=main)](https://coveralls.io/github/knoksen/BERT-Dashboard?branch=main)
```

</details>

---

## 📖 Documentation

### 🛠️ Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript compiler options |
| `vitest.config.ts` | Test runner configuration |
| `eslint.config.cjs` | Linting rules |
| `electron-builder.json` | Desktop app packaging |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (offline support) |

### 📂 Project Structure

```
BERT-Dashboard/
├── 📱 components/          # React components (30+ AI assistants)
│   ├── ChatView.tsx
│   ├── DarkbertStudio.tsx
│   ├── DocuBertAnalyzer.tsx
│   └── ...
├── 🎨 contexts/            # React contexts (state management)
├── 🎣 hooks/               # Custom React hooks
├── 🔧 services/            # API services & utilities
├── 🧪 __tests__/           # Test files
├── 🖥️ electron/            # Electron main process
├── 📜 scripts/             # Build & automation scripts
│   └── windows/           # Windows PowerShell scripts
├── 📄 docs/                # Documentation
└── 🌐 public/              # Static assets
```

### 🔑 Environment Variables

```env
# .env.local
GEMINI_API_KEY=your-api-key-here
```

**Get your API key:**
- 🔗 [Google AI Studio](https://makersuite.google.com/app/apikey)

### 🎨 Available AI Modes

<details>
<summary><b>View All 30+ Modes</b></summary>

1. 💬 **ChatBERT** - General conversation
2. 🎨 **ArtisanBERT** - Art generation & concepts
3. 📝 **DocuBERT** - Document analysis
4. 📋 **ContractBERT** - Contract review & QA
5. 🌙 **DreamBERT** - Dream interpretation
6. 🏋️ **FitBERT** - Fitness coaching
7. 💰 **FinanceBERT** - Financial analysis
8. 🎮 **QuestBERT** - RPG quest generation
9. 📰 **NewsBERT** - News analysis
10. 🔬 **RoBERTa Studio** - Research assistant
11. 🚗 **CarBERT Garage** - Vehicle diagnostics
12. 👨‍⚖️ **LegalBERT** - Legal research
13. 🎬 **LiveBERT** - Production planning
14. 🚀 **LaunchBERT** - Product launches
15. 🎯 **AnniBERT** - Planning assistant
16. 📚 **BartholomewLibrary** - Knowledge base
17. 🔍 **GitBERT** - Repository preview
18. 🍳 **ChefBERT** - Cooking assistant
19. 🎨 **ArtGalleryBERT** - Art curation
20. ✈️ **TravelBERT** - Travel planning
21. 🎭 **EventBERT** - Event planning
22. 📊 **AnalyticsBERT** - Data analysis
23. 🎓 **EduBERT** - Educational content
24. 🔐 **SecurityBERT** - Security audit
25. 🌐 **LocaBERT** - Localization
26. 🎵 **MusicBERT** - Music composition
27. 📸 **PhotoBERT** - Photo editing
28. 🎥 **VideoBERT** - Video production
29. 🌱 **GreenBERT** - Sustainability
30. 🤝 **SocialBERT** - Social media

...and more!

</details>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Report Bugs

Found a bug? [Open an issue](https://github.com/knoksen/BERT-Dashboard/issues/new) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### 💡 Suggest Features

Have an idea? [Start a discussion](https://github.com/knoksen/BERT-Dashboard/discussions) or open a feature request issue.

### 🔨 Submit Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Run tests: `npm test`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### 📝 Code Style

- Follow existing code conventions
- Use TypeScript types
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Ensure tests pass before submitting

### ✅ Pull Request Checklist

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No linting errors
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Powering the AI capabilities
- **React Team** - Amazing framework
- **Vite Team** - Lightning-fast build tool
- **Electron** - Desktop application framework
- **All Contributors** - Thank you! 🎉

---

## 📞 Support

- 📧 **Issues:** [GitHub Issues](https://github.com/knoksen/BERT-Dashboard/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/knoksen/BERT-Dashboard/discussions)
- 📖 **Documentation:** [Wiki](https://github.com/knoksen/BERT-Dashboard/wiki)

---

## 📄 License

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright © 2025 knoksen

---

<div align="center">

**Made with ❤️ and ☕**

⭐ **Star this repo if you find it helpful!** ⭐

[🐛 Report Bug](https://github.com/knoksen/BERT-Dashboard/issues) • [✨ Request Feature](https://github.com/knoksen/BERT-Dashboard/issues) • [📖 Documentation](https://github.com/knoksen/BERT-Dashboard/wiki)

</div>
