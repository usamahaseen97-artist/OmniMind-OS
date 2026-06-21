# Run from project root — API on port 8000 (always starts; MongoDB fallback if Atlas fails)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$env:WATCHFILES_FORCE_POLLING = "true"
$env:UVICORN_RELOAD = "1"
$env:PORT = "8000"
$env:HOST = "127.0.0.1"
Write-Host "Starting OmniMind V11 via backend/omni_orchestrator.py on http://127.0.0.1:8000 ..." -ForegroundColor Green
python backend/omni_orchestrator.py
