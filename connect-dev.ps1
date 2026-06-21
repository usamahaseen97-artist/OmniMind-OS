# Start OmniMind backend (8001) + frontend (3000) with matching ports.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== OmniMind Dev Connect ===" -ForegroundColor Cyan
Write-Host "Backend: http://127.0.0.1:8001  |  Frontend: http://localhost:3000" -ForegroundColor White

& "$PSScriptRoot\scripts\free-port.ps1" -Port 8000
& "$PSScriptRoot\scripts\free-port.ps1" -Port 8001

$backendCmd = @"
Set-Location '$PSScriptRoot\backend'
`$env:HOST='127.0.0.1'
`$env:PORT='8001'
`$env:UVICORN_RELOAD='0'
`$env:WATCHFILES_FORCE_POLLING='true'
python omni_orchestrator.py
"@

Write-Host "Starting backend on port 8001 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd | Out-Null

Start-Sleep -Seconds 8

$ready = $false
for ($i = 0; $i -lt 12; $i++) {
    try {
        $r = Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/v1/gateway/providers" -TimeoutSec 5
        if ($r) { $ready = $true; break }
    } catch {
        Start-Sleep -Seconds 3
    }
}

if ($ready) {
    Write-Host "Backend online on http://127.0.0.1:8001" -ForegroundColor Green
} else {
    Write-Host "Backend still warming up — wait ~30s then refresh the frontend." -ForegroundColor Yellow
}

Write-Host "Starting frontend (Next.js) ..." -ForegroundColor Green
& "$PSScriptRoot\run-frontend.ps1"
