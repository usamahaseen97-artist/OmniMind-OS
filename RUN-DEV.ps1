# OmniMind V11 — opens Backend + Frontend in two terminals (Windows PowerShell 5.1+)
$ErrorActionPreference = "Continue"
$root = $PSScriptRoot

Write-Host "`n=== OmniMind RUN-DEV ===" -ForegroundColor Magenta
Write-Host "Project: $root`n" -ForegroundColor DarkGray

# Sync env (same logic as OMNIMIND-START)
$envLocal = Join-Path $root "frontend\.env.local"
if (-not (Test-Path $envLocal)) {
    @"
NEXT_PUBLIC_USE_API_PROXY=false
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8001
OMNIMIND_BACKEND_URL=http://127.0.0.1:8001
OMNIMIND_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"@ | Set-Content -Path $envLocal -Encoding UTF8
    Write-Host "Created frontend/.env.local (port 8001)" -ForegroundColor Cyan
}

Write-Host "Opening BACKEND window (port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $root "run-backend-8001.ps1")
) -WorkingDirectory $root

Start-Sleep -Seconds 2

Write-Host "Opening FRONTEND window (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $root "run-frontend.ps1")
) -WorkingDirectory $root

Write-Host "`nDone. Two new PowerShell windows should open." -ForegroundColor Green
Write-Host "  App:  http://localhost:3000" -ForegroundColor Green
Write-Host "  API:  http://127.0.0.1:8001/docs" -ForegroundColor Green
Write-Host "`nIf Cursor terminal is frozen: Terminal menu -> New Terminal (Ctrl+Shift+`)" -ForegroundColor DarkGray
