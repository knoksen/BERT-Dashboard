# Windows Uninstaller Script for BERT Dashboard
# Run this script to clean up installed dependencies and build artifacts

param(
  [switch]$Full,
  [switch]$KeepEnv
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "`n━━━ $Message ━━━" -ForegroundColor Yellow
}

function Write-Success {
  param([string]$Message)
  Write-Host "✓ $Message" -ForegroundColor Green
}

Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   BERT Dashboard - Uninstaller            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan

# Remove build artifacts
Write-Step "Cleaning Build Artifacts"
$toRemove = @("dist", "release", "dist.zip")
foreach ($item in $toRemove) {
  if (Test-Path $item) {
    Remove-Item $item -Recurse -Force
    Write-Success "Removed $item"
  }
}

# Remove dependencies if Full clean
if ($Full) {
  Write-Step "Removing Dependencies"
  if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
    Write-Success "Removed node_modules"
  }
  if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Success "Removed package-lock.json"
  }
}

# Remove environment file unless KeepEnv
if (-not $KeepEnv) {
  Write-Step "Cleaning Environment Files"
  if (Test-Path ".env.local") {
    Remove-Item ".env.local" -Force
    Write-Success "Removed .env.local"
  }
  
  # Remove backups
  Get-ChildItem -Filter ".env.local.backup.*" | ForEach-Object {
    Remove-Item $_.FullName -Force
    Write-Success "Removed $($_.Name)"
  }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "   Cleanup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
