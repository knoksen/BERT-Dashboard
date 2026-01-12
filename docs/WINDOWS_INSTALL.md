# Windows Installation Guide

Complete guide for installing and running BERT Dashboard on Windows.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation Methods](#installation-methods)
- [Desktop Application](#desktop-application)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Prerequisites

### Required Software

1. **Node.js 18 or higher**
   - Download from: https://nodejs.org/
   - Recommended: LTS version (20.x)
   - Verify: `node --version`

2. **npm** (included with Node.js)
   - Verify: `npm --version`

3. **PowerShell 5.1 or higher**
   - Included with Windows 10/11
   - Verify: `$PSVersionTable.PSVersion`

### Optional Software

- **Git** (for cloning repository)
  - Download from: https://git-scm.com/

## Quick Start

### Option 1: One-Command Install

Open PowerShell in the project directory and run:

```powershell
.\scripts\windows\start.ps1 -ApiKey "your-gemini-api-key"
```

This will:
1. Check if dependencies are installed
2. Install them if needed
3. Configure your API key
4. Start the development server

### Option 2: Manual Installation

```powershell
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Setup environment
Copy-Item .env.example .env.local

# 3. Edit .env.local and add your API key
notepad .env.local

# 4. Start dev server
npm run dev
```

## Installation Methods

### Standard Web Application

#### Full Installation with Build

```powershell
.\scripts\windows\install.ps1 -ApiKey "your-api-key"
```

**What it does:**
- ✅ Checks Node.js and npm are installed
- ✅ Installs all npm dependencies
- ✅ Creates/updates .env.local with your API key
- ✅ Builds production version to `dist/`
- ✅ Creates `dist.zip` package

**Output Files:**
- `dist/` - Production build (ready to deploy)
- `dist.zip` - Compressed package
- `.env.local` - Environment configuration
- `.env.local.backup.*` - Automatic backups

#### Installation Options

```powershell
# Skip dependency installation (if already installed)
.\scripts\windows\install.ps1 -SkipInstall

# Skip build step (install only)
.\scripts\windows\install.ps1 -SkipBuild

# Verbose output (for debugging)
.\scripts\windows\install.ps1 -Verbose

# Configure API key only
.\scripts\windows\install.ps1 -ApiKey "new-key"
```

### Desktop Application (Electron)

Build a native Windows desktop application with installer.

#### Quick Build

```powershell
.\scripts\windows\install.ps1 -BuildElectron -ApiKey "your-api-key"
```

Or using npm scripts:

```powershell
# Build web app first
npm run build

# Build Electron app with installers
npm run electron:build:win
```

#### Output Installers

The build process creates multiple installer types in `release/`:

1. **NSIS Installer** (`BERT-Dashboard-Setup-0.0.0.exe`)
   - Traditional Windows installer
   - Allows custom installation directory
   - Creates Start Menu shortcuts
   - Creates Desktop shortcut
   - Includes uninstaller

2. **Portable Version** (`BERT-Dashboard-0.0.0-Portable.exe`)
   - Single executable file
   - No installation required
   - Run directly from USB drive
   - Perfect for testing

3. **ZIP Archive** (`BERT-Dashboard-0.0.0-x64-win.zip`)
   - Compressed application
   - Extract and run
   - For advanced users

#### Desktop App Features

- **Native Windows Application** - Runs like any Windows program
- **System Tray Integration** - Minimize to tray
- **Keyboard Shortcuts** - Full shortcut support
- **Auto-Updates** - Built-in update mechanism
- **Offline Support** - Works without internet (after first run)

## Testing Your Installation

### Automated Tests

Run the installation test suite:

```powershell
# Basic tests
.\scripts\windows\test-install.ps1

# Verbose output with details
.\scripts\windows\test-install.ps1 -Verbose
```

**Tests Include:**
- ✓ Node.js and npm versions
- ✓ Dependencies installed
- ✓ Key packages present
- ✓ Configuration files exist
- ✓ API key configured
- ✓ Source files present
- ✓ Build output (if exists)

### Manual Verification

```powershell
# Check Node.js
node --version

# Check npm
npm --version

# List installed packages
npm list --depth=0

# Verify environment file
Get-Content .env.local

# Test build
npm run build
npm run preview
```

## Development Commands

```powershell
# Start development server (hot reload)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Common Issues

#### 1. "Cannot be loaded because running scripts is disabled"

**Error:**
```
.\scripts\windows\install.ps1 : File cannot be loaded because running scripts is disabled on this system.
```

**Solution:**
Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then retry the script.

#### 2. npm Install Fails

**Error:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
Make sure to use the `--legacy-peer-deps` flag:
```powershell
npm install --legacy-peer-deps
```

Or use the install script:
```powershell
.\scripts\windows\install.ps1
```

#### 3. Node.js Version Too Old

**Error:**
```
Node.js version 16.x detected. Version 18+ is recommended.
```

**Solution:**
1. Download latest LTS from https://nodejs.org/
2. Install and restart PowerShell
3. Verify: `node --version`

#### 4. Port Already in Use

**Error:**
```
Port 5173 is already in use
```

**Solution:**
Find and kill the process using the port:
```powershell
# Find process
netstat -ano | findstr :5173

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Or specify a different port:
```powershell
npm run dev -- --port 3000
```

#### 5. Electron Build Fails

**Error:**
```
Cannot find module 'electron'
```

**Solution:**
Install Electron dependencies:
```powershell
npm install --save-dev electron electron-builder --legacy-peer-deps
```

### Getting Help

1. **Check Logs**: Enable verbose mode:
   ```powershell
   .\scripts\windows\install.ps1 -Verbose
   ```

2. **Run Tests**: Identify specific issues:
   ```powershell
   .\scripts\windows\test-install.ps1 -Verbose
   ```

3. **Clean Install**: Remove everything and start fresh:
   ```powershell
   .\scripts\windows\uninstall.ps1 -Full
   .\scripts\windows\install.ps1 -ApiKey "your-key"
   ```

## Advanced Configuration

### Environment Variables

Edit `.env.local` to configure:

```env
# Required: Your Gemini API key
GEMINI_API_KEY=your-key-here

# Optional: Custom API endpoint
# API_ENDPOINT=https://custom-endpoint.com

# Optional: Enable debug mode
# DEBUG=true
```

### Build Configuration

Edit `vite.config.ts` for custom build settings:

```typescript
export default defineConfig({
  // Custom base path
  base: '/my-app/',
  
  // Custom port
  server: {
    port: 3000
  },
  
  // Build optimizations
  build: {
    minify: 'terser',
    sourcemap: true
  }
});
```

### Electron Configuration

Edit `electron-builder.json` for installer customization:

```json
{
  "productName": "My BERT Dashboard",
  "win": {
    "target": ["nsis", "portable"]
  },
  "nsis": {
    "oneClick": false,
    "perMachine": true
  }
}
```

## Cleanup

### Remove Build Artifacts

```powershell
# Remove dist and release folders only
.\scripts\windows\uninstall.ps1
```

### Full Cleanup

```powershell
# Remove everything including node_modules
.\scripts\windows\uninstall.ps1 -Full
```

### Keep Environment Configuration

```powershell
# Clean but preserve .env.local
.\scripts\windows\uninstall.ps1 -Full -KeepEnv
```

## CI/CD Integration

### GitHub Actions

The project includes a Windows build workflow (`.github/workflows/windows-build.yml`).

**Triggers:**
- Push to main branch
- Pull requests
- Version tags (v*)
- Manual workflow dispatch

**Outputs:**
- Web build artifacts
- Electron installers (on tagged releases)
- Test results
- Coverage reports

### Local Release Build

Create a production release:

```powershell
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Build everything
.\scripts\windows\install.ps1 -BuildElectron -Verbose

# 3. Test the installers
.\release\BERT-Dashboard-Setup-0.0.0.exe
```

## Performance Tips

1. **Use SSD**: Install on SSD for faster builds
2. **Disable Antivirus**: Temporarily disable during `npm install`
3. **Use npm Cache**: Speeds up subsequent installs
4. **Close Other Apps**: Free up RAM during builds

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Keys**: Never commit `.env.local` to git
2. **Production**: Use backend proxy for API calls
3. **HTTPS**: Always use HTTPS in production
4. **Updates**: Keep dependencies updated

## Next Steps

After installation:

1. ✅ Configure your API key
2. ✅ Run tests to verify setup
3. ✅ Start development server
4. ✅ Build desktop app (optional)
5. ✅ Deploy to production

## Resources

- **Project Repository**: https://github.com/knoksen/BERT-Dashboard
- **Node.js Downloads**: https://nodejs.org/
- **Electron Docs**: https://www.electronjs.org/docs
- **Vite Docs**: https://vitejs.dev/

## Support

For issues or questions:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Run diagnostic tests: `.\scripts\windows\test-install.ps1 -Verbose`
3. Check the GitHub Issues page
4. Review the main [README.md](../README.md)
