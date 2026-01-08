# Quick start script for Windows users
# Automatically detects if installation is needed and runs dev server

param(
  [string]$ApiKey = ""
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 BERT Dashboard - Quick Start`n" -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
  Write-Host "Dependencies not found. Running installation..." -ForegroundColor Yellow
  
  if ($ApiKey) {
    & "$PSScriptRoot\install.ps1" -ApiKey $ApiKey
  } else {
    & "$PSScriptRoot\install.ps1"
  }
} else {
  Write-Host "✓ Dependencies found" -ForegroundColor Green
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
  Write-Host "⚠ No .env.local file found" -ForegroundColor Yellow
  
  if ($ApiKey) {
    Write-Host "Creating .env.local with provided API key..." -ForegroundColor Cyan
    if (Test-Path ".env.example") {
      Copy-Item ".env.example" ".env.local"
    }
    "GEMINI_API_KEY=$ApiKey" | Set-Content ".env.local"
    Write-Host "✓ API key configured" -ForegroundColor Green
  } else {
    Write-Host "Please add your GEMINI_API_KEY to .env.local" -ForegroundColor Red
    if (Test-Path ".env.example") {
      Copy-Item ".env.example" ".env.local"
      Write-Host "Created .env.local from template" -ForegroundColor Yellow
    }
    Write-Host "`nRun: .\scripts\windows\start.ps1 -ApiKey `"your-key-here`"`n" -ForegroundColor Cyan
    exit 1
  }
}

# Start dev server
Write-Host "`n🌐 Starting development server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

npm run dev
