param(
  [string]$ApiKey = "",
  [switch]$SkipInstall,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

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
  npm install --legacy-peer-deps
}

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
}

if ($ApiKey) {
  $envLines = @()
  if (Test-Path ".env.local") {
    $envLines = Get-Content ".env.local"
  }

  if ($envLines -match "^GEMINI_API_KEY=") {
    $envLines = $envLines -replace "^GEMINI_API_KEY=.*", "GEMINI_API_KEY=$ApiKey"
  } else {
    $envLines += "GEMINI_API_KEY=$ApiKey"
  }

  Set-Content ".env.local" $envLines
}

if (-not $SkipBuild) {
  npm run build
}

if (Test-Path "dist") {
  if (Test-Path "dist.zip") {
    Remove-Item "dist.zip" -Force
  }
  Compress-Archive -Path "dist/*" -DestinationPath "dist.zip"
}
