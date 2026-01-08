# AI Tool Suite (DarkBERT Fine-Tuning & Chat)

Production-ready React + Vite PWA that bundles multiple AI assistant workflows using the Gemini API.

![CI](https://img.shields.io/github/actions/workflow/status/knoksen/BERT-Dashboard/ci.yml?branch=main&label=CI) ![Deploy](https://img.shields.io/github/actions/workflow/status/knoksen/BERT-Dashboard/deploy-pages.yml?branch=main&label=Pages%20Deploy) ![Release](https://img.shields.io/github/actions/workflow/status/knoksen/BERT-Dashboard/release.yml?branch=main&label=Release) ![License](https://img.shields.io/badge/license-MIT-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![Node](https://img.shields.io/badge/Node-20.x-brightgreen) ![PWA](https://img.shields.io/badge/PWA-ready-blueviolet) ![Coverage](https://img.shields.io/badge/coverage-local--run-informational)

Icons: ![Icon 192](icon-192.png) ![Icon 512](icon-512.png)

## Features

* Multi-mode tool suite with persistent local state
* Credit system with paywall modal stub
* Streaming chat sessions via `@google/genai`
* PWA: offline caching + install prompt + share modal with QR code

## Quick Start

Prerequisites: Node.js 18+

1. Install deps:
   npm install --legacy-peer-deps
2. Copy env template:
   cp .env.example .env.local (Windows PowerShell: Copy-Item .env.example .env.local)
3. Add your key to `.env.local`:
   GEMINI_API_KEY=sk-...
4. Run dev server:
   npm run dev

### Windows Install Helper

For Windows, you can run the helper script to install dependencies, set the API key, build, and package the app:

```powershell
.\scripts\windows\install.ps1 -ApiKey "sk-..." 
```

Optional flags:

* `-SkipInstall` to skip `npm install`
* `-SkipBuild` to skip the production build

The script outputs `dist.zip` using `Compress-Archive`.

## Build

Production bundle (outputs to `dist/`):
   npm run build
Preview production build locally:
   npm run preview

Run tests:
   npm test

Run tests with coverage:
   npm run test:coverage

Run lint:
   npm run lint

## Deployment

Any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages, Azure Static Web Apps). Serve the `dist/` folder.

Ensure headers for service worker:

* Cache-Control: no-cache for `sw.js` (so updates are picked up)
* Correct `manifest.json` and icons at site root

### GitHub Pages

Automatic deployment via `deploy-pages.yml` workflow after push to `main`.
If using custom domain: add `CNAME` file in `public/` (root) before build.

### Release Pipeline

Push a semver tag (e.g. `v0.1.0`) to trigger the release workflow:

1. Runs lint, type-check, tests, coverage, and build
2. Zips production bundle (`dist.zip`)
3. Publishes a GitHub Release attaching `dist.zip` and `coverage-summary.json`

To cut a release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

### Optional External Hosting

The generated `dist/` folder is fully static. You can drag & drop into:
 
* Netlify (drag folder or `netlify deploy`)
* Vercel (`vercel --prod` with output dir set to `dist`)
* Cloudflare Pages (set build command `npm run build` and output `dist`)

### Coverage Badges

Currently a local placeholder badge is shown. To publish real coverage:
 
* Codecov: add `bash <(curl -s https://codecov.io/bash)` step and badge
* Coveralls: add `coveralls` GitHub Action after tests

---

## Mobile Quick Launch (PWA)

The app is installable on iOS & Android. `manifest.json` includes shortcuts for rapid navigation.

Shortcuts (long-press the app icon after install):
 
* Chat
* Fine-Tuning
* Gallery

### Install Instructions

Android (Chrome):

1. Open the site
2. Tap the install banner (or ⋮ > Install App)

iOS (Safari):

1. Open the site
2. Share button > Add to Home Screen

Desktop (Chrome / Edge): Omnibox install icon (+) or browser menu > Install.

### Deep Linking Hashes

The app uses hash fragments for quick navigation used in shortcuts:
 
* `#chat` – opens chat
* `#tuning` – opens fine-tuning workflow
* `#art` – opens art generation tools

### QR Code Sharing

Include a QR code anywhere in the UI (already dependency present):

```tsx
import QRCode from 'react-qr-code';

export function ShareQR() {
   return <QRCode value={window.location.href} size={160} />;
}
```

### iOS Theming Tips

Add optional splash screens or additional icons if needed; current config supplies maskable icons and status-bar styling.

### In-App Quick Launch Bar

On mobile viewports a bottom quick launch bar exposes: Chat, Tuning, Art. These map to hash routes (`#chat`, `#tuning`, `#art`) and update the PWA shortcut deep links. The bar highlights the active section. Desktop users access the same areas via the standard mode grid.


## Updating Environment Keys

Vite inlines `GEMINI_API_KEY` at build time via `loadEnv` in `vite.config.ts`. Rebuild after changes.

## Security Notes

Do NOT expose sensitive production keys directly to the client. For production, proxy Gemini calls through a lightweight backend that injects the key server-side.

## License

MIT (add a LICENSE file if distributing publicly).
