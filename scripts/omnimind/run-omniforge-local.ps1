# Local OmniForge without Docker (SQLite + Node terminal)
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $Root

Write-Host "== OmniForge local stack ==" -ForegroundColor Cyan

# backend-node
$nodeDir = Join-Path $Root "backend-node"
if (-not (Test-Path (Join-Path $nodeDir "node_modules"))) {
  Write-Host "Installing backend-node dependencies..."
  Push-Location $nodeDir
  npm install --silent
  Pop-Location
}

# backend-fastapi
$apiDir = Join-Path $Root "backend-fastapi"
Write-Host "Installing backend-fastapi dependencies..."
python -m pip install -q -r (Join-Path $apiDir "requirements.txt")

$env:OMNIFORGE_DEV_SQLITE = "1"
$env:JWT_SECRET_KEY = "local-dev-secret"
$env:NODE_SERVICE_URL = "http://127.0.0.1:8091"
$env:NODE_PORT = "8091"
$env:GATEWAY_ORIGIN = "http://localhost:8003"
$env:FRONTEND_ORIGIN = "http://localhost:3000"

Write-Host "Starting backend-node on :8091 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$nodeDir'; `$env:NODE_PORT='8091'; node src/server.js" -WindowStyle Minimized

Start-Sleep -Seconds 2

Write-Host "Starting backend-fastapi on :8003 (SQLite dev) ..."
$coreDir = Join-Path $Root "core-python"
Write-Host "Starting core-python on :8001 (provider orchestrator) ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$coreDir'; python -m pip install -q -r requirements.txt; python -m uvicorn app.main:app --host 127.0.0.1 --port 8001" -WindowStyle Minimized

Start-Sleep -Seconds 2

Push-Location $apiDir
python -m uvicorn app.main:app --host 127.0.0.1 --port 8003
