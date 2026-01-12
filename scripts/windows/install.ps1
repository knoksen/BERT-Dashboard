param(
  [string]$ApiKey = "",
  [switch]$SkipInstall,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Error "Required command '$Name' not found. Install it and try again."
    exit 1
  }
}

Require-Command "node"
Require-Command "npm"

if (-not $SkipInstall) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install --legacy-peer-deps
}

if (-not (Test-Path ".env.local")) {
  if (-not (Test-Path ".env.example")) {
    Write-Error "Missing .env.example; create .env.local manually or restore the template."
    exit 1
  }
  Copy-Item ".env.example" ".env.local"
}

if ($ApiKey) {
#Requires -Version 5.1

<#
.SYNOPSIS
    BERT Dashboard Windows Installation Script
.DESCRIPTION
    Installs dependencies, configures API keys, builds, and packages the BERT Dashboard application for Windows.
.PARAMETER ApiKey
    Optional Gemini API key to configure in .env.local
.PARAMETER SkipInstall
    Skip npm install step
.PARAMETER SkipBuild
    Skip the production build step
.PARAMETER BuildElectron
    Build Electron desktop application with installer
.PARAMETER Verbose
    Enable verbose output
.EXAMPLE
    .\install.ps1 -ApiKey "your-api-key-here"
.EXAMPLE
    .\install.ps1 -BuildElectron
.EXAMPLE
    .\install.ps1 -SkipInstall -SkipBuild
#>

param(
  [string]$ApiKey = "",
  [switch]$SkipInstall,
  [switch]$SkipBuild,
  [switch]$BuildElectron,
  [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Color output functions
function Write-Success {
  param([string]$Message)
  Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Info {
  param([string]$Message)
  Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Warning {
  param([string]$Message)
  Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Step {
  param([string]$Message)
  Write-Host "`n━━━ $Message ━━━" -ForegroundColor Magenta
}

function Require-Command {
  param([string]$Name, [string]$InstallUrl = "")
  
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Error "Required command '$Name' not found."
    if ($InstallUrl) {
      Write-Host "Install from: $InstallUrl" -ForegroundColor Yellow
    }
    exit 1
  }
  
  $version = & $Name --version 2>&1
  Write-Success "$Name found: $version"
}

function Test-NodeVersion {
  $nodeVersion = (node --version) -replace 'v', ''
  $majorVersion = [int]($nodeVersion -split '\.')[0]
  
  if ($majorVersion -lt 18) {
    Write-Warning "Node.js version $nodeVersion detected. Version 18+ is recommended."
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
  } else {
    Write-Success "Node.js version $nodeVersion (meets requirements)"
  }
}

function Backup-EnvFile {
  if (Test-Path ".env.local") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = ".env.local.backup.$timestamp"
    Copy-Item ".env.local" $backupPath
    Write-Info "Backed up .env.local to $backupPath"
  }
}

function Set-ApiKeyInEnv {
  param([string]$Key)
  
  if (-not $Key) {
    return
  }

  Backup-EnvFile

  $envLines = @()
  if (Test-Path ".env.local") {
    $envLines = Get-Content ".env.local"
  }

  if ($envLines -match "^GEMINI_API_KEY=") {
    $envLines = $envLines -replace "^GEMINI_API_KEY=.*", "GEMINI_API_KEY=$ApiKey"
  } else {
    $envLines += "GEMINI_API_KEY=$ApiKey"
  }

  Set-Content ".env.local" $envLines -Encoding UTF8
}

if (-not $SkipBuild) {
  Write-Host "Building production bundle..." -ForegroundColor Cyan
  npm run build
}

if (Test-Path "dist") {
  if (Test-Path "dist.zip") {
    Remove-Item "dist.zip" -Force
  }
  Write-Host "Packaging dist.zip..." -ForegroundColor Cyan
  Compress-Archive -Path "dist/*" -DestinationPath "dist.zip"
} else {
  Write-Warning "dist/ not found; skipping dist.zip packaging."
  $keyExists = $false
  $envLines = $envLines | ForEach-Object {
    if ($_ -match "^GEMINI_API_KEY=") {
      $keyExists = $true
      "GEMINI_API_KEY=$Key"
    } else {
      $_
    }
  }

  if (-not $keyExists) {
    $envLines += "GEMINI_API_KEY=$Key"
  }

  Set-Content ".env.local" $envLines
  Write-Success "API key configured in .env.local"
}

function Install-Dependencies {
  Write-Step "Installing Dependencies"
  
  $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
  Write-Info "Project: $($packageJson.name)"
  
  if ($Verbose) {
    npm install --legacy-peer-deps
  } else {
    npm install --legacy-peer-deps --quiet 2>&1 | Out-Null
  }
  
  Write-Success "Dependencies installed successfully"
}

function Build-WebApp {
  Write-Step "Building Web Application"
  
  if ($Verbose) {
    npm run build
  } else {
    npm run build 2>&1 | Out-Null
  }
  
  if (Test-Path "dist") {
    $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Success "Build completed successfully (Size: $([math]::Round($distSize, 2)) MB)"
  } else {
    Write-Error "Build failed - dist folder not created"
  }
}

function Build-ElectronApp {
  Write-Step "Building Electron Desktop Application"
  
  # Check if Electron is installed
  $hasElectron = $false
  $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
  if ($packageJson.devDependencies.electron -or $packageJson.dependencies.electron) {
    $hasElectron = $true
  }
  
  if (-not $hasElectron) {
    Write-Info "Installing Electron and electron-builder..."
    npm install --save-dev electron electron-builder --legacy-peer-deps
  }
  
  if ($Verbose) {
    npm run electron:build
  } else {
    npm run electron:build 2>&1 | Out-Null
  }
  
  if (Test-Path "release") {
    Write-Success "Electron build completed"
    Write-Info "Installers created in: release\"
    Get-ChildItem "release" -Filter "*.exe" | ForEach-Object {
      $size = $_.Length / 1MB
      Write-Host "  - $($_.Name) ($([math]::Round($size, 2)) MB)" -ForegroundColor White
    }
  }
}

function Create-DistZip {
  Write-Step "Creating Distribution Package"
  
  if (-not (Test-Path "dist")) {
    Write-Warning "dist folder not found. Skipping zip creation."
    return
  }
  
  if (Test-Path "dist.zip") {
    Remove-Item "dist.zip" -Force
  }
  
  Compress-Archive -Path "dist\*" -DestinationPath "dist.zip" -CompressionLevel Optimal
  
  $zipSize = (Get-Item "dist.zip").Length / 1MB
  Write-Success "Created dist.zip ($([math]::Round($zipSize, 2)) MB)"
}

function Show-Summary {
  Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
  Write-Host "   Installation Complete!" -ForegroundColor Green
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
  
  Write-Host "`nNext Steps:" -ForegroundColor Cyan
  Write-Host "  • Run dev server:    " -NoNewline; Write-Host "npm run dev" -ForegroundColor Yellow
  Write-Host "  • Preview build:     " -NoNewline; Write-Host "npm run preview" -ForegroundColor Yellow
  if ($BuildElectron -and (Test-Path "release")) {
    Write-Host "  • Install desktop:   " -NoNewline; Write-Host "Check release\ folder" -ForegroundColor Yellow
  }
  
  if (Test-Path "dist.zip") {
    Write-Host "`nDeployment package:  " -NoNewline; Write-Host "dist.zip" -ForegroundColor Green
  }
  
  Write-Host ""
}

# Main execution
try {
  $startTime = Get-Date
  
  Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
  Write-Host "║   BERT Dashboard - Windows Installer     ║" -ForegroundColor Cyan
  Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
  
  # Check prerequisites
  Write-Step "Checking Prerequisites"
  Require-Command "node" "https://nodejs.org/"
  Require-Command "npm" "https://nodejs.org/"
  Test-NodeVersion
  
  # Setup environment
  Write-Step "Setting Up Environment"
  if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
      Copy-Item ".env.example" ".env.local"
      Write-Success "Created .env.local from template"
    } else {
      Write-Warning ".env.example not found"
    }
  } else {
    Write-Info ".env.local already exists"
  }
  
  # Configure API key
  if ($ApiKey) {
    Set-ApiKeyInEnv -Key $ApiKey
  } elseif (-not (Test-Path ".env.local")) {
    Write-Warning "No API key provided. You'll need to add GEMINI_API_KEY to .env.local manually."
  }
  
  # Install dependencies
  if (-not $SkipInstall) {
    Install-Dependencies
  } else {
    Write-Info "Skipping dependency installation (SkipInstall flag)"
  }
  
  # Build application
  if (-not $SkipBuild) {
    Build-WebApp
    Create-DistZip
  } else {
    Write-Info "Skipping build (SkipBuild flag)"
  }
  
  # Build Electron app if requested
  if ($BuildElectron) {
    Build-ElectronApp
  }
  
  # Show summary
  $duration = (Get-Date) - $startTime
  Write-Host "`nCompleted in $([math]::Round($duration.TotalSeconds, 1)) seconds" -ForegroundColor Gray
  Show-Summary
  
} catch {
  Write-Host "`n❌ Installation failed!" -ForegroundColor Red
  Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
  if ($Verbose) {
    Write-Host "`nStack Trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
  }
  exit 1
}
