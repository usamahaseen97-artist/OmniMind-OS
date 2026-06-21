# OmniMind frontend — PowerShell 5.1 safe (no &&)
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "frontend")

$nextDir = Join-Path (Get-Location) ".next"
if (Test-Path $nextDir) {
    Write-Host "Clearing stale .next cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $nextDir
}

Write-Host "Starting Next.js on http://localhost:3000 ..." -ForegroundColor Green
npm run dev
