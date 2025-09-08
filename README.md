# AI Tool Suite (DarkBERT Fine-Tuning & Chat)

Production-ready React + Vite PWA that bundles multiple AI assistant workflows using the Gemini API.

![CI](https://img.shields.io/github/actions/workflow/status/knoksen/BERT-Dashboard/ci.yml?branch=main&label=CI)
![Deploy](https://img.shields.io/github/actions/workflow/status/knoksen/BERT-Dashboard/deploy-pages.yml?branch=main&label=Pages%20Deploy)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Coverage](https://img.shields.io/badge/coverage-local--run-informational)

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

## Updating Environment Keys

Vite inlines `GEMINI_API_KEY` at build time via `loadEnv` in `vite.config.ts`. Rebuild after changes.

## Security Notes

Do NOT expose sensitive production keys directly to the client. For production, proxy Gemini calls through a lightweight backend that injects the key server-side.

## License

MIT (add a LICENSE file if distributing publicly).

