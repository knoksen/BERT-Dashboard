# Windows Installation - Quick Reference

## Quick Commands

### Installation
```powershell
# Quick start (recommended)
.\scripts\windows\start.ps1 -ApiKey "your-key"

# Full install with build
.\scripts\windows\install.ps1 -ApiKey "your-key"

# Desktop app with installer
.\scripts\windows\install.ps1 -BuildElectron -ApiKey "your-key"

# Manual install
npm install --legacy-peer-deps
```

### Testing
```powershell
# Run all tests
.\scripts\windows\test-install.ps1

# Verbose output
.\scripts\windows\test-install.ps1 -Verbose

# Run unit tests
npm test
```

### Development
```powershell
# Start dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Run linter
npm run lint
```

### Desktop App
```powershell
# Dev mode
npm run electron:dev

# Build all installers
npm run electron:build

# Windows only
npm run electron:build:win

# Portable only
npm run electron:build:portable
```

### Cleanup
```powershell
# Remove build artifacts
.\scripts\windows\uninstall.ps1

# Full cleanup
.\scripts\windows\uninstall.ps1 -Full

# Keep env file
.\scripts\windows\uninstall.ps1 -KeepEnv
```

## Common Issues

### PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
```powershell
# Find process
netstat -ano | findstr :5173

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Clean Reinstall
```powershell
.\scripts\windows\uninstall.ps1 -Full
.\scripts\windows\install.ps1 -ApiKey "your-key"
```

## File Locations

- **Config:** `.env.local`
- **Web Build:** `dist/`
- **Desktop Build:** `release/`
- **Package:** `dist.zip`
- **Scripts:** `scripts/windows/`
- **Docs:** `docs/WINDOWS_INSTALL.md`

## Install Options

| Flag | Description |
|------|-------------|
| `-ApiKey` | Set Gemini API key |
| `-SkipInstall` | Skip npm install |
| `-SkipBuild` | Skip build step |
| `-BuildElectron` | Build desktop app |
| `-Verbose` | Show detailed output |

## Installer Types

| Type | File | Description |
|------|------|-------------|
| **NSIS** | `*-Setup-*.exe` | Full installer with wizard |
| **Portable** | `*-Portable.exe` | Single file, no install |
| **ZIP** | `*-win.zip` | Archive for extraction |

## Prerequisites

- ✅ Node.js 18+
- ✅ npm (included with Node.js)
- ✅ PowerShell 5.1+

## Help

- 📖 Full Guide: `docs/WINDOWS_INSTALL.md`
- 📖 Summary: `docs/WINDOWS_IMPLEMENTATION_SUMMARY.md`
- 📖 Main README: `README.md`
- 🔧 Test Install: `.\scripts\windows\test-install.ps1 -Verbose`
