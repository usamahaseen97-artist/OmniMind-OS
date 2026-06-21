# Run from project root: omnimind 1\
# Frees port 8001 then starts uvicorn in this terminal (foreground).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

& "$PSScriptRoot\scripts\free-port-8001.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Starting OmniMind V11 via backend/omni_orchestrator.py on http://127.0.0.1:8001 ..." -ForegroundColor Green
Write-Host "Docs: http://127.0.0.1:8001/docs" -ForegroundColor Cyan
Write-Host "Background restart: .\scripts\restart-backend-8001.ps1" -ForegroundColor DarkGray
$env:WATCHFILES_FORCE_POLLING = "true"
$env:UVICORN_RELOAD = "1"
$env:PORT = "8001"
$env:HOST = "127.0.0.1"
python backend/omni_orchestrator.py
