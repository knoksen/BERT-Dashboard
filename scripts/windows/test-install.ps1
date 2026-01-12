# Test script for Windows installation
# Validates that all components are installed and configured correctly

param(
  [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$testsPassed = 0
$testsFailed = 0

function Test-Requirement {
  param(
    [string]$Name,
    [scriptblock]$Test,
    [string]$Expected = "Exists"
  )
  
  Write-Host "Testing: " -NoNewline
  Write-Host $Name -ForegroundColor Cyan -NoNewline
  Write-Host " ... " -NoNewline
  
  try {
    $result = Invoke-Command $Test
    if ($result) {
      Write-Host "PASS" -ForegroundColor Green
      if ($Verbose -and $result -ne $true) {
        Write-Host "  -> $result" -ForegroundColor Gray
      }
      $script:testsPassed++
      return $true
    } else {
      Write-Host "FAIL" -ForegroundColor Red
      Write-Host "  Expected: $Expected" -ForegroundColor Gray
      $script:testsFailed++
      return $false
    }
  } catch {
    Write-Host "ERROR" -ForegroundColor Red
    if ($Verbose) {
      Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
    $script:testsFailed++
    return $false
  }
}

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "   BERT Dashboard - Installation Tests       " -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

# Test Node.js
Test-Requirement "Node.js installed" {
  $version = node --version 2>$null
  if ($version) { return $version }
  return $false
} "Node.js v18+"

# Test npm
Test-Requirement "npm installed" {
  $version = npm --version 2>$null
  if ($version) { return $version }
  return $false
} "npm installed"

# Test package.json
Test-Requirement "package.json exists" {
  return Test-Path "package.json"
}

# Test node_modules
Test-Requirement "Dependencies installed" {
  if (Test-Path "node_modules") {
    $count = (Get-ChildItem "node_modules" -Directory).Count
    return "$count packages"
  }
  return $false
} "node_modules folder"

# Test key dependencies
Write-Host "Testing key dependencies:" -ForegroundColor Yellow
Test-Requirement "react installed" {
  return Test-Path "node_modules/react"
}

Test-Requirement "react-dom installed" {
  return Test-Path "node_modules/react-dom"
}

Test-Requirement "vite installed" {
  return Test-Path "node_modules/vite"
}

Test-Requirement "@google/genai installed" {
  return Test-Path "node_modules/@google/genai"
}

# Test configuration files
Test-Requirement "vite.config.ts exists" {
  return Test-Path "vite.config.ts"
}

Test-Requirement "tsconfig.json exists" {
  return Test-Path "tsconfig.json"
}

Test-Requirement ".env.local exists" {
  return Test-Path ".env.local"
}

# Test .env.local has API key
Test-Requirement "GEMINI_API_KEY configured" {
  if (Test-Path ".env.local") {
    $content = Get-Content ".env.local" -Raw
    if ($content -match "GEMINI_API_KEY=.+") {
      return "Configured"
    }
  }
  return $false
} "API key in .env.local"

# Test source files
Test-Requirement "index.tsx exists" {
  return Test-Path "index.tsx"
}

Test-Requirement "App.tsx exists" {
  return Test-Path "App.tsx"
}

# Test Electron files if they exist
if (Test-Path "electron") {
  Write-Host "Testing Electron files:" -ForegroundColor Yellow
  
  Test-Requirement "electron/main.js exists" {
    return Test-Path "electron/main.js"
  }
  
  Test-Requirement "electron/preload.js exists" {
    return Test-Path "electron/preload.js"
  }
}

# Test build output
if (Test-Path "dist") {
  Write-Host "Testing build output:" -ForegroundColor Yellow
  
  Test-Requirement "Build output (dist/) exists" {
    $size = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    return "$([math]::Round($size, 2)) MB"
  }
  
  Test-Requirement "dist/index.html exists" {
    return Test-Path "dist/index.html"
  }
}

# Test scripts
Test-Requirement "install.ps1 script exists" {
  return Test-Path "scripts/windows/install.ps1"
}

# Summary
Write-Host "`n===============================================" -ForegroundColor White
Write-Host "Test Summary:" -ForegroundColor White
Write-Host "  Passed: " -NoNewline
Write-Host $testsPassed -ForegroundColor Green
Write-Host "  Failed: " -NoNewline
Write-Host $testsFailed -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "===============================================`n" -ForegroundColor White

if ($testsFailed -eq 0) {
  Write-Host "[OK] All tests passed! Installation is valid." -ForegroundColor Green
  exit 0
} else {
  Write-Host "[ERROR] Some tests failed. Please run install.ps1 again." -ForegroundColor Red
  exit 1
}
