# OmniMind V11 — one command: deps check, backend, frontend env, optional Docker streaming
$ErrorActionPreference = "Continue"
$root = $PSScriptRoot

function Test-PortApi($port) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 2
        return $r.StatusCode -eq 200
    } catch { return $false }
}

function Test-Docker {
    try {
        docker info 2>$null | Out-Null
        return $LASTEXITCODE -eq 0
    } catch { return $false }
}

Write-Host "`n=== OmniMind V11 Startup ===" -ForegroundColor Magenta

# Frontend env — auto-detect backend port (8000 then 8001)
$envLocal = Join-Path $root "frontend\.env.local"
$backendPort = if (Test-PortApi 8000) { "8000" } elseif (Test-PortApi 8001) { "8001" } else { "8000" }
$envContent = @"
NEXT_PUBLIC_USE_API_PROXY=false
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:$backendPort
OMNIMIND_BACKEND_URL=http://127.0.0.1:$backendPort
OMNIMIND_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LLM_PROVIDER=lm_studio
LM_STUDIO_URL=http://127.0.0.1:1234/v1
"@
Set-Content -Path $envLocal -Value $envContent -Encoding UTF8
Write-Host "Synced frontend/.env.local -> port $backendPort" -ForegroundColor Cyan

# Python deps
Write-Host "Installing backend requirements..." -ForegroundColor Yellow
Set-Location (Join-Path $root "backend")
python -m pip install -q -r requirements.txt 2>$null

# Backend
if (Test-PortApi $backendPort) {
    Write-Host "Backend already online :$backendPort" -ForegroundColor Green
} else {
    Write-Host "Starting backend on port $backendPort ..." -ForegroundColor Yellow
    $runner = if ($backendPort -eq "8001") { "run-backend-8001.ps1" } else { "run-backend-8000.ps1" }
    Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $root $runner) -WorkingDirectory $root
    Start-Sleep -Seconds 5
}

# Docker (optional — Kafka/Spark for streaming tools only)
if (Test-Docker) {
    Write-Host "Docker OK — streaming stack available (optional)." -ForegroundColor Green
    Write-Host "  docker compose up -d kafka   # when needed" -ForegroundColor DarkGray
} else {
    Write-Host "Docker Desktop not running — chat/tools still work; Kafka/Spark optional." -ForegroundColor Yellow
}

Write-Host "`n--- Next steps ---" -ForegroundColor Cyan
Write-Host "1) LM Studio: load model -> Start Server (port 1234)" -ForegroundColor White
Write-Host "2) Frontend:  .\run-frontend.ps1   (or:  cd frontend; npm run dev)" -ForegroundColor White
Write-Host "   Quick both: .\RUN-DEV.ps1  (opens 2 windows)" -ForegroundColor White
Write-Host "3) Open:       http://localhost:3000" -ForegroundColor Green
Write-Host "4) API docs:   http://127.0.0.1:${backendPort}/docs" -ForegroundColor Green
Write-Host "5) Test:       .\TEST-OMNIMIND.ps1`n" -ForegroundColor Green

Set-Location $root
